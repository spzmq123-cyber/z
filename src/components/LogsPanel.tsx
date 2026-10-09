import type { LogEntry } from '../types';
import { ScrollText, Trash2 } from 'lucide-react';

interface Props {
  logs: LogEntry[];
  onClear: () => void;
}

export default function LogsPanel({ logs, onClear }: Props) {
  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'trade': return 'text-purple-400';
      default: return 'text-gray-300';
    }
  };

  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'trade': return '💹';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ScrollText size={20} className="text-purple-400" />
          Activity Log
          <span className="text-xs text-gray-500 font-normal">({logs.length})</span>
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded border border-gray-700 hover:border-gray-500"
        >
          <Trash2 size={12} />
          Clear
        </button>
      </div>
      
      <div className="h-[300px] overflow-y-auto space-y-1 font-mono text-xs scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No logs yet. Start the bot to see activity.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`flex gap-2 py-1 px-2 rounded hover:bg-gray-800/50 ${getTypeColor(log.type)}`}>
              <span className="text-gray-500 whitespace-nowrap">
                {log.timestamp.toLocaleTimeString()}
              </span>
              <span>{getTypeIcon(log.type)}</span>
              <span className="flex-1">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
