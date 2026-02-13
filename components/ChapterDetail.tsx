
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
        case 'lq-y': return <div key={key} className={`${baseClasses} w-24 h-24 transform rotate-45`}><div className="bg-black w-full h-1/2 absolute top-0"></div><div className="absolute font-bold text-2xl text-black z-10 transform -rotate-45">Y</div></div>;
        case 'eq': return <div key={key} className={`${baseClasses} w-24 h-24 border-red-600`}><div className="absolute top-1 right-1 text-red-600 text-[10px] font-bold">*</div><div className="text-red-600 text-3xl font-extrabold">E</div></div>;
        case 'radioactive-i': return <div key={key} className={`${baseClasses} w-24 h-24 bg-white`}><Radiation className="w-8 h-8 text-black mb-1"/><span className="text-[10px]">RADIOACTIVE I</span></div>;
        case 'radioactive-ii': return <div key={key} className={`${baseClasses} w-24 h-24 bg-yellow-400`}><Radiation className="w-8 h-8 text-black mb-1"/><span className="text-[10px]">RADIOACTIVE II</span></div>;
        case 'radioactive-iii': return <div key={key} className={`${baseClasses} w-24 h-24 bg-yellow-400`}><Radiation className="w-8 h-8 text-black mb-1"/><span className="text-[10px]">RADIOACTIVE III</span></div>;
        default: return <div key={key} className="p-2 border border-dashed text-xs">Mark: {mark.type}</div>;
    }
  };


  // --- Actions ---

  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          const yOffset = -180;
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
          setActiveSectionId(id);
      }
  };

  const toggleCheck = (id: string) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  
  const handleWizardOption = (wizardId: string, nextNodeId: string) => setWizardStates(prev => ({ ...prev, [wizardId]: nextNodeId }));
  
  const resetWizard = (wizardId: string, startNodeId: string) => setWizardStates(prev => ({ ...prev, [wizardId]: startNodeId }));

  const openInNewWindow = (title: string, content: string) => {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
          newWindow.document.write(content);
          newWindow.document.close();
      } else {
          alert('Pop-up bloqueado.');
      }
  };

  const openTableInNewWindow = (tableData: DGRTable) => {
    const headerRow = tableData.headers.map((h, i) => `<th class="p-2 border" onclick="sortTable(${i})">${h}</th>`).join('');
    
    const filterRow = tableData.headers.map((h, i) => 
        `<th class="p-1 border bg-white"><input type="text" class="w-full p-1 text-xs border rounded col-filter" data-col="${i}" oninput="filterTable()" placeholder="Filtrar ${h}..."></th>`
    ).join('');

    const bodyRows = tableData.rows.map((row, i) => 
        `<tr class="${i % 2 === 0 ? '' : 'bg-gray-50'} hover:bg-yellow-50">
            ${row.map(c => `<td class="p-2 border">${c === true ? 'SIM' : c === false ? 'NÃO' : c}</td>`).join('')}
        </tr>`
    ).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>${tableData.caption || 'Tabela DGR'}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { font-family: sans-serif; }
                th { cursor: pointer; user-select: none; }
                #dgr-table thead { position: sticky; top: 0; z-index: 10; }
            </style>
        </head>
        <body class="bg-gray-100 p-6 flex flex-col h-screen">
            <div class="bg-white p-4 shadow rounded-t flex justify-between items-center shrink-0">
                <h1 class="font-bold text-lg">${tableData.caption || 'Tabela'}</h1>
                <button onclick="clearFilters()" class="text-xs font-medium text-blue-600 hover:underline">Limpar Filtros</button>
            </div>
            <div class="flex-grow overflow-auto bg-white shadow rounded-b min-h-0">
                <table id="dgr-table" class="w-full text-left border-collapse text-sm">
                    <thead class="bg-gray-200">
                        <tr>${headerRow}</tr>
                        <tr>${filterRow}</tr>
                    </thead>
                    <tbody id="tbody">${bodyRows}</tbody>
                </table>
            </div>
            <script>
                const filterInputs = document.querySelectorAll('.col-filter');
                function clearFilters() {
                    filterInputs.forEach(input => input.value = '');
                    filterTable();
                }
                function filterTable() {
                    const filters = Array.from(filterInputs).map(input => ({
                        col: parseInt(input.dataset.col),
                        value: input.value.toLowerCase()
                    }));
                    const tbody = document.getElementById('tbody');
                    const rows = tbody.getElementsByTagName('tr');
                    for (let r of rows) {
                        let isVisible = true;
                        for (const filter of filters) {
                            if (filter.value) {
                                const cell = r.cells[filter.col];
                                if (cell && !cell.textContent.toLowerCase().includes(filter.value)) {
                                    isVisible = false;
                                    break;
                                }
                            }
                        }
                        r.style.display = isVisible ? '' : 'none';
                    }
                }
                let sortState = {};
                function sortTable(colIndex) {
                    const tbody = document.getElementById('tbody');
                    const rows = Array.from(tbody.rows);
                    const dir = sortState[colIndex] === 'asc' ? 'desc' : 'asc';
                    sortState = { [colIndex]: dir };
                    rows.sort((a, b) => {
                        const valA = a.cells[colIndex].textContent.trim();
                        const valB = b.cells[colIndex].textContent.trim();
                        // Special handling for SIM/NÃO
                        const boolA = valA === 'SIM' ? 1 : (valA === 'NÃO' ? 0 : -1);
                        const boolB = valB === 'SIM' ? 1 : (valB === 'NÃO' ? 0 : -1);
                        if (boolA !== -1 && boolB !== -1) {
                            return (boolA - boolB) * (dir === 'asc' ? 1 : -1);
                        }
                        return valA.localeCompare(valB, undefined, { numeric: true }) * (dir === 'asc' ? 1 : -1);
                    });
                    rows.forEach(row => tbody.appendChild(row));
                }
            </script>
        </body>
        </html>
    `;
    openInNewWindow(tableData.caption || 'Tabela', htmlContent);
  };

  const openDatabaseInNewWindow = (db: DGRDatabase) => {
    const finalData = db.data.map(item => (item.un && verifiedRegistry[item.un]) ? verifiedRegistry[item.un] : item);

    const isBluePages = db.id === 'blue-pages';
    const piColumns = ['lq_pi', 'pax_pi', 'cao_pi'];

    const generateCellContent = (row: Record<string, any>, column: { key: string }) => {
        const value = row[column.key] || '';
        if (isBluePages && piColumns.includes(column.key) && value && !['Forbidden', 'N/A', 'See 10.5'].includes(value)) {
            return `<td class="p-2 border"><a href="#" class="text-blue-600 hover:underline font-medium" onclick="event.stopPropagation(); window.opener.postMessage({type: 'navigateToPI', pi: '${value}'}, '*')">${value}</a></td>`;
        }
        return `<td class="p-2 border">${value}</td>`;
    };

    const headerRow = db.columns.map((c, i) => `<th class="p-2 border" onclick="sortTable(${i})">${c.label}</th>`).join('');
    
    const filterRow = db.columns.map((c, i) => {
        if (c.filterable) {
            return `<th class="p-1 border bg-white"><input type="text" class="w-full p-1 text-xs border rounded col-filter" data-col="${i}" oninput="filterTable()" placeholder="Filtrar ${c.label}..."></th>`;
        }
        return `<th class="p-1 border bg-white"></th>`;
    }).join('');

    const bodyRows = finalData.map((row, i) => 
        `<tr class="${i % 2 === 0 ? '' : 'bg-gray-50'} cursor-pointer hover:bg-yellow-50" onclick='window.opener.postMessage({type: "openUNDetail", payload: ${JSON.stringify(row)}}, "*")'>
            ${db.columns.map(c => generateCellContent(row, c)).join('')}
        </tr>`
    ).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>${db.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { font-family: sans-serif; }
                th { cursor: pointer; user-select: none; }
                #dgr-table thead { position: sticky; top: 0; z-index: 10; }
            </style>
        </head>
        <body class="bg-gray-100 p-6 flex flex-col h-screen">
            <div class="bg-white p-4 shadow rounded-t flex justify-between items-center shrink-0">
                <h1 class="font-bold text-lg">${db.title}</h1>
                <button onclick="clearFilters()" class="text-xs font-medium text-blue-600 hover:underline">Limpar Filtros</button>
            </div>
            <div class="flex-grow overflow-auto bg-white shadow rounded-b min-h-0">
                <table id="dgr-table" class="w-full text-left border-collapse text-sm">
                    <thead class="bg-gray-200">
                        <tr>${headerRow}</tr>
                        <tr>${filterRow}</tr>
                    </thead>
                    <tbody id="tbody">${bodyRows}</tbody>
                </table>
            </div>
            <script>
                const filterInputs = document.querySelectorAll('.col-filter');
                function clearFilters() {
                    filterInputs.forEach(input => input.value = '');
                    filterTable();
                }
                function filterTable() {
                    const filters = Array.from(filterInputs).map(input => ({
                        col: parseInt(input.dataset.col),
                        value: input.value.toLowerCase()
                    }));
                    const tbody = document.getElementById('tbody');
                    const rows = tbody.getElementsByTagName('tr');
                    for (let r of rows) {
                        let isVisible = true;
                        for (const filter of filters) {
                            if (filter.value) {
                                const cell = r.cells[filter.col];
                                if (cell && !cell.textContent.toLowerCase().includes(filter.value)) {
                                    isVisible = false;
                                    break;
                                }
                            }
                        }
                        r.style.display = isVisible ? '' : 'none';
                    }
                }
                let sortState = {};
                function sortTable(colIndex) {
                    const tbody = document.getElementById('tbody');
                    const rows = Array.from(tbody.rows);
                    const dir = sortState[colIndex] === 'asc' ? 'desc' : 'asc';
                    sortState = { [colIndex]: dir };
                    rows.sort((a, b) => {
                        const valA = a.cells[colIndex].textContent.trim();
                        const valB = b.cells[colIndex].textContent.trim();
                        return valA.localeCompare(valB, undefined, { numeric: true }) * (dir === 'asc' ? 1 : -1);
                    });
                    rows.forEach(row => tbody.appendChild(row));
                }
            </script>
        </body>
        </html>
    `;
    openInNewWindow(db.title, htmlContent);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'openUNDetail' && event.data.payload) {
            setSelectedUNEntry(event.data.payload);
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // --- Main Render ---

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-slate-800">
        
        {selectedUNEntry && <UNDetailModal data={selectedUNEntry} onClose={() => setSelectedUNEntry(null)} />}
        
        <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
            <div className="flex items-center"><button onClick={onBack} className="p-2 mr-3 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><ArrowLeft className="w-5 h-5" /></button><div><h1 className="text-lg font-bold text-latam-indigo flex items-center"><span className="bg-latam-indigo text-white text-xs px-2 py-0.5 rounded mr-2 font-mono">{chapter.id}</span>{chapter.title}</h1></div></div>
            {activeSectionId && (<div className="hidden md:block text-xs font-medium text-gray-400">Seção Atual: <span className="text-latam-coral font-bold">{activeSectionId}</span></div>)}
        </div>

        <div className="flex flex-grow container mx-auto px-4 py-8 gap-8 max-w-7xl">
            <div className="hidden lg:block w-64 flex-shrink-0 sticky top-[150px] max-h-[calc(100vh-160px)] overflow-y-auto"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 pl-3">Neste Capítulo</h4><div className="space-y-1 border-l border-gray-200 ml-1">{chapter.sections.map(section => (<button key={section.id} onClick={() => scrollToSection(section.id)} className={`text-sm text-left w-full py-1.5 pl-4 border-l-2 -ml-[2px] transition-colors truncate ${activeSectionId === section.id ? 'border-latam-indigo text-latam-indigo font-bold bg-indigo-50/50 rounded-r' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-r'}`}><span className="mr-2 opacity-70 text-xs font-mono">{section.id}</span>{section.title}</button>))}</div></div>
            <div className="flex-1 min-w-0">{chapter.sections.map((section: DGRSection) => (<div key={section.id} id={section.id} className="mb-16 scroll-mt-40"><div className="flex items-baseline mb-6 border-b border-gray-200 pb-2"><span className="text-lg font-bold text-latam-coral mr-3 font-mono">{section.id}</span><h2 className="text-2xl font-bold text-gray-800">{section.title}</h2></div><div className="space-y-6">{section.blocks.map((block: DGRContentBlock, bIdx: number) => {
                const key = `${section.id}-${bIdx}`;
                switch (block.type) {
                    case 'paragraph': return <p key={key} className="text-gray-700 leading-relaxed text-base"><HighlightText text={block.content as string} highlight={initialSearchTerm} /></p>;
                    case 'list': const list = block.content as DGRList; return <ul key={key} className={`space-y-2 ml-4 ${list.ordered ? 'list-decimal' : 'list-disc'} text-gray-700 marker:text-gray-400`}>{list.items.map((item, i) => <li key={i} className="pl-1"><HighlightText text={item} highlight={initialSearchTerm} /></li>)}</ul>;
                    case 'warning': const warn = block.content as DGRNote; return <div key={key} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start shadow-sm"><AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" /><div className="text-red-800 text-sm">{warn.title && <div className="font-bold mb-1">{warn.title}</div>}{warn.text}</div></div>;
                    case 'note': const note = block.content as DGRNote; return <div key={key} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg text-sm text-blue-900 flex items-start shadow-sm"><Bookmark className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" /><div><span className="font-bold block mb-1">Nota: {note.title}</span>{note.text}</div></div>;
                    case 'table': const table = block.content as DGRTable; return <div key={key} className="my-6 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"><div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center"><span className="font-bold text-xs uppercase text-gray-500 flex items-center"><TableIcon className="w-4 h-4 mr-2" />{table.caption || 'Tabela'}</span><button onClick={() => openTableInNewWindow(table)} className="text-latam-indigo hover:text-latam-coral text-xs font-bold flex items-center"><ExternalLink className="w-3 h-3 mr-1" /> Expandir</button></div></div>;
                    case 'database': const db = block.content as DGRDatabase; return <div key={key} className="my-6 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"><div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center"><span className="font-bold text-xs uppercase text-gray-500 flex items-center"><Database className="w-4 h-4 mr-2" />{db.title}</span><button onClick={() => openDatabaseInNewWindow(db)} className="text-latam-indigo hover:text-latam-coral text-xs font-bold flex items-center"><ExternalLink className="w-3 h-3 mr-1" /> Abrir Base de Dados</button></div></div>;
                    case 'checklist': const cl = block.content as DGRChecklist; return <div key={key} className="my-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm"><div className="flex justify-between items-center mb-4"><h4 className="font-bold text-gray-800">{cl.title}</h4><button onClick={() => setCheckedItems({})} className="text-xs text-gray-500 hover:text-latam-coral flex items-center"><RotateCcw className="w-3 h-3 mr-1"/>Limpar</button></div><div className="space-y-3">{cl.items.map(item => (<div key={item.id} onClick={() => toggleCheck(item.id)} className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${checkedItems[item.id] ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'}`}>{checkedItems[item.id] ? <CheckSquare className="w-5 h-5 text-green-600 mr-3 mt-0.5"/> : <Square className="w-5 h-5 text-gray-400 mr-3 mt-0.5"/>}<div className="flex-1"><p className={`text-sm ${checkedItems[item.id] ? 'text-gray-800' : 'text-gray-700'}`}>{item.text}</p>{item.reference && <span className="text-xs text-gray-400 font-mono">Ref: {item.reference}</span>}</div></div>))}</div></div>;
                    case 'tool': const tool = block.content as DGRTool; return <div key={key} className="p-5 my-4 bg-white border-2 border-dashed border-gray-300 rounded-xl shadow-inner"><h4 className="font-bold text-gray-800 mb-4 flex items-center"><Beaker className="w-4 h-4 mr-2"/> {tool.title}</h4><div className="flex items-center space-x-4"><select onChange={e => setSegregationClassA(e.target.value)} className="flex-1 p-2 border rounded"><option>Classe A</option>{tool.data.classes.map(c => <option key={c} value={c}>Cl {c}</option>)}</select><ArrowRightLeft className="text-gray-400"/><select onChange={e => setSegregationClassB(e.target.value)} className="flex-1 p-2 border rounded"><option>Classe B</option>{tool.data.classes.map(c => <option key={c} value={c}>Cl {c}</option>)}</select></div></div>;
                    case 'wizard': const wiz = block.content as DGRWizard; const currentNodeId = wizardStates[wiz.id] || wiz.startNodeId; const node = wiz.nodes[currentNodeId]; const result = wiz.results[currentNodeId]; return <div key={key} className="p-5 my-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl shadow-sm"><div className="flex justify-between items-start mb-4"><h4 className="font-bold text-indigo-900 flex items-center"><HelpCircle className="w-5 h-5 mr-2"/> {wiz.title}</h4><button onClick={() => resetWizard(wiz.id, wiz.startNodeId)} className="text-xs text-indigo-600 hover:underline"><RotateCcw className="w-3 h-3 inline mr-1"/>Reiniciar</button></div>{node && <div><p className="text-indigo-800 font-medium mb-4">{node.question}</p><div className="grid grid-cols-2 gap-3">{node.options.map((opt, i) => <button key={i} onClick={() => handleWizardOption(wiz.id, opt.nextNodeId)} className="text-sm bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-700 p-3 rounded-lg text-left font-semibold transition-all">{opt.label}</button>)}</div></div>}{result && <div className={`p-4 rounded-lg bg-${result.type === 'success' ? 'green' : 'yellow'}-100`}><h5 className="font-bold text-lg">{result.title}</h5><p>{result.description}</p></div>}</div>;
                    case 'definition-list': const dl = block.content as DGRDefinition[]; return <dl key={key} className="space-y-4">{dl.map((item, i) => <div key={i} className="pl-3 border-l-2 border-gray-200"><dt className="font-semibold text-gray-800">{item.term}</dt><dd className="text-gray-600 pl-4">{item.definition}</dd></div>)}</dl>;
                    case 'visual-mark': return <div key={key} className="flex flex-wrap gap-4 items-center justify-center p-4 bg-gray-50 rounded-lg">{renderMark(block.content as DGRMark, key)}<p className="w-full text-center text-xs text-gray-500 mt-2 font-medium">{(block.content as DGRMark).caption}</p></div>;
                    case 'figure': const fig = block.content as DGRFigure; return <div key={key} className="p-4 my-4 bg-white border rounded text-center"><h4 className="font-bold mb-2">{fig.caption}</h4><p className="text-sm text-gray-500">Label Class: {fig.labelClass} (Visual not implemented)</p></div>;
                    case 'variation': const v = block.content as DGRVariation; return <div key={key} className="p-4 my-4 bg-white border border-gray-200 rounded-lg"><div className="font-bold text-sm text-gray-800">{v.code} - {v.owner}</div><p className="text-sm text-gray-600 mt-1">{v.text}</p></div>;
                    case 'packing-instruction': return <div key={key} className="p-4 my-4 bg-white border border-dashed rounded-lg"><h4 className="font-bold text-gray-800">Referência à Instrução de Embalagem</h4><p className="text-sm text-gray-600">Conteúdo detalhado na Seção 5.</p></div>
                    default: return <div key={key} className="p-2 bg-gray-100 text-xs">Unsupported block type: {block.type}</div>;
                }
            })}</div></div>))}</div>
        </div>
    </div>
  );
};

export default ChapterDetail;
