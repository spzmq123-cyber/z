import { useState } from 'react';
import { useBinanceBot } from './hooks/useBinanceBot';
import StrategyVisual from './components/StrategyVisual';
import SettingsPanel from './components/SettingsPanel';
import LogsPanel from './components/LogsPanel';
import StatusBar from './components/StatusBar';
import { Play, Square, Bot, Zap, AlertTriangle } from 'lucide-react';

export default function App() {
  const { config, setConfig, state, logs, startBot, stopBot, clearLogs } = useBinanceBot();
  const [activeTab, setActiveTab] = useState<'strategy' | 'settings' | 'logs'>('strategy');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStart = () => {
    if (!config.apiKey || !config.apiSecret) {
      alert('Please set your API keys in Settings first!');
      setActiveTab('settings');
      return;
    }
    setShowConfirm(true);
  };

  const confirmStart = () => {
    setShowConfirm(false);
    startBot();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Binance Grid Bot
              </h1>
              <p className="text-xs text-gray-400">
                {config.symbol} • {config.testnet ? '🧪 Testnet' : '🔴 LIVE'} • {config.numOrders} orders per side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!state.isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-green-600/20"
              >
                <Play size={16} />
                Start Bot
              </button>
            ) : (
              <button
                onClick={stopBot}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-red-600/20"
              >
                <Square size={16} />
                Stop Bot
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Confirm Start Bot</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-300 mb-4">
              <p>• Symbol: <strong className="text-white">{config.symbol}</strong></p>
              <p>• Mode: <strong className={config.testnet ? 'text-blue-400' : 'text-red-400'}>{config.testnet ? 'TESTNET' : 'LIVE TRADING'}</strong></p>
              <p>• Orders per side: <strong className="text-white">{config.numOrders}</strong></p>
              <p>• Quantity: <strong className="text-white">{config.orderQuantity}</strong></p>
              <p>• Buy distance: <strong className="text-white">{config.buyDistancePercent}%</strong> per level</p>
              <p>• Sell distance: <strong className="text-white">{config.sellDistancePercent}%</strong> per level</p>
              <p>• TP distance: <strong className="text-white">{config.tpPercent}%</strong></p>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-300">
                ⚠️ This bot will place real orders on {config.testnet ? 'testnet' : 'the LIVE exchange'}. 
                Make sure you understand the strategy before proceeding.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmStart}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                Confirm & Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Status Bar */}
        <StatusBar state={state} />

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-700">
          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'strategy'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            📊 Strategy Map
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            📜 Logs {logs.length > 0 && `(${logs.length})`}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'strategy' && (
          <div className="space-y-4">
            <StrategyVisual state={state} />
            
            {/* Strategy Info */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">📖 Strategy Explanation</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">↑</span>
                    <p><strong className="text-emerald-400">TP Buy Line:</strong> If price goes UP to this line, ALL orders are closed and strategy restarts at new price.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">↓</span>
                    <p><strong className="text-green-400">Buy Limits:</strong> {config.numOrders} buy limit orders placed below market price, each {config.buyDistancePercent}% apart.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">●</span>
                    <p><strong className="text-yellow-400">Market Price:</strong> The anchor point. All levels are calculated from here.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">↑</span>
                    <p><strong className="text-red-400">Sell Limits:</strong> {config.numOrders} sell limit orders placed above market price, each {config.sellDistancePercent}% apart.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">↓</span>
                    <p><strong className="text-orange-400">TP Sell Line:</strong> If price goes DOWN to this line, ALL orders are closed and strategy restarts at new price.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">🛡️</span>
                    <p><strong className="text-yellow-400">Safe Zone:</strong> If price reaches the last order on either side, SL moves to safe zone and everything resets.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsPanel config={config} setConfig={setConfig} isRunning={state.isRunning} />
        )}

        {activeTab === 'logs' && (
          <LogsPanel logs={logs} onClear={clearLogs} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 px-4 py-3 mt-8">
        <div className="max-w-7xl mx-auto text-center text-xs text-gray-500">
          <p>Binance Grid Trading Bot • For educational purposes • Use at your own risk</p>
          <p className="mt-1">API keys stored locally in browser • Never share your keys</p>
        </div>
      </footer>
    </div>
  );
}
