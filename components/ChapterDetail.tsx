
import React, { useState, useEffect, useRef } from 'react';
import { 
    ArrowLeft, Bookmark, AlertTriangle, ArrowRightLeft, 
    Search, ExternalLink, Box, Info, FilterX, CheckSquare, Square,
    BookOpen, Glasses, Eye, EyeOff, X
} from 'lucide-react';
import { 
    DGRChapter, DGRContentBlock, DGRTable, DGRList, DGRNote,
    DGRMark, DGRDatabase, DGRDefinition, DGRChecklist, DGRVisualGallery, DGRTool
} from '../types';
import { getGlossaryIntervals } from '../services/glossaryEngine';
import UNDetailModal from './UNDetailModal';
import DatabasePopup from './DatabasePopup';
import HazardLabel from './HazardLabel';
import HazardClassModal from './HazardClassModal';
import SegregationChecker from './SegregationChecker';
import AcceptanceChecklist from './AcceptanceChecklist';
import ERGDecoder from './ERGDecoder';
import DGRWizard from './DGRWizard';

let popupWindow: Window | null = null;

interface ChapterDetailProps {
  chapter: DGRChapter;
  onBack: () => void;
  initialSearchTerm?: string;
  initialScrollId: string | null;
  onClearInitialScroll: () => void;
  onOpenTable?: (db: DGRDatabase) => void;
}

