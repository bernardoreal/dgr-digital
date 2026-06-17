import React from 'react';
import { History, Trash2, BookOpen, Database, ChevronRight, Clock } from 'lucide-react';
import { RecentQuery } from '../types';

interface RecentQueriesPanelProps {
  recentQueries: RecentQuery[];
  onClear: () => void;
  onSelectChapter: (chapterId: string | number) => void;
  onSelectTable: (dbId: string) => void;
}

const RecentQueriesPanel: React.FC<RecentQueriesPanelProps> = ({
  recentQueries,
  onClear,
  onSelectChapter,
  onSelectTable
}) => {
  return (
    <div className="bg-white dark:bg-[#110e26] rounded-2xl border border-gray-200/85 dark:border-slate-800/80 p-5 shadow-xl shadow-gray-200/20 dark:shadow-none flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-latam-coral" />
          <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
            Últimas Consultas
          </h4>
        </div>
        {recentQueries.length > 0 && (
          <button
            onClick={onClear}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
            title="Limpar histórico"
            id="btn-clear-history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Query List */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[450px] pr-1">
        {recentQueries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center h-full">
            <Clock className="w-8 h-8 text-gray-300 dark:text-slate-700 mb-3 animate-pulse" />
            <h5 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
              Sem consultas rápidas
            </h5>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1.5 leading-relaxed">
              Capítulos e tabelas acessados recentemente estarão salvos aqui para restauração imediata.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentQueries.map((query) => (
              <div
                key={query.id}
                onClick={() => {
                  if (query.type === 'chapter') {
                    onSelectChapter(query.itemId);
                  } else {
                    onSelectTable(String(query.itemId));
                  }
                }}
                className="group flex items-start p-3 hover:bg-slate-50/80 dark:hover:bg-slate-900/65 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-850 transition-all cursor-pointer text-left"
              >
                {/* Icon Container */}
                <div className="mt-0.5 mr-3 flex-shrink-0">
                  {query.type === 'chapter' ? (
                    <div className="bg-indigo-50 dark:bg-indigo-950/40 text-latam-indigo dark:text-indigo-300 p-2 rounded-lg group-hover:bg-latam-indigo group-hover:text-white transition-all">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 p-2 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block truncate">
                      {query.subtitle}
                    </span>
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold tracking-tight">
                      {new Date(query.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-gray-800 dark:text-slate-200 group-hover:text-latam-indigo dark:group-hover:text-white transition-colors truncate mt-0.5">
                    {query.title}
                  </h5>
                </div>

                {/* Action Arrow */}
                <div className="self-center ml-2 text-gray-300 dark:text-slate-700 group-hover:text-latam-indigo dark:group-hover:text-indigo-300 transform group-hover:translate-x-0.5 transition-all">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentQueriesPanel;
