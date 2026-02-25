import React, { useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

interface SegregationCheckerProps {
  matrix: Record<string, Record<string, boolean>>;
  classes: string[];
  labels: Record<string, string>;
  notes: Record<string, string>;
}

const SegregationChecker: React.FC<SegregationCheckerProps> = ({ matrix, classes, labels, notes }) => {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const checkCompatibility = () => {
    if (selectedClasses.length < 2) {
      return { compatible: true, message: 'Selecione 2 ou mais classes para verificar.' };
    }

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
  };

  const result = checkCompatibility();

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 my-10">
      <h3 className="font-black text-xl text-gray-800 uppercase tracking-tight mb-6">Verificador de Segregação Interativo</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
        {classes.map(cls => (
          <button 
            key={cls}
            onClick={() => toggleClass(cls)}
            className={`p-4 rounded-lg text-center font-bold border-2 transition-all ${selectedClasses.includes(cls) ? 'bg-latam-indigo text-white border-latam-indigo' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}>
            <div className="text-2xl">{cls}</div>
            <div className="text-xs opacity-70">{labels[cls]}</div>
          </button>
        ))}
      </div>
      <div className={`p-6 rounded-lg flex items-center text-lg font-bold ${result.compatible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {result.compatible ? <Check className="w-8 h-8 mr-4" /> : <X className="w-8 h-8 mr-4" />}
        {result.message}
      </div>
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800">
        <h4 className="font-bold flex items-center"><AlertTriangle className="w-4 h-4 mr-2" />Notas Importantes</h4>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {Object.values(notes).map((note, i) => <li key={i}>{note}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default SegregationChecker;