const ChapterDetail: React.FC<ChapterDetailProps> = ({ 
    chapter, 
    onBack, 
    initialSearchTerm = '', 
    initialScrollId, 
    onClearInitialScroll,
    onOpenTable
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedUNEntry, setSelectedUNEntry] = useState<Record<string, any> | null>(null);
  const [tableFilters, setTableFilters] = useState<Record<string, string>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedHazard, setSelectedHazard] = useState<string | null>(null);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [activeGlossary, setActiveGlossary] = useState<{
    term: string;
    definition: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (initialScrollId) {
      setTimeout(() => {
        const element = document.getElementById(initialScrollId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          element.classList.add('bg-yellow-100');
          setTimeout(() => element.classList.remove('bg-yellow-100'), 3000);
          setActiveSectionId(initialScrollId);
        }
        onClearInitialScroll();
      }, 400);
    }
  }, [initialScrollId, onClearInitialScroll]);
  
  const openDB = (db: DGRDatabase) => {
    if (onOpenTable) {
      onOpenTable(db);
    }
    window.location.href = `/?table=${db.id}`;
  };
  
  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
      const intervals = getGlossaryIntervals(text, highlight);
      if (intervals.length === 0) return <>{text}</>;
      
      const result: React.ReactNode[] = [];
      let currentIndex = 0;
      
      intervals.forEach((inv, idx) => {
        // 1. Add any text before the interval
        if (inv.start > currentIndex) {
          result.push(
            <React.Fragment key={`text-${idx}`}>
              {text.substring(currentIndex, inv.start)}
            </React.Fragment>
          );
        }
        
        // 2. Add the highlighted interval
        const matchText = text.substring(inv.start, inv.end);
        if (inv.type === 'search') {
          result.push(
            <mark key={`search-${idx}`} className="bg-yellow-200 text-gray-900 px-0.5 rounded font-medium">
              {matchText}
            </mark>
          );
        } else {
          // Glossary term
          result.push(
            <button
              key={`glossary-${idx}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const rect = e.currentTarget.getBoundingClientRect();
                
                setActiveGlossary({
                  term: inv.term!,
                  definition: inv.definition!,
                  x: rect.left,
                  y: rect.top
                });
              }}
              className="border-b-[1.5px] border-dotted border-latam-coral text-latam-indigo font-bold hover:bg-indigo-50/70 hover:text-indigo-950 px-0.5 rounded transition-all cursor-help focus:outline-none"
              title="Clique para ver definição regulatória"
            >
              {matchText}
            </button>
          );
        }
        
        currentIndex = inv.end;
      });
      
      // 3. Add any remaining text
      if (currentIndex < text.length) {
        result.push(
          <React.Fragment key={`text-end-${text.length}`}>
            {text.substring(currentIndex)}
          </React.Fragment>
        );
      }
      
      return <>{result}</>;
  };

  const renderTable = (t: DGRTable, tableIndex: number) => {
    const is93A = t.caption?.includes('9.3.A') || t.type === 'matrix';
    const filterKey = `${chapter.id}-${tableIndex}`;
    const currentFilter = tableFilters[filterKey] || '';
    const filteredRows = (is93A || !currentFilter) ? t.rows : t.rows.filter(row => row.some(cell => String(cell).toLowerCase().includes(currentFilter.toLowerCase())));
    
    return (
      <div key={tableIndex} className={`overflow-hidden ${isReadingMode ? 'my-4 border-2 border-black bg-white shadow-none rounded-none' : 'my-8 rounded-2xl border border-gray-100 bg-white shadow-xl'}`}>
        <div className={`${isReadingMode ? 'bg-black text-white px-4 py-2 border-b-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-2' : 'bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4'}`}>
          <h4 className={`text-[10px] font-black uppercase ${isReadingMode ? 'text-white tracking-widest' : 'text-gray-400 tracking-[0.2em]'}`}>{t.caption || 'Tabela Regulamentar'}</h4>
          {!is93A ? (
            <div className="relative w-full md:w-64">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isReadingMode ? 'text-black' : 'text-gray-400'}`} />
                <input type="text" placeholder="Filtrar nesta tabela..." className={`w-full pl-9 pr-4 py-1.5 rounded-none text-xs outline-none ${isReadingMode ? 'bg-white border-2 border-black text-black font-extrabold' : 'bg-white border border-gray-200 focus:ring-2 focus:ring-latam-indigo/10'}`} value={currentFilter} onChange={e => setTableFilters(p => ({ ...p, [filterKey]: e.target.value }))} />
            </div>
          ) : (
            <div className={`flex items-center text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isReadingMode ? 'text-yellow-400 bg-black font-black border border-yellow-400' : 'text-latam-coral bg-rose-50'}`}>
                <FilterX className="w-3 h-3 mr-1.5" />Filtros Desativados (Matriz)
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
                <tr className={isReadingMode ? 'bg-gray-100' : 'bg-gray-50'}>
                    {t.headers.map((h, i) => (
                      <th key={i} className={`px-4 py-3 font-black border-b border-black text-[10px] uppercase tracking-wider ${isReadingMode ? 'text-black border-r border-black font-extrabold' : 'text-gray-500 tracking-widest border-b border-gray-100'}`}>
                        {h}
                      </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {filteredRows.length > 0 ? filteredRows.map((row, ri) => (
                    <tr key={ri} className={`border-b ${isReadingMode ? 'border-black hover:bg-yellow-50/20 bg-white' : 'border-gray-50 hover:bg-gray-50/30'} transition-colors`}>
                        {row.map((c, ci) => (
                            <td key={ci} className={`px-4 py-3 border-r ${isReadingMode ? 'border-black text-black font-bold text-xs' : 'border-gray-50 font-medium'} ${ci === 0 && !isReadingMode ? 'font-black bg-gray-50/50 text-gray-800' : ''} ${ci === 0 && isReadingMode ? 'bg-gray-100 font-extrabold text-black' : ''}`}>
                                {typeof c === 'boolean' ? (c ? <span className={isReadingMode ? "text-red-700 bg-red-100 px-1.5 py-0.5 rounded-none font-black border-2 border-red-700" : "text-red-600 font-black"}>SIM</span> : <span className={isReadingMode ? "text-black line-through text-opacity-50" : "text-gray-300 font-bold"}>NÃO</span>) : <HighlightText text={String(c)} highlight={currentFilter} />}
                            </td>
                         ))}
                    </tr>
                )) : (
                    <tr><td colSpan={t.headers.length} className={`px-6 py-12 text-center font-bold uppercase tracking-widest text-[10px] ${isReadingMode ? 'text-black bg-white font-extrabold' : 'text-gray-400'}`}>Nenhum registro corresponde ao filtro.</td></tr>
                )}
            </tbody>
          </table>
        </div>
        {t.footnotes && <div className={`p-4 border-t ${isReadingMode ? 'border-black bg-gray-50 text-black' : 'border-gray-50 bg-gray-50/30'}`}>{t.footnotes.map((fn, i) => <p key={i} className={`text-[10px] italic mb-1 ${isReadingMode ? 'text-black font-bold' : 'text-gray-400'}`}>{fn}</p>)}</div>}
      </div>
    );
  };

  const renderBlock = (b: DGRContentBlock, i: number) => {
    switch (b.type) {
      case 'paragraph': return <p key={i} className={`mb-6 leading-relaxed ${isReadingMode ? "text-base text-black font-bold tracking-wide" : "text-sm text-gray-700 font-medium"}`}><HighlightText text={b.content as string} highlight={initialSearchTerm} /></p>;
      case 'list': {
          const list = b.content as DGRList;
          const listClass = list.ordered ? (list.type === 'alpha' ? 'list-[lower-alpha]' : 'list-decimal') : 'list-disc';
          return <ul key={i} className={`pl-8 font-medium ${isReadingMode ? "space-y-2 mb-6 text-sm text-black font-extrabold list-outside" : "space-y-3 mb-8 text-sm text-gray-600 list-disc"}`}>{list.items.map((it, idx) => <li key={idx}><HighlightText text={it} highlight={initialSearchTerm} /></li>)}</ul>;
      }
      case 'table': return renderTable(b.content as DGRTable, i);
      case 'note': {
          const note = b.content as DGRNote;
          if (isReadingMode) {
              return (
                <div key={i} className="bg-white border-2 border-black p-5 mb-6">
                  <h5 className="font-extrabold text-black text-xs uppercase tracking-wider mb-2 flex items-center"><Info className="w-4 h-4 mr-2" />{note.title || 'Nota Regulamentar'}</h5>
                  <p className="text-sm text-black font-bold leading-relaxed">{note.text}</p>
                </div>
              );
          }
          return <div key={i} className="bg-blue-50 border-l-4 border-latam-indigo p-6 rounded-r-2xl mb-8 shadow-sm"><h5 className="font-black text-latam-indigo text-[10px] uppercase tracking-widest mb-2 flex items-center"><Info className="w-4 h-4 mr-2" />{note.title || 'Nota Regulamentar'}</h5><p className="text-sm text-indigo-900 font-medium leading-relaxed">{note.text}</p></div>;
      }
      case 'warning': {
          const warn = b.content as DGRNote;
          if (isReadingMode) {
              return (
                <div key={i} className="bg-red-50 border-2 border-red-700 p-5 mb-6 flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-700 mr-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-black text-red-900 text-xs uppercase tracking-wider mb-1">ALERTA DE SEGURANÇA MANDATÓRIO</h5>
                    <p className="text-sm text-red-950 font-bold leading-relaxed">{warn.text}</p>
                  </div>
                </div>
              );
          }
          return <div key={i} className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl mb-8 shadow-sm flex items-start"><AlertTriangle className="w-5 h-5 text-red-600 mr-4 mt-1 flex-shrink-0" /><div><h5 className="font-black text-red-800 text-[10px] uppercase tracking-widest mb-1">Alerta de Segurança</h5><p className="text-sm text-red-700 font-medium leading-relaxed">{warn.text}</p></div></div>;
      }
      case 'database': {
        const db = b.content as DGRDatabase;
        if (isReadingMode) {
            return (
                <div key={i} className="bg-white border-2 border-black p-6 mb-6 flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h3 className="font-black text-black text-lg uppercase tracking-tight mb-1">{db.title}</h3>
                        <p className="text-xs text-black font-extrabold uppercase">Base de Dados • {db.data.length} Registros</p>
                    </div>
                    <button onClick={() => openDB(db)} className="bg-black text-white px-6 py-3 border-2 border-black font-black uppercase text-xs hover:bg-gray-900 transition-all flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2" /> Explorar Base Completa
                    </button>
                </div>
            );
        }
        return (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-8 mb-10 shadow-2xl flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 text-center md:text-left">
                    <h3 className="font-black text-gray-900 text-xl uppercase tracking-tight mb-2">{db.title}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Base de Dados Indexada • {db.data.length} Registros</p>
                </div>
                <button onClick={() => openDB(db)} className="bg-latam-indigo text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-900 transition-all flex items-center">
                    <ExternalLink className="w-4 h-4 mr-3" /> Explorar Base Completa
                </button>
            </div>
        );
      }
      case 'visual-mark': {
          const mark = b.content as DGRMark;
          const MarkIcon = () => {
              switch (mark.type) {
                  case 'cargo-only': return <div className="bg-orange-400 text-black font-black text-center p-3 leading-tight w-40 h-24 flex items-center justify-center text-sm border-2 border-black">CARGO AIRCRAFT ONLY</div>;
                  case 'orientation': return <ArrowRightLeft className="w-24 h-24 text-black transform rotate-90" />;
                  case 'lithium-battery': return <div className="text-center"><Box className="w-12 h-12 mx-auto mb-1" /> <div className="font-bold text-xs">UN {mark.data?.unNumbers}</div></div>;
                  case 'lq-y': return <div className="font-black text-4xl text-black">Y</div>;
                  case 'eq': return <div className="font-black text-4xl text-red-600">E</div>;
                  default: return null;
              }
          };
          return (
            <div key={i} className="flex flex-col items-center my-10 animate-fade-in">
                <div className={`border-[6px] border-black p-6 bg-white shrink-0 mb-4 flex items-center justify-center min-w-[180px] min-h-[180px] ${isReadingMode ? 'shadow-none border-4' : 'shadow-2xl'} ${mark.type === 'lq-y' ? 'transform rotate-45' : ''}`}>
                    <MarkIcon />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{mark.caption}</p>
            </div>
          );
      }
      case 'definition-list': {
          const defs = b.content as DGRDefinition[];
          return (
            <dl key={i} className="space-y-4 mb-8">
              {defs.map((def, idx) => (
                <div key={idx} className={isReadingMode ? "border-l-4 border-black pl-4" : "border-l-2 border-gray-100 pl-4"}>
                  <dt className={`font-black text-sm ${isReadingMode ? 'text-black font-extrabold' : 'text-gray-800'}`}>{def.term}</dt>
                  <dd className={`text-sm ${isReadingMode ? 'text-black font-bold' : 'text-gray-600'}`}>{def.definition}</dd>
                </div>
              ))}
            </dl>
          );
      }
      case 'visual-gallery': {
          const gallery = b.content as DGRVisualGallery;
          return (
            <div key={i} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 my-12">
                {gallery.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center">
                        <button 
                          onClick={() => setSelectedHazard(item.type)}
                          className={`w-32 h-32 flex items-center justify-center mb-2 hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-latam-indigo/20 rounded-lg cursor-pointer ${isReadingMode ? 'border border-black' : ''}`}
                          title={`Ver detalhes da classe: ${item.caption}`}
                        >
                           <HazardLabel type={item.type} />
                        </button>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isReadingMode ? 'text-black font-black' : 'text-gray-500'}`}>{item.caption}</p>
                    </div>
                ))}
            </div>
          );
      }
      case 'tool': {
          const tool = b.content as DGRTool;
          if (tool.toolType === 'segregation-checker') {
              return <SegregationChecker key={i} matrix={tool.data.matrix} classes={tool.data.classes} labels={tool.data.labels} notes={tool.data.notes} />;
          }
          if (tool.toolType === 'acceptance-checklist') {
              return <AcceptanceChecklist key={i} />;
          }
          if (tool.toolType === 'erg-decoder') {
              return <ERGDecoder key={i} />;
          }
          return null;
      }
      case 'checklist': {
          const cl = b.content as DGRChecklist;
          return (
            <div key={i} className={`my-8 p-6 ${isReadingMode ? 'bg-white border-2 border-black shadow-none' : 'bg-white rounded-2xl shadow-lg border border-gray-100'}`}>
                <h4 className={`font-black text-lg mb-4 ${isReadingMode ? 'text-black' : 'text-latam-indigo'}`}>{cl.title}</h4>
                <div className="space-y-3">
                    {cl.items.map(item => (
                        <div key={item.id} className={`flex items-start p-3 cursor-pointer ${isReadingMode ? 'bg-white border border-black mb-1 hover:bg-gray-50 text-black font-bold' : 'bg-gray-50 rounded-lg'}`} onClick={() => setCheckedItems(p => ({...p, [item.id]: !p[item.id]}))}>
                            {checkedItems[item.id] ? <CheckSquare className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${isReadingMode ? 'text-black' : 'text-green-600'}`} /> : <Square className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />}
                            <div>
                                <p className={`text-sm ${isReadingMode ? 'text-black font-extrabold' : 'font-medium text-gray-800'}`}>{item.text}</p>
                                {item.reference && <p className={`text-xs mt-1 ${isReadingMode ? 'text-black font-bold bg-yellow-105' : 'text-gray-400'}`}>Ref: {item.reference}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          );
      }
      case 'wizard': {
          const wizardData = b.content as any;
          return <DGRWizard key={i} wizard={wizardData} />;
      }
      default: return <div key={i} className="p-4 bg-gray-100 rounded text-xs text-gray-400">Bloco de conteúdo não suportado: {b.type}</div>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-fade-in relative z-20">
      <aside className="lg:w-80 shrink-0 lg:sticky lg:top-28 self-start">
        <div className="space-y-8">
          <button onClick={onBack} className="group flex items-center text-latam-indigo font-black text-[10px] uppercase tracking-[0.2em] hover:text-latam-coral transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Retornar ao Sumário
          </button>
          
          {/* MODO LEITURA CONFIG PANEL */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center">
                  <Glasses className="w-4 h-4 text-latam-indigo mr-2" /> Modo Leitura
                </h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Pátio & Hangares</p>
              </div>
              <button 
                id="toggle-reading-mode"
                onClick={() => setIsReadingMode(!isReadingMode)} 
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-latam-indigo focus:ring-offset-2 ${isReadingMode ? 'bg-latam-indigo' : 'bg-gray-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isReadingMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
              Remove decorações pesadas, aumenta fontes e eleva o contraste de tabelas regulamentares para facilitar a leitura rápida sob sol forte ou pouca iluminação.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-latam-indigo text-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
                <Bookmark className="w-3 h-3 mr-3" /> Seções do Capítulo
            </div>
            <nav className="p-4 space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {chapter.sections.map(s => (
                    <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSectionId(s.id)} className={`flex items-center px-4 py-3 rounded-xl text-xs transition-all ${activeSectionId === s.id ? 'bg-indigo-50 text-latam-indigo font-black' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 font-bold'}`}>
                        <span className={`font-mono font-black text-sm mr-2 shrink-0 ${activeSectionId === s.id ? 'text-latam-indigo' : 'text-gray-950 bg-gray-100/80 px-1.5 py-0.5 rounded'}`}>{s.id}</span>
                        <span className="text-gray-300 mr-2 shrink-0">•</span>
                        <span className="truncate">{s.title}</span>
                    </a>
                ))}
            </nav>
          </div>
        </div>
      </aside>
      <div className="flex-1 max-w-5xl">
        <div className={`overflow-hidden mb-20 relative ${isReadingMode ? 'bg-white border-4 border-black p-6 md:p-10 rounded-none shadow-none text-black' : 'bg-white rounded-[40px] shadow-2xl border border-gray-50 p-12 md:p-16'}`}>
          {isReadingMode && (
            <div className="mb-6 bg-yellow-100 border-2 border-black p-4 flex items-center space-x-3 text-black">
              <Info className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Modo de Leitura Operacional Ativo</p>
                <p className="text-[10px] font-bold">Contrastes ampliados, fontes reforçadas e efeitos visuais decorativos simplificados para leitura rápida no pátio.</p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-4 mb-8">
            <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] ${isReadingMode ? 'bg-black text-white rounded-none border border-black' : 'bg-latam-indigo text-white rounded-full'}`}>
              Capítulo {chapter.id}
            </span>
            <div className={`h-px flex-grow ${isReadingMode ? 'bg-black h-0.5' : 'bg-gray-100'}`}></div>
          </div>
          <h1 className={`font-black uppercase mb-8 leading-none ${isReadingMode ? 'text-3xl md:text-4xl text-black tracking-normal' : 'text-4xl md:text-5xl text-gray-900 tracking-tighter'}`}>{chapter.title}</h1>
          <p className={`font-bold mb-12 italic leading-relaxed pl-8 ${isReadingMode ? 'text-base text-black border-l-4 border-black' : 'text-xl text-gray-400 border-l-8 border-gray-100'}`}>{chapter.description}</p>
          <div className={isReadingMode ? "space-y-12" : "space-y-24"}>
            {chapter.sections.map(s => (
                <section key={s.id} id={s.id} className="scroll-mt-32 group">
                    <div className="flex items-center mb-6">
                        <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight flex items-center">
                            {!isReadingMode && <span className="text-latam-coral mr-3 opacity-30">/</span>}
                            <span className={`font-mono font-black mr-3 shrink-0 text-sm md:text-base leading-none py-1 px-2 ${isReadingMode ? 'text-white bg-black border border-black' : 'text-latam-indigo bg-indigo-50/80 rounded-xl border border-indigo-100/40'}`}>
                              {s.id}
                            </span>
                            <span className={isReadingMode ? "text-black underline decoration-2 decoration-black font-extrabold" : ""}>{s.title}</span>
                        </h2>
                        <div className={`flex-grow ml-6 ${isReadingMode ? 'h-0.5 bg-black' : 'h-px bg-gray-50'}`}></div>
                    </div>
                    <div className={isReadingMode ? "pl-0" : "pl-0 md:pl-10"}>{s.blocks.map((b, idx) => renderBlock(b, idx))}</div>
                </section>
            ))}
          </div>
        </div>
      </div>
      {selectedUNEntry && <UNDetailModal data={selectedUNEntry} onClose={() => setSelectedUNEntry(null)} />}
      <HazardClassModal 
        isOpen={!!selectedHazard} 
        onClose={() => setSelectedHazard(null)} 
        hazardType={selectedHazard} 
      />

      {/* Floating Glossary Popover */}
      {activeGlossary && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center md:items-start md:justify-start bg-black/15 backdrop-blur-[1px]" 
          onClick={() => setActiveGlossary(null)}
        >
          <div 
            style={
              window.innerWidth > 768 
                ? {
                    position: 'absolute',
                    left: `${Math.min(window.innerWidth - 340, Math.max(16, activeGlossary.x - 120))}px`,
                    top: `${Math.min(window.innerHeight - 250, Math.max(16, activeGlossary.y + 24))}px`,
                  } 
                : undefined
            }
            className="bg-white rounded-2xl shadow-3xl border border-gray-200/90 p-5 w-11/12 max-w-[320px] md:w-[320px] absolute animate-scale-up-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3 border-b border-gray-100 pb-2">
              <div className="flex items-center space-x-2 min-w-0">
                <BookOpen className="w-4 h-4 text-latam-indigo flex-shrink-0" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider truncate">
                  {activeGlossary.term}
                </h3>
              </div>
              <button 
                onClick={() => setActiveGlossary(null)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-all"
                id="btn-close-glossary-popup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Definition */}
            <p className="text-xs text-gray-600 font-medium leading-relaxed mb-4 text-left">
              {activeGlossary.definition}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-[9px] font-black tracking-widest text-latam-coral uppercase">
                Glossário Técnico
              </span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                IATA DGR 2026
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterDetail;
