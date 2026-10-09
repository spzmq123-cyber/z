import type { BotState } from '../types';

interface Props {
  state: BotState;
}

export default function StrategyVisual({ state }: Props) {
  const { currentPrice, tpBuyLine, tpSellLine, buyOrders, sellOrders, safeZoneActive, phase } = state;
  
  if (!currentPrice) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">📊 Strategy Map</h3>
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <div className="w-12 h-12 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-sm">Waiting for price data...</p>
          <p className="text-xs text-gray-600 mt-1">Start the bot to begin</p>
        </div>
      </div>
    );
  }

  // Calculate visual positions
  const allPrices = [
    tpBuyLine,
    ...sellOrders.map(o => o.price).filter(p => p > 0),
    currentPrice,
    ...buyOrders.map(o => o.price).filter(p => p > 0),
    tpSellLine,
  ].filter(p => p > 0);

  if (allPrices.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">📊 Strategy Map</h3>
        <p className="text-gray-400 text-center py-8">Current Price: ${currentPrice.toFixed(2)}</p>
      </div>
    );
  }

  const maxPrice = Math.max(...allPrices) * 1.01;
  const minPrice = Math.min(...allPrices) * 0.99;
  const range = maxPrice - minPrice;

  const getPosition = (price: number) => {
    if (range === 0) return 50;
    return Math.max(2, Math.min(98, ((maxPrice - price) / range) * 100));
  };

  const filledBuyCount = buyOrders.filter(o => o.status === 'filled').length;
  const filledSellCount = sellOrders.filter(o => o.status === 'filled').length;
  const activeBuyCount = buyOrders.filter(o => o.status === 'active').length;
  const activeSellCount = sellOrders.filter(o => o.status === 'active').length;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${phase === 'monitoring' ? 'bg-green-500 animate-pulse' : phase === 'closing' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></span>
          Strategy Map
        </h3>
        <div className="flex gap-3 text-xs">
          <span className="text-green-400">Buys: {activeBuyCount} active, {filledBuyCount} filled</span>
          <span className="text-red-400">Sells: {activeSellCount} active, {filledSellCount} filled</span>
        </div>
      </div>
      
      <div className="relative h-[500px] bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-transparent to-green-950/10"></div>
        
        {/* Grid lines */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-gray-800/30"
            style={{ top: `${i * 5}%` }}
          />
        ))}

        {/* TP BUY LINE */}
        {tpBuyLine > 0 && (
          <div
            className="absolute left-0 right-0 flex items-center transition-all duration-300"
            style={{ top: `${getPosition(tpBuyLine)}%` }}
          >
            <div className="w-full border-t-2 border-dashed border-emerald-400/70"></div>
            <div className="absolute right-2 bg-emerald-900/80 border border-emerald-500/50 rounded px-2 py-1 backdrop-blur-sm">
              <span className="text-emerald-300 text-xs font-mono font-bold">
                🎯 TP BUY ${tpBuyLine.toFixed(2)}
              </span>
            </div>
            {/* Glow effect */}
            <div className="absolute left-0 right-0 h-4 -top-2 bg-emerald-400/5"></div>
          </div>
        )}

        {/* SELL LIMIT ORDERS */}
        {sellOrders.slice().sort((a, b) => b.price - a.price).map((order, idx) => (
          <div
            key={`sell-${order.level}`}
            className="absolute left-0 right-0 flex items-center transition-all duration-300"
            style={{ top: `${getPosition(order.price)}%` }}
          >
            <div className={`w-full border-t-2 ${
              order.status === 'active' ? 'border-red-500/80' : 
              order.status === 'filled' ? 'border-red-300/40 border-dashed' : 
              'border-red-500/20 border-dotted'
            }`}></div>
            <div className={`absolute right-2 rounded px-2 py-1 backdrop-blur-sm ${
              order.status === 'active' ? 'bg-red-900/80 border border-red-500/50' :
              order.status === 'filled' ? 'bg-yellow-900/80 border border-yellow-500/50' :
              'bg-gray-800/80 border border-gray-600/50'
            }`}>
              <span className={`text-xs font-mono font-bold ${
                order.status === 'active' ? 'text-red-300' :
                order.status === 'filled' ? 'text-yellow-300' :
                'text-gray-400'
              }`}>
                {order.status === 'filled' ? '💰' : order.status === 'active' ? '📍' : '⏳'} SELL #{order.level} ${order.price.toFixed(2)}
              </span>
            </div>
          </div>
        ))}

        {/* MARKET PRICE */}
        <div
          className="absolute left-0 right-0 flex items-center z-10 transition-all duration-300"
          style={{ top: `${getPosition(currentPrice)}%` }}
        >
          <div className="w-full border-t-2 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]"></div>
          <div className="absolute left-1/2 -translate-x-1/2 bg-yellow-500 text-black rounded-lg px-4 py-1.5 font-bold text-sm shadow-lg shadow-yellow-500/30 whitespace-nowrap">
            💰 MARKET ${currentPrice.toFixed(2)}
          </div>
        </div>

        {/* BUY LIMIT ORDERS */}
        {buyOrders.slice().sort((a, b) => b.price - a.price).map((order, idx) => (
          <div
            key={`buy-${order.level}`}
            className="absolute left-0 right-0 flex items-center transition-all duration-300"
            style={{ top: `${getPosition(order.price)}%` }}
          >
            <div className={`w-full border-t-2 ${
              order.status === 'active' ? 'border-green-500/80' : 
              order.status === 'filled' ? 'border-green-300/40 border-dashed' : 
              'border-green-500/20 border-dotted'
            }`}></div>
            <div className={`absolute right-2 rounded px-2 py-1 backdrop-blur-sm ${
              order.status === 'active' ? 'bg-green-900/80 border border-green-500/50' :
              order.status === 'filled' ? 'bg-yellow-900/80 border border-yellow-500/50' :
              'bg-gray-800/80 border border-gray-600/50'
            }`}>
              <span className={`text-xs font-mono font-bold ${
                order.status === 'active' ? 'text-green-300' :
                order.status === 'filled' ? 'text-yellow-300' :
                'text-gray-400'
              }`}>
                {order.status === 'filled' ? '💰' : order.status === 'active' ? '📍' : '⏳'} BUY #{order.level} ${order.price.toFixed(2)}
              </span>
            </div>
          </div>
        ))}

        {/* TP SELL LINE */}
        {tpSellLine > 0 && (
          <div
            className="absolute left-0 right-0 flex items-center transition-all duration-300"
            style={{ top: `${getPosition(tpSellLine)}%` }}
          >
            <div className="w-full border-t-2 border-dashed border-orange-400/70"></div>
            <div className="absolute right-2 bg-orange-900/80 border border-orange-500/50 rounded px-2 py-1 backdrop-blur-sm">
              <span className="text-orange-300 text-xs font-mono font-bold">
                🎯 TP SELL ${tpSellLine.toFixed(2)}
              </span>
            </div>
            {/* Glow effect */}
            <div className="absolute left-0 right-0 h-4 -top-2 bg-orange-400/5"></div>
          </div>
        )}

        {/* Safe Zone Indicators */}
        {(safeZoneActive === 'buy' || safeZoneActive === 'both') && (
          <div className="absolute bottom-4 left-4 bg-yellow-500/20 border border-yellow-500/70 rounded-lg px-3 py-2 animate-pulse backdrop-blur-sm z-20">
            <span className="text-yellow-300 text-xs font-bold">🛡️ SAFE ZONE — BUYS</span>
          </div>
        )}
        {(safeZoneActive === 'sell' || safeZoneActive === 'both') && (
          <div className="absolute top-4 left-4 bg-yellow-500/20 border border-yellow-500/70 rounded-lg px-3 py-2 animate-pulse backdrop-blur-sm z-20">
            <span className="text-yellow-300 text-xs font-bold">🛡️ SAFE ZONE — SELLS</span>
          </div>
        )}

        {/* Phase overlays */}
        {phase === 'closing' && (
          <div className="absolute inset-0 bg-red-950/40 flex items-center justify-center z-30 backdrop-blur-[2px]">
            <div className="bg-red-900/90 border-2 border-red-500 rounded-xl px-8 py-5 animate-pulse shadow-2xl shadow-red-500/30">
              <span className="text-red-100 text-2xl font-bold">⚡ CLOSING ALL ⚡</span>
            </div>
          </div>
        )}

        {phase === 'resetting' && (
          <div className="absolute inset-0 bg-blue-950/40 flex items-center justify-center z-30 backdrop-blur-[2px]">
            <div className="bg-blue-900/90 border-2 border-blue-500 rounded-xl px-8 py-5 animate-pulse shadow-2xl shadow-blue-500/30">
              <span className="text-blue-100 text-2xl font-bold">🔄 RESTARTING...</span>
            </div>
          </div>
        )}

        {phase === 'placing' && (
          <div className="absolute inset-0 bg-blue-950/20 flex items-center justify-center z-30">
            <div className="bg-gray-900/90 border border-blue-500/50 rounded-xl px-6 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-200 text-lg font-bold">Placing Orders...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
        <span className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-emerald-400 border-dashed inline-block"></span>
          <span className="text-gray-400">TP Buy Line</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-red-500 inline-block"></span>
          <span className="text-gray-400">Sell Limits</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-yellow-400 inline-block"></span>
          <span className="text-gray-400">Market Price</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-green-500 inline-block"></span>
          <span className="text-gray-400">Buy Limits</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-orange-400 border-dashed inline-block"></span>
          <span className="text-gray-400">TP Sell Line</span>
        </span>
        <span className="flex items-center gap-2">
          <span>💰</span>
          <span className="text-gray-400">Filled Order</span>
        </span>
      </div>
    </div>
  );
}
