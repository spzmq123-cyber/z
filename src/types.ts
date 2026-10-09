export interface BotConfig {
  apiKey: string;
  apiSecret: string;
  symbol: string;
  numOrders: number;
  buyDistancePercent: number;
  sellDistancePercent: number;
  tpPercent: number;
  orderQuantity: number;
  safeZonePercent: number;
  testnet: boolean;
}

export interface OrderLevel {
  price: number;
  orderId?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'active';
  side: 'BUY' | 'SELL';
  level: number;
}

export interface BotState {
  isRunning: boolean;
  currentPrice: number;
  tpBuyLine: number;
  tpSellLine: number;
  buyOrders: OrderLevel[];
  sellOrders: OrderLevel[];
  phase: 'idle' | 'placing' | 'monitoring' | 'closing' | 'resetting';
  safeZoneActive: 'none' | 'buy' | 'sell' | 'both';
  cycleCount: number;
  totalProfit: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'trade';
}

export interface BinanceOrder {
  symbol: string;
  orderId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  status: string;
  type: string;
  side: string;
  time: number;
  updateTime: number;
}
