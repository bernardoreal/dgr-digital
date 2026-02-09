
import React, { useState, useMemo } from 'react';
import { X, Box, Plane, AlertTriangle, Info, Shield, Scale, FileText, Globe, Layers, ChevronRight, Check, Search, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';
import { SPECIAL_PROVISIONS_DATA, VARIATIONS_DATA, DGR_CHAPTERS } from '../constants';
import { DGRPackingInstruction, DGRContentBlock } from '../types';
import { queryGemini, GroundingSource } from '../services/geminiService';

interface UNDetailModalProps {
  data: Record<string, any> | null;
  onClose: () => void;
}

const UNDetailModal: React.FC<UNDetailModalProps> = ({ data, onClose }) => {
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
    if (cls.startsWith('9')) return 'bg-white text-black border-t-4 border-black border-b-0 relative'; 
    return 'bg-latam-indigo';
  };

  const headerBg = getHeaderColor(String(data.class));
  const isLightHeader = headerBg.includes('white') || headerBg.includes('yellow');
  
  // Parse special provisions
  const spCodes = data.sp ? data.sp.split(' ').filter(Boolean) : [];

  // --- CROSS-REFERENCING LOGIC ---

  // 1. Find Packing Instructions (Chapter 5)
  const relatedPackingInstructions = useMemo(() => {
    const chapter5 = DGR_CHAPTERS.find(c => c.id === 5);
    if (!chapter5) return [];
    
    // Look for PI IDs mentioned in the UN entry
    const targets = [data.pax_pi, data.cao_pi, data.lq_pi?.replace('Y', '')].filter(t => t && t !== 'Forbidden' && t !== 'See 10.5');
    
    // Flatten Chapter 5 blocks to find PI blocks
    const foundPIs: DGRPackingInstruction[] = [];
    
    chapter5.sections.forEach(sec => {
        sec.blocks.forEach(block => {
            if (block.type === 'packing-instruction') {
                const pi = block.content as DGRPackingInstruction;
                if (targets.includes(pi.id)) {
                    foundPIs.push(pi);
                }
            }
        });
    });
    
    return foundPIs;
  }, [data]);

  // 2. Find Applicable Variations
  const applicableVariations = useMemo(() => {
      const relevant = VARIATIONS_DATA.filter(v => {
          return v.text.includes(`UN ${data.un}`) || 
                 v.text.includes(`UN${data.un}`) ||
                 v.text.includes(`Class ${data.class}`) ||
                 (data.class === '9' && v.text.includes('Lithium'))
      });
      return relevant;
  }, [data]);

  // 3. Handle Live Audit
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


  // Helper to render simple blocks inside the modal
  const renderSimpleBlock = (block: DGRContentBlock, idx: string) => {
     switch (block.type) {
         case 'paragraph': return <p key={idx} className="mb-2 text-sm text-gray-700">{block.content as string}</p>;
         case 'list': return (
             <ul key={idx} className="list-disc pl-5 mb-2 text-sm text-gray-700">
                 {(block.content as any).items.map((it: string, i: number) => <li key={i}>{it}</li>)}
             </ul>
         );
         case 'warning': return (
             <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-3 my-2 text-sm text-red-700">
                 <span className="font-bold block">Atenção:</span> {(block.content as any).text}
             </div>
         );
         case 'note': return (
            <div key={idx} className="bg-gray-50 border-l-4 border-gray-400 p-3 my-2 text-sm text-gray-700">
                <span className="font-bold block">Nota:</span> {(block.content as any).text}
            </div>
        );
         case 'table': return (
             <div key={idx} className="overflow-x-auto my-3 border border-gray-200 rounded">
                 <table className="min-w-full text-xs">
                     <thead className="bg-gray-100 font-bold">
                         <tr>{(block.content as any).headers.map((h: string, i:number) => <th key={i} className="p-2 border-r">{h}</th>)}</tr>
                     </thead>
                     <tbody>
                         {(block.content as any).rows.map((r: any[], i:number) => (
                             <tr key={i} className="border-t">
                                 {r.map((c, j) => <td key={j} className="p-2 border-r">{c === true ? 'Sim' : c === false ? 'Não' : c}</td>)}
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         );
         default: return null;
     }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto md:max-h-[90vh] animate-fade-in-up">
        
        {/* Header - Hazard Style */}
        <div className={`${headerBg} p-6 flex justify-between items-start relative overflow-hidden flex-shrink-0`}>
           {/* Striped overlay for Class 9 simulation */}
           {String(data.class).startsWith('9') && (
             <div className="absolute top-0 inset-x-0 h-1/2 bg-[linear-gradient(180deg,black_10%,transparent_10%,transparent_20%,black_20%,black_30%,transparent_30%,transparent_40%,black_40%,black_50%,transparent_50%,transparent_60%,black_60%,black_70%,transparent_70%)] opacity-10"></div>
           )}

           <div className={`relative z-10 ${isLightHeader ? 'text-gray-900' : 'text-white'}`}>
              <div className="flex items-center space-x-2 text-sm font-bold opacity-80 mb-1 uppercase tracking-wider">
                  <span>UN {data.un}</span>
                  <span>•</span>
                  <span>Class {data.class}</span>
                  {data.sub && <span>({data.sub})</span>}
              </div>
              <h2 className="text-2xl font-bold leading-tight max-w-md">{data.name}</h2>
           </div>
           
           <button 
             onClick={onClose}
             className={`p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors ${isLightHeader ? 'text-black' : 'text-white'}`}
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${activeTab === 'overview' ? 'border-latam-indigo text-latam-indigo bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Info className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Visão Geral</span>
            </button>
            <button 
                onClick={() => setActiveTab('packing')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${activeTab === 'packing' ? 'border-latam-indigo text-latam-indigo bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Box className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Embalagem</span>
                {relatedPackingInstructions.length > 0 && <span className="ml-1.5 bg-gray-200 text-gray-700 text-[10px] px-1.5 rounded-full">{relatedPackingInstructions.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('variations')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center border-b-2 transition-colors ${activeTab === 'variations' ? 'border-latam-indigo text-latam-indigo bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Globe className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Variações</span>
            </button>
            <button 
                onClick={() => setActiveTab('audit')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center border-b-2 transition-colors ${activeTab === 'audit' ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-500 hover:text-green-600'}`}
            >
                <Shield className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">AUDITORIA LIVE</span>
                <span className="sm:hidden">AUDIT</span>
            </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-8 bg-gray-50/50 flex-grow">
            
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    {/* 1. General Info Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Grupo de Emb.</div>
                            <div className="text-xl font-mono font-bold text-latam-indigo">{data.pg || "N/A"}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Qtd. Excecionada</div>
                            <div className="text-xl font-mono font-bold text-latam-indigo">{data.eq}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Cód. ERG</div>
                            <div className="text-xl font-mono font-bold text-latam-indigo">{data.erg}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-visible">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Disp. Especiais</div>
                            <div className="flex flex-wrap gap-1">
                                {spCodes.length > 0 ? spCodes.map((code: string) => {
                                    const def = SPECIAL_PROVISIONS_DATA.find(s => s.code === code);
                                    return (
                                    <div key={code} className="group relative">
                                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded cursor-help border border-indigo-100 hover:bg-indigo-100 transition-colors">{code}</span>
                                        {def && (
                                            <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs p-3 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                            <div className="font-bold mb-1 text-indigo-300">{def.code}</div>
                                            {def.text}
                                            {/* Tiny triangle pointer */}
                                            <div className="absolute top-full right-2 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                            </div>
                                        )}
                                    </div>
                                    )
                                }) : <span className="text-sm font-bold text-gray-400">-</span>}
                            </div>
                        </div>
                    </div>

                    {/* 2. Passenger Aircraft Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-100 flex items-center">
                            <Plane className="w-5 h-5 text-blue-600 mr-2" />
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Aeronave de Passageiros</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            {/* Limited Quantity */}
                            <div className="p-5">
                                <div className="flex items-center mb-3">
                                    <Box className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-xs font-bold text-gray-500 uppercase">Quantidade Limitada (Y)</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] text-gray-400 mb-0.5">INSTR. EMBALAGEM</div>
                                        <div className={`font-mono font-bold ${data.lq_pi === 'Forbidden' ? 'text-red-600' : 'text-gray-900 text-lg'}`}>{data.lq_pi}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-400 mb-0.5">LIMITE MÁX.</div>
                                        <div className={`font-mono font-bold ${data.lq_max === 'Forbidden' ? 'text-red-600' : 'text-gray-900 text-lg'}`}>{data.lq_max}</div>
                                    </div>
                                </div>
                            </div>
                            {/* Passenger Standard */}
                            <div className="p-5">
                                <div className="flex items-center mb-3">
                                    <Box className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-xs font-bold text-gray-500 uppercase">Standard (Pax)</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] text-gray-400 mb-0.5">INSTR. EMBALAGEM</div>
                                        <div className={`font-mono font-bold ${data.pax_pi === 'Forbidden' ? 'text-red-600' : 'text-gray-900 text-lg'}`}>{data.pax_pi}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-400 mb-0.5">LIMITE MÁX.</div>
                                        <div className={`font-mono font-bold ${data.pax_max === 'Forbidden' ? 'text-red-600' : 'text-gray-900 text-lg'}`}>{data.pax_max}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Cargo Aircraft Only Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden relative">
                        <div className="bg-orange-50 px-4 py-3 border-b border-orange-100 flex items-center justify-between">
                            <div className="flex items-center">
                                <Plane className="w-5 h-5 text-orange-600 mr-2" />
                                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Somente Carga (CAO)</h3>
                            </div>
                            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Risco Elevado</span>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-[10px] text-gray-400 mb-0.5">INSTR. EMBALAGEM</div>
                                    <div className="font-mono font-bold text-2xl text-gray-900">{data.cao_pi}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400 mb-0.5">LIMITE MÁX.</div>
                                    <div className="font-mono font-bold text-2xl text-gray-900">{data.cao_max}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: PACKING INSTRUCTIONS */}
            {activeTab === 'packing' && (
                <div className="animate-fade-in">
                    {relatedPackingInstructions.length > 0 ? (
                        <div className="space-y-8">
                             {relatedPackingInstructions.map((pi, idx) => (
                                 <div key={idx} className="bg-white border-2 border-gray-800 rounded-lg overflow-hidden">
                                     <div className="bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0 z-10">
                                        <div className="flex items-center">
                                            <span className="font-mono font-bold text-xl mr-3">PI {pi.id}</span>
                                            <span className="text-xs opacity-70 border-l border-white/30 pl-3">{pi.title}</span>
                                        </div>
                                     </div>
                                     <div className="p-5">
                                         {pi.content.map((block, bIdx) => renderSimpleBlock(block, `pi-${idx}-${bIdx}`))}
                                     </div>
                                 </div>
                             ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-gray-700 mb-2">Instrução Não Disponível na Base</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                A Instrução de Embalagem referenciada ({data.pax_pi} / {data.cao_pi}) não consta na base de dados demonstrativa.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: VARIATIONS */}
            {activeTab === 'variations' && (
                <div className="animate-fade-in">
                     <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-yellow-800 text-sm">Variações Aplicáveis</h4>
                            <p className="text-xs text-yellow-700 mt-1">
                                As variações abaixo foram identificadas com base na Classe ou Número UN. Sempre verifique o manual completo do operador.
                            </p>
                        </div>
                     </div>

                     {applicableVariations.length > 0 ? (
                         <div className="space-y-4">
                             {applicableVariations.map((v, idx) => (
                                 <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                     <div className="flex items-center justify-between mb-2">
                                         <div className="flex items-center space-x-2">
                                             <span className="font-mono font-bold text-latam-indigo bg-indigo-50 px-2 py-0.5 rounded text-xs">{v.code}</span>
                                             <span className="text-xs font-bold text-gray-500 uppercase">{v.owner}</span>
                                         </div>
                                     </div>
                                     <p className="text-sm text-gray-700 leading-relaxed">{v.text}</p>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="text-center py-10">
                            <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <h3 className="font-bold text-gray-700">Nenhuma Variação Específica Encontrada</h3>
                            <p className="text-sm text-gray-500">
                                Não foram encontradas variações de Estado ou Operador específicas para este UN na base de dados.
                            </p>
                         </div>
                     )}
                </div>
            )}

            {/* TAB: LIVE AUDIT (NEW FEATURE) */}
            {activeTab === 'audit' && (
                <div className="animate-fade-in flex flex-col h-full">
                    {!auditResult && !isAuditing ? (
                        <div className="flex flex-col items-center justify-center flex-grow py-10">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
                                <Shield className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Auditoria Regulatória em Tempo Real</h3>
                            <p className="text-gray-500 text-center max-w-md mb-8 leading-relaxed">
                                Esta ferramenta utiliza IA conectada à web para cruzar os dados deste UN Number com as últimas atualizações do IATA DGR 2026 e variações de Estado em tempo real.
                            </p>
                            <button 
                                onClick={handleLiveAudit}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-green-200 transition-all flex items-center"
                            >
                                <Sparkles className="w-5 h-5 mr-3" />
                                Iniciar Auditoria Live
                            </button>
                        </div>
                    ) : isAuditing ? (
                        <div className="flex flex-col items-center justify-center flex-grow py-20">
                            <RefreshCw className="w-12 h-12 text-green-600 animate-spin mb-4" />
                            <h3 className="text-lg font-bold text-gray-700">Auditando Fontes Globais...</h3>
                            <p className="text-sm text-gray-500">Verificando IATA.org, FAA e Airlines...</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-green-100 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                                <h3 className="font-bold text-green-800 flex items-center">
                                    <Check className="w-5 h-5 mr-2" />
                                    Resultado da Auditoria
                                </h3>
                                <button onClick={() => setAuditResult(null)} className="text-xs text-green-700 hover:underline">Nova Busca</button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-grow">
                                <div className="prose prose-sm max-w-none text-gray-700">
                                    <div className="whitespace-pre-line">{auditResult?.text}</div>
                                </div>
                                
                                {auditResult?.sources && auditResult.sources.length > 0 && (
                                    <div className="mt-8 pt-4 border-t border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center">
                                            <Globe className="w-3 h-3 mr-1" /> Fontes Verificadas
                                        </h4>
                                        <div className="space-y-2">
                                            {auditResult.sources.map((s, i) => (
                                                <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center text-xs text-blue-600 hover:underline bg-blue-50 p-2 rounded">
                                                    <ExternalLink className="w-3 h-3 mr-2 flex-shrink-0" />
                                                    <span className="truncate">{s.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Disclaimer Footer (All Tabs) */}
            {activeTab !== 'overview' && activeTab !== 'audit' && (
                <div className="flex items-start text-xs text-gray-400 bg-gray-100/50 p-3 rounded-lg mt-auto">
                    <Info className="w-3 h-3 mr-2 flex-shrink-0 mt-0.5" />
                    <p>Documento de referência. A conformidade final é responsabilidade do expedidor.</p>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default UNDetailModal;
