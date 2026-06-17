import React, { useState } from 'react';
import { 
  ArrowLeft, FileText, CheckSquare, Square, Search, 
  HelpCircle, AlertTriangle, ChevronRight, Info, ShieldCheck, 
  Download, RefreshCw, Eye, Sparkles, BookOpen, Layers
} from 'lucide-react';

interface FdsSection {
  num: number;
  title: string;
  relevance: 'high' | 'medium' | 'low';
  summary: string;
  details: string;
  iataReference: string;
}

const FDS_SECTIONS: FdsSection[] = [
  {
    num: 1,
    title: "Identificação do Produto e da Empresa",
    relevance: "medium",
    summary: "Fornece o nome comercial do produto químico e os dados de contato do fabricante ou importador.",
    details: "Aqui você deve verificar se o nome do produto coincide exatamente com a declaração na minuta do AWB e na Declaração de Mercadorias Perigosas (DGD).",
    iataReference: "IATA DGR 8.1 - Informações do Expedidor"
  },
  {
    num: 2,
    title: "Identificação de Perigos",
    relevance: "high",
    summary: "Apresenta a classificação de perigo do produto segundo o GHS (pictogramas, frases de perigo H e precaução P).",
    details: "Crucial para verificar a presença de pictogramas de inflamabilidade, toxicidade, corrosividade ou perigo ao meio ambiente. Define a palavra de advertência ('Perigo' ou 'Atenção').",
    iataReference: "IATA DGR Seção 3 - Classes de Risco"
  },
  {
    num: 3,
    title: "Composição e Informações sobre os Ingredientes",
    relevance: "low",
    summary: "Se for uma mistura, lista os ingredientes que contribuem para o perigo e suas concentrações.",
    details: "Útil para identificar se existem substâncias controladas ou com regulamentações específicas escondidas em misturas comerciais.",
    iataReference: "IATA DGR 3.0.3 - Misturas e Soluções"
  },
  {
    num: 4,
    title: "Medidas de Primeiros-Socorros",
    relevance: "low",
    summary: "Instruções sobre o que fazer em caso de inalação, contato com a pele, olhos ou ingestão do produto.",
    details: "Relevante para respostas de emergência em solo e bordo. Alinha-se às diretrizes do guia ERG (Emergency Response Guidebook).",
    iataReference: "IATA DGR Seção 9.5.1 / Doc 9284"
  },
  {
    num: 5,
    title: "Medidas de Combate a Incêndio",
    relevance: "low",
    summary: "Identifica os meios de extinção apropriados (água, CO2, pó químico) e perigos específicos do fogo.",
    details: "Indica se o produto reage violentamente com água ou requer agentes extintores especiais a bordo da aeronave.",
    iataReference: "IATA ERG - Procedimentos de Emergência"
  },
  {
    num: 6,
    title: "Medidas de Controle para Derramamento ou Vazamento",
    relevance: "medium",
    summary: "Procedimentos de isolamento, EPIs necessários e métodos de limpeza em caso de vazamento na pista ou aeronave.",
    details: "Essencial para as equipes de rampa da LATAM e aeroportuárias seguirem as diretrizes de contenção e neutralização imediata.",
    iataReference: "IATA DGR Seção 9.4 - Relatórios de Incidentes"
  },
  {
    num: 7,
    title: "Manuseio e Armazenamento",
    relevance: "medium",
    summary: "Condições ideais de armazenamento, incluindo incompatibilidades de empilhamento e limites de temperatura.",
    details: "Fornece bases adicionais para as restrições de armazenamento conjunto em terminais de carga (TECA).",
    iataReference: "IATA DGR Seção 9.3 - Armazenamento e Carregamento"
  },
  {
    num: 8,
    title: "Controle de Exposição e Proteção Individual (EPI)",
    relevance: "low",
    summary: "Especifica os limites de tolerância industrial e os EPIs necessários (luvas, respiradores, óculos de proteção).",
    details: "Informa os operadores terrestres sobre os cuidados no manuseio direto de embalagens avariadas.",
    iataReference: "IATA DGR Seção 9.4 - Precauções Pessoais"
  },
  {
    num: 9,
    title: "Propriedades Físicas e Químicas",
    relevance: "high",
    summary: "Detalhes científicos como estado físico, cor, pH, ponto de ebulição e, principalmente, o Ponto de Fulgor (Flash Point).",
    details: "O Ponto de Fulgor (temperatura mínima na qual um líquido desprende vapores suficientes para inflamar) determina se um solvente, tinta ou perfume é classificado como Líquido Inflamável (Class 3). Se o Ponto de Fulgor for ≤ 60°C, obrigatoriamente é Classe 3.",
    iataReference: "IATA DGR Seção 3.3 - Líquidos Inflamáveis"
  },
  {
    num: 10,
    title: "Estabilidade e Reatividade",
    relevance: "medium",
    summary: "Informa sobre a estabilidade química, reações perigosas possíveis e condições ou materiais incompatíveis.",
    details: "Identifica se a substância sofre polimerização perigosa, oxidação violenta ou se é auto-reativa.",
    iataReference: "IATA DGR 3.4.1 - Substâncias Auto-Reativas"
  },
  {
    num: 11,
    title: "Informações Toxicológicas",
    relevance: "low",
    summary: "Efeitos à saúde em curto, médio e longo prazo (toxicidade aguda LD50, carcinogenicidade).",
    details: "O valor de LD50 (Dose Letal 50) nesta seção classifica e define o Grupo de Embalagem (GE I, II ou III) para substâncias tóxicas da Classe 6.1.",
    iataReference: "IATA DGR Seção 3.6 - Substâncias Tóxicas"
  },
  {
    num: 12,
    title: "Informações Ecológicas",
    relevance: "medium",
    summary: "Efeitos ao meio ambiente (ecotoxicidade na água, persistência, bioacumulação).",
    details: "Determina se a carga deve receber a marcação especial de 'Poluente Marinho' ou risco de 'Perigo ao Meio Ambiente' na etiqueta de embarque.",
    iataReference: "IATA DGR 7.1.5.3 - Substâncias Perigosas para o Meio Ambiente"
  },
  {
    num: 13,
    title: "Considerações sobre Destinação Final",
    relevance: "low",
    summary: "Recomendações detalhadas para o descarte ecológico do produto químico residual ou embalagens usadas.",
    details: "Importante para o descarte de resíduos industriais em conformidade com as legislações locais (IBAMA).",
    iataReference: "Regulamento Nacional de Desíduos Perigosos"
  },
  {
    num: 14,
    title: "Informações sobre Transporte",
    relevance: "high",
    summary: "Seção mais crucial para a aviação! Lista o Número UN, Nome Apropriado para Embarque, Classe de Risco, Grupo de Embalagem e indicações de transporte aéreo/marítimo/terrestre.",
    details: "Atenção Crítica: Muitas FDS brasileiras listam apenas a regulamentação terrestre da ANTT (Resolução 5947). Como operador LATAM, você deve exigir que a FDS cite explicitamente a regulamentação aérea ('ICAO-TI / IATA DGR') para certificar que o produto é de fato aceito e classificado para transporte em aeronaves de passageiro ou apenas de carga.",
    iataReference: "IATA DGR Seção 1.5 & Seção 4.2"
  },
  {
    num: 15,
    title: "Regulamentações",
    relevance: "medium",
    summary: "Lista as legislações aplicáveis ao produto químico (fronteiras controladas pela Polícia Federal, Exército ou IBAMA).",
    details: "Útil para o despacho de cargas controladas nacionalmente que exigem licenças prévias de órgãos públicos brasileiros adicionais à documentação de voo.",
    iataReference: "Policiamentos Federais e Estaduais Aplicáveis"
  },
  {
    num: 16,
    title: "Outras Informações",
    relevance: "low",
    summary: "Siglas utilizadas, referências de normas de elaboração (como ABNT NBR 14725) e advertências de isenção de responsabilidade.",
    details: "Verifique aqui a data de elaboração ou revisão. É altamente recomendado que a FDS tenha sido atualizada ou revisada nos últimos 5 anos.",
    iataReference: "ABNT NBR 14725:2023"
  }
];

