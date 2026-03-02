import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, FileText, RefreshCw } from 'lucide-react';

interface ChecklistItem {
  id: string;
  question: string;
  reference: string;
}

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

  const handleAnswer = (id: string, answer: 'YES' | 'NO' | 'N/A') => {
    setAnswers(prev => ({ ...prev, [id]: answer }));
  };

  const resetChecklist = () => {
    setAnswers({});
  };

  const isComplete = CHECKLIST_ITEMS.every(item => answers[item.id] !== undefined && answers[item.id] !== null);
  const hasRejection = Object.values(answers).some(ans => ans === 'NO');

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden my-8 font-sans">
      {/* Header */}
      <div className="bg-gray-900 text-white p-6 border-b-4 border-latam-coral">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center">
              <FileText className="w-6 h-6 mr-3 text-latam-coral" />
              IATA Acceptance Checklist
            </h3>
            <p className="text-gray-400 text-sm mt-1 font-medium">Non-Radioactive Shipment (Simulated DGR 2026 Standard)</p>
          </div>
          <button 
            onClick={resetChecklist}
            className="flex items-center text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors font-bold text-gray-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-yellow-800 font-medium">
          <strong>INSTRUÇÕES:</strong> Responda a cada pergunta. Se a resposta a qualquer pergunta for <strong>"NO"</strong>, a remessa <strong>NÃO DEVE SER ACEITA</strong>. Indique "N/A" se o requisito não for aplicável à remessa.
        </p>
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-gray-100">
        {CHECKLIST_ITEMS.map((item, index) => (
          <div key={item.id} className={`p-4 flex flex-col md:flex-row md:items-center justify-between transition-colors ${answers[item.id] === 'NO' ? 'bg-red-50' : answers[item.id] === 'YES' ? 'bg-green-50/30' : 'hover:bg-gray-50'}`}>
            <div className="flex-1 pr-6 mb-4 md:mb-0">
              <div className="flex items-start">
                <span className="font-bold text-gray-400 mr-3 w-6 text-right">{index + 1}.</span>
                <div>
                  <p className={`text-sm font-bold ${answers[item.id] === 'NO' ? 'text-red-900' : 'text-gray-800'}`}>
                    {item.question}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">DGR Ref: {item.reference}</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 md:ml-4 pl-9 md:pl-0">
              <button
                onClick={() => handleAnswer(item.id, 'YES')}
                className={`px-4 py-2 text-xs font-bold rounded border transition-all ${
                  answers[item.id] === 'YES' 
                    ? 'bg-green-600 text-white border-green-600 shadow-inner' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                YES
              </button>
              <button
                onClick={() => handleAnswer(item.id, 'NO')}
                className={`px-4 py-2 text-xs font-bold rounded border transition-all ${
                  answers[item.id] === 'NO' 
                    ? 'bg-red-600 text-white border-red-600 shadow-inner' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                NO
              </button>
              <button
                onClick={() => handleAnswer(item.id, 'N/A')}
                className={`px-4 py-2 text-xs font-bold rounded border transition-all ${
                  answers[item.id] === 'N/A' 
                    ? 'bg-gray-600 text-white border-gray-600 shadow-inner' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                N/A
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Result Footer */}
      <div className={`p-6 border-t-4 transition-all duration-500 ${
        !isComplete ? 'bg-gray-50 border-gray-200' :
        hasRejection ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'
      }`}>
        {!isComplete ? (
          <div className="text-center text-gray-500 font-bold flex items-center justify-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2"></span>
            Aguardando conclusão do checklist...
          </div>
        ) : hasRejection ? (
          <div className="flex items-center justify-center text-red-700">
            <XCircle className="w-10 h-10 mr-4" />
            <div>
              <h4 className="text-2xl font-black uppercase tracking-tight">Remessa Rejeitada</h4>
              <p className="text-sm font-medium">A remessa não atende aos requisitos do IATA DGR e não pode ser aceita para transporte aéreo.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-green-700">
            <CheckCircle className="w-10 h-10 mr-4" />
            <div>
              <h4 className="text-2xl font-black uppercase tracking-tight">Remessa Aceita</h4>
              <p className="text-sm font-medium">A remessa está em conformidade com as verificações documentais e visuais do IATA DGR.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptanceChecklist;
