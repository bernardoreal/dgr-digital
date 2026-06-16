
/**
 * @file DatabasePopup.tsx
 * @description Integrated regulatory database explorer displaying datasets like Blue Pages index.
 * Employs custom lightweight virtual scrolling to fluidly render thousands of entries without lag.
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, FilterX } from 'lucide-react';
import { DGRDatabase } from '../types';
import { BLUE_PAGES_DATA } from '../constants';
import UNDetailModal from './UNDetailModal';

interface DatabasePopupProps {
    /** The active configuration object that details columns and loaded items of the database */
    initialDb: DGRDatabase;
    /** Optional initial filters passed on load (e.g., from deep query links) */
    initialFilter?: Record<string, string>;
}

const DatabasePopup: React.FC<DatabasePopupProps> = ({ initialDb, initialFilter: initialFilterProp }) => {
    const [currentDb] = useState(initialDb);
    const [selectedUNEntry, setSelectedUNEntry] = useState<Record<string, any> | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Dynamic measurements based on specific active database types
    const ROW_HEIGHT = currentDb.id === 'sp-db' ? 120 : 45;
    const OVERSCAN_COUNT = 10; // Number of non-visible buffer rows rendered to smoothen scroll visual artifacts

    // Deep sync initialized filters on load
    useEffect(() => {
        if (initialFilterProp) {
            setFilters(initialFilterProp);
        }
    }, [initialFilterProp]);

    /**
     * Highly optimized sorting and filtering computation.
     * Re-runs only on data, filtering, or sort configurations changes.
     */
    const sortedAndFilteredData = useMemo(() => {
        let data = [...currentDb.data];
        const activeFilters = Object.entries(filters).filter(([, value]) => value);
        
        // 1. Multi-column Filtering
        if (activeFilters.length > 0) {
            data = data.filter(row => 
                activeFilters.every(([key, value]) => 
                    String(row[key] ?? '').toLowerCase().includes(String(value).toLowerCase())
                )
            );
        }

        // 2. Sorting execution
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

    /**
     * Updates sorting directions. Matches asc/desc state cycles.
     */
    const handleSort = useCallback((key: string) => {
        setSortConfig(prev => {
            const direction = (prev?.key === key && prev.direction === 'asc') ? 'desc' : 'asc';
            return { key, direction };
        });
    }, []);

    /**
     * Safe navigation mechanism directing users to the associated packing instruction guidelines.
     */
    const handlePiClick = useCallback((pi: string) => {
        if (!pi || pi === 'Forbidden' || String(pi).toLowerCase().includes('see')) return;
        
        const newWindow = window.open(`/?table=pi-database&filter_id=${pi}`, '_blank');
        if (!newWindow) {
            alert('Pop-up bloqueado. Por favor, permita a abertura de novas abas.');
        }
    }, []);

    /**
     * Deep-scans the source registry to locate full hazard metadata on selected rows.
     */
    const handleRowClick = useCallback((row: Record<string, any>) => {
        if (currentDb.id === 'blue-pages') {
            const entry = BLUE_PAGES_DATA.find(d => d.un === row.un);
            if (entry) {
                setSelectedUNEntry(entry);
            }
        }
    }, [currentDb.id]);

    /** State listener keeping virtual list positioning precise as scrolling is generated */
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters({});
    }, []);

    // Virtualization grid dimensions computations
    const containerHeight = scrollContainerRef.current?.clientHeight || window.innerHeight;
    const totalRows = sortedAndFilteredData.length;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_COUNT);
    const endIndex = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN_COUNT);
    
    // Extract only currently visible items based on computations
    const visibleRows = useMemo(() => {
        return sortedAndFilteredData.slice(startIndex, endIndex);
    }, [sortedAndFilteredData, startIndex, endIndex]);

    return (
        <>
            <div id="database-manager-view" className="bg-gray-100 p-8 flex flex-col h-screen font-sans">
                {/* Search Bar & Stats Header */}
                <div className="bg-white p-4 shadow-md rounded-t-lg flex justify-between items-center shrink-0 border-b border-gray-200">
                    <div>
                        <h1 className="font-bold text-lg text-gray-800">{currentDb.title}</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                            Visualizando {totalRows} de {currentDb.data.length} registros
                        </p>
                    </div>
                    <button 
                        id="btn-database-clear-filters"
                        onClick={handleClearFilters} 
                        className="flex items-center text-xs font-bold text-blue-600 hover:underline hover:text-blue-800 uppercase tracking-wider transition-colors"
                    >
                        <FilterX className="w-3.5 h-3.5 mr-1.5" /> Limpar Filtros
                    </button>
                </div>

                {/* Main scroll window */}
                <div 
                    ref={scrollContainerRef} 
                    onScroll={handleScroll} 
                    className="flex-grow overflow-auto bg-white shadow-md rounded-b-lg min-h-0"
                >
                    <div className="min-w-max">
                        {/* Headers with integrated filter fields */}
                        <div className="bg-gray-200 sticky top-0 z-10 border-b border-gray-300">
                            <div className="flex bg-gray-100">
                                {currentDb.columns.map(c => (
                                    <div 
                                        key={c.key} 
                                        className={`p-3 border-r border-gray-200 font-bold uppercase text-[10px] tracking-widest text-gray-500 cursor-pointer flex items-center hover:bg-gray-200/50 transition-colors ${c.width === 'flex-1' ? 'flex-1 min-w-[200px]' : `flex-shrink-0 ${c.width || 'w-32'}`}`} 
                                        onClick={() => handleSort(c.key)}
                                    >
                                        {c.label}
                                    </div>
                                ))}
                            </div>
                            <div className="flex bg-gray-50 border-t border-gray-200">
                                {currentDb.columns.map(c => (
                                    <div key={`${c.key}-filter`} className={`p-1.5 border-r border-gray-200 ${c.width === 'flex-1' ? 'flex-1 min-w-[200px]' : `flex-shrink-0 ${c.width || 'w-32'}`}`}>
                                        {c.filterable ? (
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    className="w-full pl-2 pr-2 py-1.5 text-xs border border-gray-300 rounded bg-white text-gray-800 outline-none focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo" 
                                                    value={filters[c.key] || ''} 
                                                    onChange={e => setFilters(p => ({ ...p, [c.key]: e.target.value }))} 
                                                    placeholder="Filtrar..."
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Realized Translation container matching virtualization heights */}
                        <div style={{ height: `${totalRows * ROW_HEIGHT}px`, position: 'relative' }}>
                            {visibleRows.map((row, index) => {
                                const rowIndex = startIndex + index;
                                return (
                                    <div 
                                      key={rowIndex} 
                                      className={`flex border-b border-gray-100 transition-colors ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-yellow-50 ${currentDb.id === 'blue-pages' ? 'cursor-pointer' : ''}`}
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
                                                        <span 
                                                            className="text-blue-600 hover:underline font-semibold cursor-pointer" 
                                                            onClick={(e) => { e.stopPropagation(); handlePiClick(String(cellValue)); }}
                                                        >
                                                            {cellValue}
                                                        </span>
                                                    ) : (
                                                        <span className={cellValue === 'Forbidden' ? 'text-red-500 font-bold' : ''}>{cellValue}</span>
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
            {selectedUNEntry && (
                <UNDetailModal 
                    data={selectedUNEntry} 
                    onClose={() => setSelectedUNEntry(null)} 
                    onNavigateToPi={handlePiClick} 
                />
            )}
        </>
    );
};

export default React.memo(DatabasePopup);

