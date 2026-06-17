/**
 * @file AnacQuiz.tsx
 * @description Operational safety training simulator matching ANAC RBAC 175 recurrency training rules
 * and LATAM Cargo policy guidelines. Emits safety certification on passing results.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, XCircle, Award, Sparkles, RefreshCw, HelpCircle, ChevronRight, Bookmark } from 'lucide-react';

interface AnacQuizProps {
  onClose: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
  reference: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'De acordo com a norma reguladora ANAC RBAC 175, qual é a duração padrão de validade homologada para o treinamento de Artigos Perigosos de categoria de solo?',
    options: [
      '12 meses (1 ano)',
      '24 meses (2 anos)',
      '36 meses (3 anos)',
      'Indeterminada, desde que continue no mesmo cargo'
    ],
    correctIdx: 1,
    explanation: 'Em conformidade com a regulamentação civil da ANAC RBAC 175 e normas IATA, toda certificação recorrente de treinamento de artigos perigosos para despachantes e operadores tem uma vigência máxima estrita de 24 meses (2 anos).',
    reference: 'ANAC RBAC 175.75'
  },
  {
    id: 2,
    question: 'Sob a variação da transportadora LATAM Brasil (TAM/ABSA codigo M3-06), onde devem ser afixadas as marcas exigidas de expedidor e as etiquetas de manuseio ou perigo?',
    options: [
      'Exclusivamente no topo ou tampa externa do volume',
      'Exclusivamente na base ou fundo para evitar atrito',
      'Nas laterais das embalagens (não no topo ou fundo, exceto pequenos adesivos ou endereços)',
      'Em qualquer face externa de forma totalmente arbitrária'
    ],
    correctIdx: 2,
    explanation: 'A diretriz particular LATAM (M3-06) veta de forma expressa a colocação de etiquetas regulamentares de perigo e manuseio no topo ou no fundo do invólucro para assegurar visibilidade desimpedida nas pilhas de paletes. Elas devem obrigatoriamente ir nas laterais.',
    reference: 'LATAM Variation JJ-06 / M3-06'
  },
  {
    id: 3,
    question: 'O transporte aéreo de Gelo Seco (UN 1845, Dry Ice) requer qual dos seguintes cuidados operacionais críticos por conta de emissões secundárias?',
    options: [
      'Manter em hold aquecido a mais de 45°C',
      'Segregação obrigatória de animais vivos em porões pressurizados devido ao risco latente de asfixia por CO2',
      'Manter dentro de contêineres hermeticamente lacrados e sem furos',
      'Armazenar junto com baterias de lítio soltas de forma mista'
    ],
    correctIdx: 1,
    explanation: 'O gelo seco (UN 1845) se sublima liberando gás dióxido de carbono (CO2), o qual causa rápido acúmulo de asfixia. É estritamente proibido carregar gelo seco em compartimento adjacente ou no mesmo porão onde viajam animais de companhia para evitar tragédias.',
    reference: 'IATA DGR Section 9.3.1'
  },
  {
    id: 4,
    question: 'A variação JJ-13 / M3-13 do LATAM Cargo Group impõe qual restrição específica a respeito do preenchimento físico da Shipper\'s Declaration for Dangerous Goods (DGD)?',
    options: [
      'Veta declarações manuscritas ou com emendas, exigindo emissão puramente gerada eletronicamente e em idioma inglês',
      'Permite caneta esferográfica azul somente operacionais de solo brasileiros',
      'Exige que seja manuscrita exclusivamente por despachantes governamentais',
      'Declara que o documento DGD físico não é mais necessário em nenhuma circunstância'
    ],
    correctIdx: 0,
    explanation: 'Segundo as variações LATAM (JJ-13 / UC-07 / M3-13), não são aceitas declarações escritas de próprio punho (manuscritas) ou que possuam rasuras. Devem ser sempre impressas sob software regulamentar padrão em inglês.',
    reference: 'Variação LATAM JJ-13 / M3-13'
  },
  {
    id: 5,
    question: 'Ao decodificar as letras acessórias de risco secundário do código de drill emergencial IATA ERG, o que significa a representação do caractere "W"?',
    options: [
      'Gás tóxico ou asfixiante (Wind)',
      'Substância muito volátil (Water-soluble)',
      'Perigoso quando molhado (Dangerous when wet - reage com água liberando gases inflamáveis)',
      'Risco de ignição por calor espontâneo'
    ],
    correctIdx: 2,
    explanation: 'Na tabela do livreto IATA Emergency Response Guidance (ERG Tools) para o controle primário de emergência a bordo, a letra "W" denota categoricamente "Perigoso quando molhado" (ou seja, risco de incêndio violento ou liberação de toxicidade se entrar em contacto direto com umidade).',
    reference: 'IATA ERG Codes'
  }
];

export const AnacQuiz: React.FC<AnacQuizProps> = ({ onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answersStatus, setAnswersStatus] = useState<boolean[]>([]); // Array tracking question correct states
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userName, setUserName] = useState('Bernardo Real');

  const activeQuestion = useMemo(() => {
    return QUIZ_QUESTIONS[currentIdx];
  }, [currentIdx]);

  const handleOptionSelect = useCallback((idx: number) => {
    if (showExplanation) return; // Prevent double selecting once resolved
    setSelectedOpt(idx);
  }, [showExplanation]);

  const handleNextSubmit = useCallback(() => {
    if (!showExplanation) {
      // First screen click acts as answer validation
      if (selectedOpt === null) return;
      const isCorrect = selectedOpt === activeQuestion.correctIdx;
      setAnswersStatus(prev => [...prev, isCorrect]);
      setShowExplanation(true);
    } else {
      // Second click shifts to next question index
      const nextId = currentIdx + 1;
      if (nextId < QUIZ_QUESTIONS.length) {
        setCurrentIdx(nextId);
        setSelectedOpt(null);
        setShowExplanation(false);
      } else {
        setQuizFinished(true);
      }
    }
  }, [showExplanation, selectedOpt, activeQuestion, currentIdx]);

  const score = useMemo(() => {
    return answersStatus.filter(Boolean).length;
  }, [answersStatus]);

  const isApproved = useMemo(() => {
    // 80% passing grade requirement (4 out of 5 correct)
    return score >= 4;
  }, [score]);

  const handleRestart = useCallback(() => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setAnswersStatus([]);
    setShowExplanation(false);
    setQuizFinished(false);
  }, []);

  const certificateHash = useMemo(() => {
    // Generate a beautiful, unique serial index
    return 'ANAC-CERT-' + Math.floor(200000 + Math.random() * 800000) + '-2026';
  }, []);

  return (
    <div id="anac-quiz-view" className="min-h-screen bg-gray-50 dark:bg-[#06050e] flex flex-col font-sans pb-16 text-slate-900 dark:text-slate-100">
      {/* Dynamic Navigation Header */}
      <div className="bg-white dark:bg-[#0c0a1f] border-b border-gray-200 dark:border-slate-850 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            id="btn-quiz-close"
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400 transition-colors cursor-pointer"
            aria-label="Voltar para a tela inicial"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-latam-coral animate-pulse" />
              Treinamento de Segurança ANAC RBAC 175 & LATAM
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Simulado Recorrente Técnico Cargo / Despacho</p>
          </div>
        </div>
        <button 
          id="btn-quiz-top-close"
          onClick={onClose}
          className="text-xs font-black text-white bg-latam-indigo px-4 py-2 rounded-lg hover:bg-latam-indigoLight cursor-pointer"
        >
          Painel Principal
        </button>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        {!quizFinished ? (
          /* Active Question layout */
          <div className="bg-white dark:bg-[#110e26] rounded-xl shadow-xl border border-gray-200 dark:border-slate-800/80 overflow-hidden">
            {/* Progress indicators */}
            <div className="bg-gray-100 dark:bg-[#0c0a1f]/80 px-6 py-3 border-b border-gray-200 dark:border-slate-805/80 flex justify-between items-center text-xs font-bold text-gray-500 dark:text-slate-400">
              <span className="uppercase tracking-wider">Questão {currentIdx + 1} de {QUIZ_QUESTIONS.length}</span>
              <span className="bg-latam-indigo/10 dark:bg-indigo-950/40 text-latam-indigo dark:text-indigo-300 px-2.5 py-1 rounded-full font-black">
                {Math.round(((currentIdx) / QUIZ_QUESTIONS.length) * 100)}% Concluído
              </span>
            </div>

            <div className="p-8">
              <div className="flex items-start mb-6">
                <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black mr-4 text-sm">
                  ?
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug">{activeQuestion.question}</h3>
                  <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center">
                    <Bookmark className="w-3 w-3 mr-1 text-gray-300 dark:text-slate-500" /> Referência: {activeQuestion.reference}
                  </p>
                </div>
              </div>

              {/* Multiple choices options list */}
              <div className="space-y-3.5 mb-8">
                {activeQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOpt === idx;
                  const isCorrectAnswer = idx === activeQuestion.correctIdx;
                  
                  let optionStyle = 'border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0f0d22] hover:bg-gray-50 dark:hover:bg-slate-900/60 text-gray-850 dark:text-slate-200';
                  
                  if (showExplanation) {
                    if (isCorrectAnswer) {
                      optionStyle = 'border-green-600 dark:border-green-900/60 bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-300 font-extrabold';
                    } else if (isSelected) {
                      optionStyle = 'border-red-600 dark:border-red-900/60 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-300 font-extrabold';
                    } else {
                      optionStyle = 'border-gray-100 dark:border-slate-900 bg-white/50 dark:bg-slate-950/30 text-gray-400 dark:text-slate-500';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-latam-indigo dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-latam-indigo dark:text-indigo-300 font-black shadow-sm ring-2 ring-indigo-100 dark:ring-indigo-955';
                  }

                  return (
                    <button
                      id={`btn-quiz-opt-${idx}`}
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={showExplanation}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between text-sm ${optionStyle} ${!showExplanation ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span>{opt}</span>
                      {showExplanation && isCorrectAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 ml-3" />
                      )}
                      {showExplanation && isSelected && !isCorrectAnswer && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0 ml-3" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation section shown after submitting */}
              {showExplanation && (
                <div className="mb-8 p-5 rounded-lg border bg-blue-50 dark:bg-indigo-950/30 border-blue-100 dark:border-indigo-900/30 text-xs text-blue-900 dark:text-indigo-300 animate-fade-in animate-fade-in">
                  <h4 className="font-black uppercase tracking-wider mb-1 flex items-center animate-pulse">
                    Explicação de Segurança Regulamentar
                  </h4>
                  <p className="leading-relaxed font-semibold">{activeQuestion.explanation}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end">
                <button
                  id="btn-quiz-next"
                  onClick={handleNextSubmit}
                  disabled={selectedOpt === null}
                  className="bg-latam-indigo text-white px-8 py-3 rounded-lg text-sm font-bold hover:bg-latam-indigoLight disabled:opacity-50 disabled:cursor-not-allowed justify-center flex items-center transition-all cursor-pointer"
                >
                  {showExplanation ? (
                    currentIdx + 1 === QUIZ_QUESTIONS.length ? 'Finalizar Simulado' : 'Próxima Questão'
                  ) : (
                    'Confirmar Resposta'
                  )}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Finished score board layout with provisional training certificate emissions */
          <div className="bg-white dark:bg-[#110e26] rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden text-center p-8 animate-fade-in">
            {isApproved ? (
              <div className="inline-flex p-4 rounded-full bg-green-100 text-green-700 mb-4 animate-bounce">
                <Award className="w-12 h-12" />
              </div>
            ) : (
              <div className="inline-flex p-4 rounded-full bg-amber-100 text-amber-700 mb-4 animate-pulse">
                <XCircle className="w-12 h-12" />
              </div>
            )}

            <h3 className="text-2xl font-black uppercase text-gray-950 dark:text-white mb-2">Simulado de Recorrência Concluído</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 font-medium">
              Você acertou <span className="font-extrabold text-latam-indigo text-lg">{score}</span> de <span className="font-extrabold text-gray-905 dark:text-gray-100 text-lg">{QUIZ_QUESTIONS.length}</span> questões. 
              {isApproved ? ' (Status: Aprovado)' : ' (Status: Requer mais estudos)'}
            </p>

            {isApproved ? (
              /* Approved Provisional Training Certificate box */
              <div className="my-8 border-4 border-double border-latam-indigo dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/15 p-8 rounded-2xl relative max-w-xl mx-auto text-left rotate-0 animate-zoom-in">
                
                {/* Micro logo header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4 mb-6 text-xs text-gray-400 dark:text-slate-500 font-bold tracking-wider">
                  <span>ANAC RBAC 175 DIGITAL COMPLIANCE</span>
                  <span>LATAM CARGO TEAM</span>
                </div>

                <div className="space-y-4 text-center">
                  <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Certidão de Aptidão Provisória</h4>
                  
                  <div className="text-xs text-gray-600 dark:text-slate-350 space-y-1 py-4 font-sans max-w-md mx-auto">
                    <p className="leading-relaxed">
                      Certificamos para fins de simulação de ground safety que o operador cargo
                    </p>
                    <p className="text-base font-black text-latam-indigo dark:text-indigo-300 tracking-tight block py-1.5 uppercase">
                      {userName}
                    </p>
                    <p className="leading-relaxed">
                      concluiu o ciclo de e-learning rápido referente às diretivas de aceitação, marcas de perigo de bateria de lítio, e regras de segregação IATA / LATAM Cargo vigentes.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-slate-800 pt-4 text-[10px] font-mono text-gray-400 dark:text-slate-500 font-bold">
                    <div>
                      <span>CÓDIGO DE AUTENTICIDADE:</span>
                      <span className="block text-gray-800 dark:text-slate-200 font-black tracking-wider text-xs">{certificateHash}</span>
                    </div>
                    <div>
                      <span>STATUS DE TREINAMENTO:</span>
                      <span className="block text-green-700 dark:text-green-400 font-black text-xs uppercase">APROVADO E RECORRENTE</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Retry advice box */
              <div className="bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/40 p-6 rounded-xl max-w-lg mx-auto mb-8 text-left text-xs font-medium text-red-900 dark:text-red-350 leading-relaxed">
                <h4 className="font-black uppercase tracking-wider text-red-950 dark:text-red-200 mb-1">Nota de Treinamento Insuficiente</h4>
                A pontuação mínima de aceitação para homologação ANAC e LATAM Cargo regulatória é de 80% (4 acertos). Revise as diretrizes da Seção 2 (Variações das Cias) e Seção 9 (Regulamento de Manuseio e Alocação) e tente novamente.
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center space-x-3.5 border-t border-gray-100 dark:border-slate-800 pt-6">
              <button
                id="btn-quiz-retry"
                onClick={handleRestart}
                className="bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 px-6 py-3 rounded-lg text-xs font-bold transition-all flex items-center cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refazer Simulado
              </button>
              <button
                id="btn-quiz-reset-close"
                onClick={onClose}
                className="bg-latam-indigo hover:bg-latam-indigoLight text-white px-6 py-3 rounded-lg text-xs font-bold transition-all flex items-center cursor-pointer"
              >
                Finalizar e Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AnacQuiz);
