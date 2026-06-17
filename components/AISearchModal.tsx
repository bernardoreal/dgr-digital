import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Loader2, Bot, User, Globe, ExternalLink, ShieldCheck, Box, Plane, AlertTriangle, FileCheck, Scale, MapPin, Copy, Check } from 'lucide-react';
import { queryGemini, analyzeShipment, GroundingSource } from '../services/geminiService';

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: GroundingSource[];
  type?: 'chat' | 'analysis';
}

type Mode = 'CONSULTANT' | 'OPERATIONS';

// List of major LATAM Brasil Airports
const LATAM_AIRPORTS = [
    { code: '', name: 'Selecione o destino...' },
    { code: 'GRU', name: 'São Paulo/Guarulhos (GRU)' },
    { code: 'CGH', name: 'São Paulo/Congonhas (CGH)' },
    { code: 'BSB', name: 'Brasília (BSB)' },
    { code: 'GIG', name: 'Rio de Janeiro/Galeão (GIG)' },
    { code: 'SDU', name: 'Rio de Janeiro/Santos Dumont (SDU)' },
    { code: 'CNF', name: 'Belo Horizonte/Confins (CNF)' },
    { code: 'REC', name: 'Recife (REC)' },
    { code: 'FOR', name: 'Fortaleza (FOR)' },
    { code: 'SSA', name: 'Salvador (SSA)' },
    { code: 'POA', name: 'Porto Alegre (POA)' },
    { code: 'CWB', name: 'Curitiba (CWB)' },
    { code: 'MAO', name: 'Manaus (MAO)' },
    { code: 'BEL', name: 'Belém (BEL)' },
    { code: 'FLN', name: 'Florianópolis (FLN)' },
    { code: 'VIX', name: 'Vitória (VIX)' },
    { code: 'GYN', name: 'Goiânia (GYN)' },
    { code: 'CGB', name: 'Cuiabá (CGB)' },
    { code: 'CGR', name: 'Campo Grande (CGR)' },
    { code: 'SLZ', name: 'São Luís (SLZ)' },
    { code: 'MCZ', name: 'Maceió (MCZ)' },
    { code: 'NAT', name: 'Natal (NAT)' },
    { code: 'JPA', name: 'João Pessoa (JPA)' },
    { code: 'AJU', name: 'Aracaju (AJU)' },
    { code: 'THE', name: 'Teresina (THE)' },
    { code: 'VCP', name: 'Campinas (VCP)' },
    { code: 'IGU', name: 'Foz do Iguaçu (IGU)' },
    { code: 'NVT', name: 'Navegantes (NVT)' },
    { code: 'LDB', name: 'Londrina (LDB)' },
    { code: 'UDI', name: 'Uberlândia (UDI)' }
];

