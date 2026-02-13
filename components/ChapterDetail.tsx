import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Bookmark, AlertTriangle, Check, X as XIcon, ChevronRight, 
    CheckSquare, Square, RotateCcw, ArrowRightLeft, Table as TableIcon, 
    ExternalLink, Database, Search, Radiation, Users, Beaker, HelpCircle, Plane 
} from 'lucide-react';
import { 
    DGRChapter, DGRSection, DGRContentBlock, DGRTable, DGRList, DGRNote,
    DGRMark, DGRChecklist, DGRTool, DGRWizard, DGRDatabase, DGRDefinition, DGRFigure, DGRVariation
} from '../types.ts';
import UNDetailModal from './UNDetailModal.tsx';
import { fetchOfficialUNData } from '../services/geminiService.ts';

interface ChapterDetailProps {
  chapter: DGRChapter;
  onBack: () => void;
  initialSearchTerm?: string;
  initialScrollId?: string | null;
  onClearInitialScroll: () => void;
}

const ChapterDetail: React.FC<ChapterDetailProps> = ({ 
    chapter, 
    onBack, 
    initialSearchTerm = '', 
    initialScrollId, 
    onClearInitialScroll 
}) => {
  
  // --- State ---
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedUNEntry, setSelectedUNEntry] = useState<Record<string, any> | null>(null);
  const [verifiedRegistry, setVerifiedRegistry] = useState<Record<string, any>>({});
  const [segregationClassA, setSegregationClassA] = useState<string>('');
  const [segregationClassB, setSegregationClassB] = useState<string>('');
  const [wizardStates, setWizardStates] = useState<Record<string, string>>({});

  // --- Effects ---

  // Handle Initial Scroll (Deep Linking)
  useEffect(() => {
    if (initialScrollId) {
      setTimeout(() => {
        const element = document.getElementById(initialScrollId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          element.classList.add('bg-yellow-50', 'transition-colors', 'duration-1000');
          setTimeout(() => element.classList.remove('bg-yellow-50'), 2500);
          setActiveSectionId(initialScrollId);
        }
        onClearInitialScroll();
      }, 300);
    }
  }, [initialScrollId, onClearInitialScroll]);

  // Scroll Spy for Sidebar
  useEffect(() => {
    const handleScroll = () => {
        const sections = chapter.sections;
        for (const section of sections) {
            const element = document.getElementById(section.id);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top >= 0 && rect.top <= 300) {
                    setActiveSectionId(section.id);
                    break;
                }
            }
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapter]);

  // --- Helper Components ---

  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
      if (!highlight || !highlight.trim()) return <>{text}</>;
      const tokens = highlight.trim().split(/\s+/).filter(t => t.length > 0);
      if (tokens.length === 0) return <>{text}</>;
      const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
      const parts = text.split(regex);
      return (
        <>
          {parts.map((part, i) => {
            const isMatch = tokens.some(t => t.toLowerCase() === part.toLowerCase());
            return isMatch ? <span key={i} className="bg-yellow-200 text-gray-900 px-0.5 rounded">{part}</span> : part;
          })}
        </>
      );
  };
  
  const renderMark = (mark: DGRMark, key: string) => {
    const baseClasses = "border-2 border-black p-2 text-center font-bold text-xs relative flex flex-col items-center justify-center";
    switch(mark.type) {
        case 'cargo-only': return <div key={key} className={`${baseClasses} w-32 h-20 bg-orange-400 text-black`}><Plane className="w-6 h-6 mb-1"/>CARGO AIRCRAFT ONLY</div>;
        case 'orientation': return <div key={key} className={`${baseClasses} w-24 h-24 bg-white`}><svg className="w-12 h-12" viewBox="0 0 24 24"><path d="M12 2L12 14M12 2L8 6M12 2L16 6M12 22L12 10M12 22L8 18M12 22L16 18M3 11L21 11M3 13L21 13" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>;
        case 'lithium-battery': return <div key={key} className={`${baseClasses} w-32 h-20`}><img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/IATA_lithium_battery_label.svg" className="w-8 h-8 mb-1" alt="Lithium Battery" /><div>UN {mark.data?.unNumbers}</div></div>;
        case 'lq-y': return <div key={key} className={`${baseClasses} w-24 h-24 transform rotate-45`}><div className="bg-black w-full h-1/2 absolute top-0"></div><div className="absolute font-