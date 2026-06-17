import React from 'react';
import { Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { DGRChapter } from '../types';

interface BookmarksPanelProps {
  bookmarks: string[];
  chaptersConfig: DGRChapter[];
  onSelectBookmark: (chapterId: string | number, sectionId: string) => void;
  onRemoveBookmark: (sectionId: string) => void;
}

const BookmarksPanel: React.FC<BookmarksPanelProps> = ({ bookmarks, chaptersConfig, onSelectBookmark, onRemoveBookmark }) => {
  if (bookmarks.length === 0) {
    return (
      <div className="bg-white dark:bg-[#110e26] rounded-2xl shadow-sm border border-gray-200/80 dark:border-slate-800/80 p-5 mb-6">
        <div className="flex items-center space-x-2 text-latam-coral dark:text-rose-400 mb-4">
          <Bookmark className="w-5 h-5" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100 uppercase tracking-widest text-xs">
            Acesso Rápido
          </h3>
        </div>
        <div className="text-center py-6">
          <Bookmark className="w-8 h-8 mx-auto text-gray-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
            Nenhuma seção favoritada. Use o ícone de <Bookmark className="w-3 h-3 inline" /> nas seções dos capítulos para adicionar acessos rápidos, como procedimentos de emergência.
          </p>
        </div>
      </div>
    );
  }

  // Find info for each bookmark
  const pinnedSections = bookmarks.map(bookmarkId => {
    for (const chapter of chaptersConfig) {
      const section = chapter.sections.find(s => s.id === bookmarkId);
      if (section) {
        return { chapterId: chapter.id, sectionId: section.id, sectionTitle: section.title, chapterTitle: chapter.title };
      }
    }
    return null;
  }).filter(Boolean) as { chapterId: string | number, sectionId: string, sectionTitle: string, chapterTitle: string }[];

  return (
    <div className="bg-white dark:bg-[#110e26] rounded-2xl shadow-sm border border-gray-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 overflow-hidden mb-6 flex flex-col">
      <div className="p-4 border-b border-gray-100 dark:border-slate-800/60 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-latam-coral dark:text-rose-400">
          <Bookmark className="w-4 h-4 fill-current" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100 uppercase tracking-widest text-xs">
            Acesso Rápido
          </h3>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto max-h-[400px]">
        {pinnedSections.map((item) => (
          <div 
            key={item.sectionId} 
            className="group flex flex-col border-b border-gray-100 dark:border-slate-800/50 last:border-0 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer p-4 overflow-hidden"
            onClick={() => onSelectBookmark(item.chapterId, item.sectionId)}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-latam-coral py-0.5 rounded flex items-center">
                Seção {item.sectionId}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBookmark(item.sectionId);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500"
                title="Remover favorito"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="font-bold text-sm text-gray-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-latam-coral transition-colors mb-1">
              {item.sectionTitle}
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs text-gray-500 dark:text-slate-400 truncate pr-2 font-medium">
                Capítulo {item.chapterId}
              </span>
              <ArrowRight className="w-3 h-3 text-gray-300 dark:text-slate-600 group-hover:text-latam-coral transform group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarksPanel;
