import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Bookmark, AlertTriangle, Check, X as XIcon, ChevronRight, 
    CheckSquare, Square, RotateCcw, ArrowRightLeft, Table as TableIcon, 
    ExternalLink, Database, Search, Radiation, Users, Beaker, HelpCircle, Plane, Info, Scale, Box, Tag, FileText
} from 'lucide-react';
import { 
    DGRChapter, DGRSection, DGRContentBlock, DGRTable, DGRList, DGRNote,
    DGRMark, DGRChecklist, DGRTool, DGRWizard, DGRDatabase, DGRDefinition, DGRFigure, DGRVariation
} from '../types.ts';
import UNDetailModal from './UNDetailModal.tsx';

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
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedUNEntry, setSelectedUNEntry] = useState<Record<string, any> | null>(null);
  const [dbFilters, setDbFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialScrollId) {
      setTimeout(() => {
        const element = document.getElementById(initialScrollId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          element.classList.add('bg-yellow-50');
          setTimeout(() => element.classList.remove('bg-yellow-50'), 2500);
          setActiveSectionId(initialScrollId);
        }
        onClearInitialScroll();
      }, 300);
    }
  }, [initialScrollId, onClearInitialScroll]);

  const handleOpenDatabase = (db: DGRDatabase) => {
    const newWindow = window.open('', '_blank');
    if (!newWindow) return;

    const headerRow = db.columns.map((c, i) => `<th class="p-2 border text-left">${c.label}</th>`).join('');
    const bodyRows = db.data.map((row, i) => 
        `<tr class="${i % 2 === 0 ? '' : 'bg-gray-50'}">
            ${db.columns.map(c => `<td class="p-2 border">${row[c.key] || ''}</td>`).join('')}
        </tr>`
    ).join('');

    newWindow.document.write(`
        <html>
        <head>
            <title>${db.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-8 bg-gray-50">
            <h1 class="text-2xl font-bold mb-4">${db.title}</h1>
            <table class="w-full border-collapse bg-white shadow rounded overflow-hidden text-sm">
                <thead class="bg-gray-200"><tr>${headerRow}</tr></thead>
                <tbody>${bodyRows}</tbody>
            </table>
        </body>
        </html>
    `);
    newWindow.document.close();
  };

  const renderTable = (table: DGRTable, is93A: boolean = false) => {
    return (
      <div className="my-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {table.caption && (
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{table.caption}</h4>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100/80">
                {table.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-bold text-gray-700 border-b border-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  {row.map((cell, cellIndex) => {
                    if (typeof cell === 'boolean') {
                      return (
                        <td key={cellIndex} className="px-4 py-3 border-r border-gray-100 text-center font-bold">
                          {cell ? <span className="text-latam-coral">SIM</span> : <span className="text-gray-400">NÃO</span>}
                        </td>
                      );
                    }
                    return (
                      <td key={cellIndex} className={`px-4 py-3 border-r border-gray-100 ${cellIndex === 0 ? 'bg-gray-50/50 font-bold text-gray-700' : ''}`}>
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {table.footnotes && (
          <div className="bg-gray-50 p-3 border-t border-gray-200 space-y-1">
            {table.footnotes.map((f, i) => (
              <p key={i} className="text-[10px] text-gray-500">{f}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderBlock = (block: DGRContentBlock, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return <p key={index} className="text-gray-700 leading-relaxed mb-4">{block.content as string}</p>;
      case 'list':
        const list = block.content as DGRList;
        return (
          <ul key={index} className={`space-y-2 mb-6 ${list.ordered ? 'list-decimal' : 'list-disc'} pl-6 text-gray-700`}>
            {list.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        );
      case 'table':
        const table = block.content as DGRTable;
        return renderTable(table, table.caption?.includes('9.3.A'));
      case 'note':
        const note = block.content as DGRNote;
        return (
          <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6 shadow-sm">
            {note.title && <h5 className="font-bold text-blue-800 text-sm mb-1 uppercase tracking-wide">{note.title}</h5>}
            <p className="text-sm text-blue-700">{note.text}</p>
          </div>
        );
      case 'warning':
        const warn = block.content as DGRNote;
        return (
          <div key={index} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6 shadow-sm">
            <div className="flex items-center mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <h5 className="font-bold text-red-800 text-sm uppercase tracking-wide">Alerta Regulatório</h5>
            </div>
            <p className="text-sm text-red-700">{warn.text}</p>
          </div>
        );
      case 'database':
        const db = block.content as DGRDatabase;
        return (
          <div key={index} className="bg-white rounded-xl border border-latam-indigo/20 p-6 mb-8 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Database className="w-5 h-5 text-latam-indigo mr-2" />
                <h3 className="font-bold text-latam-indigo text-lg">{db.title}</h3>
              </div>
              <button 
                onClick={() => handleOpenDatabase(db)}
                className="bg-latam-indigo text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-latam-indigoLight transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Base Completa (Nova Aba)
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4 italic">Esta base de dados contém {db.data.length} registros regulatórios.</p>
            <div className="relative group">
               <input 
                  type="text" 
                  placeholder="Pesquisar na prévia da base..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-latam-indigo/20"
               />
               <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        );
      case 'visual-mark':
        const mark = block.content as DGRMark;
        return (
          <div key={index} className="flex flex-col items-center mb-8">
             <div className="border-4 border-black p-4 bg-white shadow-lg mb-2 flex items-center justify-center min-w-[150px] min-h-[150px]">
                {mark.type === 'cargo-only' && <div className="bg-orange-400 text-black font-black text-center p-2 leading-tight w-32 h-20 flex items-center justify-center">CARGO AIRCRAFT ONLY</div>}
                {mark.type === 'orientation' && <ArrowRightLeft className="w-20 h-20 text-black transform rotate-90" />}
                {mark.type === 'lithium-battery' && <div className="text-center"><Box className="w-12 h-12 mx-auto mb-1" /> <div className="font-bold text-xs">UN {mark.data?.unNumbers}</div></div>}
             </div>
             <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{mark.caption}</p>
          </div>
        );
      default:
        return <div key={index} className="p-4 bg-gray-100 rounded mb-4 text-xs text-gray-400">Bloco de conteúdo: {block.type}</div>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
      {/* Navigation Sidebar */}
      <aside className="lg:w-72 shrink-0">
        <div className="sticky top-24 space-y-6">
          <button 
            onClick={onBack}
            className="group flex items-center text-latam-indigo font-bold hover:text-latam-coral transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Dashboard
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="bg-latam-indigo text-white px-4 py-3 text-xs font-bold uppercase tracking-widest flex items-center">
                <Bookmark className="w-3 h-3 mr-2" />
                Seções do Capítulo {chapter.id}
             </div>
             <nav className="p-2 space-y-1">
                {chapter.sections.map(section => (
                    <a 
                      key={section.id}
                      href={`#${section.id}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-all ${activeSectionId === section.id ? 'bg-indigo-50 text-latam-indigo font-bold border-l-4 border-latam-indigo pl-2' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        {section.id} {section.title}
                    </a>
                ))}
             </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Detail */}
      <div className="flex-1 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="p-8 md:p-12">
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-latam-indigo text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest">CAPÍTULO {chapter.id}</span>
              <div className="h-px bg-gray-200 flex-grow"></div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-latam-indigo mb-6 leading-tight">{chapter.title}</h1>
            <p className="text-lg text-gray-500 mb-10 italic leading-relaxed border-l-4 border-gray-200 pl-6">{chapter.description}</p>
            
            <div className="space-y-16">
              {chapter.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28 group">
                   <div className="flex items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <span className="text-latam-coral mr-2 opacity-50 group-hover:opacity-100 transition-opacity">#</span>
                        {section.id} {section.title}
                      </h2>
                      <div className="h-px bg-gray-100 flex-grow ml-4"></div>
                   </div>
                   <div className="pl-0 md:pl-6">
                     {section.blocks.map((block, idx) => renderBlock(block, idx))}
                   </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedUNEntry && <UNDetailModal data={selectedUNEntry} onClose={() => setSelectedUNEntry(null)} />}
    </div>
  );
};

export default ChapterDetail;