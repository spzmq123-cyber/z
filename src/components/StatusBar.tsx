import type { BotState } from '../types';
import { Activity, TrendingUp, RotateCw, Shield } from 'lucide-react';

interface Props {
  state: BotState;
}

export default function StatusBar({ state }: Props) {
  const phaseColors: Record<string, string> = {
    idle: 'bg-gray-500',
    placing: 'bg-blue-500 animate-pulse',
    monitoring: 'bg-green-500 animate-pulse',
    closing: 'bg-red-500 animate-pulse',
    resetting: 'bg-yellow-500 animate-pulse',
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Status */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Status</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${phaseColors[state.phase] || 'bg-gray-500'}`}></span>
            <span className="text-sm font-semibold text-white capitalize">{state.phase}</span>
          </div>
        </div>

        {/* Current Price */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-yellow-400" />
            <span className="text-xs text-gray-400">Price</span>
          </div>
          <span className="text-sm font-bold text-yellow-400 font-mono">
            {state.currentPrice ? `$${state.currentPrice.toFixed(2)}` : '---'}
          </span>
        </div>

        {/* TP Buy */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">TP Buy</span>
          </div>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {state.tpBuyLine ? `$${state.tpBuyLine.toFixed(2)}` : '---'}
          </span>
        </div>

        {/* TP Sell */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">TP Sell</span>
          </div>
          <span className="text-sm font-bold text-orange-400 font-mono">
            {state.tpSellLine ? `$${state.tpSellLine.toFixed(2)}` : '---'}
          </span>
        </div>

        {/* Cycles */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <RotateCw size={14} className="text-blue-400" />
            <span className="text-xs text-gray-400">Cycles</span>
          </div>
          <span className="text-sm font-bold text-blue-400">{state.cycleCount}</span>
        </div>

        {/* Safe Zone */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className={state.safeZoneActive !== 'none' ? 'text-yellow-400' : 'text-gray-500'} />
            <span className="text-xs text-gray-400">Safe Zone</span>
          </div>
          <span className={`text-sm font-bold ${state.safeZoneActive !== 'none' ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`}>
            {state.safeZoneActive === 'none' ? 'OFF' : state.safeZoneActive.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
