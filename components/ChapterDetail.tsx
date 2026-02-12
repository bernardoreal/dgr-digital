

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Bookmark, Share2, List, FileText, ShieldCheck, AlertTriangle, Check, X as XIcon, ChevronRight, Package, Plane, Globe, BookOpen, Search, CheckSquare, Square, RefreshCw, ArrowRightLeft, GitMerge, RotateCcw, Filter, ArrowUpDown, Eye, ShieldAlert, BadgeCheck, CloudDownload, Box, ExternalLink, Table as TableIcon, Database, Wind, ThermometerSnowflake, Sun, Radiation } from 'lucide-react';
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
  initialScrollId?: string | null;
  onClearInitialScroll: () => void;
}

const ChapterDetail: React.FC<ChapterDetailProps> = ({ chapter, onBack, initialSearchTerm = '', initialScrollId, onClearInitialScroll }) => {
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

  useEffect(() => {
    if (initialScrollId) {
      setTimeout(() => {
        const element = document.getElementById(initialScrollId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          element.classList.add('ring-4', 'ring-offset-4', 'ring-latam-coral', 'transition-all', 'duration-1000', 'ease-in-out', 'rounded-lg');
          setTimeout(() => element.classList.remove('ring-4', 'ring-offset-4', 'ring-latam-coral', 'rounded-lg'), 2500);
        }
        onClearInitialScroll();
      }, 200);
    }
  }, [initialScrollId, onClearInitialScroll, chapter]);

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
                                            const piValue = String(row[col.key] || '');
                                            const piNumber = piValue.replace('Y', '');
                                            const isClickablePI = (col.key === 'pax_pi' || col.key === 'cao_pi' || col.key === 'lq_pi') && piNumber && piNumber !== 'Forbidden' && !isNaN(Number(piNumber));

                                            if (isClickablePI) {
                                                cellContent = `<button class="text-blue-600 underline font-bold hover:text-blue-800" onclick="window.opener.postMessage({ type: 'navigateToPI', chapterId: 5, sectionId: '${piNumber}' }, '*'); window.close();">${piValue}</button>`;
                                            } else if (col.key === 'name') {
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
                          <div className="w-3 h-8 bg-white"></div>
                          <div className="w-8 h-1 bg-white"></div>
                      </div>
                      <div className="flex flex-col items-center">
                          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-white"></div>
                          <div className="w-3 h-8 bg-white"></div>
                          <div className="w-8 h-1 bg-white"></div>
                      </div>
                 </div>
              </div>
          );
      case 'cargo-only':
         return (
             <div className="w-32 h-24 bg-orange-500 relative shadow-xl mx-auto my-8 flex flex-col items-center justify-center p-2 group hover:scale-105 transition-transform duration-300 rounded-sm text-black">
                <Plane className="w-10 h-10 mb-1"/>
                <div className="font-extrabold text-xs text-center leading-tight">CARGO AIRCRAFT<br/>ONLY</div>
             </div>
         );
      case 'cryogenic':
          return (
            <div className="w-24 h-32 bg-green-500 text-white relative shadow-xl mx-auto my-8 flex flex-col items-center justify-center p-2 group hover:scale-105 transition-transform duration-300 rounded-sm">
                <ThermometerSnowflake className="w-10 h-10 mb-2"/>
                <div className="font-bold text-xs text-center leading-tight">NON-FLAMMABLE<br/>GAS</div>
                <div className="font-extrabold text-2xl mt-1">2</div>
            </div>
          );
      case 'keep-away-heat':
           return (
             <div className="w-24 h-32 bg-white border-2 border-red-600 text-red-600 relative shadow-xl mx-auto my-8 flex flex-col items-center justify-center p-2 group hover:scale-105 transition-transform duration-300 rounded-sm">
                 <Sun className="w-10 h-10 mb-2"/>
                 <div className="font-bold text-xs text-center leading-tight">KEEP AWAY FROM HEAT</div>
                 <div className="font-extrabold text-2xl mt-1">4.1</div>
             </div>
           );
      case 'radioactive-i':
          return (
            <div className="w-24 h-24 bg-white border-2 border-black text-black relative shadow-xl mx-auto my-8 flex flex-col items-center justify-center p-1 group hover:scale-105 transition-transform duration-300 rounded-sm">
                 <div className="font-bold text-[8px] text-center mb-1">RADIOACTIVE</div>
                 <div className="w-full h-0.5 bg-black my-1"></div>
                 <div className="text-xs font-mono text-center leading-tight">
                     CONTENTS...<br/>
                     ACTIVITY...
                 </div>
                 <div className="font-extrabold text-sm mt-1 px-2 py-0.5 bg-gray-300 rounded-sm">I</div>
                 <div className="font-extrabold text-2xl mt-auto">7</div>
            </div>
          );
      case 'radioactive-ii':
          return (
             <div className="w-24 h-24 bg-yellow-400 border-2 border-black text-black relative shadow-xl mx-auto my-8 flex flex-col items-center justify-center p-1 group hover:scale-105 transition-transform duration-300 rounded-sm">
                 <div className="absolute top-0 w-full h-1/2 bg-yellow-400"></div>
                 <div className="absolute bottom-0 w-full h-1/2 bg-white"></div>
                 <div className="relative z-10 w-full h-full flex flex-col items-center p-1">
                     <div className="font-bold text-[8px] text-center mb-1">RADIOACTIVE</div>
                     <div className="w-full h-0.5 bg-black my-1"></div>
                     <div className="text-xs font-mono text-center leading-tight">
                         CONTENTS...<br/>
                         ACTIVITY...<br/>
                         TI: 0.5
                     </div>
                     <div className="font-extrabold text-sm mt-1 px-2 py-0.5 bg-gray-300 rounded-sm">II</div>
                     <div className="font-extrabold text-2xl mt-auto">7</div>
                 </div>
             </div>
          );
      case 'radioactive-iii':
            return (
                <div className="w-24 h-24 bg-yellow-400 border-2 border-black text-black relative shadow-xl mx-auto my-8 flex flex-col items-center justify-center p-1 group hover:scale-105 transition-transform duration-300 rounded-sm">
                    <div className="absolute top-0 w-full h-1/2 bg-yellow-400"></div>
                    <div className="absolute bottom-0 w-full h-1/2 bg-white"></div>
                    <div className="relative z-10 w-full h-full flex flex-col items-center p-1">
                        <div className="font-bold text-[8px] text-center mb-1">RADIOACTIVE</div>
                        <div className="w-full h-0.5 bg-black my-1"></div>
                        <div className="text-xs font-mono text-center leading-tight">
                            CONTENTS...<br/>
                            ACTIVITY...<br/>
                            TI: 7.3
                        </div>
                        <div className="font-extrabold text-sm mt-1 px-2 py-0.5 bg-red-600 text-white rounded-sm">III</div>
                        <div className="font-extrabold text-2xl mt-auto">7</div>
                    </div>
                </div>
            );
      default: return null;
    }
  };

  const renderContentBlock = (block: DGRContentBlock, idx: number | string) => {
    switch(block.type) {
      case 'paragraph': return <p key={idx} className="mb-4 leading-relaxed text-gray-700"><HighlightText text={block.content as string} highlight={initialSearchTerm} /></p>;
      case 'list': 
        const list = block.content as DGRList;
        const ListTag = list.ordered ? 'ol' : 'ul';
        const listStyle = {
          'alpha': 'list-[lower-alpha]',
          'numeric': 'list-decimal',
          'bullet': 'list-disc'
        }[list.type || (list.ordered ? 'numeric' : 'bullet')] || 'list-disc';
        return (
          <ListTag key={idx} className={`${listStyle} pl-6 mb-4 space-y-2 text-gray-700`}>
            {list.items.map((item, i) => <li key={i}><HighlightText text={item} highlight={initialSearchTerm} /></li>)}
          </ListTag>
        );
      case 'table':
          const table = block.content as DGRTable;
          const isMatrix = table.type === 'matrix';
          return (
              <div key={idx} className="my-6 relative group">
                  <h4 className="text-sm font-bold text-gray-600 mb-2 pl-2 border-l-4 border-gray-300">{table.caption}</h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                      <table className="min-w-full text-sm">
                          <thead className="bg-gray-100 text-gray-600 font-semibold">
                              <tr>
                                  {table.headers.map((h, i) => <th key={i} className="p-3 text-left border-r border-gray-200 last:border-r-0">{h}</th>)}
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                              {table.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-blue-50/50 transition-colors">
                                      {row.map((cell, cIdx) => {
                                          let content = cell;
                                          if (isMatrix) {
                                              if (cell === true) content = <div className="text-center"><XIcon className="w-5 h-5 text-red-500 mx-auto" /></div>;
                                              else if (cell === false) content = <div className="text-center font-bold text-gray-300">-</div>;
                                          } else {
                                              if (typeof cell === 'boolean') {
                                                content = cell ? 
                                                    <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs font-bold border border-green-200">SIM</span> : 
                                                    <span className="inline-flex items-center text-red-700 bg-red-50 px-2 py-0.5 rounded text-xs font-bold border border-red-100">NÃO</span>;
                                              }
                                          }
                                          return <td key={cIdx} className="p-3 border-r border-gray-200 last:border-r-0"><HighlightText text={String(content)} highlight={initialSearchTerm} /></td>;
                                      })}
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                  {table.footnotes && (
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                          {table.footnotes.map((note, i) => <p key={i}>* <HighlightText text={note} highlight={initialSearchTerm} /></p>)}
                      </div>
                  )}
                  <button onClick={() => openTableInNewWindow(table)} className="absolute top-2 right-2 p-2 bg-white/50 backdrop-blur-sm rounded-full text-gray-500 hover:text-latam-indigo hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" title="Abrir em Nova Janela">
                      <ExternalLink className="w-4 h-4"/>
                  </button>
              </div>
          );
      case 'note':
          const note = block.content as DGRNote;
          return (
              <div key={idx} className="my-4 p-4 bg-gray-100 border-l-4 border-gray-400 text-gray-800 rounded-r-md">
                  {note.title && <h5 className="font-bold mb-1">{note.title}</h5>}
                  <p className="text-sm"><HighlightText text={note.text} highlight={initialSearchTerm} /></p>
              </div>
          );
      case 'warning':
          const warning = block.content as DGRNote;
          return (
              <div key={idx} className="my-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-r-md">
                  {warning.title && <h5 className="font-bold mb-1">{warning.title}</h5>}
                  <p className="text-sm"><HighlightText text={warning.text} highlight={initialSearchTerm} /></p>
              </div>
          );
      case 'figure':
        const figure = block.content as DGRFigure;
        return (
          <div key={idx} className="my-6 p-4 border border-dashed border-gray-300 rounded-lg text-center">
             {renderHazardLabel(figure.labelClass)}
             <p className="text-xs text-gray-500 font-semibold mt-2">{figure.caption}</p>
          </div>
        );
      case 'packing-instruction':
          const pi = block.content as DGRPackingInstruction;
          return (
            <div key={idx} id={pi.id} className="my-6 p-4 border-2 border-gray-800 rounded-lg shadow-sm bg-white">
                <div className="bg-gray-800 text-white -m-4 mb-4 p-3 rounded-t-md flex justify-between items-center">
                    <h4 className="font-bold text-lg flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Instrução de Embalagem {pi.id}
                    </h4>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-semibold">{pi.transportMode}</span>
                </div>
                <div className="space-y-3">
                  {pi.content.map((b, i) => renderContentBlock(b, `${idx}-${i}`))}
                </div>
            </div>
          );
      case 'variation': return null; // Variations are handled in their own database view
      case 'definition-list':
          const defs = block.content as DGRDefinition[];
          return (
              <dl key={idx} className="my-4 space-y-3">
                  {defs.map((def, i) => (
                      <div key={i} className="pl-4 border-l-2 border-gray-200">
                          <dt className="font-bold text-gray-800"><HighlightText text={def.term} highlight={initialSearchTerm} /></dt>
                          <dd className="text-sm text-gray-600"><HighlightText text={def.definition} highlight={initialSearchTerm} /></dd>
                      </div>
                  ))}
              </dl>
          );
      case 'visual-mark':
          const mark = block.content as DGRMark;
          return (
            <div key={idx} className="my-6 p-4 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
               {renderVisualMark(mark)}
               <p className="text-xs text-gray-500 font-semibold mt-2">{mark.caption}</p>
            </div>
          );
      case 'checklist':
          const checklist = block.content as DGRChecklist;
          return (
              <div key={idx} id={checklist.id} className="my-6 p-4 border border-blue-200 bg-blue-50/50 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-4 flex items-center"><CheckSquare className="w-5 h-5 mr-2"/>{checklist.title}</h4>
                  <div className="space-y-3">
                      {checklist.items.map(item => (
                          <div key={item.id} className="flex items-start bg-white p-3 rounded shadow-sm border border-gray-100">
                              <button onClick={() => toggleCheck(item.id)} className="mr-3 mt-0.5">
                                  {checkedItems[item.id] ? <CheckSquare className="w-5 h-5 text-blue-600"/> : <Square className="w-5 h-5 text-gray-400"/>}
                              </button>
                              <div className="flex-grow">
                                  <p className="text-sm text-gray-800">{item.text}</p>
                                  {item.reference && <p className="text-xs text-gray-400 mt-1">Ref: {item.reference}</p>}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          );
      case 'tool':
          const tool = block.content as DGRTool;
          if (tool.toolType === 'segregation-checker') {
              const result = segregationClassA && segregationClassB ? (tool.data.matrix[segregationClassA]?.[segregationClassB] ?? null) : null;
              return (
                  <div key={idx} className="my-6 p-4 border border-gray-300 bg-white rounded-lg shadow-inner">
                      <h4 className="font-bold mb-4 flex items-center"><GitMerge className="w-5 h-5 mr-2"/>{tool.title}</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 block mb-1">Classe A</label>
                              <select value={segregationClassA} onChange={e => setSegregationClassA(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                                  <option value="">Selecione...</option>
                                  {tool.data.classes.map(c => <option key={c} value={c}>{c} - {tool.data.labels[c]}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 block mb-1">Classe B</label>
                              <select value={segregationClassB} onChange={e => setSegregationClassB(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                                <option value="">Selecione...</option>
                                {tool.data.classes.map(c => <option key={c} value={c}>{c} - {tool.data.labels[c]}</option>)}
                              </select>
                          </div>
                      </div>
                      {result !== null && (
                          <div className={`p-4 rounded text-center font-bold text-lg animate-fade-in ${result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {result ? '✓ COMPATÍVEL' : '✕ SEGREGAÇÃO OBRIGATÓRIA'}
                          </div>
                      )}
                  </div>
              )
          }
          return null;
      case 'wizard':
          const wizard = block.content as DGRWizard;
          const currentNodeId = wizardStates[wizard.id] || wizard.startNodeId;
          const currentNode = wizard.nodes[currentNodeId];
          const resultNode = wizard.results[currentNodeId];

          return (
            <div key={idx} className="my-6 p-5 border border-purple-200 bg-purple-50 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-purple-800 text-lg">{wizard.title}</h4>
                    <button onClick={() => resetWizard(wizard.id, wizard.startNodeId)} className="text-xs text-purple-600 hover:underline flex items-center"><RotateCcw className="w-3 h-3 mr-1"/>Reiniciar</button>
                </div>

                {currentNode && (
                    <div className="bg-white p-4 rounded shadow-inner border border-gray-100 animate-fade-in">
                        <p className="font-semibold text-gray-800 mb-4">{currentNode.question}</p>
                        <div className="space-y-2">
                            {currentNode.options.map((opt, i) => (
                                <button key={i} onClick={() => handleWizardOption(wizard.id, opt.nextNodeId)} className="w-full text-left p-3 bg-gray-50 hover:bg-purple-100 rounded border border-gray-200 text-sm font-medium flex items-center justify-between">
                                    <span>{opt.label}</span>
                                    <ChevronRight className="w-4 h-4"/>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {resultNode && (
                     <div className={`p-4 rounded mt-4 border animate-fade-in ${
                        resultNode.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
                        resultNode.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                        'bg-red-50 border-red-200 text-red-800'
                     }`}>
                        <h5 className="font-bold flex items-center">
                           {resultNode.type === 'success' && <Check className="w-4 h-4 mr-2"/>}
                           {resultNode.type === 'warning' && <AlertTriangle className="w-4 h-4 mr-2"/>}
                           {resultNode.type === 'danger' && <XIcon className="w-4 h-4 mr-2"/>}
                           {resultNode.title}
                        </h5>
                        <p className="text-sm mt-1">{resultNode.description}</p>
                     </div>
                )}
            </div>
          );
      case 'database':
        const db = block.content as DGRDatabase;
        return (
            <div key={idx} className="my-6 p-4 border border-gray-300 rounded-lg shadow-inner bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800 flex items-center text-lg"><Database className="w-5 h-5 mr-2 text-latam-indigo"/>{db.title}</h4>
                    <button onClick={() => openDatabaseInNewWindow(db, verifiedRegistry)} className="text-xs font-bold bg-gray-800 text-white px-3 py-2 rounded hover:bg-black flex items-center">
                        <ExternalLink className="w-3 h-3 mr-1.5"/>
                        ABRIR EM NOVA JANELA
                    </button>
                </div>
                <p className="text-xs text-gray-500 mb-4">Exibindo os primeiros 5 de {db.data.length} registros. Use o botão acima para uma visualização completa e interativa.</p>
                
                <div className="overflow-x-auto border border-gray-200 rounded">
                    <table className="min-w-full text-xs">
                        <thead className="bg-gray-100 font-semibold">
                            <tr>
                                {db.columns.map(c => <th key={c.key} className="p-2 border-r text-left">{c.label}</th>)}
                                {db.type === 'blue-pages' && <th className="p-2">Ações</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {db.data.slice(0, 5).map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    {db.columns.map(c => <td key={c.key} className="p-2 border-r"><HighlightText text={String(row[c.key] || '')} highlight={initialSearchTerm}/></td>)}
                                    {db.type === 'blue-pages' && (
                                        <td className="p-2 text-center space-x-2">
                                            <button onClick={() => handleRowClick(row)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100" title="Ver Detalhes">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {!verifiedRegistry[row.un] && (
                                                <button onClick={() => handleRowVerification(row.un)} className="p-1 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-100" title="Verificar Dados Oficiais (Live)">
                                                    <ShieldAlert className="w-4 h-4" />
                                                </button>
                                            )}
                                            {verifiedRegistry[row.un] && (
                                                <span className="inline-block p-1 text-green-600" title="Dados Verificados">
                                                    <BadgeCheck className="w-4 h-4"/>
                                                </span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex-none p-4 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full mr-2">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-latam-indigo">{chapter.title}</h2>
              <p className="text-xs text-gray-500">Capítulo {chapter.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><Bookmark className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><Share2 className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 flex-none overflow-y-auto p-4 border-r border-gray-200 hidden md:block">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Seções</h3>
          <ul>
            {chapter.sections.map(section => (
              <li key={section.id}>
                <a 
                  href={`#${section.id}`} 
                  className={`block text-sm p-2 rounded transition-colors ${activeSectionId === section.id ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {section.id} - {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-grow p-6 overflow-y-auto">
          {chapter.sections.map(section => (
            <section key={section.id} id={section.id} className="mb-12 scroll-mt-24">
              <div className="border-b-2 border-latam-coral pb-2 mb-4">
                 <h3 className="text-2xl font-bold text-gray-800">{section.id} - <HighlightText text={section.title} highlight={initialSearchTerm}/></h3>
              </div>
              {section.blocks.map((block, idx) => renderContentBlock(block, `${section.id}-${idx}`))}
            </section>
          ))}
        </main>
      </div>

      {/* Modal for UN Details */}
      {selectedUNEntry && (
        <UNDetailModal 
            data={verifiedRegistry[selectedUNEntry.un] || selectedUNEntry} 
            onClose={() => setSelectedUNEntry(null)} 
        />
      )}
    </div>
  );
};

// FIX: Add default export to make the component available for import.
export default ChapterDetail;
