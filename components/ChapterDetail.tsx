
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
    ArrowLeft, Bookmark, AlertTriangle, ArrowRightLeft, 
    Search, ExternalLink, Box, Info, FilterX, CheckSquare, Square 
} from 'lucide-react';
import { 
    DGRChapter, DGRContentBlock, DGRTable, DGRList, DGRNote,
    DGRMark, DGRDatabase, DGRDefinition, DGRChecklist
} from '../types';
import UNDetailModal from './UNDetailModal';
import DatabasePopup from './DatabasePopup';

let popupWindow: Window | null = null;

const getPopupHead = (title: string) => `
    <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: { sans: ['Inter', 'sans-serif'] },
                colors: {
                  latam: {
                    indigo: '#1E1B4B',
                    indigoLight: '#312E81',
                    coral: '#E11D48',
                    bg: '#F8FAFC',
                    text: '#0F172A',
                    textMuted: '#64748B'
                  }
                }
              }
            }
          }
        </script>
        <style>body { font-family: 'Inter', sans-serif; background-color: #F8FAFC; }</style>
    </head>
`;

interface ChapterDetailProps {
  chapter: DGRChapter;
  onBack: () => void;
  initialSearchTerm?: string;
  initialScrollId: string | null;
  onClearInitialScroll: () => void;
}