const GHS_PICTOGRAMS = [
  {
    id: "flame",
    name: "Inflamável",
    meaning: "Gases, aerossóis, líquidos e sólidos inflamáveis; substâncias auto-aquecíveis; pirofóricas.",
    classRef: "Classe 3 (Líquidos Inflamáveis), Classe 4.1, 4.2, 4.3"
  },
  {
    id: "corrosive",
    name: "Corrosivo",
    meaning: "Corrosão cutânea grave, lesões oculares graves, corrosivo para os metais.",
    classRef: "Classe 8 (Substâncias Corrosivas)"
  },
  {
    id: "skull",
    name: "Tóxico Agudo",
    meaning: "Toxicidade aguda por via oral, dérmica ou inalatória que pode causar fatalidades rapidamente.",
    classRef: "Classe 6.1 (Substâncias Tóxicas)"
  },
  {
    id: "explosion",
    name: "Explosivo",
    meaning: "Explosivos instáveis; substâncias e misturas auto-reativas; peróxidos orgânicos explosivos.",
    classRef: "Classe 1 (Explosivos)"
  },
  {
    id: "environment",
    name: "Perigo ao Meio Ambiente",
    meaning: "Toxicidade aquática aguda ou crônica; perigo de contaminação a ecossistemas fluviais e marinhos.",
    classRef: "Substâncias Perigosas para o Meio Ambiente (Classe 9 / UN 3077, 3082)"
  },
  {
    id: "gas_cylinder",
    name: "Gás sob Pressão",
    meaning: "Gases liquefeitos, comprimidos, dissolvidos ou refrigerados que podem explodir se aquecidos.",
    classRef: "Classe 2.1 (Gás Inflamável), Classe 2.2 (Não-Inflamável)"
  },
  {
    id: "oxidizer",
    name: "Oxidante / Comburente",
    meaning: "Pode provocar ou intensificar incêndios. Age como comburente facilitando a queima.",
    classRef: "Classe 5.1 (Substâncias Oxidantes) e 5.2 (Peróxidos Orgânicos)"
  }
];

