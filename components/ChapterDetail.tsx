
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Bookmark, Share2, List, FileText, ShieldCheck, AlertTriangle, Check, X as XIcon, ChevronRight, Package, Plane, Globe, BookOpen, Search, CheckSquare, Square, RefreshCw, ArrowRightLeft, GitMerge, RotateCcw, Filter, ArrowUpDown, Eye, ShieldAlert, BadgeCheck, CloudDownload, Box, ExternalLink, Table as TableIcon, Database, Wind, ThermometerSnowflake, Sun } from 'lucide-react';
import { DGRChapter, DGRSection, DGRContentBlock, DGRTable, DGRList, DGRNote, DGRFigure, DGRPackingInstruction, DGRVariation, DGRDefinition, DGRMark, DGRChecklist, DGRTool, DGRWizard, DGRDatabase } from '../types';
import UNDetailModal from './UNDetailModal';
import { fetchOfficialUNData } from '../services/geminiService';

// --- Shared Components ---

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight || !highlight.trim()) return <>{text}</>;
    
    // Split highlight by space for multi-word highlighting
    const tokens = highlight.trim().split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) return <>{text}</>;
    
    // Create a regex that matches any of the tokens
    const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = tokens.some(t => t.toLowerCase() === part.toLowerCase());
          return isMatch ? (
            <span key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0.5 shadow-sm">{part}</span>
          ) : (
            part
          );
        })}
      </>
    );
};

const ArrowUpBlack = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-12 text-black">
        <path d="M12 2L5 12h14L12 2zm-2 10v10h4V12h-4z" />
        <rect x="0" y="22" width="24" height="2" fill="currentColor" />
    </svg>
);


// --- Chapter Detail Component ---

interface ChapterDetailProps {
  chapter: DGRChapter;
  onBack: () => void;
  initialSearchTerm?: string;
}

