import React, { useState } from 'react';
import { ArrowRight, RotateCcw, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { DGRWizard as DGRWizardType } from '../types';

interface DGRWizardProps {
  wizard: DGRWizardType;
}

const DGRWizard: React.FC<DGRWizardProps> = ({ wizard }) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>(wizard.startNodeId);
  const [history, setHistory] = useState<string[]>([]);

  const handleOptionClick = (nextNodeId: string) => {
    setHistory([...history, currentNodeId]);
    setCurrentNodeId(nextNodeId);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevNodeId = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentNodeId(prevNodeId);
    }
  };

  const handleReset = () => {
    setCurrentNodeId(wizard.startNodeId);
    setHistory([]);
  };

  const isResult = wizard.results[currentNodeId] !== undefined;
  const node = wizard.nodes[currentNodeId];
  const result = wizard.results[currentNodeId];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden my-8 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-latam-indigo to-[#2e1065] text-white p-6 border-b-4 border-latam-coral">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <HelpCircle className="w-6 h-6 mr-3 text-latam-coral" />
            <h3 className="text-xl font-black uppercase tracking-tight">
              {wizard.title}
            </h3>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors font-bold text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Reiniciar
          </button>
        </div>
      </div>

      <div className="p-8">
        {!isResult && node && (
          <div className="animate-fade-in">
            <h4 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {node.question}
            </h4>
            <div className="space-y-4 max-w-2xl mx-auto">
              {node.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option.nextNodeId)}
                  className="w-full text-left p-5 rounded-xl border-2 border-gray-100 hover:border-latam-indigo hover:bg-indigo-50 transition-all flex items-center justify-between group"
                >
                  <span className="text-lg font-medium text-gray-800 group-hover:text-latam-indigo">
                    {option.label}
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-latam-indigo transform group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
            {history.length > 0 && (
              <div className="mt-8 text-center">
                <button 
                  onClick={handleBack}
                  className="text-sm font-bold text-gray-400 hover:text-gray-600 underline"
                >
                  Voltar para a pergunta anterior
                </button>
              </div>
            )}
          </div>
        )}

        {isResult && result && (
          <div className="animate-fade-in text-center max-w-2xl mx-auto py-8">
            <div className="flex justify-center mb-6">
              {result.type === 'success' && <CheckCircle className="w-20 h-20 text-green-500" />}
              {result.type === 'warning' && <AlertTriangle className="w-20 h-20 text-yellow-500" />}
              {result.type === 'danger' && <XCircle className="w-20 h-20 text-red-500" />}
            </div>
            <h4 className={`text-3xl font-black uppercase tracking-tight mb-4 ${
              result.type === 'success' ? 'text-green-700' :
              result.type === 'warning' ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {result.title}
            </h4>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {result.description}
            </p>
            {result.actionText && (
              <div className={`p-4 rounded-xl font-bold text-sm inline-block ${
                result.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                result.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {result.actionText}
              </div>
            )}
            <div className="mt-12">
              <button 
                onClick={handleReset}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold transition-colors"
              >
                Fazer Nova Classificação
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DGRWizard;