const AISearchModal: React.FC<AISearchModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<Mode>('CONSULTANT');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scenario State
  const [scenarioData, setScenarioData] = useState({
      unNumbers: '',
      airline: 'LATAM Airlines Brasil (JJ)', // Configured to JJ by default
      destination: '',
      type: 'PASSENGER' // PASSENGER or CARGO
  });

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userText, type: 'chat' }]);
    setIsLoading(true);
    
    // Call Gemini Service
    const result = await queryGemini(userText);
    
    setIsLoading(false);
    setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.text,
        sources: result.sources,
        type: 'chat'
    }]);
  };

  const handleShipmentAudit = async () => {
      if (!scenarioData.unNumbers || !scenarioData.destination) return;

      const scenarioText = `
      CENÁRIO DE EMBARQUE LATAM (INTERNO):
      - Itens/UNs: ${scenarioData.unNumbers}
      - Companhia Aérea: ${scenarioData.airline}
      - Destino: ${scenarioData.destination}
      - Tipo de Aeronave: ${scenarioData.type === 'PASSENGER' ? 'Passageiros (PAX)' : 'Somente Carga (CAO)'}
      - Contexto: Voo Doméstico/Internacional LATAM Brasil (Variações JJ/LA)
      `;

      setMessages(prev => [...prev, { role: 'user', content: `Auditoria LATAM: ${scenarioData.unNumbers} para ${scenarioData.destination} (${scenarioData.airline})`, type: 'analysis' }]);
      setIsLoading(true);

      const result = await analyzeShipment(scenarioText);

      setIsLoading(false);
      setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: result.text,
          sources: result.sources,
          type: 'analysis'
      }]);
  };

  const copyToClipboard = (text: string, id: number) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const renderAnalysisContent = (content: string, msgIndex: number) => {
      // Split content to find "Ação Requerida" or "Passo-a-passo"
      const parts = content.split(/###\s*🛠️?\s*AÇÃO\s*(?:REQUERIDA|CORRETIVA).*/i);
      const mainContent = parts[0];
      const actionContent = parts[1];

      return (
          <div className="space-y-4">
              <div className="prose prose-sm max-w-none text-gray-700 dark:text-slate-300 font-semibold whitespace-pre-wrap">
                  {mainContent}
              </div>
              
              {actionContent && (
                  <div className="bg-amber-50 dark:bg-amber-955/15 border-2 border-amber-200 dark:border-amber-900/40 rounded-xl p-4 shadow-sm animate-fade-in relative group">
                      <div className="flex items-center mb-2 text-amber-800 dark:text-amber-305">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          <h4 className="font-bold uppercase tracking-tight text-sm">Plano de Ação Corretiva</h4>
                      </div>
                      <div className="text-sm text-amber-900 dark:text-amber-400 font-bold whitespace-pre-wrap">
                          {actionContent.trim()}
                      </div>
                  </div>
              )}

              <button 
                onClick={() => copyToClipboard(content, msgIndex)}
                className="flex items-center text-[10px] font-bold text-gray-400 dark:text-slate-500 hover:text-latam-indigo dark:hover:text-indigo-400 transition-colors uppercase tracking-widest mt-2 cursor-pointer"
              >
                  {copiedId === msgIndex ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copiedId === msgIndex ? 'Copiado para o Clipboard' : 'Copiar Relatório de Auditoria'}
              </button>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-latam-indigo/65 dark:bg-[#06050e]/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#110e26] rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[90vh] border border-white/20 dark:border-slate-800">
        
        {/* Header with Tabs */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#110e26] shrink-0">
          <div className="flex items-center space-x-6">
             <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-tr from-latam-indigo to-blue-600 p-2 rounded-lg text-white shadow-md">
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800 dark:text-white">IATA AI Agent</h2>
                    <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono uppercase tracking-wide">Live 2026 Edition</div>
                </div>
             </div>
             
             {/* Mode Switcher */}
             <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-lg border dark:border-slate-800/80">
                 <button 
                    onClick={() => setMode('CONSULTANT')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${mode === 'CONSULTANT' ? 'bg-white dark:bg-slate-800 text-latam-indigo dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                 >
                     Consultor
                 </button>
                 <button 
                    onClick={() => setMode('OPERATIONS')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center cursor-pointer ${mode === 'OPERATIONS' ? 'bg-latam-indigo text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
                 >
                     <ShieldCheck className="w-3 h-3 mr-1.5" />
                     Operações (Validador)
                 </button>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-grow overflow-hidden">
            
            {/* Sidebar for Operations Mode */}
            {mode === 'OPERATIONS' && (
                <div className="w-[380px] bg-gray-50 dark:bg-[#0c0a1f] border-r border-gray-200 dark:border-slate-800 p-6 flex flex-col overflow-y-auto shrink-0 shadow-inner">
                    <h3 className="font-bold text-gray-700 dark:text-slate-300 mb-4 flex items-center">
                        <Box className="w-4 h-4 mr-2 text-latam-indigo dark:text-[#a09beb]" />
                        Dados do Embarque
                    </h3>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-650 dark:text-slate-400 mb-1.5">Itens (UN, Qtd, Tipo)</label>
                            <div className="relative">
                                <textarea 
                                    className="w-full p-3 pr-8 border border-gray-305 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-[#0f0d22] text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo min-h-[140px] shadow-sm placeholder-gray-400"
                                    placeholder="Ex: 5L de UN 1263 Paint e 2kg de UN 3480 Lithium Batteries..."
                                    value={scenarioData.unNumbers}
                                    onChange={(e) => setScenarioData(prev => ({...prev, unNumbers: e.target.value}))}
                                />
                                {scenarioData.unNumbers && (
                                    <button
                                        type="button"
                                        onClick={() => setScenarioData(prev => ({...prev, unNumbers: ''}))}
                                        className="absolute top-2 right-2 p-1 text-gray-405 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
                                        title="Limpar campo"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-650 dark:text-slate-400 mb-1.5">Companhia Aérea</label>
                            <select
                                className="w-full p-3 border border-gray-305 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-[#0f0d22] text-gray-901 dark:text-slate-100 focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo shadow-sm"
                                value={scenarioData.airline}
                                onChange={(e) => setScenarioData(prev => ({...prev, airline: e.target.value}))}
                            >
                                <option value="LATAM Airlines Brasil (JJ)">LATAM Airlines Brasil (JJ)</option>
                                <option value="LATAM Airlines Chile / Group (LA)">LATAM Airlines Group (LA)</option>
                                <option value="LATAM Cargo Brasil (M3)">LATAM Cargo Brasil (M3)</option>
                                <option value="LATAM Cargo Colombia (UC)">LATAM Cargo Colombia (UC)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-650 dark:text-slate-400 mb-1.5">Aeroporto de Destino</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    className="w-full appearance-none p-3 pl-10 border border-gray-305 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-[#0f0d22] text-gray-901 dark:text-slate-100 focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo shadow-sm"
                                    value={scenarioData.destination}
                                    onChange={(e) => setScenarioData(prev => ({...prev, destination: e.target.value}))}
                                >
                                    {LATAM_AIRPORTS.map(airport => (
                                        <option key={airport.code} value={airport.code}>{airport.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-650 dark:text-slate-400 mb-1.5">Tipo de Aeronave</label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setScenarioData(prev => ({...prev, type: 'PASSENGER'}))}
                                    className={`flex-1 p-3 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center cursor-pointer ${scenarioData.type === 'PASSENGER' ? 'bg-blue-100 dark:bg-indigo-950/40 border-blue-400 dark:border-indigo-900/40 text-blue-800 dark:text-indigo-300' : 'bg-white dark:bg-[#0f0d22] border-gray-300 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-405'}`}
                                >
                                    <Plane className="w-4 h-4 mr-2" />
                                    Passageiro
                                </button>
                                <button
                                    onClick={() => setScenarioData(prev => ({...prev, type: 'CARGO'}))}
                                    className={`flex-1 p-3 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center cursor-pointer ${scenarioData.type === 'CARGO' ? 'bg-orange-100 dark:bg-orange-955/30 border-orange-400 dark:border-orange-900/40 text-orange-810 dark:text-orange-300' : 'bg-white dark:bg-[#0f0d22] border-gray-300 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-405'}`}
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Cargueiro
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-auto pt-6 border-t border-gray-200 dark:border-slate-850">
                        <button
                            onClick={handleShipmentAudit}
                            disabled={!scenarioData.unNumbers || !scenarioData.destination || isLoading}
                            className="w-full bg-latam-indigo hover:bg-latam-indigoLight text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none disabled:bg-gray-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-605 disabled:shadow-none transition-all flex items-center justify-center cursor-pointer"
                        >
                            <FileCheck className="w-5 h-5 mr-3" />
                            Auditar Embarque
                        </button>
                        <p className="text-[10px] text-center text-gray-400 dark:text-slate-500 mt-3 font-semibold uppercase tracking-widest">Verificação em tempo real via Grounding</p>
                    </div>
                </div>
            )}

            {/* Main Chat/Results Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#0c0a1f]/40 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.length === 0 && mode === 'CONSULTANT' && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <Sparkles className="w-12 h-12 mb-4 text-latam-indigo dark:text-indigo-400" />
                            <p className="text-gray-500 dark:text-slate-400 font-bold max-w-xs text-sm">Faça perguntas complexas sobre o IATA DGR 2026. A IA verificará fontes em tempo real.</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-latam-indigo text-white flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-5 h-5" />
                                </div>
                            )}
                            <div className={`max-w-2xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-slate-200 rounded-br-none font-semibold' : 'bg-white dark:bg-[#110e26] border border-gray-100 dark:border-slate-850 text-gray-700 dark:text-slate-300 rounded-bl-none shadow-sm'}`}>
                                
                                {msg.type === 'analysis' && msg.role === 'assistant' ? (
                                    renderAnalysisContent(msg.content, index)
                                ) : (
                                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-slate-300 font-semibold">
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                )}

                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-850">
                                        <h4 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-2 flex items-center">
                                            <Globe className="w-3 h-3 mr-1.5" /> Fontes Verificadas
                                        </h4>
                                        <div className="space-y-1.5">
                                            {msg.sources.map((s, i) => (
                                                <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-start text-xs text-blue-600 dark:text-indigo-455 hover:text-blue-800 dark:hover:text-indigo-300 bg-blue-50/50 dark:bg-indigo-950/20 hover:bg-blue-100 dark:hover:bg-indigo-900/40 p-2 rounded-md transition-colors group">
                                                    <ExternalLink className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span className="truncate group-hover:underline">{s.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-slate-305 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-latam-indigo text-white flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="p-4 rounded-2xl bg-white dark:bg-[#110e26] border border-gray-100 dark:border-slate-850 rounded-bl-none shadow-sm flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                <span className="text-sm text-gray-500 dark:text-slate-400">Executando Auditoria Live...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {mode === 'CONSULTANT' && (
                    <div className="p-4 border-t border-gray-100 dark:border-slate-850 bg-white dark:bg-[#110e26] shrink-0">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Pergunte sobre regulamentação, UN numbers, ou variações..."
                                className="w-full pl-5 pr-14 py-4 border border-gray-200 dark:border-slate-800 rounded-xl text-sm bg-white dark:bg-[#0f0d22] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-latam-indigo/30 focus:border-latam-indigo"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !query.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-latam-indigo text-white p-2.5 rounded-lg shadow-md hover:bg-latam-indigoLight transition-all disabled:bg-gray-300 dark:disabled:bg-slate-800 disabled:shadow-none cursor-pointer"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AISearchModal;