const ChapterDetail: React.FC<ChapterDetailProps> = ({ chapter, onBack, initialSearchTerm = '' }) => {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Drill-Down State
  const [selectedUNEntry, setSelectedUNEntry] = useState<Record<string, any> | null>(null);
  
  // Data Reliability: Store Live Verified Rows
  const [verifiedRegistry, setVerifiedRegistry] = useState<Record<string, any>>({});

  // Tool State
  const [segregationClassA, setSegregationClassA] = useState<string>('');
  const [segregationClassB, setSegregationClassB] = useState<string>('');

  // Wizard State
  const [wizardStates, setWizardStates] = useState<Record<string, string>>({});

  const toggleCheck = (id: string) => {
      setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleWizardOption = (wizardId: string, nextNodeId: string) => {
      setWizardStates(prev => ({ ...prev, [wizardId]: nextNodeId }));
  };

  const resetWizard = (wizardId: string, startNodeId: string) => {
      setWizardStates(prev => ({ ...prev, [wizardId]: startNodeId }));
  };

  const handleRowVerification = async (un: string) => {
      // Fetch official data from AI/Web
      const officialData = await fetchOfficialUNData(un);
      if (officialData) {
          setVerifiedRegistry(prev => ({
              ...prev,
              [un]: officialData
          }));
      }
  };

  const handleRowClick = (row: any) => {
      setSelectedUNEntry(row);
  };

  // Helper to open table in new window
  const openTableInNewWindow = (tableData: DGRTable) => {
    const width = 1000;
    const height = 800;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const newWindow = window.open('', '_blank', `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);

    if (!newWindow) {
        alert('Pop-up bloqueado. Por favor, permita pop-ups para ver a tabela.');
        return;
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${tableData.caption || 'Tabela IATA DGR'}</title>
            <script src="https://cdn.tailwindcss.com"></script>
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
                        text: '#0F172A'
                      }
                    }
                  }
                }
              }
            </script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; }
                th { cursor: pointer; user-select: none; }
                th:hover { background-color: #f3f4f6; }
                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: #f1f1f1; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                
                /* Clear button in input */
                .input-wrapper { position: relative; width: 100%; }
                .clear-input {
                    position: absolute;
                    right: 6px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: #94a3b8;
                    font-size: 14px;
                    display: none;
                }
                .clear-input:hover { color: #ef4444; }
                input:not(:placeholder-shown) + .clear-input { display: block; }
            </style>
        </head>
        <body class="bg-gray-100 flex flex-col h-screen overflow-hidden text-slate-800">
            <!-- Fixed Header Section -->
            <div class="flex-none z-30 bg-white shadow-md relative">
                <div class="bg-slate-900 text-white p-4 md:p-6 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h1 class="text-lg md:text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
                            ${tableData.caption || 'Tabela Regulatória'}
                        </h1>
                        <p class="text-xs text-slate-400 mt-1">IATA DGR 2026 Reference</p>
                    </div>
                    <button onclick="window.print()" class="hidden md:flex items-center text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-slate-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                        Imprimir
                    </button>
                </div>
                
                <!-- Filter Toolbar -->
                <div class="p-4 border-b border-gray-200 bg-white">
                    <div class="max-w-6xl mx-auto">
                        <label for="searchInput" class="block text-xs font-bold text-gray-500 uppercase mb-2">Filtrar Dados da Tabela</label>
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="relative flex-grow flex items-center group">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <input type="text" id="searchInput" oninput="debouncedFilterTable()" 
                                    class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner text-base" 
                                    placeholder="Digite palavras-chave..." autofocus>
                                <button onclick="clearSearch()" id="clearBtn" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer hidden" title="Limpar todos os filtros">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <!-- Filter Toggle Button -->
                            <div class="flex-none">
                                <button onclick="toggleFilterRow()" id="filterToggleBtn" class="w-full md:w-auto h-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:text-indigo-600 hover:border-indigo-500 transition-all shadow-sm flex items-center justify-center font-medium text-sm group">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 group-hover:scale-110 transition-transform"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                                    Filtros
                                </button>
                            </div>
                        </div>

                        <div class="mt-2 text-xs text-gray-400 flex justify-between items-center">
                           <span>Busca global e filtros por coluna</span>
                           <span class="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">
                               Exibindo <span id="visibleCount" class="font-bold text-gray-900">${tableData.rows.length}</span> / <span id="totalCount">${tableData.rows.length}</span>
                           </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Scrollable Table Area -->
            <div class="flex-grow overflow-y-auto overflow-x-auto p-4 md:p-8 bg-gray-50">
                <div class="max-w-7xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-left border-collapse">
                            <thead class="bg-gray-100 text-xs font-bold text-gray-600 uppercase border-b border-gray-300 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    ${tableData.headers.map((h, index) => `
                                        <th onclick="sortTable(${index})" class="px-6 py-4 border-r border-gray-200 last:border-r-0 whitespace-nowrap group hover:bg-gray-200 transition-colors select-none">
                                            <div class="flex items-center space-x-1">
                                                <span>${h}</span>
                                                <span class="sort-icon text-gray-400 text-[10px] group-hover:text-gray-600 opacity-50 group-hover:opacity-100">↕</span>
                                            </div>
                                        </th>
                                    `).join('')}
                                </tr>
                                <tr id="filterRow" class="hidden bg-gray-50 border-b border-gray-300">
                                    ${tableData.headers.map((h, i) => {
                                        // Heuristic: Text-heavy columns use 'contains', codes use 'starts-with'
                                        const lowerH = h.toLowerCase();
                                        const mode = (lowerH.includes('name') || lowerH.includes('desc') || lowerH.includes('text') || lowerH.includes('item')) ? 'contains' : 'starts-with';
                                        const ph = mode === 'starts-with' ? `${h}...` : `${h}...`;
                                        return `
                                        <th class="px-2 py-2 border-r border-gray-200 last:border-r-0">
                                            <div class="input-wrapper">
                                                <input type="text" 
                                                    class="w-full text-xs px-2 py-1.5 pr-6 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-normal text-gray-700 col-filter" 
                                                    data-col="${i}" 
                                                    data-mode="${mode}"
                                                    placeholder="${ph}" 
                                                    oninput="debouncedFilterTable()">
                                                <span class="clear-input" onclick="clearColFilter(this)">✕</span>
                                            </div>
                                        </th>
                                        `;
                                    }).join('')}
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 text-sm bg-white">
                                ${tableData.rows.map((row, rIdx) => `
                                    <tr class="${rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50 transition-colors">
                                        ${row.map(cell => {
                                            let content = cell;
                                            if (typeof cell === 'boolean') {
                                                content = cell ? 
                                                    '<span class="inline-flex items-center text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold border border-green-200">✓ SIM</span>' : 
                                                    '<span class="inline-flex items-center text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-100">✕ NÃO</span>';
                                            }
                                            return `<td class="px-6 py-3 border-r border-gray-200 last:border-r-0">${content}</td>`;
                                        }).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${tableData.footnotes ? `
                        <div class="bg-yellow-50 p-6 border-t border-gray-200 text-xs text-gray-600 space-y-2">
                            <div class="font-bold text-yellow-800 uppercase mb-1">Notas de Rodapé:</div>
                            ${tableData.footnotes.map((note, i) => `<div class="flex"><span class="font-bold mr-2 text-yellow-700">[${i + 1}]</span><span>${note}</span></div>`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="text-center mt-12 pb-8">
                    <button onclick="window.close()" class="text-sm font-medium text-gray-500 hover:text-gray-800 hover:underline px-4 py-2">
                        Fechar Janela
                    </button>
                </div>
            </div>

            <script>
                function toggleFilterRow() {
                    const row = document.getElementById('filterRow');
                    const btn = document.getElementById('filterToggleBtn');
                    if (row.classList.contains('hidden')) {
                        row.classList.remove('hidden');
                        btn.classList.add('bg-indigo-50', 'border-indigo-500', 'text-indigo-700', 'ring-1', 'ring-indigo-500');
                    } else {
                        row.classList.add('hidden');
                        btn.classList.remove('bg-indigo-50', 'border-indigo-500', 'text-indigo-700', 'ring-1', 'ring-indigo-500');
                    }
                }

                function clearSearch() {
                    const globalInput = document.getElementById('searchInput');
                    globalInput.value = '';
                    
                    // Clear all column filters
                    const colInputs = document.querySelectorAll('.col-filter');
                    colInputs.forEach(input => input.value = '');
                    
                    filterTable();
                    globalInput.focus();
                }

                function clearColFilter(btn) {
                    const input = btn.previousElementSibling;
                    input.value = '';
                    debouncedFilterTable();
                    input.focus();
                }

                let filterTimeout;
                function debouncedFilterTable() {
                    clearTimeout(filterTimeout);
                    filterTimeout = setTimeout(filterTable, 300);
                }

                function filterTable() {
                    const globalInput = document.getElementById('searchInput');
                    const clearBtn = document.getElementById('clearBtn');
                    const globalFilter = globalInput.value.toLowerCase().trim();
                    const globalTokens = globalFilter ? globalFilter.split(' ').filter(t => t.length > 0) : [];
                    
                    // Get all column filters
                    const colInputs = document.querySelectorAll('.col-filter');
                    const colFilters = [];
                    let hasColFilters = false;
                    colInputs.forEach(input => {
                        const val = input.value.toLowerCase().trim();
                        if (val) {
                            colFilters.push({
                                index: parseInt(input.getAttribute('data-col')),
                                value: val,
                                mode: input.getAttribute('data-mode') || 'starts-with'
                            });
                            hasColFilters = true;
                        }
                    });

                    // Show/Hide Clear Button based on ANY active filter
                    if (globalFilter.length > 0 || hasColFilters) {
                        clearBtn.classList.remove('hidden');
                    } else {
                        clearBtn.classList.add('hidden');
                    }

                    const tbody = document.querySelector('tbody');
                    const rows = tbody.getElementsByTagName('tr');
                    let count = 0;

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        let visible = true;

                        // 1. Global Search
                        if (globalTokens.length > 0) {
                            const rowText = row.textContent.toLowerCase();
                            for (let token of globalTokens) {
                                if (rowText.indexOf(token) === -1) {
                                    visible = false;
                                    break;
                                }
                            }
                        }

                        // 2. Column Filters
                        if (visible && hasColFilters) {
                            const cells = row.getElementsByTagName('td');
                            for (let filter of colFilters) {
                                const cell = cells[filter.index];
                                if (!cell) continue; 
                                const cellText = cell.textContent.trim().toLowerCase();
                                
                                if (filter.mode === 'contains') {
                                    if (cellText.indexOf(filter.value) === -1) {
                                        visible = false;
                                        break;
                                    }
                                } else {
                                    // 'starts-with' logic (Strict)
                                    if (!cellText.startsWith(filter.value)) {
                                        visible = false;
                                        break;
                                    }
                                }
                            }
                        }

                        if (visible) {
                            row.style.display = "";
                            count++;
                        } else {
                            row.style.display = "none";
                        }
                    }
                    const visibleCountEl = document.getElementById('visibleCount');
                    if(visibleCountEl) visibleCountEl.textContent = count;
                }

                let currentSort = { col: -1, dir: 'asc' };

                function sortTable(colIndex) {
                    const table = document.querySelector('table');
                    const tbody = table.querySelector('tbody');
                    const rows = Array.from(tbody.querySelectorAll('tr'));
                    // Target first row only to avoid selecting filter row ths
                    const headers = table.querySelectorAll('thead tr:first-child th');

                    let dir = 'asc';
                    if (currentSort.col === colIndex && currentSort.dir === 'asc') {
                        dir = 'desc';
                    }
                    currentSort = { col: colIndex, dir: dir };

                    headers.forEach(h => {
                        const icon = h.querySelector('.sort-icon');
                        if(icon) icon.textContent = '↕';
                        h.classList.remove('bg-gray-200');
                    });
                    
                    const activeHeader = headers[colIndex];
                    if (activeHeader) {
                        const icon = activeHeader.querySelector('.sort-icon');
                        if(icon) icon.textContent = dir === 'asc' ? '↑' : '↓';
                        activeHeader.classList.add('bg-gray-200');
                    }

                    rows.sort((a, b) => {
                        const cellA = a.children[colIndex] ? a.children[colIndex].textContent.trim() : '';
                        const cellB = b.children[colIndex] ? b.children[colIndex].textContent.trim() : '';
                        const numA = parseFloat(cellA.replace(/[^0-9.-]+/g,""));
                        const numB = parseFloat(cellB.replace(/[^0-9.-]+/g,""));
                        const isNum = !isNaN(numA) && !isNaN(numB) && cellA.length < 20;

                        let comparison = 0;
                        if (isNum) {
                            comparison = numA - numB;
                        } else {
                            comparison = cellA.localeCompare(cellB);
                        }

                        return dir === 'asc' ? comparison : -comparison;
                    });

                    rows.forEach(row => tbody.appendChild(row));
                }
            </script>
        </body>
        </html>
    `;

    // Use Blob URL to prevent "about:blank" refresh issue
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Attempt to open the new window with the Blob URL
    newWindow.location.href = url;
  };

  const openDatabaseInNewWindow = (db: DGRDatabase, verifiedRegistry: Record<string, any>) => {
    const width = 1200;
    const height = 800;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const newWindow = window.open('', '_blank', `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);

    if (!newWindow) {
        alert('Pop-up bloqueado. Por favor, permita pop-ups para ver a base de dados.');
        return;
    }

    // Merge logic: Prioritize verified data
    const finalData = db.data.map(item => {
        if (item.un && verifiedRegistry[item.un]) {
            return verifiedRegistry[item.un];
        }
        return item;
    });

    // Generate unique values for datalists (max 50 items per column)
    const uniqueOptions: Record<string, string[]> = {};
    db.columns.forEach(col => {
        const values = new Set<string>();
        finalData.forEach(row => {
            const val = row[col.key];
            if (val && typeof val === 'string' && val.length < 50) {
                values.add(val.trim());
            }
        });
        if (values.size > 0 && values.size < 100) {
            uniqueOptions[col.key] = Array.from(values).sort();
        }
    });

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${db.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
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
                        text: '#0F172A'
                      }
                    }
                  }
                }
              }
            </script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; }
                th { cursor: pointer; user-select: none; }
                th:hover { background-color: #f3f4f6; }
                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: #f1f1f1; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                /* Clear button in input */
                .input-wrapper { position: relative; width: 100%; }
                .clear-input {
                    position: absolute;
                    right: 6px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: #94a3b8;
                    font-size: 14px;
                    display: none;
                }
                .clear-input:hover { color: #ef4444; }
                input:not(:placeholder-shown) + .clear-input { display: block; }
            </style>
        </head>
        <body class="bg-gray-100 flex flex-col h-screen overflow-hidden text-slate-800">
            <div class="flex-none z-30 bg-white shadow-md relative">
                <div class="bg-slate-900 text-white p-4 md:p-6 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h1 class="text-lg md:text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                            ${db.title}
                        </h1>
                        <p class="text-xs text-slate-400 mt-1">Base de Dados IATA DGR (Referência 2026)</p>
                    </div>
                    <button onclick="window.print()" class="hidden md:flex items-center text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-slate-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                        Imprimir
                    </button>
                </div>
                
                <!-- Filter Toolbar -->
                <div class="p-4 border-b border-gray-200 bg-white">
                    <div class="max-w-7xl mx-auto">
                        <label for="searchInput" class="block text-xs font-bold text-gray-500 uppercase mb-2">Buscar Registros</label>
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="relative flex-grow flex items-center group">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <input type="text" id="searchInput" oninput="debouncedFilterTable()" 
                                    class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-latam-indigo/50 focus:border-latam-indigo sm:text-base shadow-inner transition-all" 
                                    placeholder="Buscar por UN, Nome, Classe, Variação..." autofocus>
                                <button onclick="clearSearch()" id="clearBtn" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer hidden" title="Limpar todos os filtros">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <!-- Filter Toggle Button -->
                            <div class="flex-none">
                                <button onclick="toggleFilterRow()" id="filterToggleBtn" class="w-full md:w-auto h-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:text-indigo-600 hover:border-indigo-500 transition-all shadow-sm flex items-center justify-center font-medium text-sm group">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 group-hover:scale-110 transition-transform"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                                    Filtros
                                </button>
                            </div>
                        </div>

                        <div class="mt-2 text-xs text-gray-400 flex justify-between items-center">
                            <span>Dica: Use espaços para buscar múltiplos termos</span>
                            <span class="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">
                                Exibindo <span id="visibleCount" class="font-bold text-gray-900">${finalData.length}</span> / <span id="totalCount">${finalData.length}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Generated Datalists for Suggestions -->
            ${Object.entries(uniqueOptions).map(([key, options]) => `
                <datalist id="list-${key}">
                    ${options.map(opt => `<option value="${opt}">`).join('')}
                </datalist>
            `).join('')}

            <!-- Scrollable Table Content -->
            <div class="flex-grow overflow-y-auto overflow-x-auto p-4 md:p-8 bg-gray-50">
                <div class="max-w-7xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-left border-collapse">
                            <thead class="bg-gray-100 text-xs font-bold text-gray-600 uppercase border-b border-gray-300 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    ${db.columns.map((col, index) => `
                                        <th onclick="sortTable(${index})" class="px-4 py-3 border-r border-gray-200 last:border-r-0 whitespace-nowrap ${col.width || 'w-auto'} group hover:bg-gray-200 transition-colors select-none">
                                            <div class="flex items-center space-x-1">
                                                <span>${col.label}</span>
                                                <span class="sort-icon text-gray-400 text-[10px] group-hover:text-gray-600 opacity-50 group-hover:opacity-100">↕</span>
                                            </div>
                                        </th>
                                    `).join('')}
                                </tr>
                                <tr id="filterRow" class="hidden bg-gray-50 border-b border-gray-300">
                                    ${db.columns.map((col, i) => {
                                        // Smart Strict Filter: Code columns use startsWith, Text columns use contains
                                        const isCode = ['un', 'class', 'sub', 'pg', 'eq', 'lq_pi', 'pax_pi', 'cao_pi'].includes(col.key);
                                        const mode = isCode ? 'starts-with' : 'contains';
                                        const hasList = uniqueOptions[col.key] ? `list="list-${col.key}"` : '';
                                        
                                        return `
                                        <th class="px-2 py-2 border-r border-gray-200 last:border-r-0">
                                            <div class="input-wrapper">
                                                <input type="text" 
                                                    class="w-full text-xs px-2 py-1.5 pr-6 border border-gray-300 rounded focus:ring-2 focus:ring-latam-indigo/50 focus:border-latam-indigo font-normal text-gray-700 col-filter" 
                                                    data-col="${i}" 
                                                    data-mode="${mode}"
                                                    ${hasList}
                                                    placeholder="${col.label}..." 
                                                    oninput="debouncedFilterTable()">
                                                <span class="clear-input" onclick="clearColFilter(this)">✕</span>
                                            </div>
                                        </th>
                                        `;
                                    }).join('')}
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 text-xs bg-white">
                                ${finalData.map((row, rIdx) => {
                                    const isSimulated = !!row.isSimulated;
                                    const isVerified = !!(row.un && verifiedRegistry[row.un]);
                                    const rowClass = isVerified ? 'bg-emerald-50 hover:bg-emerald-100' : (isSimulated ? 'text-gray-500 bg-gray-50/50' : 'bg-white hover:bg-blue-50');
                                    
                                    return `
                                    <tr class="${rowClass} transition-colors">
                                        ${db.columns.map(col => {
                                            let cellContent = row[col.key] || '';
                                            
                                            // Specific styling for Name
                                            if (col.key === 'name') {
                                                if (isVerified) {
                                                    cellContent = `<div class="flex justify-between items-center"><span>${cellContent}</span><span class="text-[9px] uppercase font-bold text-green-700 bg-green-100 border border-green-200 rounded px-1.5 py-0.5 ml-2">Oficial</span></div>`;
                                                } else if (isSimulated) {
                                                    cellContent = `<span class="italic" title="Dado Simulado">${cellContent}</span>`;
                                                }
                                            } else if (col.key === 'un') {
                                                cellContent = `<span class="font-mono font-bold">${cellContent}</span>`;
                                            }
                                            
                                            return `<td class="px-4 py-2 border-r border-gray-200 last:border-r-0 whitespace-normal">${cellContent}</td>`;
                                        }).join('')}
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="bg-gray-50 p-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                        <span>Nota: Para detalhes interativos e auditoria, utilize a busca global ou o assistente IA.</span>
                        <button onclick="window.close()" class="underline hover:text-gray-800">Fechar Janela</button>
                    </div>
                </div>
                
                <div class="text-center mt-12 pb-8">
                    <button onclick="window.close()" class="text-sm font-medium text-gray-500 hover:text-gray-800 hover:underline px-4 py-2">
                        Fechar Janela
                    </button>
                </div>
            </div>
            
            <script>
                function toggleFilterRow() {
                    const row = document.getElementById('filterRow');
                    const btn = document.getElementById('filterToggleBtn');
                    if (row.classList.contains('hidden')) {
                        row.classList.remove('hidden');
                        btn.classList.add('bg-indigo-50', 'border-indigo-500', 'text-indigo-700', 'ring-1', 'ring-indigo-500');
                    } else {
                        row.classList.add('hidden');
                        btn.classList.remove('bg-indigo-50', 'border-indigo-500', 'text-indigo-700', 'ring-1', 'ring-indigo-500');
                    }
                }

                function clearSearch() {
                    const globalInput = document.getElementById('searchInput');
                    globalInput.value = '';
                    
                    // Clear all column filters
                    const colInputs = document.querySelectorAll('.col-filter');
                    colInputs.forEach(input => input.value = '');
                    
                    filterTable();
                    globalInput.focus();
                }

                function clearColFilter(btn) {
                    const input = btn.previousElementSibling;
                    input.value = '';
                    debouncedFilterTable();
                    input.focus();
                }

                let filterTimeout;
                function debouncedFilterTable() {
                    clearTimeout(filterTimeout);
                    filterTimeout = setTimeout(filterTable, 300);
                }

                function filterTable() {
                    const globalInput = document.getElementById('searchInput');
                    const clearBtn = document.getElementById('clearBtn');
                    const globalFilter = globalInput.value.toLowerCase().trim();
                    const globalTokens = globalFilter ? globalFilter.split(' ').filter(t => t.length > 0) : [];
                    
                    // Get all column filters
                    const colInputs = document.querySelectorAll('.col-filter');
                    const colFilters = [];
                    let hasColFilters = false;
                    colInputs.forEach(input => {
                        const val = input.value.toLowerCase().trim();
                        if (val) {
                            colFilters.push({
                                index: parseInt(input.getAttribute('data-col')),
                                value: val,
                                mode: input.getAttribute('data-mode') || 'starts-with'
                            });
                            hasColFilters = true;
                        }
                    });

                    // Show/Hide Clear Button based on ANY active filter
                    if (globalFilter.length > 0 || hasColFilters) {
                        clearBtn.classList.remove('hidden');
                    } else {
                        clearBtn.classList.add('hidden');
                    }

                    const tbody = document.querySelector('tbody');
                    const rows = tbody.getElementsByTagName('tr');
                    let count = 0;

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        let visible = true;

                        // 1. Global Search
                        if (globalTokens.length > 0) {
                            const rowText = row.textContent.toLowerCase();
                            for (let token of globalTokens) {
                                if (rowText.indexOf(token) === -1) {
                                    visible = false;
                                    break;
                                }
                            }
                        }

                        // 2. Column Filters
                        if (visible && hasColFilters) {
                            const cells = row.getElementsByTagName('td');
                            for (let filter of colFilters) {
                                const cell = cells[filter.index];
                                if (!cell) continue; 
                                const cellText = cell.textContent.trim().toLowerCase();
                                
                                if (filter.mode === 'contains') {
                                    if (cellText.indexOf(filter.value) === -1) {
                                        visible = false;
                                        break;
                                    }
                                } else {
                                    // 'starts-with' logic (Strict)
                                    if (!cellText.startsWith(filter.value)) {
                                        visible = false;
                                        break;
                                    }
                                }
                            }
                        }

                        if (visible) {
                            row.style.display = "";
                            count++;
                        } else {
                            row.style.display = "none";
                        }
                    }
                    const visibleCountEl = document.getElementById('visibleCount');
                    if(visibleCountEl) visibleCountEl.textContent = count;
                }

                let currentSort = { col: -1, dir: 'asc' };

                function sortTable(colIndex) {
                    const table = document.querySelector('table');
                    const tbody = table.querySelector('tbody');
                    const rows = Array.from(tbody.querySelectorAll('tr'));
                    // Target first row only to avoid selecting filter row ths
                    const headers = table.querySelectorAll('thead tr:first-child th');

                    let dir = 'asc';
                    if (currentSort.col === colIndex && currentSort.dir === 'asc') {
                        dir = 'desc';
                    }
                    currentSort = { col: colIndex, dir: dir };

                    headers.forEach(h => {
                        const icon = h.querySelector('.sort-icon');
                        if(icon) icon.textContent = '↕';
                        h.classList.remove('bg-gray-200');
                    });
                    
                    const activeHeader = headers[colIndex];
                    if (activeHeader) {
                        const icon = activeHeader.querySelector('.sort-icon');
                        if(icon) icon.textContent = dir === 'asc' ? '↑' : '↓';
                        activeHeader.classList.add('bg-gray-200');
                    }

                    rows.sort((a, b) => {
                        const cellA = a.children[colIndex] ? a.children[colIndex].textContent.trim() : '';
                        const cellB = b.children[colIndex] ? b.children[colIndex].textContent.trim() : '';
                        const numA = parseFloat(cellA.replace(/[^0-9.-]+/g,""));
                        const numB = parseFloat(cellB.replace(/[^0-9.-]+/g,""));
                        const isNum = !isNaN(numA) && !isNaN(numB) && cellA.length < 20;

                        let comparison = 0;
                        if (isNum) {
                            comparison = numA - numB;
                        } else {
                            comparison = cellA.localeCompare(cellB);
                        }

                        return dir === 'asc' ? comparison : -comparison;
                    });

                    rows.forEach(row => tbody.appendChild(row));
                }
            </script>
        </body>
        </html>
    `;

    // Use Blob URL to prevent "about:blank" refresh issue
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Attempt to open the new window with the Blob URL
    newWindow.location.href = url;
  };

  // --- Renderers ---

  const renderHazardLabel = (labelClass: string) => {
    switch (labelClass) {
      case '3':
        return (
          <div className="w-32 h-32 bg-red-600 relative transform rotate-45 border-4 border-white shadow-xl mx-auto my-8 overflow-hidden flex items-center justify-center group hover:scale-105 transition-transform duration-300">
             <div className="transform -rotate-45 flex flex-col items-center justify-center text-white w-full h-full p-2">
                <div className="flex-1 flex items-end pb-1 mb-2">
                   <Wind className="w-14 h-14"/>
                </div>
                <div className="h-0.5 w-full bg-transparent"></div>
                <span className="text-4xl font-extrabold mt-auto leading-none mb-1">3</span>
             </div>
             <div className="absolute inset-0 border-[3px] border-white/90 pointer-events-none"></div>
          </div>
        );
      case '8':
        return (
          <div className="w-32 h-32 bg-white relative transform rotate-45 border-4 border-gray-900 shadow-xl mx-auto my-8 overflow-hidden flex items-center justify-center group hover:scale-105 transition-transform duration-300">
             <div className="absolute inset-0 bg-white"></div>
             <div className="absolute top-0 w-full h-1/2 bg-white border-b-2 border-black"></div>
             <div className="absolute bottom-0 w-full h-1/2 bg-black"></div>
             <div className="transform -rotate-45 relative z-10 flex flex-col items-center justify-center w-full h-full">
                <div className="flex-1 pt-3 text-black w-full flex justify-center">
                   <div className="flex space-x-3 items-end">
                      <div className="flex flex-col items-center">
                          <div className="w-4 h-6 bg-gray-300 border border-black rounded-sm relative overflow-hidden mb-1">
                             <div className="absolute bottom-0 w-full h-3 bg-black transform rotate-12 scale-150"></div>
                          </div>
                          <div className="w-6 h-1 bg-black rounded-full"></div>
                      </div>
                      <div className="flex flex-col items-center">
                          <div className="w-8 h-2 bg-gray-300 border border-black rounded-sm relative mb-1"></div>
                          <div className="w-8 h-2 bg-black/20 rounded-full blur-[1px]"></div>
                      </div>
                   </div>
                </div>
                <div className="text-white text-4xl font-extrabold pb-1 leading-none mt-auto">8</div>
             </div>
             <div className="absolute inset-0 border-[3px] border-black pointer-events-none"></div>
          </div>
        );
      case '9':
          return (
            <div className="w-32 h-32 bg-white relative transform rotate-45 border-4 border-gray-900 shadow-xl mx-auto my-8 overflow-hidden flex items-center justify-center group hover:scale-105 transition-transform duration-300">
               <div className="absolute inset-0 bg-white"></div>
               <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
                    {[...Array(7)].map((_, i) => (
                         <div key={i} className="absolute bg-black h-full w-1" style={{left: `${(i+1)*12.5}%`, transform: 'translateX(-50%)'}}></div>
                    ))}
               </div>
               <div className="transform -rotate-45 relative z-10 flex flex-col items-center justify-center w-full h-full">
                  <div className="flex-1"></div>
                  <div className="text-black text-4xl font-extrabold pb-1 leading-none mt-auto underline decoration-4">9</div>
               </div>
               <div className="absolute inset-0 border-[3px] border-black pointer-events-none"></div>
            </div>
          );
      case '7':
          return (
             <div className="w-32 h-32 bg-white relative border-4 border-black shadow-xl mx-auto my-8 overflow-hidden flex flex-col group hover:scale-105 transition-transform duration-300">
                 <div className="h-1/2 bg-[#FFFF00] border-b-2 border-black flex items-center justify-center pt-2 relative">
                    <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-black absolute top-6"></div>
                    <div className="w-3 h-3 bg-black rounded-full absolute top-10"></div>
                    <div className="font-bold text-[10px] absolute top-1 right-1">RADIOACTIVE</div>
                    <div className="font-bold text-[10px] absolute top-1 left-1">II</div>
                 </div>
                 <div className="h-1/2 bg-white flex flex-col items-center justify-end pb-1 relative">
                    <div className="text-[9px] font-mono leading-tight text-center w-full px-1">
                        CONTENTS...................<br/>
                        ACTIVITY...................<br/>
                        TRANSPORT INDEX ...0.5...
                    </div>
                    <div className="text-2xl font-bold mt-1">7</div>
                 </div>
             </div>
          );
      default:
        return null;
    }
  };

  const renderVisualMark = (mark: DGRMark) => {
    switch (mark.type) {
      case 'lq':
        return (
          <div className="w-32 h-32 bg-white relative mx-auto my-8 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
             <div className="w-24 h-24 transform rotate-45 border-[4px] border-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[30%] bg-black"></div>
                <div className="absolute bottom-0 left-0 w-full h-[30%] bg-black"></div>
             </div>
          </div>
        );
      case 'lq-y':
        return (
          <div className="w-32 h-32 bg-white relative mx-auto my-8 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
             <div className="w-24 h-24 transform rotate-45 border-[4px] border-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[30%] bg-black"></div>
                <div className="absolute bottom-0 left-0 w-full h-[30%] bg-black"></div>
                <div className="transform -rotate-45 text-5xl font-bold text-black z-10">Y</div>
             </div>
          </div>
        );
      case 'eq':
        return (
            <div className="w-32 h-32 bg-white relative border-2 border-red-600 rounded-sm shadow-xl mx-auto my-8 flex flex-col items-center justify-center p-2 group hover:scale-105 transition-transform duration-300">
                 <div className="text-6xl font-black text-red-600 leading-none">E</div>
                 <div className="w-full flex flex-col items-center mt-1 space-y-1">
                    <div className="text-[8px] text-red-600 font-bold uppercase text-center w-full border-t border-red-600 pt-1">
                        {mark.data?.class ? `Class ${mark.data.class}` : '***'}
                    </div>
                    <div className="text-[8px] text-red-600 font-bold uppercase text-center w-full border-t border-red-600 pt-1">
                        {mark.data?.unNumbers || '***'}
                    </div>
                 </div>
            </div>
        );
      case 'lithium-battery':
         return (
             <div className="w-40 h-28 bg-white relative border-[3px] border-red-600 shadow-xl mx-auto my-8 flex flex-col items-center justify-center group hover:scale-105 transition-transform duration-300 p-2">
                 {/* Battery Graphic Simulation */}
                 <div className="flex space-x-2 mb-2">
                     <div className="w-8 h-4 border-2 border-black rounded-sm relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full w-1 h-2 bg-black"></div>
                        <div className="h-full bg-black w-1/2"></div>
                     </div>
                     <div className="w-8 h-4 border-2 border-black rounded-sm relative">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full w-1 h-2 bg-black"></div>
                        <div className="h-full bg-black w-1/2"></div>
                     </div>
                 </div>
                 <div className="text-black font-extrabold text-lg leading-none">UN {mark.data?.unNumbers || '3480'}</div>
                 <div className="text-black font-bold text-xs mt-2">{mark.data?.phone || '(XX) XXXX-XXXX'}</div>
             </div>
         );
       case 'orientation':
          return (
              <div className="w-24 h-32 bg-red-600 relative shadow-xl mx-auto my-8 flex items-center justify-center group hover:scale-105 transition-transform duration-300 rounded-sm">
                 <div className="flex space-x-3">
                      <div className="flex flex-col items-center">
                          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-white"></div>
                          <div className="w-1.5 h-10 bg-white"></div>
                          <div className="w-6 h-0.5 bg-white mt-1"></div>
                      </div>
                      <div className="flex flex-col items-center">
                          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-white"></div>
                          <div className="w-1.5 h-10 bg-white"></div>
                          <div className="w-6 h-0.5 bg-white mt-1"></div>
                      </div>
                 </div>
              </div>
          );
      case 'cargo-only':
        return (
          <div className="w-40 h-44 bg-orange-500 relative shadow-xl mx-auto my-8 flex items-center justify-center border-4 border-black group hover:scale-105 transition-transform duration-300">
             <div className="flex flex-col items-center justify-center w-full h-full p-2">
                 <div className="flex-1 w-full flex items-center justify-center">
                    <div className="text-black font-bold text-xs uppercase text-center w-full">
                        <div className="mb-2 text-[10px] leading-tight">CARGO AIRCRAFT<br/>ONLY</div>
                        <Plane className="w-16 h-16 mx-auto" strokeWidth={2}/>
                    </div>
                 </div>
                 <div className="w-full bg-black h-1 my-1"></div>
                 <div className="text-black text-[10px] font-bold uppercase text-center leading-tight">
                    FORBIDDEN IN PASSENGER AIRCRAFT
                 </div>
             </div>
          </div>
        );
      case 'mag':
          return (
            <div className="w-32 h-32 bg-white relative border-2 border-black shadow-xl mx-auto my-8 overflow-hidden flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-white p-2 flex flex-col justify-between">
                    <div className="text-center font-bold text-[10px] uppercase">Magnetized Material</div>
                    <div className="flex justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-12 h-12 text-blue-800">
                           <path d="M15 7h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3m-6 0H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3M6 11h12"/>
                           <path d="M12 20v-8m-3 3 3 3 3-3"/>
                        </svg>
                    </div>
                    <div className="text-center font-bold text-[10px] uppercase text-blue-800">Keep away from flight deck</div>
                </div>
            </div>
          );
      case 'cryogenic':
          return (
            <div className="w-32 h-32 bg-green-600 text-white relative border-4 border-white shadow-xl mx-auto my-8 flex flex-col items-center justify-center group hover:scale-105 transition-transform duration-300">
                <ThermometerSnowflake className="w-16 h-16" strokeWidth={2}/>
                <div className="mt-2 text-xs font-bold uppercase tracking-wider">Cryogenic Liquid</div>
            </div>
          );
       case 'keep-away-heat':
          return (
            <div className="w-32 h-32 bg-red-600 text-white relative border-4 border-white shadow-xl mx-auto my-8 flex flex-col items-center justify-center group hover:scale-105 transition-transform duration-300">
                <Sun className="w-12 h-12 mb-2" strokeWidth={2.5}/>
                <Box className="w-10 h-10" strokeWidth={2}/>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-center">Keep Away<br/>From Heat</div>
            </div>
          );
      default:
        return null;
    }
  };

  const renderBlock = (block: DGRContentBlock, idx: number | string) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={idx} className="mb-3 text-gray-800 leading-relaxed text-justify text-[14px] font-medium">
             <HighlightText text={block.content as string} highlight={initialSearchTerm} />
          </p>
        );

      case 'list':
        const listData = block.content as DGRList;
        const ListTag = listData.ordered ? 'ol' : 'ul';
        const listStyle = listData.type === 'alpha' ? 'list-[lower-alpha]' : listData.ordered ? 'list-decimal' : 'list-disc';
        return (
          <ListTag key={idx} className={`mb-4 pl-8 space-y-1 text-gray-700 ${listStyle} marker:text-latam-indigo marker:font-bold text-sm`}>
            {listData.items.map((item, i) => (
              <li key={i} className="pl-1">
                 <HighlightText text={item} highlight={initialSearchTerm} />
              </li>
            ))}
          </ListTag>
        );
      
      case 'definition-list':
        const defData = block.content as DGRDefinition[];
        return (
          <dl key={idx} className="my-6 space-y-4">
            {defData.map((item, i) => (
              <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
                <dt className="font-bold text-latam-indigo text-sm mb-1">{item.term}</dt>
                <dd className="text-gray-600 text-sm leading-relaxed pl-4 border-l-2 border-gray-200">
                    <HighlightText text={item.definition} highlight={initialSearchTerm} />
                </dd>
              </div>
            ))}
          </dl>
        );

      case 'checklist':
        const checkData = block.content as DGRChecklist;
        return (
            <div key={idx} className="my-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between">
                    <h4 className="font-bold text-gray-800">{checkData.title}</h4>
                    <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-1 rounded">{checkData.id}</span>
                </div>
                <div className="divide-y divide-gray-100">
                    {checkData.items.map((item) => {
                         const isChecked = checkedItems[item.id] || false;
                         return (
                            <div 
                                key={item.id} 
                                onClick={() => toggleCheck(item.id)}
                                className={`p-4 flex items-start cursor-pointer hover:bg-blue-50 transition-colors ${isChecked ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className={`mr-4 mt-0.5 transition-colors ${isChecked ? 'text-green-600' : 'text-gray-300'}`}>
                                    {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${isChecked ? 'text-gray-800' : 'text-gray-600'}`}>{item.text}</p>
                                    {item.reference && (
                                        <span className="text-xs text-latam-indigo mt-1 inline-block">Ref: {item.reference}</span>
                                    )}
                                </div>
                            </div>
                         );
                    })}
                </div>
                <div className="bg-gray-50 p-3 text-center border-t border-gray-200">
                    <button 
                        onClick={() => setCheckedItems({})}
                        className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wide"
                    >
                        Limpar Checklist
                    </button>
                </div>
            </div>
        );

      case 'tool':
        const toolData = block.content as DGRTool;
        if (toolData.toolType === 'segregation-checker') {
            const isCompatible = segregationClassA && segregationClassB 
                ? toolData.data.matrix[segregationClassA]?.[segregationClassB] 
                : null;
            
            return (
                <div key={idx} className="my-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center mb-4">
                        <ArrowRightLeft className="w-5 h-5 text-latam-indigo mr-2" />
                        <h4 className="font-bold text-gray-800">{toolData.title}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Classe do Volume 1</label>
                            <select 
                                value={segregationClassA}
                                onChange={(e) => setSegregationClassA(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-latam-indigo focus:border-latam-indigo"
                            >
                                <option value="">Selecione...</option>
                                {toolData.data.classes.map((c: string) => (
                                    <option key={c} value={c}>{toolData.data.labels[c]}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Classe do Volume 2</label>
                            <select 
                                value={segregationClassB}
                                onChange={(e) => setSegregationClassB(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-latam-indigo focus:border-latam-indigo"
                            >
                                <option value="">Selecione...</option>
                                {toolData.data.classes.map((c: string) => (
                                    <option key={c} value={c}>{toolData.data.labels[c]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {segregationClassA && segregationClassB && (
                        <div className={`p-4 rounded-lg flex items-start animate-fade-in ${isCompatible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            {isCompatible ? (
                                <Check className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
                            ) : (
                                <XIcon className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
                            )}
                            <div>
                                <h5 className={`font-bold ${isCompatible ? 'text-green-800' : 'text-red-800'}`}>
                                    {isCompatible ? 'Compatível' : 'Segregação Necessária'}
                                </h5>
                                <p className={`text-sm mt-1 ${isCompatible ? 'text-green-700' : 'text-red-700'}`}>
                                    {isCompatible 
                                        ? "Estes volumes podem ser carregados juntos (salvo exceções específicas)." 
                                        : "Estes volumes NÃO devem ser carregados próximos um do outro."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )
        }
        return null;

      case 'wizard':
        const wizard = block.content as DGRWizard;
        const currentNodeId = wizardStates[wizard.id] || wizard.startNodeId;
        const isResult = wizard.results && wizard.results[currentNodeId];
        
        return (
            <div key={idx} className="my-10 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                <div className="bg-gradient-to-r from-latam-indigo to-latam-indigoLight p-5 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                        <GitMerge className="w-5 h-5" />
                        <h4 className="font-bold tracking-tight">{wizard.title}</h4>
                    </div>
                    {currentNodeId !== wizard.startNodeId && (
                        <button 
                            onClick={() => resetWizard(wizard.id, wizard.startNodeId)}
                            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors flex items-center"
                        >
                            <RotateCcw className="w-3 h-3 mr-1.5" />
                            Reiniciar
                        </button>
                    )}
                </div>
                
                <div className="p-6 md:p-8">
                    {isResult ? (
                        <div className="animate-fade-in text-center">
                            <div className={`
                                w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6
                                ${wizard.results[currentNodeId].type === 'success' ? 'bg-green-100 text-green-600' : ''}
                                ${wizard.results[currentNodeId].type === 'warning' ? 'bg-yellow-100 text-yellow-600' : ''}
                                ${wizard.results[currentNodeId].type === 'danger' ? 'bg-red-100 text-red-600' : ''}
                            `}>
                                {wizard.results[currentNodeId].type === 'success' && <Check className="w-10 h-10" />}
                                {wizard.results[currentNodeId].type === 'warning' && <AlertTriangle className="w-10 h-10" />}
                                {wizard.results[currentNodeId].type === 'danger' && <XIcon className="w-10 h-10" />}
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">{wizard.results[currentNodeId].title}</h3>
                            <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">{wizard.results[currentNodeId].description}</p>
                            
                            {wizard.results[currentNodeId].actionText && (
                                <div className="inline-block px-4 py-2 bg-gray-100 text-gray-700 font-mono text-sm rounded border border-gray-200">
                                    {wizard.results[currentNodeId].actionText}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <h5 className="text-lg font-medium text-gray-800 mb-6 text-center">
                                {wizard.nodes[currentNodeId]?.question}
                            </h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                {wizard.nodes[currentNodeId]?.options.map((option, optIdx) => (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleWizardOption(wizard.id, option.nextNodeId)}
                                        className="p-4 border-2 border-gray-100 hover:border-latam-indigo hover:bg-indigo-50/30 rounded-xl transition-all duration-200 text-left group"
                                    >
                                        <span className="font-semibold text-gray-700 group-hover:text-latam-indigo flex items-center justify-between">
                                            {option.label}
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );

      case 'note':
        const noteData = block.content as DGRNote;
        return (
          <div key={idx} className="my-4 p-3 bg-slate-50 border border-slate-200 rounded text-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
            <div className="flex">
                <span className="font-bold text-slate-700 mr-2 uppercase text-xs flex-shrink-0">
                {noteData.title || 'Nota'}:
                </span>
                <span className="text-slate-600">
                    <HighlightText text={noteData.text} highlight={initialSearchTerm} />
                </span>
            </div>
          </div>
        );

      case 'warning':
        const warningData = block.content as DGRNote;
        return (
          <div key={idx} className="my-4 p-4 bg-red-50 border-2 border-red-100 rounded flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <span className="block font-bold text-red-700 text-sm uppercase mb-1">
                {warningData.title || 'Atenção'}
              </span>
              <p className="text-red-800 text-sm font-medium">
                  <HighlightText text={warningData.text} highlight={initialSearchTerm} />
              </p>
            </div>
          </div>
        );
      
      case 'database':
          const db = block.content as DGRDatabase;
          // CARD VIEW WITH BUTTON: Replaces the inline DatabaseBlock to reduce clutter.
          return (
            <div key={idx} className="my-8 flex flex-col items-center justify-center bg-gray-50 p-8 rounded-xl border border-gray-200 border-dashed animate-fade-in group hover:border-latam-indigo/30 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-400 group-hover:text-latam-indigo group-hover:scale-110 transition-all duration-300">
                    <Database className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider text-center">
                    {db.title}
                </h4>
                <p className="text-xs text-gray-400 mb-6 text-center max-w-sm">
                    Base de dados contendo {db.data.length} registros. Clique para acessar a versão interativa completa.
                </p>
                <button 
                    onClick={() => openDatabaseInNewWindow(db, verifiedRegistry)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-300 hover:border-latam-indigo text-gray-700 hover:text-latam-indigo rounded-lg shadow-sm hover:shadow-md transition-all font-medium text-sm"
                >
                   <span>Abrir Base de Dados</span>
                   <ExternalLink className="w-4 h-4" />
                </button>
            </div>
          );

      case 'table':
        const tableData = block.content as DGRTable;
        return (
          <div key={idx} className="my-8 flex flex-col items-center justify-center bg-gray-50 p-8 rounded-xl border border-gray-200 border-dashed animate-fade-in group hover:border-latam-indigo/30 transition-colors">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-400 group-hover:text-latam-indigo group-hover:scale-110 transition-all duration-300">
                <TableIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider text-center">
                {tableData.caption || 'Tabela de Dados'}
            </h4>
            <p className="text-xs text-gray-400 mb-6 text-center max-w-sm">
                Esta tabela contém {tableData.rows.length} linhas de dados regulatórios detalhados.
            </p>
            <button 
                onClick={() => openTableInNewWindow(tableData)}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-gray-300 hover:border-latam-indigo text-gray-700 hover:text-latam-indigo rounded-lg shadow-sm hover:shadow-md transition-all font-medium text-sm"
            >
               <span>Abrir Tabela Completa</span>
               <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        );

      case 'packing-instruction':
        const piData = block.content as DGRPackingInstruction;
        return (
          <div key={idx} className="my-10 border-2 border-gray-800 bg-white">
            {/* PI Header */}
            {/* Updated top-24 to fix overlap with main header */}
            <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center sticky top-24 z-10 transition-all duration-300">
               <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest opacity-80">Instrução de Embalagem</span>
                  <span className="text-3xl font-bold font-mono">{piData.id}</span>
               </div>
               <div className="text-right">
                  <div className="flex items-center text-xs font-bold bg-white/10 px-3 py-1 rounded-full mb-1">
                     <Plane className="w-3 h-3 mr-2" />
                     {piData.transportMode}
                  </div>
               </div>
            </div>
            
            {/* PI Body */}
            <div className="p-6 md:p-8 space-y-6">
               <div className="border-b border-gray-200 pb-4 mb-4">
                  <h4 className="font-bold text-lg text-gray-900">{piData.title}</h4>
               </div>
               
               {/* Recursive Render of PI Blocks */}
               {piData.content.map((b, i) => (
                  <div key={i} className="pi-content-block">
                     {renderBlock(b, `${idx}-${i}`)}
                  </div>
               ))}
            </div>
          </div>
        );

      case 'figure':
        const figData = block.content as DGRFigure;
        return (
            <div key={idx} className="my-8 flex flex-col items-center">
                {renderHazardLabel(figData.labelClass)}
                <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center border-t border-gray-200 pt-2 w-full max-w-xs">
                    {figData.caption}
                </div>
            </div>
        );
      
      case 'visual-mark':
        const markData = block.content as DGRMark;
        return (
             <div key={idx} className="my-8 flex flex-col items-center">
                {renderVisualMark(markData)}
                <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center border-t border-gray-200 pt-2 w-full max-w-xs">
                    {markData.caption}
                </div>
            </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in pb-32 pt-4 px-2">
      {/* Header */}
      <div className="mb-6 flex items-start space-x-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors bg-white">
              <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-grow pt-1">
           <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                <span className="font-mono text-gray-400 mr-2">{!isNaN(Number(chapter.id)) ? String(chapter.id).padStart(2, '0') : chapter.id}</span>
                {chapter.title}
           </h2>
           <p className="text-sm text-gray-500 mt-1">{chapter.description}</p>
        </div>
        <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                <Bookmark className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                <Share2 className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Table of Contents */}
        <aside className="col-span-12 md:col-span-3 md:sticky md:top-24">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-sm mb-3 flex items-center text-gray-700">
                   <List className="w-4 h-4 mr-2" />
                   Navegação
                </h3>
                <nav>
                    <ul>
                        {chapter.sections.map(section => (
                            <li key={section.id}>
                                <a 
                                  href={`#${section.id}`} 
                                  onClick={(e) => {
                                      e.preventDefault();
                                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      setActiveSectionId(section.id);
                                  }}
                                  className={`block text-sm py-2 px-3 rounded-md transition-all ${activeSectionId === section.id ? 'bg-indigo-50 text-latam-indigo font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                  {section.id} - {section.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </aside>

        {/* Main Content */}
        <main className="col-span-12 md:col-span-9">
            {chapter.sections.map(section => (
                <section key={section.id} id={section.id} className="mb-12 scroll-mt-20 md:scroll-mt-24">
                    <div className="flex items-center mb-4 pb-2 border-b-2 border-latam-indigo/20">
                        <span className="font-mono text-xl font-extrabold text-latam-indigo mr-4 bg-indigo-50 px-2 py-1 rounded">{section.id}</span>
                        <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
                    </div>
                    <div className="space-y-4">
                        {section.blocks.map((block, i) => renderBlock(block, `${section.id}-${i}`))}
                    </div>
                </section>
            ))}
        </main>

      </div>

      {selectedUNEntry && (
        <UNDetailModal data={selectedUNEntry} onClose={() => setSelectedUNEntry(null)} />
      )}
    </div>
  );
};

//--- Database Component (Embedded for locality) ---

interface DatabaseBlockProps {
  db: DGRDatabase;
  highlight: string;
  onRowClick: (row: any) => void;
  onHydrate: (un: string) => void;
  verifiedRegistry: Record<string, any>;
}

const DatabaseBlock: React.FC<DatabaseBlockProps> = ({ db, highlight, onRowClick, onHydrate, verifiedRegistry }) => {
    const [filter, setFilter] = useState('');
    const [sortBy, setSortBy] = useState<{ key: string; order: 'asc' | 'desc' } | null>(null);

    const filteredAndSortedData = useMemo(() => {
        let data = [...db.data];

        // Filter
        if (filter.trim()) {
            const lowerFilter = filter.toLowerCase();
            data = data.filter(row => {
                return Object.values(row).some(val => 
                    String(val).toLowerCase().includes(lowerFilter)
                );
            });
        }
        
        // Merge verified data (prioritizing it)
        data = data.map(row => {
            if (row.un && verifiedRegistry[row.un]) {
                return { ...row, ...verifiedRegistry[row.un], isVerified: true };
            }
            return row;
        });

        // Sort
        if (sortBy) {
            data.sort((a, b) => {
                const valA = a[sortBy.key];
                const valB = b[sortBy.key];
                
                if (valA < valB) return sortBy.order === 'asc' ? -1 : 1;
                if (valA > valB) return sortBy.order === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [db.data, filter, sortBy, verifiedRegistry]);

    const handleSort = (key: string) => {
        if (sortBy && sortBy.key === key) {
            setSortBy({ key, order: sortBy.order === 'asc' ? 'desc' : 'asc' });
        } else {
            setSortBy({ key, order: 'asc' });
        }
    };
    
    // Virtualization state (simple implementation)
    const [visibleRows, setVisibleRows] = useState(50);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (tableContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 200 && visibleRows < filteredAndSortedData.length) {
                setVisibleRows(prev => Math.min(prev + 50, filteredAndSortedData.length));
            }
        }
    };

    return (
        <div className="my-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center">
                    <Database className="w-5 h-5 text-latam-indigo mr-2" />
                    <h4 className="font-bold text-gray-800">{db.title}</h4>
                </div>
                <div className="relative w-1/3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        placeholder={`Filtrar ${db.data.length} registros...`}
                        className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-full text-sm"
                    />
                </div>
            </div>
            <div 
                ref={tableContainerRef}
                onScroll={handleScroll}
                className="overflow-x-auto overflow-y-auto max-h-[600px] relative"
                style={{ scrollbarWidth: 'thin' }}
            >
                <table className="min-w-full text-xs border-collapse">
                    <thead className="bg-white sticky top-0 z-10 shadow-sm">
                        <tr>
                            {db.columns.map(col => (
                                <th 
                                    key={col.key} 
                                    onClick={() => handleSort(col.key)}
                                    className={`px-3 py-2 text-left font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 ${col.width || ''}`}
                                >
                                    <div className="flex items-center">
                                       {col.label}
                                       {sortBy && sortBy.key === col.key && (
                                           <span className="ml-1">{sortBy.order === 'asc' ? '▲' : '▼'}</span>
                                       )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-3 py-2 text-left font-bold text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredAndSortedData.slice(0, visibleRows).map((row, idx) => (
                            <tr 
                                key={idx} 
                                onClick={() => onRowClick(row)}
                                className={`group cursor-pointer ${row.isSimulated ? 'bg-gray-50 text-gray-500' : 'bg-white'} ${row.isVerified ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-blue-50'}`}
                            >
                                {db.columns.map(col => (
                                    <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                                        <HighlightText text={String(row[col.key] || '')} highlight={filter} />
                                    </td>
                                ))}
                                <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <button title="Ver Detalhes" className="p-1 rounded text-gray-400 hover:bg-gray-200 hover:text-gray-700">
                                            <Eye className="w-3 h-3" />
                                        </button>
                                        {!row.isVerified && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onHydrate(row.un); }}
                                                title="Verificar com IA" 
                                                className="p-1 rounded text-green-500 hover:bg-green-100 hover:text-green-700 animate-pulse-slow group-hover:animate-none"
                                            >
                                                <BadgeCheck className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {visibleRows < filteredAndSortedData.length && (
                    <div className="text-center p-4 text-xs text-gray-500">
                        Carregando mais...
                    </div>
                )}
            </div>
            <div className="p-2 bg-gray-50 border-t border-gray-200 text-right text-[10px] text-gray-400">
                Exibindo {Math.min(visibleRows, filteredAndSortedData.length)} de {filteredAndSortedData.length}
            </div>
        </div>
    );
};

// FIX: Move export to the end of the file
export default ChapterDetail;