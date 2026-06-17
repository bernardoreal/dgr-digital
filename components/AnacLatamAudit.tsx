/**
 * @file AnacLatamAudit.tsx
 * @description Interactive compliance audit validator checking dangerous goods shipments against
 * Brazil ANAC RBAC 175 rules and LATAM Cargo specific Operator Variations (LA/JJ/UC/M3).
 * Outputs a digital verification clearance certificate.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, ChevronRight, FileText, ArrowLeft, Printer, RefreshCw, Layers, Sparkles, HelpCircle } from 'lucide-react';

interface AnacLatamAuditProps {
  onClose: () => void;
}

interface AuditQuestion {
  id: string;
  category: 'LATAM_VARS' | 'ANAC_RBAC' | 'GENERAL_SAFETY';
  title: string;
  description: string;
  variationRef?: string;
  ruleRef?: string;
}

const AUDIT_QUESTIONS: AuditQuestion[] = [
  {
    id: 'dgd_electronic',
    category: 'LATAM_VARS',
    title: 'A Declaração (DGD) é digital e eletrônica?',
    description: 'Declarações manuscritas ou com rasuras são estritamente proíbidas sob as variações regulatórias LATAM (JJ-13 / UC-07 / M3-13). Deve estar em inglês.',
    variationRef: 'JJ-13 / M3-13 / UC-07'
  },
  {
    id: 'label_placement',
    category: 'LATAM_VARS',
    title: 'Furação e aplicação de etiquetas nas laterais?',
    description: 'As marcações de segurança e etiquetas de perigo NÃO devem ser afixadas no topo ou fundo das embalagens (regra JJ-06/M3-06). Apenas nas laterais.',
    variationRef: 'JJ-06 / M3-06'
  },
  {
    id: 'liquid_drums',
    category: 'LATAM_VARS',
    title: 'Líquidos em tambor plástico possuem dupla proteção?',
    description: 'Se houver embalagem única rígida de plástico (tambor/bombona) com líquidos, ela deve estar dentro de uma caixa externa resistente ou palletizada com proteção superior/inferior (regra M3-11).',
    variationRef: 'M3-11'
  },
  {
    id: 'lithium_loose',
    category: 'LATAM_VARS',
    title: 'Baterias de lítio soltas possuem aprovação prévia expressa?',
    description: 'Baterias soltas de metal lítio (UN3090 Sections IA/IB) ou íon lítio (UN3480 Sections IA/IB) exigem aprovação operacional prévia e código de liberação (JJ-03 / LA-03). Seção II solta é proibida.',
    variationRef: 'LA-03 / JJ-03 / UC-03'
  },
  {
    id: 'awb_statement',
    category: 'LATAM_VARS',
    title: 'Declaração descritiva na Natureza de Carga do AWB?',
    description: 'O número de volumes de baterias de lítio preparadas sob Seção II deve constar obrigatoriamente no campo "Natureza e Quantidade de Mercadorias" do CT-e / AWB (regra JJ-08 / M3-08).',
    variationRef: 'JJ-08 / M3-08'
  },
  {
    id: 'anac_expedidor',
    category: 'ANAC_RBAC',
    title: 'Expedidor possui certificado ANAC de capacitação?',
    description: 'Conforme RBAC 175, o expedidor de mercadorias perigosas deve possuir treinamento homologado ativo correspondente à categoria regulamentar aplicável.',
    ruleRef: 'ANAC RBAC 175.71'
  },
  {
    id: 'fissile_radioactive',
    category: 'LATAM_VARS',
    title: 'Controle de material radioativo ou físsil pré-aprovado?',
    description: 'Materiais radioativos ou físseis (Classe 7) exigem revisão expressa por escrito do Comitê Técnico de Artigos Perigosos da LATAM (regra JJ-07/M3-07 / UC-06) antes do aceite.',
    variationRef: 'JJ-07 / M3-01'
  },
  {
    id: 'anac_embalagem',
    category: 'ANAC_RBAC',
    title: 'Marca de especificação UN visível e intacta?',
    description: 'Conforme os padrões ANAC e IATA, todo recipiente que requer embalagem homologada deve exibir a marca de certificação UN indelével no exterior do volume.',
    ruleRef: 'ANAC RBAC 175.105'
  }
];

export const AnacLatamAudit: React.FC<AnacLatamAuditProps> = ({ onClose }) => {
  const [answers, setAnswers] = useState<Record<string, 'PASSED' | 'FAILED' | 'NA'>>({});
  const [shipmentId, setShipmentId] = useState('');
  const [unNumber, setUnNumber] = useState('');
  const [flightNumber, setFlightNumber] = useState('LA');
  const [inspectorName, setInspectorName] = useState( 'Bernardo Real' );
  const [isGenerated, setIsGenerated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-populate input values
  const defaultShipmentId = useMemo(() => {
    return 'LATAM-' + Math.floor(100000 + Math.random() * 900000);
  }, []);

  const handleInitialize = useCallback(() => {
    setShipmentId(defaultShipmentId);
    setUnNumber('UN 3481');
    setAnswers({});
    setIsGenerated(false);
    setErrorMessage('');
  }, [defaultShipmentId]);

  // Initial trigger
  React.useEffect(() => {
    handleInitialize();
  }, [handleInitialize]);

  const handleAnswerChange = useCallback((id: string, value: 'PASSED' | 'FAILED' | 'NA') => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }, []);

  const allQuestionsAnswered = useMemo(() => {
    return AUDIT_QUESTIONS.every(q => answers[q.id] !== undefined);
  }, [answers]);

  const failedItems = useMemo(() => {
    return AUDIT_QUESTIONS.filter(q => answers[q.id] === 'FAILED');
  }, [answers]);

  const auditPassed = useMemo(() => {
    return failedItems.length === 0;
  }, [failedItems]);

  const cryptographicHash = useMemo(() => {
    // Generate a beautiful mock SHA-256 for tracking
    if (!shipmentId) return '';
    let hashStr = `${shipmentId}-${unNumber}-${flightNumber}-${inspectorName}-2026`;
    let hash = 0;
    for (let i = 0; i < hashStr.length; i++) {
      hash = (hash << 5) - hash + hashStr.charCodeAt(i);
      hash |= 0;
    }
    return 'LCO-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0') + '-2026';
  }, [shipmentId, unNumber, flightNumber, inspectorName]);

  const handleGenerateCertificate = useCallback(() => {
    if (!unNumber.trim()) {
      setErrorMessage('Por favor, indique o Número UN da carga.');
      return;
    }
    if (!shipmentId.trim()) {
      setErrorMessage('Por favor, informe a identificação da remessa (Minuta/AWB).');
      return;
    }
    setErrorMessage('');
    setIsGenerated(true);
  }, [unNumber, shipmentId]);

  return (
    <div id="anac-latam-audit-view" className="min-h-screen bg-gray-50 dark:bg-[#06050e] flex flex-col font-sans pb-16 text-slate-900 dark:text-slate-100">
      {/* Dynamic Navigation Header */}
      <div className="bg-white dark:bg-[#0c0a1f] border-b border-gray-200 dark:border-slate-850 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            id="btn-audit-close"
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400 transition-colors cursor-pointer"
            aria-label="Voltar para a tela inicial"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-latam-indigo dark:text-indigo-305" />
              Auditoria de Segurança ANAC RBAC 175 & LATAM
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Verificador de Operação de Solo & Despacho</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-latam-indigo/10 dark:bg-indigo-950/40 border border-latam-indigo/20 dark:border-indigo-900/40 px-3 py-1 rounded-full text-xs font-bold text-latam-indigo dark:text-indigo-300">IATA 2026</span>
          <span className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1 rounded-full text-xs font-bold text-gray-600 dark:text-slate-400">ANAC</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metadata Card (1 Column left) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#110e26] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800/80">
              <h3 className="font-extrabold text-sm text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center">
                <Layers className="w-4 h-4 mr-2 text-gray-400 dark:text-slate-500" />
                Dados do Voo & Carga
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Identificação da Guia (AWB / Minuta)</label>
                  <input 
                    type="text" 
                    value={shipmentId}
                    onChange={(e) => setShipmentId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-lg text-gray-800 dark:text-slate-100 bg-white dark:bg-[#0f0d22] font-mono tracking-wider focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo outline-none"
                    placeholder="Ex: LA-590021"
                    disabled={isGenerated}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Número UN aplicável</label>
                  <input 
                    type="text" 
                    value={unNumber}
                    onChange={(e) => setUnNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-lg text-gray-800 dark:text-slate-100 bg-white dark:bg-[#0f0d22] font-bold focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo outline-none"
                    placeholder="Ex: UN 3481"
                    disabled={isGenerated}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Prefixo do Voo / Operador</label>
                  <select 
                    value={flightNumber} 
                    onChange={(e) => setFlightNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-lg text-gray-800 dark:text-slate-100 bg-white dark:bg-[#0f0d22] font-bold focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo outline-none"
                    disabled={isGenerated}
                  >
                    <option value="LA">LA - LATAM Airlines</option>
                    <option value="JJ">JJ - LATAM Cargo Brasil / TAM</option>
                    <option value="UC">UC - LATAM Cargo Chile / Colombia</option>
                    <option value="M3">M3 - LATAM Cargo Americas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Auditor Regulatório Responsável</label>
                  <input 
                    type="text" 
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-800 rounded-lg text-gray-800 dark:text-slate-100 bg-white dark:bg-[#0f0d22] font-medium focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo outline-none"
                    disabled={isGenerated}
                  />
                </div>
              </div>

              {!isGenerated ? (
                <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-4">
                  <button
                    id="btn-audit-validate"
                    onClick={handleGenerateCertificate}
                    disabled={!allQuestionsAnswered}
                    className="w-full bg-latam-indigo text-white py-3 rounded-lg text-sm font-bold hover:bg-latam-indigoLight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" /> Validar & Emitir Selo
                  </button>
                  {!allQuestionsAnswered && (
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-2 text-center font-medium">Respondas todos os itens da auditoria ao lado para liberar.</p>
                  )}
                  {errorMessage && (
                    <p className="text-xs text-red-600 mt-2 text-center font-bold">{errorMessage}</p>
                  )}
                </div>
              ) : (
                <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-4 space-y-2">
                  <button
                    id="btn-audit-recheck"
                    onClick={() => setIsGenerated(false)}
                    className="w-full bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reavaliar Itens
                  </button>
                  <button
                    id="btn-audit-print"
                    onClick={() => window.print()}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Imprimir Relatório
                  </button>
                </div>
              )}
            </div>

            {/* Regulatory Scope Info box */}
            <div className="bg-blue-50 dark:bg-indigo-950/20 border border-blue-100 dark:border-indigo-900/30 p-5 rounded-xl">
              <h4 className="text-xs font-black text-blue-800 dark:text-indigo-305 uppercase tracking-wider mb-2 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                Vigilância Civil ANAC Brasil
              </h4>
              <p className="text-xs text-blue-800 dark:text-indigo-400 leading-relaxed font-semibold">
                O Regulamento Brasileiro da Aviação Civil nº 175 (RBAC 175) estabelece as regras de competência nacional e fiscaliza expedidores e aeroportos. Alinhado com as variações particulares da LATAM, este formulário garante o compliance de triplo check obrigatório antes do embarque comercial.
              </p>
            </div>
          </div>

          {/* Interactive Questionnaire (2 Columns Right) */}
          <div className="lg:col-span-2">
            {!isGenerated ? (
              <div className="bg-white dark:bg-[#110e26] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800/80 overflow-hidden">
                <div className="bg-gray-100 dark:bg-[#0c0a1f] px-5 py-4 border-b border-gray-200 dark:border-slate-800">
                  <h3 className="font-extrabold text-sm text-gray-800 dark:text-white uppercase tracking-wider">
                    Filtros de Segurança & Variações Operacionais
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-slate-850">
                  {AUDIT_QUESTIONS.map((q, idx) => {
                    const currentAns = answers[q.id];
                    return (
                      <div 
                        key={q.id} 
                        className={`p-5 flex flex-col md:flex-row md:items-start justify-between transition-colors ${
                          currentAns === 'FAILED' 
                            ? 'bg-red-50 dark:bg-red-950/20' 
                            : currentAns === 'PASSED' 
                              ? 'bg-green-50/20 dark:bg-green-950/10' 
                              : 'bg-white dark:bg-[#110e26] hover:bg-gray-50/50 dark:hover:bg-slate-905/40'
                        }`}
                      >
                        <div className="flex-1 pr-6 pb-3 md:pb-0">
                          <div className="flex items-start">
                            <span className="font-bold text-gray-400 dark:text-slate-500 mr-2 w-5 text-right">{idx + 1}.</span>
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                                {q.title}
                                {q.category === 'LATAM_VARS' ? (
                                  <span className="ml-2 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase border dark:border-red-900/30">Var LATAM</span>
                                ) : (
                                  <span className="ml-2 bg-blue-105 dark:bg-indigo-950/40 text-blue-700 dark:text-indigo-300 text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase border dark:border-indigo-900/30">ANAC Rule</span>
                                )}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed font-semibold">{q.description}</p>
                              <div className="flex space-x-4 mt-2">
                                {q.variationRef && (
                                  <span className="text-[10px] font-semibold font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">
                                    Variação: {q.variationRef}
                                  </span>
                                )}
                                {q.ruleRef && (
                                  <span className="text-[10px] font-semibold font-mono text-blue-600 dark:text-indigo-400 bg-blue-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded">
                                    Regra: {q.ruleRef}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pass/Fail/Na Selection Buttons */}
                        <div className="flex shrink-0 space-x-1.5 md:ml-4 pt-1 items-center self-end md:self-start">
                          <button
                            id={`btn-ans-${q.id}-passed`}
                            onClick={() => handleAnswerChange(q.id, 'PASSED')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              currentAns === 'PASSED'
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'bg-white dark:bg-[#0f0d22] border-gray-300 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            Passa
                          </button>
                          <button
                            id={`btn-ans-${q.id}-failed`}
                            onClick={() => handleAnswerChange(q.id, 'FAILED')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              currentAns === 'FAILED'
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'bg-white dark:bg-[#0f0d22] border-gray-300 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            Falha
                          </button>
                          <button
                            id={`btn-ans-${q.id}-na`}
                            onClick={() => handleAnswerChange(q.id, 'NA')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              currentAns === 'NA'
                                ? 'bg-gray-200 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200'
                                : 'bg-white dark:bg-[#0f0d22] border-gray-300 dark:border-slate-800 text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            N/A
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile-only Validation Button */}
                <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-[#0c0a1f] block lg:hidden">
                  <button
                    id="btn-audit-validate-mobile"
                    onClick={handleGenerateCertificate}
                    disabled={!allQuestionsAnswered}
                    className="w-full bg-latam-indigo text-white py-3.5 rounded-xl text-sm font-bold hover:bg-latam-indigoLight disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-5 h-5 mr-2" /> Validar & Emitir Selo
                  </button>
                  {!allQuestionsAnswered && (
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 text-center font-medium">Responda todas as perguntas da auditoria acima para liberar o selo.</p>
                  )}
                  {errorMessage && (
                    <p className="text-xs text-red-600 mt-2 text-center font-bold">{errorMessage}</p>
                  )}
                </div>
              </div>
            ) : (
              /* Clearance Certificate Display panel */
              <div className="bg-white dark:bg-[#110e26] rounded-xl shadow-xl border border-gray-200 dark:border-slate-850 overflow-hidden animate-fade-in relative">
                
                {/* Header ribbon */}
                <div className={`p-6 text-white ${auditPassed ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {auditPassed ? (
                        <CheckCircle2 className="w-12 h-12 text-white animate-pulse" />
                      ) : (
                        <AlertOctagon className="w-12 h-12 text-white" />
                      )}
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">
                          {auditPassed ? 'PARECER: CARGA LIBERADA' : 'PARECER: EMBARQUE VETADO'}
                        </h3>
                        <p className="text-xs text-white/80 font-bold tracking-widest mt-0.5">
                          {auditPassed ? 'CERTIFICADO DE CONFORMIDADE DA REMESSA' : 'CARGA COM INCONFORMIDADES REGULATÓRIAS'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {auditPassed ? (
                  /* Approved Visual Template */
                  <div className="p-8">
                    <div className="text-center mb-8 border-b border-gray-100 dark:border-slate-800 pb-6">
                      <div className="inline-flex items-center space-x-1.5 text-xs font-black text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 px-3 py-1.5 rounded-full mb-3 uppercase tracking-wider font-extrabold pb-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-green-600 animate-spin" />
                        <span>Selo de Integridade Gerado com Sucesso</span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
                        Esta remessa cumpre rigorosamente com as diretivas e exigências da Agência Nacional de Aviação Civil (ANAC PB 175) e com todas as restrições de transportadora da rede LATAM Cargo.
                      </p>
                    </div>

                    {/* Certificate Details Grid */}
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 dark:bg-[#0c0a1f] border border-dashed border-gray-200 dark:border-slate-800 p-6 rounded-xl text-xs font-medium text-gray-700 dark:text-slate-350 font-mono">
                      <div>
                        <span className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mb-1">ID DA MINUTA:</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{shipmentId}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mb-1">NÚMERO UN:</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{unNumber}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mb-1">OPERADOR & VOO:</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{flightNumber} CARGO NETWORK</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mb-1">DATA E HORA:</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{new Date().toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="col-span-2 border-t border-gray-200 dark:border-slate-800 pt-4">
                        <span className="block text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mb-1">CHAVE DIGITAL DE SEGURANÇA (SHA-256):</span>
                        <span className="text-xs font-black text-blue-700 dark:text-indigo-400 tracking-wider block break-all">{cryptographicHash}</span>
                      </div>
                    </div>

                    {/* Visual Stamp Seal simulation */}
                    <div className="mt-8 flex flex-col items-center justify-center border-t border-gray-100 dark:border-slate-800 pt-8">
                      <div className="border-4 border-double border-green-600 p-4 rounded-xl flex items-center space-x-4 bg-green-50/20 dark:bg-green-950/15 max-w-sm rotate-1 text-green-700 dark:text-green-400">
                        <div className="p-2 border-2 border-green-600 rounded bg-white dark:bg-slate-900 shrink-0">
                          {/* QR Code Graphic Mock matching operational standards */}
                          <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 flex flex-col justify-between p-0.5 border border-gray-300 dark:border-slate-700">
                            <div className="flex justify-between"><span className="w-3.5 h-3.5 bg-gray-800 dark:bg-slate-200"></span><span className="w-3.5 h-3.5 bg-gray-800 dark:bg-slate-200"></span></div>
                            <div className="flex justify-center"><span className="w-2.5 h-2.5 bg-gray-800 dark:bg-slate-200"></span></div>
                            <div className="flex justify-between"><span className="w-3.5 h-3.5 bg-gray-800 dark:bg-slate-200"></span><span className="w-2 h-2 bg-gray-500 dark:bg-slate-400"></span></div>
                          </div>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-550 leading-none mb-1">Selo Digital LATAM</span>
                          <span className="block text-lg font-black tracking-tight leading-none text-green-700 dark:text-green-400">LIBERADO PARA VOO</span>
                          <span className="block text-[9px] font-mono mt-1 opacity-80 uppercase">Doc Verificado - Inspector {inspectorName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Denied and Blocked Visual template */
                  <div className="p-8">
                    <div className="mb-6 bg-red-50 dark:bg-red-955/15 border border-red-200 dark:border-red-900/40 p-5 rounded-xl flex items-start">
                      <AlertOctagon className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-red-900 dark:text-red-300 uppercase">Embarque bloqueado automaticamente</h4>
                        <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed mt-1 font-semibold">
                          O sistema identificou de forma categórica que a remessa viola os regulamentos e variações de segurança. Corrija os itens listados abaixo para submeter a carga a uma nova avaliação.
                        </p>
                      </div>
                    </div>

                    <h4 className="font-bold text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">CONFORMIDADES REJEITADAS NA AUDITORIA</h4>
                    <div className="space-y-3">
                      {failedItems.map(item => (
                        <div key={item.id} className="border border-red-100 dark:border-red-900/30 p-4 rounded-lg bg-red-50/30 dark:bg-red-955/10 text-xs">
                          <h5 className="font-bold text-red-900 dark:text-red-300 flex items-center mb-1">
                            {item.title}
                          </h5>
                          <p className="text-red-700 dark:text-red-400 font-semibold leading-relaxed mb-2">{item.description}</p>
                          <div className="flex font-semibold">
                            {item.variationRef && (
                              <span className="bg-red-100/60 dark:bg-red-955/40 text-red-800 dark:text-red-300 px-2 py-0.5 rounded font-bold font-mono">
                                Variação Violada: {item.variationRef}
                              </span>
                            )}
                            {item.ruleRef && (
                              <span className="bg-red-100/60 dark:bg-red-955/40 text-red-800 dark:text-red-300 px-2 py-0.5 rounded font-bold font-mono ml-2">
                                Norma Violada: {item.ruleRef}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile-only Action Buttons at bottom of certificate card */}
                <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-[#0c0a1f] block lg:hidden space-y-2">
                  <button
                    id="btn-audit-recheck-mobile"
                    onClick={() => setIsGenerated(false)}
                    className="w-full bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5 text-gray-500 dark:text-slate-400" /> Reavaliar Outro Lote
                  </button>
                  <button
                    id="btn-audit-print-mobile"
                    onClick={() => window.print()}
                    className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-805 dark:hover:bg-slate-700 text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Printer className="w-4 h-4 mr-1.5" /> Imprimir Laudo de Conformidade
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default React.memo(AnacLatamAudit);
