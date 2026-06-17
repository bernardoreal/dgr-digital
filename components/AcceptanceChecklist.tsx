/**
 * @file AcceptanceChecklist.tsx
 * @description Interactive Non-Radioactive Acceptance Checklist conforming to standard IATA DGR guidelines.
 * Collects step-by-step verification answers and enforces "no-go" constraints for non-compliant cargo.
 */

import React, { useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, FileText, RefreshCw } from 'lucide-react';

interface ChecklistItem {
  id: string;
  question: string;
  reference: string;
}

// IATA guidelines reference questions mapping to specific regulation articles
const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: '1', question: 'A remessa está acompanhada de duas cópias da Declaração do Expedidor (DGD)?', reference: '8.1.2.3.1' },
  { id: '2', question: 'A DGD está preenchida em inglês e assinada pelo expedidor?', reference: '8.1.1.1' },
  { id: '3', question: 'O número UN, PSN, Classe/Divisão e Grupo de Embalagem estão corretos e na sequência exata?', reference: '8.1.6.9.1' },
  { id: '4', question: 'A quantidade e o tipo de embalagem estão dentro dos limites permitidos para a aeronave (Passageiro ou CAO)?', reference: '8.1.6.9.2' },
  { id: '5', question: 'As embalagens estão em boas condições, sem vazamentos ou danos visíveis?', reference: '9.1.3.1' },
  { id: '6', question: 'A marcação de especificação UN (ex: 4G/Y145/S/23) está presente e legível?', reference: '7.1.4.1' },
  { id: '7', question: 'O PSN, número UN e nome/endereço do expedidor e consignatário estão marcados na embalagem?', reference: '7.1.4.1' },
  { id: '8', question: 'As etiquetas de risco primário e subsidiário estão afixadas na mesma superfície da embalagem?', reference: '7.2.6.2' },
  { id: '9', question: 'A etiqueta "Cargo Aircraft Only" (se aplicável) está afixada adjacente à etiqueta de risco?', reference: '7.2.6.3' },
  { id: '10', question: 'As setas de orientação (se aplicáveis) estão afixadas em dois lados opostos?', reference: '7.2.4.4' }
];

