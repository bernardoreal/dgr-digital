import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { DGRChapter } from '../types';

interface ChapterCardProps {
  chapter: DGRChapter;
  onClick: (chapter: DGRChapter) => void;
}

const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onClick }) => {
  // Extract border color for use as text/bg color instead
  const accentColorClass = chapter.color.replace('border-l-4 ', '').replace('border-', 'text-');
  const bgAccentClass = chapter.color.replace('border-l-4 ', '').replace('border-', 'bg-');

  // Format ID for display (pad with 0 if numeric)
  const isNumeric = !isNaN(Number(chapter.id));
  const displayId = isNumeric ? String(chapter.id).padStart(2, '0') : chapter.id;

  return (
    <div 
      onClick={() => onClick(chapter)}
      className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 flex flex-col h-full transform hover:-translate-y-2 relative"
    >
      {/* Top Accent Line */}
      <div className={`h-1 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-latam-indigo to-latam-coral`}></div>
      
      <div className="p-6 flex-grow flex flex-col relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-2xl 
            bg-gray-50 group-hover:bg-latam-indigo group-hover:text-white
            transition-colors duration-300 shadow-sm
          `}>
            {chapter.icon ? (
                <chapter.icon className="w-6 h-6" />
            ) : (
                <span className="font-bold text-xl">{chapter.id}</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Chapter Number Top Right - Gradient */}
            <span className="text-4xl font-black bg-gradient-to-br from-latam-coral to-latam-indigo bg-clip-text text-transparent font-mono select-none opacity-90">
                {displayId}
            </span>

            {/* Hover Action Arrow */}
            <div className="p-2 rounded-full bg-gray-50 text-gray-400 group-hover:bg-latam-coral group-hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 shadow-sm">
                <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-latam-indigo mb-3 group-hover:text-latam-coral transition-colors leading-tight">
          {chapter.title}
        </h3>
        
        <p className="text-sm text-latam-textMuted leading-relaxed flex-grow line-clamp-3 mb-4">
          {chapter.description}
        </p>
        
        {/* Decorative background number/icon */}
        <div className="absolute -bottom-6 -right-6 text-[120px] font-bold text-gray-50 opacity-50 select-none pointer-events-none group-hover:text-gray-100 transition-colors">
          {chapter.id}
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;