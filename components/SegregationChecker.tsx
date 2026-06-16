/**
 * @file SegregationChecker.tsx
 * @description Interactive Segregation Checker for validating hazardous material class compatibility on aircraft decks.
 * Prevents loading incompatible classes near each other.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

interface SegregationCheckerProps {
  /** Dual key dictionary defining incompatibility (segregation) flags between distinct hazard classes */
  matrix: Record<string, Record<string, boolean>>;
  /** Registered array list in order of active hazard classes */
  classes: string[];
  /** Mapping from simple hazard class keys (e.g. '1') to full description labels */
  labels: Record<string, string>;
  /** Descriptive footnote guidelines specifying further exemptions and special criteria rules */
  notes: Record<string, string>;
}

const SegregationChecker: React.FC<SegregationCheckerProps> = ({ matrix, classes, labels, notes }) => {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  /**
   * Toggles the presence of a target hazard class of the selection list.
   */
  const toggleClass = useCallback((cls: string) => {
    setSelectedClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  }, []);

  /**
   * Dynamic lookup computation checking current compatibility index status.
   * Runs sequentially matching elements pair-by-pair from selected list.
   */
  const segregationStatus = useMemo(() => {
    if (selectedClasses.length < 2) {
      return { compatible: true, message: 'Selecione 2 ou mais classes para verificar.' };
    }

    // Dynamic inner checking loop for O(N^2) relative segregation pairings
    for (let i = 0; i < selectedClasses.length; i++) {
      for (let j = i + 1; j < selectedClasses.length; j++) {
        const classA = selectedClasses[i];
        const classB = selectedClasses[j];

        if (matrix[classA]?.[classB] || matrix[classB]?.[classA]) {
          return {
            compatible: false,
            message: `Segregação Necessária: ${labels[classA]} e ${labels[classB]} são incompatíveis.`
          };
        }
      }
    }

    return { compatible: true, message: 'Compatível: Nenhuma segregação necessária entre as classes selecionadas.' };
  }, [selectedClasses, matrix, labels]);

  return (
    <div id="segregation-checker-card" className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 my-10 font-sans animate-fade-in">
      <h3 className="font-black text-xl text-gray-800 uppercase tracking-tight mb-6">Verificador de Segregação Interativo</h3>
      
      {/* Category selector grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
        {classes.map(cls => (
          <button 
            key={cls}
            onClick={() => toggleClass(cls)}
            className={`p-4 rounded-lg text-center font-bold border-2 transition-all cursor-pointer ${
              selectedClasses.includes(cls) 
                ? 'bg-latam-indigo text-white border-latam-indigo shadow' 
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
            }`}
          >
            <div className="text-2xl font-black">{cls}</div>
            <div className="text-xs opacity-70 mt-1 truncate">{labels[cls]}</div>
          </button>
        ))}
      </div>

      {/* Dynamic results status bar */}
      <div className={`p-6 rounded-xl flex items-center text-lg font-black transition-all ${
        segregationStatus.compatible 
          ? 'bg-green-100/80 text-green-800' 
          : 'bg-red-100/80 text-red-800'
      }`}>
        {segregationStatus.compatible ? (
          <Check className="w-8 h-8 mr-4 flex-shrink-0 animate-pulse" />
        ) : (
          <X className="w-8 h-8 mr-4 flex-shrink-0" />
        )}
        <span>{segregationStatus.message}</span>
      </div>

      {/* General DGR footnotes definitions */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800 rounded-r-lg">
        <h4 className="font-bold flex items-center mb-2"><AlertTriangle className="w-4 h-4 mr-2" />Notas Importantes</h4>
        <ul className="list-disc pl-5 space-y-1 font-medium">
          {Object.values(notes).map((note, i) => (
            <li key={i} className="hover:text-yellow-900 transition-colors">{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default React.memo(SegregationChecker);

