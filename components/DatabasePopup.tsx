
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, FilterX, X } from 'lucide-react';
import { DGRDatabase } from '../types';
import { BLUE_PAGES_DATA, PACKING_INSTRUCTIONS_DATA } from '../constants';
import UNDetailModal from './UNDetailModal';

interface DatabasePopupProps {
    initialDb: DGRDatabase;
    initialFilter?: Record<string, string>;
}

const DatabasePopup: React.FC<DatabasePopupProps> = ({ initialDb, initialFilter: initialFilterProp }) => {
    const [currentDb, setCurrentDb] = useState(initialDb);
    const [selectedUNEntry, setSelectedUNEntry] = useState<Record<string, any> | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const ROW_HEIGHT = currentDb.id === 'sp-db' ? 120 : 45;
    const OVERSCAN_COUNT = 10;

    useEffect(() => {
        if (initialFilterProp) {
            setFilters(initialFilterProp);
        }
    }, [initialFilterProp]);

    const sortedAndFilteredData = useMemo(() => {
        let data = [...currentDb.data];
        const activeFilters = Object.entries(filters).filter(([, value]) => value);
        
        if (activeFilters.length > 0) {
            data = data.filter(row => 
                activeFilters.every(([key, value]) => 
                    String(row[key] ?? '').toLowerCase().includes(String(value).toLowerCase())
                )
            );
        }

        if (sortConfig) {
            data.sort((a, b) => {
                const valA = String(a[sortConfig.key] ?? '');
                const valB = String(b[sortConfig.key] ?? '');
                const comparison = valA.localeCompare(valB, undefined, { numeric: true });
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return data;
    }, [currentDb.data, filters, sortConfig]);

    const handleSort = (key: string) => {
        const direction = (sortConfig?.key === key && sortConfig.direction === 'asc') ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    };

    const handlePiClick = (pi: string) => {
        if (!pi || pi === 'Forbidden' || String(pi).toLowerCase().includes('see')) return;
        
        const newWindow = window.open(`/?table=pi-database&filter_id=${pi}`, '_blank');
        if (!newWindow) {
            alert('Pop-up bloqueado. Por favor, permita a abertura de novas abas.');
            return;
        }
    };

    const handleRowClick = (row: Record<string, any>) => {
        if (currentDb.id === 'blue-pages') {
            const entry = BLUE_PAGES_DATA.find(d => d.un === row.un);
            if (entry) setSelectedUNEntry(entry);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop);

    const containerHeight = scrollContainerRef.current?.clientHeight || window.innerHeight;
    const totalRows = sortedAndFilteredData.length;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_COUNT);
    const endIndex = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN_COUNT);
    const visibleRows = sortedAndFilteredData.slice(startIndex, endIndex);

    return (
        <>
            <div className="bg-gray-100 p-8 flex flex-col h-screen font-sans">
                <div className="bg-white p-4 shadow-md rounded-t-lg flex justify-between items-center shrink-0 border-b border-gray-200">
                    <h1 className="font-bold text-lg text-gray-800">{currentDb.title}</h1>
                    <button onClick={() => setFilters({})} className="flex items-center text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider">
                        <FilterX className="w-3 h-3 mr-1" /> Limpar Filtros
                    </button>
                </div>
                <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-grow overflow-auto bg-white shadow-md rounded-b-lg min-h-0">
                    <div className="min-w-max">
                        <div className="bg-gray-200 sticky top-0 z-10 border-b border-gray-300">
                            <div className="flex bg-gray-100">
                                {currentDb.columns.map(c => (
                                    <div 
                                        key={c.key} 
                                        className={`p-3 border-r border-gray-200 font-bold uppercase text-[10px] tracking-widest text-gray-500 cursor-pointer flex items-center ${c.width === 'flex-1' ? 'flex-1 min-w-[200px]' : `flex-shrink-0 ${c.width || 'w-32'}`}`} 
                                        onClick={() => handleSort(c.key)}
                                    >
                                        {c.label}
                                    </div>
                                ))}
                            </div>
                            <div className="flex bg-gray-50">
                                {currentDb.columns.map(c => (
                                    <div key={`${c.key}-filter`} className={`p-1 border-r border-gray-200 ${c.width === 'flex-1' ? 'flex-1 min-w-[200px]' : `flex-shrink-0 ${c.width || 'w-32'}`}`}>
                                        {c.filterable ? (
                                            <input type="text" className="w-full p-2 text-xs border rounded bg-white" value={filters[c.key] || ''} onChange={e => setFilters(p => ({ ...p, [c.key]: e.target.value }))} placeholder="Filtrar..."/>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ height: `${totalRows * ROW_HEIGHT}px`, position: 'relative' }}>
                            {visibleRows.map((row, index) => {
                                const rowIndex = startIndex + index;
                                return (
                                    <div 
                                      key={rowIndex} 
                                      className={`flex border-b border-gray-100 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-yellow-100 ${currentDb.id === 'blue-pages' ? 'cursor-pointer' : ''}`}
                                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${ROW_HEIGHT}px`, transform: `translateY(${rowIndex * ROW_HEIGHT}px)`}}
                                      onClick={() => handleRowClick(row)}
                                    >
                                        {currentDb.columns.map(c => {
                                            const cellValue = row[c.key] || '';
                                            const isPiCol = currentDb.id === 'blue-pages' && ['lq_pi', 'pax_pi', 'cao_pi'].includes(c.key);
                                            const isClickable = isPiCol && cellValue && cellValue !== 'Forbidden' && !String(cellValue).toLowerCase().includes('see');

                                            return (
                                                <div key={c.key} className={`p-3 border-r border-gray-100 text-xs font-medium text-gray-700 flex items-center ${c.width === 'flex-1' ? 'flex-1 min-w-[200px] whitespace-normal overflow-y-auto' : `truncate flex-shrink-0 ${c.width || 'w-32'}`}`}>
                                                    {isClickable ? (
                                                        <span className="text-blue-600 hover:underline font-semibold" onClick={(e) => { e.stopPropagation(); handlePiClick(String(cellValue)); }}>
                                                            {cellValue}
                                                        </span>
                                                    ) : (
                                                        <span className={cellValue === 'Forbidden' ? 'text-red-500' : ''}>{cellValue}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            {selectedUNEntry && <UNDetailModal data={selectedUNEntry} onClose={() => setSelectedUNEntry(null)} onNavigateToPi={handlePiClick} />}
        </>
    );
};

export default DatabasePopup;