const AcceptanceChecklist: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, 'YES' | 'NO' | 'N/A' | null>>({});

  /**
   * Registers a single answer checklist option.
   */
  const handleAnswer = useCallback((id: string, answer: 'YES' | 'NO' | 'N/A') => {
    setAnswers(prev => ({ ...prev, [id]: answer }));
  }, []);

  /**
   * Clears the current progress to restart audit logs.
   */
  const resetChecklist = useCallback(() => {
    setAnswers({});
  }, []);

  const isComplete = CHECKLIST_ITEMS.every(item => answers[item.id] !== undefined && answers[item.id] !== null);
  const hasRejection = Object.values(answers).some(ans => ans === 'NO');

  return (
    <div id="acceptance-checklist-card" className="bg-white dark:bg-[#110e26] rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800/85 overflow-hidden my-8 font-sans">
      {/* Visual Header card */}
      <div className="bg-gray-900 dark:bg-[#0c0a1f] text-white p-6 border-b-4 border-latam-coral">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center">
              <FileText className="w-6 h-6 mr-3 text-latam-coral" />
              IATA Acceptance Checklist
            </h3>
            <p className="text-gray-400 dark:text-slate-500 text-sm mt-1 font-medium">Non-Radioactive Shipment (Simulated DGR 2026 Standard)</p>
          </div>
          <button 
            id="btn-checklist-reset"
            onClick={resetChecklist}
            className="flex items-center text-xs bg-gray-800 dark:bg-slate-900 hover:bg-gray-700 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors font-bold text-gray-300 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset
          </button>
        </div>
      </div>

      {/* Warnings & legal instruction framework */}
      <div className="bg-yellow-50 dark:bg-yellow-955/15 p-4 border-b border-yellow-101 dark:border-slate-800/60 flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-405 mr-3 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-yellow-800 dark:text-yellow-305 font-medium leading-relaxed">
          <strong>INSTRUÇÕES:</strong> Responda a cada pergunta. Se a resposta a qualquer pergunta for <strong>"NO"</strong>, a remessa <strong>NÃO DEVE SER ACEITA</strong>. Indique "N/A" se o requisito não for aplicável à remessa.
        </p>
      </div>

      {/* Questions table list */}
      <div className="divide-y divide-gray-100 dark:divide-slate-800/80">
        {CHECKLIST_ITEMS.map((item, index) => (
          <div 
            key={item.id} 
            className={`p-4 flex flex-col md:flex-row md:items-center justify-between transition-colors duration-200 ${
              answers[item.id] === 'NO' 
                ? 'bg-red-50 dark:bg-red-955/15' 
                : answers[item.id] === 'YES' 
                  ? 'bg-green-50/30 dark:bg-green-955/10' 
                  : 'hover:bg-gray-50 dark:hover:bg-slate-900/40'
            }`}
          >
            <div className="flex-1 pr-6 mb-4 md:mb-0">
              <div className="flex items-start">
                <span className="font-bold text-gray-400 dark:text-slate-600 mr-3 w-6 text-right">{index + 1}.</span>
                <div>
                  <p className={`text-sm font-semibold leading-relaxed ${answers[item.id] === 'NO' ? 'text-red-900 dark:text-red-400 font-bold' : 'text-gray-800 dark:text-slate-300'}`}>
                    {item.question}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono mt-1">DGR Ref: {item.reference}</p>
                </div>
              </div>
            </div>
            
            {/* Action toggles */}
            <div className="flex space-x-2 md:ml-4 pl-9 md:pl-0">
              <button
                onClick={() => handleAnswer(item.id, 'YES')}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  answers[item.id] === 'YES' 
                    ? 'bg-green-600 text-white border-green-600 shadow-inner' 
                    : 'bg-white dark:bg-[#0f0d22] text-gray-650 dark:text-slate-400 border-gray-300 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-850'
                }`}
              >
                YES
              </button>
              <button
                onClick={() => handleAnswer(item.id, 'NO')}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  answers[item.id] === 'NO' 
                    ? 'bg-red-600 text-white border-red-600 shadow-inner' 
                    : 'bg-white dark:bg-[#0f0d22] text-gray-650 dark:text-slate-400 border-gray-300 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-850'
                }`}
              >
                NO
              </button>
              <button
                onClick={() => handleAnswer(item.id, 'N/A')}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  answers[item.id] === 'N/A' 
                    ? 'bg-gray-700 text-white border-gray-700 shadow-inner' 
                    : 'bg-white dark:bg-[#0f0d22] text-gray-650 dark:text-slate-400 border-gray-300 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-850'
                }`}
              >
                N/A
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Result Status Display Footer */}
      <div className={`p-6 border-t-4 transition-all duration-300 ${
        !isComplete ? 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800' :
        hasRejection ? 'bg-red-50 dark:bg-red-955/20 border-red-500' : 'bg-green-50 dark:bg-green-955/20 border-green-500'
      }`}>
        {!isComplete ? (
          <div className="text-center text-gray-500 dark:text-slate-450 font-bold flex items-center justify-center">
            <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-ping mr-2.5"></span>
            Aguardando conclusão de todos os itens do checklist...
          </div>
        ) : hasRejection ? (
          <div className="flex items-center justify-center text-red-700 dark:text-red-400">
            <XCircle className="w-10 h-10 mr-4 flex-shrink-0" />
            <div>
              <h4 className="text-2xl font-black uppercase tracking-tight">Remessa Rejeitada</h4>
              <p className="text-sm font-medium leading-relaxed">A remessa não atende ou falhou em testes regulamentares específicos do IATA DGR e não pode ser aceita para transporte.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-green-700 dark:text-green-400">
            <CheckCircle className="w-10 h-10 mr-4 flex-shrink-0" />
            <div>
              <h4 className="text-2xl font-black uppercase tracking-tight">Remessa Aceita</h4>
              <p className="text-sm font-medium leading-relaxed">A remessa está em total conformidade e aprovada em todas as verificações do IATA DGR.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AcceptanceChecklist);
