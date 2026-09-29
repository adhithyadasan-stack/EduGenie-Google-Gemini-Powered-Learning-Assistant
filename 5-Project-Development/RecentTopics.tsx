import React from 'react';
import { History, Lightbulb, FileText, CheckSquare, Trash2, ArrowUpRight } from 'lucide-react';
import { HistoryItem, ActionType } from '../types';

interface RecentTopicsProps {
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const RecentTopics: React.FC<RecentTopicsProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (history.length === 0) return null;

  const getTypeIcon = (type: ActionType) => {
    switch (type) {
      case 'explain':
        return <Lightbulb className="w-3.5 h-3.5 text-amber-500" />;
      case 'summarize':
        return <FileText className="w-3.5 h-3.5 text-purple-500" />;
      case 'quiz':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getTypeBadge = (type: ActionType) => {
    switch (type) {
      case 'explain':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'summarize':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'quiz':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <History className="w-4 h-4 text-indigo-600" />
          <span>Recently Explored in this Session</span>
        </div>
        <button
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
          title="Clear history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {history.slice(0, 8).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectHistoryItem(item)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-medium text-slate-700 transition-all text-left group"
          >
            {getTypeIcon(item.type)}
            <span className="font-semibold text-slate-800 capitalize truncate max-w-[150px] sm:max-w-[200px]">
              {item.topic}
            </span>
            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border ${getTypeBadge(
                item.type
              )}`}
            >
              {item.type}
            </span>
            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