const ChapterDetail: React.FC<ChapterDetailProps> = ({ 
    chapter, 
    onBack, 
    initialSearchTerm = '', 
    initialScrollId, 
    onClearInitialScroll 
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedUNEntry, setSelectedUNEntry] = useState<Record<string, any> | null>(null);
  const [tableFilters, setTableFilters] = useState<Record<string, string>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

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
    if (popupWindow && !popupWindow.closed) {
        popupWindow.focus();
        return;
    }

    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert('Pop-up bloqueado. Por favor, permita a abertura de novas abas.');
        return;
    }
    popupWindow = newWindow;

    newWindow.document.write(`
        <!DOCTYPE html><html lang="pt-BR">
        ${getPopupHead(db.title)}
        <body><div id="popup-root"></div></body></html>
    `);
    newWindow.document.close();

    const popupRootEl = newWindow.document.getElementById('popup-root');
    if (popupRootEl) {
        const root = ReactDOM.createRoot(popupRootEl);
        root.render(<React.StrictMode><DatabasePopup initialDb={db} /></React.StrictMode>);
    }
  };
  
  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
      if (!highlight?.trim()) return <>{text}</>;
      const tokens = highlight.trim().split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return <>{text}</>;
      const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
      return (
        <>
            {text.split(regex).map((part, i) => 
                tokens.some(t => t.toLowerCase() === part.toLowerCase()) 
                ? <mark key={i} className="bg-yellow-200 text-gray-900 px-0.5 rounded">{part}</mark> 
                : part
            )}
        </>
      );
  };

  const renderTable = (t: DGRTable, tableIndex: number) => {
    const is93A = t.caption?.includes('9.3.A') || t.type === 'matrix';
    const filterKey = `${chapter.id}-${tableIndex}`;
    const currentFilter = tableFilters[filterKey] || '';
    const filteredRows = (is93A || !currentFilter) ? t.rows : t.rows.filter(row => row.some(cell => String(cell).toLowerCase().includes(currentFilter.toLowerCase())));
    
    return (
      <div key={tableIndex} className="my-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
        <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.caption || 'Tabela Regulamentar'}</h4>
          {!is93A ? (
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="Filtrar nesta tabela..." className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-latam-indigo/10 outline-none" value={currentFilter} onChange={e => setTableFilters(p => ({ ...p, [filterKey]: e.target.value }))} />
            </div>
          ) : (
            <div className="flex items-center text-[9px] font-bold text-latam-coral uppercase tracking-widest bg-rose-50 px-2 py-1 rounded">
                <FilterX className="w-3 h-3 mr-1.5" />Filtros Desativados (Matriz)
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
                <tr className="bg-gray-50">
                    {t.headers.map((h, i) => <th key={i} className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {filteredRows.length > 0 ? filteredRows.map((row, ri) => (
                    <tr key={ri} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                        {row.map((c, ci) => (
                            <td key={ci} className={`px-6 py-4 border-r border-gray-50 ${ci === 0 ? 'font-black bg-gray-50/50 text-gray-800' : 'font-medium'}`}>
                                {typeof c === 'boolean' ? (c ? <span className="text-red-600 font-black">SIM</span> : <span className="text-gray-300 font-bold">NÃO</span>) : <HighlightText text={String(c)} highlight={currentFilter} />}
                            </td>
                        ))}
                    </tr>
                )) : (
                    <tr><td colSpan={t.headers.length} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">Nenhum registro corresponde ao filtro.</td></tr>
                )}
            </tbody>
          </table>
        </div>
        {t.footnotes && <div className="bg-gray-50/30 p-4 border-t border-gray-50">{t.footnotes.map((fn, i) => <p key={i} className="text-[10px] text-gray-400 italic mb-1">{fn}</p>)}</div>}
      </div>
    );
  };

  const renderBlock = (b: DGRContentBlock, i: number) => {
    switch (b.type) {
      case 'paragraph': return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-6 font-medium"><HighlightText text={b.content as string} highlight={initialSearchTerm} /></p>;
      case 'list': {
          const list = b.content as DGRList;
          const listClass = list.ordered ? (list.type === 'alpha' ? 'list-[lower-alpha]' : 'list-decimal') : 'list-disc';
          return <ul key={i} className={`space-y-3 mb-8 ${listClass} pl-8 text-sm text-gray-600 font-medium`}>{list.items.map((it, idx) => <li key={idx}><HighlightText text={it} highlight={initialSearchTerm} /></li>)}</ul>;
      }
      case 'table': return renderTable(b.content as DGRTable, i);
      case 'note': {
          const note = b.content as DGRNote;
          return <div key={i} className="bg-blue-50 border-l-4 border-latam-indigo p-6 rounded-r-2xl mb-8 shadow-sm"><h5 className="font-black text-latam-indigo text-[10px] uppercase tracking-widest mb-2 flex items-center"><Info className="w-4 h-4 mr-2" />{note.title || 'Nota Regulamentar'}</h5><p className="text-sm text-indigo-900 font-medium leading-relaxed">{note.text}</p></div>;
      }
      case 'warning': {
          const warn = b.content as DGRNote;
          return <div key={i} className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl mb-8 shadow-sm flex items-start"><AlertTriangle className="w-5 h-5 text-red-600 mr-4 mt-1 flex-shrink-0" /><div><h5 className="font-black text-red-800 text-[10px] uppercase tracking-widest mb-1">Alerta de Segurança</h5><p className="text-sm text-red-700 font-medium leading-relaxed">{warn.text}</p></div></div>;
      }
      case 'database': {
        const db = b.content as DGRDatabase;
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
            <div key={i} className="flex flex-col items-center my-10">
                <div className={`border-[6px] border-black p-6 bg-white shadow-2xl mb-4 flex items-center justify-center min-w-[180px] min-h-[180px] ${mark.type === 'lq-y' ? 'transform rotate-45' : ''}`}>
                    <MarkIcon />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{mark.caption}</p>
            </div>
          );
      }
      case 'definition-list': {
          const defs = b.content as DGRDefinition[];
          return <dl key={i} className="space-y-4 mb-8">{defs.map((def, idx) => <div key={idx} className="border-l-2 border-gray-100 pl-4"><dt className="font-bold text-sm text-gray-800">{def.term}</dt><dd className="text-sm text-gray-600">{def.definition}</dd></div>)}</dl>;
      }
      case 'checklist': {
          const cl = b.content as DGRChecklist;
          return (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 my-8">
                <h4 className="font-bold text-lg text-latam-indigo mb-4">{cl.title}</h4>
                <div className="space-y-3">
                    {cl.items.map(item => (
                        <div key={item.id} className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer" onClick={() => setCheckedItems(p => ({...p, [item.id]: !p[item.id]}))}>
                            {checkedItems[item.id] ? <CheckSquare className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" /> : <Square className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />}
                            <div>
                                <p className="text-sm font-medium text-gray-800">{item.text}</p>
                                {item.reference && <p className="text-xs text-gray-400 mt-1">Ref: {item.reference}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          );
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
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-latam-indigo text-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
                <Bookmark className="w-3 h-3 mr-3" /> Seções do Capítulo
            </div>
            <nav className="p-4 space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {chapter.sections.map(s => (
                    <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSectionId(s.id)} className={`block px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeSectionId === s.id ? 'bg-indigo-50 text-latam-indigo' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}>
                        {s.id} • {s.title}
                    </a>
                ))}
            </nav>
          </div>
        </div>
      </aside>
      <div className="flex-1 max-w-5xl">
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-50 overflow-hidden mb-20 p-12 md:p-16 relative">
          <div className="flex items-center space-x-4 mb-8"><span className="bg-latam-indigo text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Capítulo {chapter.id}</span><div className="h-px bg-gray-100 flex-grow"></div></div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-none uppercase tracking-tighter">{chapter.title}</h1>
          <p className="text-xl text-gray-400 font-bold mb-16 italic leading-relaxed border-l-8 border-gray-100 pl-8">{chapter.description}</p>
          <div className="space-y-24">
            {chapter.sections.map(s => (
                <section key={s.id} id={s.id} className="scroll-mt-32 group">
                    <div className="flex items-center mb-8">
                        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center"><span className="text-latam-coral mr-3 opacity-30">/</span> {s.id} {s.title}</h2>
                        <div className="h-px bg-gray-50 flex-grow ml-6"></div>
                    </div>
                    <div className="pl-0 md:pl-10">{s.blocks.map((b, idx) => renderBlock(b, idx))}</div>
                </section>
            ))}
          </div>
        </div>
      </div>
      {selectedUNEntry && <UNDetailModal data={selectedUNEntry} onClose={() => setSelectedUNEntry(null)} />}
    </div>
  );
};

export default ChapterDetail;
