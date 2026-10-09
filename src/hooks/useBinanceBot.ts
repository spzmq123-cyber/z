import { useState, useRef, useCallback, useEffect } from 'react';
import type { BotConfig, BotState, LogEntry, OrderLevel } from '../types';
import {
  getWsUrl,
  placeLimitOrder,
  cancelAllOrders,
  closeAllPositions,
  getTickerPrice,
  getOpenOrders,
} from '../utils/binance';

const defaultState: BotState = {
  isRunning: false,
  currentPrice: 0,
  tpBuyLine: 0,
  tpSellLine: 0,
  buyOrders: [],
  sellOrders: [],
  phase: 'idle',
  safeZoneActive: 'none',
  cycleCount: 0,
  totalProfit: 0,
};

export function useBinanceBot() {
  const [config, setConfig] = useState<BotConfig>(() => {
    const saved = localStorage.getItem('botConfig');
    return saved ? JSON.parse(saved) : {
      apiKey: '',
      apiSecret: '',
      symbol: 'BTCUSDT',
      numOrders: 3,
      buyDistancePercent: 0.5,
      sellDistancePercent: 0.5,
      tpPercent: 1.5,
      orderQuantity: 0.001,
      safeZonePercent: 0.3,
      testnet: true,
    };
  });

  const [state, setState] = useState<BotState>(defaultState);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const stateRef = useRef(state);
  const configRef = useRef(config);
  const isClosingRef = useRef(false);
  const priceRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    configRef.current = config;
    localStorage.setItem('botConfig', JSON.stringify(config));
  }, [config]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      timestamp: new Date(),
      message,
      type,
    };
    setLogs(prev => [entry, ...prev].slice(0, 500));
  }, []);

  const connectWebSocket = useCallback(() => {
    const cfg = configRef.current;
    const wsUrl = getWsUrl(cfg.testnet, cfg.symbol);
    
    addLog(`Connecting to WebSocket: ${wsUrl}`, 'info');
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      addLog('WebSocket connected - receiving live prices', 'success');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const price = parseFloat(data.p);
        priceRef.current = price;
        
        setState(prev => ({ ...prev, currentPrice: price }));
        
        // Check strategy conditions in real-time
        if (stateRef.current.phase === 'monitoring' && !isClosingRef.current) {
          checkPriceConditions(price);
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    ws.onerror = () => {
      addLog('WebSocket error - reconnecting in 3s...', 'error');
    };

    ws.onclose = () => {
      addLog('WebSocket closed', 'warning');
      if (stateRef.current.isRunning) {
        setTimeout(() => {
          if (stateRef.current.isRunning) {
            connectWebSocket();
          }
        }, 3000);
      }
    };
  }, [addLog]);

  const checkPriceConditions = useCallback((price: number) => {
    const currentState = stateRef.current;
    
    // Check if price hit TP Buy Line (price went UP)
    if (currentState.tpBuyLine > 0 && price >= currentState.tpBuyLine) {
      addLog(`🎯 PRICE HIT TP BUY LINE at $${price.toFixed(2)}! Closing everything...`, 'trade');
      triggerCloseAll('TP Buy Line reached');
      return;
    }
    
    // Check if price hit TP Sell Line (price went DOWN)
    if (currentState.tpSellLine > 0 && price <= currentState.tpSellLine) {
      addLog(`🎯 PRICE HIT TP SELL LINE at $${price.toFixed(2)}! Closing everything...`, 'trade');
      triggerCloseAll('TP Sell Line reached');
      return;
    }

    // Check safe zone for buy orders
    // If price drops to the last (furthest/lowest) buy order level
    const activeBuyOrders = currentState.buyOrders.filter(o => o.status === 'active');
    if (activeBuyOrders.length > 0) {
      // Get the furthest (lowest price) buy order
      const lastBuyOrder = activeBuyOrders.reduce((min, o) => o.price < min.price ? o : min, activeBuyOrders[0]);
      if (price <= lastBuyOrder.price) {
        addLog(`🛡️ SAFE ZONE: Price reached last BUY order at $${lastBuyOrder.price.toFixed(2)}`, 'warning');
        addLog(`🛡️ Moving all buy SL to safe zone - cancelling everything & restarting`, 'warning');
        triggerCloseAll('Safe zone triggered - buy side (last buy order hit)');
        return;
      }
    }

    // Check safe zone for sell orders
    // If price rises to the last (furthest/highest) sell order level
    const activeSellOrders = currentState.sellOrders.filter(o => o.status === 'active');
    if (activeSellOrders.length > 0) {
      // Get the furthest (highest price) sell order
      const lastSellOrder = activeSellOrders.reduce((max, o) => o.price > max.price ? o : max, activeSellOrders[0]);
      if (price >= lastSellOrder.price) {
        addLog(`🛡️ SAFE ZONE: Price reached last SELL order at $${lastSellOrder.price.toFixed(2)}`, 'warning');
        addLog(`🛡️ Moving all sell SL to safe zone - cancelling everything & restarting`, 'warning');
        triggerCloseAll('Safe zone triggered - sell side (last sell order hit)');
        return;
      }
    }
  }, [addLog]);

  const executeCloseAllRef = useRef<((reason: string) => Promise<void>) | null>(null);

  const triggerCloseAll = useCallback((reason: string) => {
    if (isClosingRef.current) return; // Prevent multiple triggers
    isClosingRef.current = true;
    setState(prev => ({ ...prev, phase: 'closing' }));
    if (executeCloseAllRef.current) {
      executeCloseAllRef.current(reason);
    }
  }, []);

  const executeCloseAll = useCallback(async (reason: string) => {
    const cfg = configRef.current;
    
    try {
      addLog(`🔄 [${reason}] Executing full close...`, 'warning');
      
      // Step 1: Cancel ALL open orders on exchange
      addLog('Step 1: Cancelling all open orders on exchange...', 'info');
      await cancelAllOrders(cfg.apiKey, cfg.apiSecret, cfg.symbol, cfg.testnet);
      addLog('✅ All open orders cancelled on exchange', 'success');
      
      // Step 2: Close any open positions (market sell/buy back)
      addLog('Step 2: Closing any open positions...', 'info');
      await closeAllPositions(cfg.apiKey, cfg.apiSecret, cfg.symbol, cfg.testnet, addLog);
      
      // Step 3: Verify everything is closed
      addLog('Step 3: Verifying all orders closed...', 'info');
      const remaining = await getOpenOrders(cfg.apiKey, cfg.apiSecret, cfg.symbol, cfg.testnet);
      if (remaining.length > 0) {
        addLog(`⚠️ ${remaining.length} orders still open - retrying cancel...`, 'warning');
        await cancelAllOrders(cfg.apiKey, cfg.apiSecret, cfg.symbol, cfg.testnet);
      } else {
        addLog('✅ Verified: All orders closed successfully', 'success');
      }
      
      // Step 4: Reset state
      setState(prev => ({
        ...prev,
        buyOrders: [],
        sellOrders: [],
        tpBuyLine: 0,
        tpSellLine: 0,
        safeZoneActive: 'none',
        phase: 'resetting',
        cycleCount: prev.cycleCount + 1,
      }));
      
      addLog(`🔄 Cycle complete. Preparing to restart strategy...`, 'info');
      
      // Small delay to ensure exchange processes everything
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 5: Restart strategy if bot is still running
      if (stateRef.current.isRunning) {
        addLog('🚀 Restarting strategy at current price...', 'info');
        isClosingRef.current = false;
        await placeStrategyOrders();
      } else {
        isClosingRef.current = false;
        setState(prev => ({ ...prev, phase: 'idle' }));
      }
      
    } catch (error: any) {
      addLog(`❌ Error during close: ${error.message}`, 'error');
      
      // Retry after delay
      if (stateRef.current.isRunning) {
        addLog('🔄 Retrying close in 3 seconds...', 'warning');
        setTimeout(() => {
          isClosingRef.current = false;
          triggerCloseAll(reason + ' (retry)');
        }, 3000);
      } else {
        isClosingRef.current = false;
        setState(prev => ({ ...prev, phase: 'idle' }));
      }
    }
  }, [addLog, triggerCloseAll]);

  const placeStrategyOrders = useCallback(async () => {
    const cfg = configRef.current;
    
    try {
      setState(prev => ({ ...prev, phase: 'placing' }));
      addLog('📊 Placing strategy orders...', 'info');
      
      // Get current price
      let currentPrice = priceRef.current;
      if (!currentPrice || currentPrice === 0) {
        currentPrice = await getTickerPrice(cfg.testnet, cfg.symbol);
        priceRef.current = currentPrice;
      }
      
      addLog(`📍 Anchor price: $${currentPrice.toFixed(2)}`, 'info');
      
      // Calculate levels
      const buyLevels: OrderLevel[] = [];
      const sellLevels: OrderLevel[] = [];
      
      // Buy limit orders (below market price, from closest to furthest)
      for (let i = 1; i <= cfg.numOrders; i++) {
        const distance = cfg.buyDistancePercent * i;
        const price = currentPrice * (1 - distance / 100);
        buyLevels.push({
          price: parseFloat(price.toFixed(8)),
          side: 'BUY',
          level: i,
          status: 'pending',
        });
      }
      
      // Sell limit orders (above market price, from closest to furthest)
      for (let i = 1; i <= cfg.numOrders; i++) {
        const distance = cfg.sellDistancePercent * i;
        const price = currentPrice * (1 + distance / 100);
        sellLevels.push({
          price: parseFloat(price.toFixed(8)),
          side: 'SELL',
          level: i,
          status: 'pending',
        });
      }
      
      // Calculate TP lines
      const tpBuyLine = currentPrice * (1 + cfg.tpPercent / 100);
      const tpSellLine = currentPrice * (1 - cfg.tpPercent / 100);
      
      addLog(`📐 TP Buy: $${tpBuyLine.toFixed(2)} | TP Sell: $${tpSellLine.toFixed(2)}`, 'info');
      addLog(`📐 Buy orders: ${buyLevels.map(o => `$${o.price.toFixed(2)}`).join(', ')}`, 'info');
      addLog(`📐 Sell orders: ${sellLevels.map(o => `$${o.price.toFixed(2)}`).join(', ')}`, 'info');
      
      // Place buy limit orders on exchange
      for (let i = 0; i < buyLevels.length; i++) {
        try {
          const order = await placeLimitOrder(
            cfg.apiKey,
            cfg.apiSecret,
            cfg.symbol,
            'BUY',
            buyLevels[i].price,
            cfg.orderQuantity,
            cfg.testnet
          );
          buyLevels[i].orderId = order.orderId;
          buyLevels[i].status = 'active';
          addLog(`✅ BUY LIMIT #${i + 1} placed at $${buyLevels[i].price.toFixed(2)} (ID: ${order.orderId})`, 'success');
        } catch (error: any) {
          addLog(`❌ Failed BUY LIMIT #${i + 1}: ${error.response?.data?.msg || error.message}`, 'error');
        }
        // Small delay between orders to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Place sell limit orders on exchange
      for (let i = 0; i < sellLevels.length; i++) {
        try {
          const order = await placeLimitOrder(
            cfg.apiKey,
            cfg.apiSecret,
            cfg.symbol,
            'SELL',
            sellLevels[i].price,
            cfg.orderQuantity,
            cfg.testnet
          );
          sellLevels[i].orderId = order.orderId;
          sellLevels[i].status = 'active';
          addLog(`✅ SELL LIMIT #${i + 1} placed at $${sellLevels[i].price.toFixed(2)} (ID: ${order.orderId})`, 'success');
        } catch (error: any) {
          addLog(`❌ Failed SELL LIMIT #${i + 1}: ${error.response?.data?.msg || error.message}`, 'error');
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Update state with all order info
      setState(prev => ({
        ...prev,
        buyOrders: buyLevels,
        sellOrders: sellLevels,
        tpBuyLine: parseFloat(tpBuyLine.toFixed(8)),
        tpSellLine: parseFloat(tpSellLine.toFixed(8)),
        phase: 'monitoring',
        safeZoneActive: 'none',
      }));
      
      addLog('🟢 Strategy ACTIVE - monitoring price in real-time...', 'success');
      addLog(`📊 Watching: TP Buy $${tpBuyLine.toFixed(2)} ↑ | TP Sell $${tpSellLine.toFixed(2)} ↓`, 'info');
      
    } catch (error: any) {
      addLog(`❌ Error placing orders: ${error.response?.data?.msg || error.message}`, 'error');
      setState(prev => ({ ...prev, phase: 'idle' }));
      isClosingRef.current = false;
    }
  }, [addLog]);

  // Periodic check for order status changes on exchange
  // Keep ref updated with latest executeCloseAll
  useEffect(() => {
    executeCloseAllRef.current = executeCloseAll;
  }, [executeCloseAll]);

  const startPeriodicCheck = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(async () => {
      const currentState = stateRef.current;
      const cfg = configRef.current;
      
      if (!currentState.isRunning || currentState.phase !== 'monitoring' || isClosingRef.current) {
        return;
      }
      
      try {
        // Check open orders on exchange
        const openOrders = await getOpenOrders(cfg.apiKey, cfg.apiSecret, cfg.symbol, cfg.testnet);
        
        // Update order statuses based on what's still open on exchange
        const openOrderIds = new Set(openOrders.map(o => o.orderId));
        
        let buyStatusChanged = false;
        let sellStatusChanged = false;
        
        const updatedBuyOrders = currentState.buyOrders.map(order => {
          if (order.orderId && !openOrderIds.has(order.orderId) && order.status === 'active') {
            buyStatusChanged = true;
            addLog(`💰 BUY LIMIT #${order.level} at $${order.price.toFixed(2)} was FILLED!`, 'trade');
            return { ...order, status: 'filled' as const };
          }
          return order;
        });
        
        const updatedSellOrders = currentState.sellOrders.map(order => {
          if (order.orderId && !openOrderIds.has(order.orderId) && order.status === 'active') {
            sellStatusChanged = true;
            addLog(`💰 SELL LIMIT #${order.level} at $${order.price.toFixed(2)} was FILLED!`, 'trade');
            return { ...order, status: 'filled' as const };
          }
          return order;
        });
        
        if (buyStatusChanged || sellStatusChanged) {
          setState(prev => ({
            ...prev,
            buyOrders: updatedBuyOrders,
            sellOrders: updatedSellOrders,
          }));
        }
      } catch (error: any) {
        // Silently handle periodic check errors
        if (error.response?.status === 429) {
          addLog('⚠️ Rate limited - slowing down checks', 'warning');
        }
      }
    }, 5000); // Check every 5 seconds
  }, [addLog]);

  const startBot = useCallback(async () => {
    const cfg = configRef.current;
    
    if (!cfg.apiKey || !cfg.apiSecret) {
      addLog('❌ Please set API keys first!', 'error');
      return;
    }
    
    addLog('🚀 Starting bot...', 'info');
    setState(prev => ({ ...prev, isRunning: true }));
    
    // Connect WebSocket for live prices
    connectWebSocket();
    
    // Start periodic order status checks
    startPeriodicCheck();
    
    // Wait for price data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Place initial strategy orders
    await placeStrategyOrders();
  }, [addLog, connectWebSocket, placeStrategyOrders, startPeriodicCheck]);

  const stopBot = useCallback(async () => {
    addLog('🛑 Stopping bot...', 'warning');
    setState(prev => ({ ...prev, isRunning: false, phase: 'idle' }));
    
    // Clear periodic check
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Cancel all orders on exchange
    const cfg = configRef.current;
    if (cfg.apiKey && cfg.apiSecret) {
      try {
        await cancelAllOrders(cfg.apiKey, cfg.apiSecret, cfg.symbol, cfg.testnet);
        addLog('✅ All orders cancelled on exchange', 'success');
      } catch (error: any) {
        addLog(`⚠️ Error cancelling orders: ${error.message}`, 'warning');
      }
    }
    
    isClosingRef.current = false;
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    config,
    setConfig,
    state,
    logs,
    startBot,
    stopBot,
    clearLogs,
    addLog,
  };
}