export default function FdsExplorer({ onBack }: { onBack: () => void }) {
  const [selectedSection, setSelectedSection] = useState<number>(14);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    idioma: false,
    nbr14725: false,
    secao14Aereo: false,
    unNameMatch: false,
    fulgorCheck: false,
    assinaturaData: false
  });
  const [checklistResults, setChecklistResults] = useState<{
    show: boolean;
    status: 'pass' | 'fail' | 'warn';
    msg: string;
  } | null>(null);

  const toggleChecklist = (key: string) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEvaluateChecklist = () => {
    const totalSelected = Object.values(checklist).filter(Boolean).length;
    
    if (totalSelected === 6) {
      setChecklistResults({
        show: true,
        status: 'pass',
        msg: "✅ FDS EXCELENTE! O documento atende a todos os requisitos normativos para validação em solo. Você pode prosseguir com o processo padrão da Acceptance Checklist utilizando os dados extraídos das Seções 9 e 14."
      });
    } else if (checklist.secao14Aereo === false) {
      setChecklistResults({
        show: true,
        status: 'fail',
        msg: "❌ REJEIÇÃO MANDATÓRIA: A FDS não possui informações de transporte aéreo (IATA DGR / ICAO) na Seção 14 (indicando apenas regras terrestres ANTT). Não é possível atestar a segurança e homologação desta embalagem na aeronave sem consulta prévia ao setor de Dangerous Goods Corporativo da LATAM."
      });
    } else if (totalSelected >= 4) {
      setChecklistResults({
        show: true,
        status: 'warn',
        msg: "⚠️ ATENÇÃO REQUERIDA: Embora a FDS inclua diretrizes essenciais, faltam alguns requisitos de conformidade documental (como referência expressa à ABNT NBR 14725:2023 ou dados detalhados do ponto de fulgor). Recomenda-se solicitar uma FDS atualizada ao expedidor para evitar não-conformidades em auditorias da ANAC."
      });
    } else {
      setChecklistResults({
        show: true,
        status: 'fail',
        msg: "❌ FDS REJEITADA: Faltam muitos pontos cruciais de controle técnico documental. A documentação apresentada é insuficiente para fundamentar a correta classificação de segurança da carga de acordo com o regulamento RBAC 175."
      });
    }
  };

  const handleResetChecklist = () => {
    setChecklist({
      idioma: false,
      nbr14725: false,
      secao14Aereo: false,
      unNameMatch: false,
      fulgorCheck: false,
      assinaturaData: false
    });
    setChecklistResults(null);
  };

  const selectedSecInfo = FDS_SECTIONS.find(s => s.num === selectedSection)!;

  return (
    <div id="fds-explorer-container" className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16 animate-fade-in">
      {/* Upper Navigation Header */}
      <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              id="btn-fds-back"
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-white transition-colors cursor-pointer"
              aria-label="Voltar para o painel principal"
            >
              <ArrowLeft className="w-5 h-5 animate-pulse-slow" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-latam-coral text-white text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded leading-none uppercase">
                  FDS / MSDS / FISPQ
                </span>
                <span className="text-slate-400 text-xs font-bold font-mono">NBR 14725:2023</span>
              </div>
              <h1 className="text-sm md:text-base font-black tracking-tight text-white uppercase mt-0.5">
                Guia de Validação Documental de FDS
              </h1>
            </div>
          </div>
          <button
            onClick={() => {
              // Quick download of mock ANAC NBR checklist or guidelines
              window.print();
            }}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-all"
            id="btn-fds-print"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Imprimir Manual</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-6 w-full flex-grow">
        {/* Concept Introduction Box */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-indigo-50 text-latam-indigo p-4 rounded-2xl shrink-0">
              <FileText className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-slate-900 tracking-tight mb-2">
                O que é a FDS? (Ficha com Dados de Segurança)
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-semibold">
                Anteriormente conhecida no Brasil como <span className="text-latam-indigo font-bold">FISPQ</span> (Ficha de Informações de Segurança de Produtos Químicos), o termo foi formalmente atualizado para <span className="text-latam-indigo font-bold">FDS</span> pela norma <span className="text-slate-800 font-bold">ABNT NBR 14725:2023</span> para se alinhar globalmente com o padrão GHS (*Global Harmonized System*) e as Fichas SDS (*Safety Data Sheet*).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs">
                  <span className="font-bold text-slate-700 block mb-1">🎯 Objetivo no solo (Check-In de Carga)</span>
                  <p className="text-gray-500 font-medium leading-relaxed">Permitir que operadores terrestres LATAM identifiquem com absoluta precisão científica a periculosidade de qualquer item químico apresentado para embarque, garantindo correta segregação, rotulagem e limites de peso por aeronave.</p>
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-700 block mb-1">⚡ Atenção com o Ponto de Fulgor</span>
                  <p className="text-gray-500 font-medium leading-relaxed">Em solventes, esmaltes e tintas combustíveis, o valor exato em graus Celsius do Ponto de Fulgor (DGR Classe 3) determina se o transporte pode ocorrer em aeronaves normais ou se entra nas vedações de voo regulamentares.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tabs Grid: Sections vs Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: 16 Sections of FDS Explorer */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Layers className="w-5 h-5 text-latam-indigo" />
                <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">
                  Estrutura das 16 Seções Normativas da FDS
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-semibold mb-6">
                Clique em uma seção para analisar seus impactos na segurança operacional aeronáutica e referências no regulamento IATA DGR.
              </p>

              {/* Grid of the 16 Sections */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
                {FDS_SECTIONS.map((sec) => {
                  const isSelected = selectedSection === sec.num;
                  const relevanceColors = 
                    sec.relevance === 'high' 
                      ? isSelected ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 border-red-200' 
                      : sec.relevance === 'medium'
                        ? isSelected ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 border-amber-200'
                        : isSelected ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-600 border-slate-100';

                  return (
                    <button
                      key={sec.num}
                      onClick={() => setSelectedSection(sec.num)}
                      className={`text-center py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${relevanceColors} ${
                        isSelected ? 'scale-105 shadow-md border-transparent ring-2 ring-slate-800' : 'hover:-translate-y-0.5'
                      }`}
                      title={sec.title}
                    >
                      <span className="block text-sm">{sec.num}</span>
                      <span className="text-[8px] font-bold tracking-widest uppercase block mt-0.5">
                        {sec.relevance === 'high' ? 'Crítico' : sec.relevance === 'medium' ? 'Médio' : 'Geral'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Detail Presentation Card for the Selected Section */}
              <div className="bg-slate-50/80 rounded-2xl border border-gray-150 p-5 mt-4">
                <div className="flex items-start justify-between border-b border-gray-200/80 pb-3 mb-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Seção Regulamentar {selectedSecInfo.num} de 16
                    </span>
                    <h4 className="text-base font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                      {selectedSecInfo.title}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-1 text-[9px] font-black tracking-wider rounded-full uppercase shrink-0 ${
                    selectedSecInfo.relevance === 'high' 
                      ? 'bg-red-100 text-red-850 border border-red-200' 
                      : selectedSecInfo.relevance === 'medium'
                        ? 'bg-amber-100 text-amber-850 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {selectedSecInfo.relevance === 'high' ? '⚠️ Relevância Alta' : selectedSecInfo.relevance === 'medium' ? 'Importância Média' : 'Uso Geral'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase block tracking-wider">O que este ponto informa</span>
                    <p className="text-xs text-slate-750 font-medium leading-relaxed mt-1">
                      {selectedSecInfo.summary}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-inner">
                    <span className="text-[11px] font-extrabold text-latam-indigo uppercase flex items-center tracking-wider">
                      <HelpCircle className="w-3.5 h-3.5 mr-1 text-latam-coral" /> Impacto na Auditoria de Carga (Check-In)
                    </span>
                    <p className="text-xs text-gray-600 font-semibold leading-relaxed mt-1.5">
                      {selectedSecInfo.details}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200/50">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-bold">Correlação Regulamentar:</span>
                    <span className="font-mono text-[11px] text-slate-800">{selectedSecInfo.iataReference}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pictograms Reference Grid */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="w-5 h-5 text-indigo-500 animate-bounce-slow" />
                <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">
                  Pictogramas GHS (Seção 2 da FDS)
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-semibold mb-4 text-left">
                Estes símbolos devem constar na Seção 2 da FDS e estampar os rótulos de risco afixados nas embalagens de carga.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GHS_PICTOGRAMS.map((pic) => (
                  <div key={pic.id} className="flex gap-3.5 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all text-left">
                    <div className="w-12 h-12 border-2 border-red-500 bg-white rotate-45 flex items-center justify-center shrink-0 shadow-sm">
                      <div className="-rotate-45 font-black text-slate-950 font-mono text-[9px] text-center uppercase tracking-tighter">
                        {pic.id.slice(0, 3)}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{pic.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5">{pic.meaning}</p>
                      <span className="text-[9px] font-bold text-latam-indigo bg-indigo-50/60 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                        {pic.classRef}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: Compliance FDS Checklist Tool (Check if it compiles) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50 p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-latam-coral" />
                <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">
                  Validador Rápido de FDS (Check-In)
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-semibold mb-5 text-left leading-relaxed">
                Utilize este checklist digital para auditar o documento apresentado pelo cliente expedidor antes de prosseguir com a montagem ou despacho.
              </p>

              {/* Checklist inputs */}
              <div className="space-y-3 mb-6">
                
                {/* Item 1 */}
                <button
                  onClick={() => toggleChecklist('idioma')}
                  className="w-full flex items-start text-left p-3 rounded-xl border border-gray-100 hover:border-gray-300 bg-gray-50/30 hover:bg-white transition-all group cursor-pointer"
                >
                  <div className="mt-0.5 mr-3 shrink-0">
                    {checklist.idioma ? (
                      <CheckSquare className="w-5 h-5 text-latam-indigo fill-indigo-50" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-gray-900">1. Documento em Português</h5>
                    <p className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5">Para despacho no território brasileiro (ANAC RBAC 175), a FDS deve estar traduzida e legível em português.</p>
                  </div>
                </button>

                {/* Item 2 */}
                <button
                  onClick={() => toggleChecklist('nbr14725')}
                  className="w-full flex items-start text-left p-3 rounded-xl border border-gray-100 hover:border-gray-300 bg-gray-50/30 hover:bg-white transition-all group cursor-pointer"
                >
                  <div className="mt-0.5 mr-3 shrink-0">
                    {checklist.nbr14725 ? (
                      <CheckSquare className="w-5 h-5 text-latam-indigo fill-indigo-50" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-gray-900">2. Norma Técnica Aplicada</h5>
                    <p className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5">As Seções 15 ou 16 da FDS citam explicitamente conformidade com a norma técnica ABNT NBR 14725.</p>
                  </div>
                </button>

                {/* Item 3 */}
                <button
                  onClick={() => toggleChecklist('secao14Aereo')}
                  className="w-full flex items-start text-left p-3 rounded-xl border border-gray-100 hover:border-gray-300 bg-gray-50/30 hover:bg-white transition-all group cursor-pointer"
                >
                  <div className="mt-0.5 mr-3 shrink-0">
                    {checklist.secao14Aereo ? (
                      <CheckSquare className="w-5 h-5 text-latam-indigo fill-indigo-50" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-gray-900">3. Classificação Aérea Explicada</h5>
                    <p className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5">A Seção 14 inclui explicitamente a via aérea (ICAO-TI / IATA DGR), e não apenas a terrestre (ANTT).</p>
                  </div>
                </button>

                {/* Item 4 */}
                <button
                  onClick={() => toggleChecklist('unNameMatch')}
                  className="w-full flex items-start text-left p-3 rounded-xl border border-gray-100 hover:border-gray-300 bg-gray-50/30 hover:bg-white transition-all group cursor-pointer"
                >
                  <div className="mt-0.5 mr-3 shrink-0">
                    {checklist.unNameMatch ? (
                      <CheckSquare className="w-5 h-5 text-latam-indigo fill-indigo-50" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-gray-900">4. Concordância UN / PSN</h5>
                    <p className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5">O Número UN e o Proper Shipping Name coincidem exatamente com a rotulagem da embalagem.</p>
                  </div>
                </button>

                {/* Item 5 */}
                <button
                  onClick={() => toggleChecklist('fulgorCheck')}
                  className="w-full flex items-start text-left p-3 rounded-xl border border-gray-100 hover:border-gray-300 bg-gray-50/30 hover:bg-white transition-all group cursor-pointer"
                >
                  <div className="mt-0.5 mr-3 shrink-0">
                    {checklist.fulgorCheck ? (
                      <CheckSquare className="w-5 h-5 text-latam-indigo fill-indigo-50" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-gray-900">5. Ponto de Fulgor Declarado</h5>
                    <p className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5">Nas substâncias líquidas, o ponto de fulgor está explicitado na Seção 9 (necessitável para verificação de Classe 3).</p>
                  </div>
                </button>

                {/* Item 6 */}
                <button
                  onClick={() => toggleChecklist('assinaturaData')}
                  className="w-full flex items-start text-left p-3 rounded-xl border border-gray-100 hover:border-gray-300 bg-gray-50/30 hover:bg-white transition-all group cursor-pointer"
                >
                  <div className="mt-0.5 mr-3 shrink-0">
                    {checklist.assinaturaData ? (
                      <CheckSquare className="w-5 h-5 text-latam-indigo fill-indigo-50" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-gray-900">6. Validade Técnica Corrente</h5>
                    <p className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5">Data de elaboração ou última revisão é inferior a 5 anos, contendo informações do RT assinante.</p>
                  </div>
                </button>

              </div>

              {/* Evaluation Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleEvaluateChecklist}
                  className="w-full bg-latam-indigo hover:bg-latam-indigoLight text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer shadow"
                >
                  <span>Analisar Conformidade Documental</span>
                </button>
                <button
                  onClick={handleResetChecklist}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-xl text-xs transition-colors font-bold flex items-center justify-center cursor-pointer border border-gray-200"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Redefinir Auditoria FDS
                </button>
              </div>

              {/* Checklist Output results */}
              {checklistResults && (
                <div className={`mt-5 p-4 rounded-xl border text-xs leading-relaxed animate-fade-in-up text-left font-semibold ${
                  checklistResults.status === 'pass' 
                    ? 'bg-green-50 border-green-200 text-green-850'
                    : checklistResults.status === 'warn'
                      ? 'bg-amber-50 border-amber-200 text-amber-850'
                      : 'bg-red-50 border-red-200 text-red-850'
                }`}>
                  {checklistResults.msg}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
