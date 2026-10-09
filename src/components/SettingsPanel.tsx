import { useState } from 'react';
import type { BotConfig } from '../types';
import { Settings, Eye, EyeOff, Shield } from 'lucide-react';

interface Props {
  config: BotConfig;
  setConfig: (config: BotConfig) => void;
  isRunning: boolean;
}

export default function SettingsPanel({ config, setConfig, isRunning }: Props) {
  const [showSecret, setShowSecret] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const updateConfig = (key: keyof BotConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Settings size={20} className="text-blue-400" />
        Bot Settings
      </h3>

      <div className="space-y-4">
        {/* API Keys */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">API Credentials</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">API Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => updateConfig('apiKey', e.target.value)}
                  disabled={isRunning}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white font-mono pr-10 disabled:opacity-50"
                  placeholder="Enter your Binance API Key"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">API Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={config.apiSecret}
                  onChange={(e) => updateConfig('apiSecret', e.target.value)}
                  disabled={isRunning}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white font-mono pr-10 disabled:opacity-50"
                  placeholder="Enter your Binance API Secret"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.testnet}
                onChange={(e) => updateConfig('testnet', e.target.checked)}
                disabled={isRunning}
                className="rounded border-gray-600 bg-gray-700 text-blue-500"
              />
              <label className="text-xs text-gray-400">
                Use Testnet (recommended for testing)
              </label>
            </div>
          </div>
        </div>

        {/* Trading Pair */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Trading Pair</label>
          <select
            value={config.symbol}
            onChange={(e) => updateConfig('symbol', e.target.value)}
            disabled={isRunning}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="BNBUSDT">BNB/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
            <option value="XRPUSDT">XRP/USDT</option>
            <option value="DOGEUSDT">DOGE/USDT</option>
            <option value="ADAUSDT">ADA/USDT</option>
            <option value="AVAXUSDT">AVAX/USDT</option>
            <option value="LINKUSDT">LINK/USDT</option>
            <option value="MATICUSDT">MATIC/USDT</option>
          </select>
        </div>

        {/* Strategy Parameters */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <span className="text-sm font-semibold text-blue-400 mb-3 block">Strategy Parameters</span>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Number of Orders</label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.numOrders}
                onChange={(e) => updateConfig('numOrders', parseInt(e.target.value))}
                disabled={isRunning}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Order Quantity</label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={config.orderQuantity}
                onChange={(e) => updateConfig('orderQuantity', parseFloat(e.target.value))}
                disabled={isRunning}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Buy Distance % (per level)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={config.buyDistancePercent}
                onChange={(e) => updateConfig('buyDistancePercent', parseFloat(e.target.value))}
                disabled={isRunning}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Sell Distance % (per level)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={config.sellDistancePercent}
                onChange={(e) => updateConfig('sellDistancePercent', parseFloat(e.target.value))}
                disabled={isRunning}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">TP Distance %</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={config.tpPercent}
                onChange={(e) => updateConfig('tpPercent', parseFloat(e.target.value))}
                disabled={isRunning}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Safe Zone %</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={config.safeZonePercent}
                onChange={(e) => updateConfig('safeZonePercent', parseFloat(e.target.value))}
                disabled={isRunning}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
          <p className="text-xs text-red-300">
            ⚠️ <strong>WARNING:</strong> Trading bots can lose money. Use testnet first. 
            Never invest more than you can afford to lose. API keys are stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
