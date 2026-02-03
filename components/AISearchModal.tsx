import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Loader2, Bot, User, Globe, ExternalLink, ShieldCheck, Box, Plane, AlertTriangle, FileCheck, Scale, MapPin } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scenario State
  const [scenarioData, setScenarioData] = useState({
      unNumbers: '',
      airline: 'LATAM Airlines Group', // Locked to LATAM
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
      - Companhia Aérea: LATAM Airlines Group (Verificar Variações LA/LA-Cargo)
      - Destino: ${scenarioData.destination}
      - Tipo de Aeronave: ${scenarioData.type === 'PASSENGER' ? 'Passageiros (PAX)' : 'Somente Carga (CAO)'}
      - Contexto: Voo Doméstico/Internacional LATAM Brasil
      `;

      setMessages(prev => [...prev, { role: 'user', content: `Auditoria LATAM: ${scenarioData.unNumbers} para ${scenarioData.destination}`, type: 'analysis' }]);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-latam-indigo/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[90vh] border border-white/20">
        
        {/* Header with Tabs */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-6">
             <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-tr from-latam-indigo to-blue-600 p-2 rounded-lg text-white shadow-md">
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-800">IATA AI Agent</h2>
                    <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">Live 2026 Edition</div>
                </div>
             </div>
             
             {/* Mode Switcher */}
             <div className="flex bg-gray-100 p-1 rounded-lg">
                 <button 
                    onClick={() => setMode('CONSULTANT')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'CONSULTANT' ? 'bg-white text-latam-indigo shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                     Consultor
                 </button>
                 <button 
                    onClick={() => setMode('OPERATIONS')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center ${mode === 'OPERATIONS' ? 'bg-latam-indigo text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                     <ShieldCheck className="w-3 h-3 mr-1.5" />
                     Operações (Validador)
                 </button>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-grow overflow-hidden">
            
            {/* Sidebar for Operations Mode */}
            {mode === 'OPERATIONS' && (
                <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-6 flex flex-col overflow-y-auto shrink-0 shadow-inner">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                        <Box className="w-4 h-4 mr-2 text-latam-indigo" />
                        Dados do Embarque
                    </h3>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Itens (UN, Qtd, Tipo)</label>
                            <textarea 
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo min-h-[120px] shadow-sm placeholder-gray-400"
                                placeholder="Ex: 5L de UN 1263 Paint e 2kg de UN 3480 Lithium Batteries..."
                                value={scenarioData.unNumbers}
                                onChange={(e) => setScenarioData(prev => ({...prev, unNumbers: e.target.value}))}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Companhia Aérea (Carrier)</label>
                            <div className="relative">
                                <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text"
                                    readOnly
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500 font-semibold cursor-not-allowed select-none shadow-sm"
                                    value="LATAM Airlines Group"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 pl-1">Variações do operador LA aplicadas automaticamente.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Destino (Rede LATAM)</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select 
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo shadow-sm appearance-none cursor-pointer"
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
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Aeronave</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setScenarioData(prev => ({...prev, type: 'PASSENGER'}))}
                                    className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center justify-center transition-all ${scenarioData.type === 'PASSENGER' ? 'bg-latam-indigo text-white border-latam-indigo shadow-md ring-2 ring-indigo-200' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <User className="w-5 h-5 mb-1.5" />
                                    Passageiros (PAX)
                                </button>
                                <button 
                                    onClick={() => setScenarioData(prev => ({...prev, type: 'CARGO'}))}
                                    className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center justify-center transition-all ${scenarioData.type === 'CARGO' ? 'bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-200' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Plane className="w-5 h-5 mb-1.5" />
                                    Cargueiro (CAO)
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={handleShipmentAudit}
                            disabled={isLoading || !scenarioData.unNumbers || !scenarioData.destination}
                            className="w-full py-4 bg-latam-coral text-white rounded-lg font-bold shadow-lg shadow-red-200 hover:bg-latam-coralHover transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed mt-6 flex items-center justify-center text-sm"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                            Auditar Embarque LATAM
                        </button>
                    </div>
                </div>
            )}

            {/* Chat/Results Area */}
            <div className={`flex-grow flex flex-col bg-gray-50/50 ${mode === 'OPERATIONS' ? 'w-2/3' : 'w-full'}`}>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-gray-100">
                            {mode === 'CONSULTANT' ? <Sparkles className="w-8 h-8 text-latam-indigo" /> : <FileCheck className="w-8 h-8 text-green-600" />}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {mode === 'CONSULTANT' ? 'Consultor Regulatório' : 'Validador de Embarque LATAM'}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                            {mode === 'CONSULTANT' 
                                ? 'Faça perguntas sobre regras gerais, códigos UN ou embale. Conectado ao Google Search.'
                                : 'Preencha os dados do embarque à esquerda para que a IA verifique variações LATAM, segregação e limites.'}
                        </p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-3 shadow-sm border ${msg.type === 'analysis' ? 'bg-green-600 border-green-700' : 'bg-latam-indigo border-latam-indigoLight'} text-white`}>
                                {msg.type === 'analysis' ? <ShieldCheck className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                        )}
                        
                        <div className="max-w-[90%] flex flex-col">
                            <div className={`
                                p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                                ${msg.role === 'user' 
                                ? 'bg-latam-indigo text-white rounded-br-none' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
                            `}>
                                <div className="prose prose-sm max-w-none">
                                    <div className="whitespace-pre-line">{msg.content}</div>
                                </div>
                            </div>

                            {/* Grounding Sources (Citations) */}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 ml-1 bg-white border border-gray-200 p-3 rounded-xl shadow-sm max-w-full animate-fade-in">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">
                                        <span className="flex items-center"><Globe className="w-3 h-3 mr-1" /> Fontes Verificadas</span>
                                    </div>
                                    <div className="space-y-2">
                                        {msg.sources.map((source, sIdx) => (
                                            <a 
                                                key={sIdx} 
                                                href={source.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-start group p-1.5 hover:bg-gray-50 rounded transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3 text-latam-coral mr-2 mt-0.5 flex-shrink-0" />
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-xs font-semibold text-gray-700 group-hover:text-latam-indigo truncate">
                                                        {source.title}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 truncate">
                                                        {source.uri}
                                                    </span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0 mt-1 ml-3 border border-gray-200">
                            <User className="w-4 h-4" />
                            </div>
                        )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-start justify-start">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-3 shadow-sm ${mode === 'OPERATIONS' ? 'bg-green-600' : 'bg-latam-indigo'} text-white`}>
                            {mode === 'OPERATIONS' ? <ShieldCheck className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex flex-col space-y-2">
                                <div className="flex items-center space-x-3 text-gray-800 font-medium text-xs">
                                    <Loader2 className="w-4 h-4 text-latam-coral animate-spin" />
                                    <span>
                                        {mode === 'OPERATIONS' ? 'Auditando Variações LATAM (Web)...' : 'Analisando...'}
                                    </span>
                                </div>
                                {mode === 'OPERATIONS' && (
                                    <div className="text-[10px] text-gray-400 pl-7 space-y-1">
                                        <div>• Verificando Segregação (Tabela 9.3.A)</div>
                                        <div>• Buscando Restrições da LATAM (LA)</div>
                                        <div>• Validando Limites PAX/CAO</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer Input - Only for Consultant Mode */}
                {mode === 'CONSULTANT' && (
                    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <form onSubmit={handleSearch} className="relative flex items-center">
                        <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Digite o UN Number ou dúvida regulatória..."
                        className="flex-grow pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-latam-indigo/20 focus:border-latam-indigo focus:bg-white transition-all text-gray-800 placeholder-gray-400 shadow-inner"
                        />
                        <button 
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="absolute right-2 p-2 bg-latam-indigo text-white rounded-lg hover:bg-latam-indigoLight disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                        <Send className="w-4 h-4" />
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