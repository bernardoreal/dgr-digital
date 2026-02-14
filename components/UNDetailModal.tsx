import React, { useState, useMemo } from 'react';
import { X, Box, Plane, AlertTriangle, Info, Shield, Scale, FileText, Globe, Layers, ChevronRight, Check, Search, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';
import { SPECIAL_PROVISIONS_DATA, VARIATIONS_DATA, DGR_CHAPTERS } from '../constants';
import { DGRPackingInstruction, DGRContentBlock, DGRDatabase } from '../types';
import { queryGemini, GroundingSource } from '../services/geminiService';

interface UNDetailModalProps {
  data: Record<string, any> | null;
  onClose: () => void;
  onNavigateToPi?: (pi: string) => void;
}

const UNDetailModal: React.FC<UNDetailModalProps> = ({ data, onClose, onNavigateToPi }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'packing' | 'variations' | 'audit'>('overview');
  
  // Audit State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{text: string, sources: GroundingSource[]} | null>(null);

  if (!data) return null;

  // Determine hazard color based on class
  const getHeaderColor = (cls: string) => {
    if (cls.startsWith('1')) return 'bg-orange-600';
    if (cls.startsWith('2.1') || cls.startsWith('3')) return 'bg-red-600';
    if (cls.startsWith('2.3') || cls.startsWith('6')) return 'bg-white text-black border-b-2 border-black';
    if (cls.startsWith('8')) return 'bg-gray-800';
    if (cls.startsWith('7')) return 'bg-yellow-400 text-black';
    if (cls.startsWith('9')) return 'bg-white text-black'; 
    return 'bg-latam-indigo';
  };

  const headerBg = getHeaderColor(String(data.class));
  const isLightHeader = headerBg.includes('white') || headerBg.includes('yellow');
  
  // Parse special provisions
  const spCodes = data.sp ? data.sp.split(' ').filter(Boolean) : [];

  // --- CROSS-REFERENCING LOGIC ---

  const relatedPackingInstructions = useMemo(() => {
    const chapter5 = DGR_CHAPTERS.find(c => c.id === 5);
    // Robust check for data existence
    const piDatabaseBlock = chapter5?.sections.flatMap(s => s.blocks).find(b => b.type === 'database');
    if (!piDatabaseBlock || piDatabaseBlock.type !== 'database') return [];

    const piData = (piDatabaseBlock.content as DGRDatabase).data;
    if (!piData) return [];

    const targets = [data.pax_pi, data.cao_pi, data.lq_pi].filter(t => t && t !== 'Forbidden' && t !== 'See 10.5');
    
    // Create a Set for efficient lookup
    const targetSet = new Set(targets);

    return piData.filter(pi => targetSet.has(pi.id));
  }, [data]);

  const applicableVariations = useMemo(() => {
      const relevant = VARIATIONS_DATA.filter(v => {
          return v.text.includes(`UN ${data.un}`) || 
                 v.text.includes(`UN${data.un}`) ||
                 v.text.includes(`Class ${data.class}`) ||
                 (data.class === '9' && (v.text.toLowerCase().includes('lithium') || v.text.toLowerCase().includes('baterias')))
      });
      return relevant;
  }, [data]);

  const handleLiveAudit = async () => {
      setIsAuditing(true);
      const prompt = `Act as a Senior IATA DGR Auditor. 
      VERIFY the following database entry against current IATA DGR 2026 regulations found on the live web:
      
      Entry to Verify:
      - UN Number: ${data.un}
      - Proper Name: ${data.name}
      - Class: ${data.class}
      - Packing Group: ${data.pg}
      - PAX PI: ${data.pax_pi} (Max: ${data.pax_max})
      - CAO PI: ${data.cao_pi} (Max: ${data.cao_max})
      
      Task:
      1. Confirm if this classification is correct for the 2026 edition.
      2. Check for any NEW State or Operator variations that might prohibit this specific UN number.
      3. List any discrepancies found.
      4. Provide a "GO / NO-GO" recommendation for acceptance.
      
      Output concisely in Portuguese (Brazil).`;

      const result = await queryGemini(prompt);
      setAuditResult(result);
      setIsAuditing(false);
  };

  const handlePiClick = (pi: string) => {
    if (pi && pi !== 'Forbidden' && !pi.toLowerCase().includes('see')) {
        if (onNavigateToPi) {
            onNavigateToPi(pi);
            onClose(); // Close the modal as we are navigating away
        }
    }
  };

  const renderPi = (pi: string, className: string) => {
      const isClickable = pi && pi !== 'Forbidden' && !pi.toLowerCase().includes('see');
      if (isClickable) {
          return (
              <button onClick={() => handlePiClick(pi)} className={`${className} text-blue-600 hover:text-blue-800 underline cursor-pointer`}>
                  {pi}
              </button>
          );
      }
      return <div className={`${className} ${pi === 'Forbidden' ? 'text-red-600' : 'text-gray-900'}`}>{pi}</div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto md:max-h-[90vh] animate-fade-in-up">
        
        <div className={`${headerBg} p-6 flex justify-between items-start relative overflow-hidden flex-shrink-0`}>
           {String(data.class).startsWith('9') && (
                <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, white, white 10px, black 10px, black 20px)', opacity: 0.08 }}></div>
           )}
           <div className={`relative z-10 ${isLightHeader ? 'text-gray-900' : 'text-white'}`}>
              <div className="flex items-center space-x-2 text-sm font-bold opacity-80 mb-1 uppercase tracking-wider">
                  <span>UN {data.un}</span><span>•</span><span>Class {data.class}</span>{data.sub && <span>({data.sub})</span>}
              </div>
              <h2 className="text-2xl font-bold leading-tight max-w-md">{data.name}</h2>
           </div>
           <button onClick={onClose} className={`p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors relative z-10 ${isLightHeader ? 'text-black' : 'text-white'}`}>
             <X className="w-6 h-6" />
           </button>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50/50">
            <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${activeTab === 'overview' ? 'border-latam-indigo text-latam-indigo bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Info className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Visão Geral</span>
            </button>
            <button onClick={() => setActiveTab('packing')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${activeTab === 'packing' ? 'border-latam-indigo text-latam-indigo bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Box className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Embalagem</span>
                {relatedPackingInstructions.length > 0 && <span className="ml-1.5 bg-gray-200 text-gray-700 text-[10px] px-1.5 rounded-full">{relatedPackingInstructions.length}</span>}
            </button>
            <button onClick={() => setActiveTab('variations')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${activeTab === 'variations' ? 'border-latam-indigo text-latam-indigo bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Globe className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Variações</span>
            </button>
            <button onClick={() => setActiveTab('audit')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center border-b-2 transition-colors ${activeTab === 'audit' ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-500 hover:text-green-600'}`}>
                <Shield className="w-4 h-4 mr-2" /><span className="hidden sm:inline">AUDITORIA LIVE</span><span className="sm:hidden">AUDIT</span>
            </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8 bg-gray-50/50 flex-grow">
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div className="text-xs text-gray-500 uppercase font-bold mb-1">Grupo de Emb.</div><div className="text-xl font-mono font-bold text-latam-indigo">{data.pg || "N/A"}</div></div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div className="text-xs text-gray-500 uppercase font-bold mb-1">Qtd. Excecionada</div><div className="text-xl font-mono font-bold text-latam-indigo">{data.eq}</div></div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div className="text-xs text-gray-500 uppercase font-bold mb-1">Cód. ERG</div><div className="text-xl font-mono font-bold text-latam-indigo">{data.erg}</div></div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div className="text-xs text-gray-500 uppercase font-bold mb-1">Disp. Especiais</div><div className="flex flex-wrap gap-1">{spCodes.length > 0 ? spCodes.map((code: string) => (<div key={code} className="group relative"><span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded cursor-help border border-indigo-100">{code}</span><div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs p-3 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"><div className="font-bold mb-1 text-indigo-300">{code}</div>{SPECIAL_PROVISIONS_DATA.find(s=>s.code===code)?.text}<div className="absolute top-full right-2 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div></div></div>)) : <span className="text-sm font-bold text-gray-400">-</span>}</div></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-100 flex items-center"><Plane className="w-5 h-5 text-blue-600 mr-2" /><h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Aeronave de Passageiros</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="p-5"><div className="flex items-center mb-3"><Box className="w-4 h-4 text-gray-400 mr-2" /><span className="text-xs font-bold text-gray-500 uppercase">Quantidade Limitada (Y)</span></div><div className="flex justify-between items-end"><div><div className="text-[10px] text-gray-400">INSTR. EMBALAGEM</div>{renderPi(data.lq_pi, 'font-mono font-bold text-lg')}</div><div className="text-right"><div className="text-[10px] text-gray-400">LIMITE MÁX.</div><div className={`font-mono font-bold ${data.lq_max === 'Forbidden' ? 'text-red-600' : 'text-gray-900 text-lg'}`}>{data.lq_max}</div></div></div></div>
                            <div className="p-5"><div className="flex items-center mb-3"><Box className="w-4 h-4 text-gray-400 mr-2" /><span className="text-xs font-bold text-gray-500 uppercase">Standard (Pax)</span></div><div className="flex justify-between items-end"><div><div className="text-[10px] text-gray-400">INSTR. EMBALAGEM</div>{renderPi(data.pax_pi, 'font-mono font-bold text-lg')}</div><div className="text-right"><div className="text-[10px] text-gray-400">LIMITE MÁX.</div><div className={`font-mono font-bold ${data.pax_max === 'Forbidden' ? 'text-red-600' : 'text-gray-900 text-lg'}`}>{data.pax_max}</div></div></div></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden"><div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex items-center justify-between"><div className="flex items-center"><Plane className="w-5 h-5 text-orange-600 mr-2" /><h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Somente Carga (CAO)</h3></div><span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Risco Elevado</span></div><div className="p-5"><div className="flex justify-between items-end"><div><div className="text-[10px] text-gray-400">INSTR. EMBALAGEM</div>{renderPi(data.cao_pi, 'font-mono font-bold text-2xl')}</div><div className="text-right"><div className="text-[10px] text-gray-400">LIMITE MÁX.</div><div className="font-mono font-bold text-2xl text-gray-900">{data.cao_max}</div></div></div></div></div>
                </div>
            )}
            {activeTab === 'packing' && (
                <div className="animate-fade-in">{relatedPackingInstructions.length > 0 ? (<div className="space-y-8">{relatedPackingInstructions.map((pi: any, idx: number) => (<div key={idx} className="bg-white border-2 border-gray-800 rounded-lg overflow-hidden"><div className="bg-gray-800 text-white p-4 flex justify-between items-center"><div className="flex items-center"><span className="font-mono font-bold text-xl mr-3">PI {pi.id}</span><span className="text-xs opacity-70 border-l border-white/30 pl-3">{pi.title}</span></div></div><div className="p-5 text-sm text-gray-700 whitespace-pre-line">{pi.description}</div></div>))}</div>) : (<div className="text-center py-10"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"><FileText className="w-8 h-8" /></div><h3 className="font-bold text-gray-700 mb-2">Instrução Não Disponível na Base</h3><p className="text-sm text-gray-500 max-w-xs mx-auto">A Instrução de Embalagem referenciada ({data.pax_pi} / {data.cao_pi}) não consta na base de dados.</p></div>)}</div>
            )}
            {activeTab === 'variations' && (
                <div className="animate-fade-in"><div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start"><AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" /><div><h4 className="font-bold text-yellow-800 text-sm">Variações Aplicáveis</h4><p className="text-xs text-yellow-700 mt-1">As variações abaixo foram identificadas com base na Classe ou UN. Verifique sempre o manual do operador.</p></div></div>{applicableVariations.length > 0 ? (<div className="space-y-4">{applicableVariations.map((v, idx) => (<div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"><div className="flex items-center justify-between mb-2"><div className="flex items-center space-x-2"><span className="font-mono font-bold text-latam-indigo bg-indigo-50 px-2 py-0.5 rounded text-xs">{v.code}</span><span className="text-xs font-bold text-gray-500 uppercase">{v.owner}</span></div></div><p className="text-sm text-gray-700 leading-relaxed">{v.text}</p></div>))}</div>) : (<div className="text-center py-10"><Check className="w-12 h-12 text-green-500 mx-auto mb-3" /><h3 className="font-bold text-gray-700">Nenhuma Variação Específica Encontrada</h3><p className="text-sm text-gray-500">Não foram encontradas variações de Estado ou Operador para este UN na base de dados.</p></div>)}</div>
            )}
            {activeTab === 'audit' && (
                <div className="animate-fade-in flex flex-col h-full">{!auditResult && !isAuditing ? (<div className="flex flex-col items-center justify-center flex-grow py-10"><div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100"><Shield className="w-10 h-10 text-green-600" /></div><h3 className="text-xl font-bold text-gray-800 mb-3">Auditoria Regulatória em Tempo Real</h3><p className="text-gray-500 text-center max-w-md mb-8 leading-relaxed">Esta ferramenta utiliza IA para cruzar os dados deste UN com as últimas atualizações do IATA DGR 2026 e variações de Estado em tempo real.</p><button onClick={handleLiveAudit} className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-green-200 transition-all flex items-center"><Sparkles className="w-5 h-5 mr-3" />Iniciar Auditoria Live</button></div>) : isAuditing ? (<div className="flex flex-col items-center justify-center flex-grow py-20"><RefreshCw className="w-12 h-12 text-green-600 animate-spin mb-4" /><h3 className="text-lg font-bold text-gray-700">Auditando Fontes Globais...</h3><p className="text-sm text-gray-500">Verificando IATA.org, FAA e Airlines...</p></div>) : (<div className="bg-white border border-green-100 rounded-xl shadow-sm overflow-hidden flex flex-col h-full"><div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center"><h3 className="font-bold text-green-800 flex items-center"><Check className="w-5 h-5 mr-2" />Resultado da Auditoria</h3><button onClick={() => setAuditResult(null)} className="text-xs text-green-700 hover:underline">Nova Busca</button></div><div className="p-6 overflow-y-auto flex-grow"><div className="prose prose-sm max-w-none text-gray-700"><div className="whitespace-pre-line">{auditResult?.text}</div></div>{auditResult?.sources && auditResult.sources.length > 0 && (<div className="mt-8 pt-4 border-t border-gray-100"><h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center"><Globe className="w-3 h-3 mr-1" />Fontes Verificadas</h4><div className="space-y-2">{auditResult.sources.map((s, i) => (<a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center text-xs text-blue-600 hover:underline bg-blue-50 p-2 rounded"><ExternalLink className="w-3 h-3 mr-2 flex-shrink-0" /><span className="truncate">{s.title}</span></a>))}</div></div>)}</div></div>)}</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UNDetailModal;