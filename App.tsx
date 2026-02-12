

import React, { useState, useEffect } from 'react';
import { Plane, Search, ShieldCheck, ArrowRight, Sparkles, Bot, AlertTriangle, X, Settings, CheckCircle } from 'lucide-react';
import { DGR_CHAPTERS, APP_VERSION } from './constants';
import { DGRChapter, ViewState, DGRTable } from './types';
import ChapterCard from './components/ChapterCard';
import ChapterDetail from './components/ChapterDetail';
import AISearchModal from './components/AISearchModal';
import ComplianceDashboard from './components/ComplianceDashboard';
import { getRegulatoryConfig } from './services/regulatoryService';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedChapter, setSelectedChapter] = useState<DGRChapter | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [aiStatus, setAiStatus] = useState<'checking' | 'online'>('checking');
  const [initialScrollId, setInitialScrollId] = useState<string | null>(null);
  
  // Regulatory Config State
  const [regConfig, setRegConfig] = useState(getRegulatoryConfig());
  // Initialize based on config status so it doesn't show if already verified
  const [showDisclaimer, setShowDisclaimer] = useState(getRegulatoryConfig().validationStatus !== 'VERIFIED_OPERATIONAL');

  // Sync state whenever regulatory config changes
  const refreshConfig = () => {
      const newConfig = getRegulatoryConfig();
      setRegConfig(newConfig);
      // Auto-hide disclaimer if operational
      if (newConfig.validationStatus === 'VERIFIED_OPERATIONAL') {
          setShowDisclaimer(false);
      } else {
          setShowDisclaimer(true);
      }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'navigateToPI') {
        const { chapterId, sectionId } = event.data;
        const chapter = DGR_CHAPTERS.find(c => c.id === chapterId);
        if (chapter) {
          setSelectedChapter(chapter);
          setViewState(ViewState.CHAPTER_DETAIL);
          setInitialScrollId(sectionId);
          setIsAiModalOpen(false); // Close any open modals
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Handle scroll for header transparency effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate AI System Check
  useEffect(() => {
    const timer = setTimeout(() => {
      setAiStatus('online');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleChapterClick = (chapter: DGRChapter) => {
    setSelectedChapter(chapter);
    setViewState(ViewState.CHAPTER_DETAIL);
    window.scrollTo(0, 0);
  };

  const handleBackToDashboard = () => {
    setSelectedChapter(null);
    setViewState(ViewState.DASHBOARD);
  };

  // Deep Search Logic
  const filteredChapters = DGR_CHAPTERS.filter(chapter => {
    const lowerTerm = searchTerm.toLowerCase();
    
    // 1. Check basic metadata
    if (chapter.title.toLowerCase().includes(lowerTerm) || chapter.id.toString().includes(searchTerm)) {
        return true;
    }

    // 2. Deep Content Search (Sections & Blocks)
    return chapter.sections.some(section => {
        // Check section title
        if (section.title.toLowerCase().includes(lowerTerm)) return true;

        // Check blocks content
        return section.blocks.some(block => {
            // Text Search
            if (block.type === 'paragraph' && (block.content as string).toLowerCase().includes(lowerTerm)) return true;
            
            // Deep Table Search (Crucial for Table 4.2)
            if (block.type === 'table') {
                const table = block.content as DGRTable;
                return table.rows.some(row => 
                    row.some(cell => String(cell).toLowerCase().includes(lowerTerm))
                );
            }
            
            return false;
        });
    });
  });

  const isHeaderActive = scrolled || viewState !== ViewState.DASHBOARD;

  if (viewState === ViewState.COMPLIANCE_ADMIN) {
      return <ComplianceDashboard 
                onClose={() => setViewState(ViewState.DASHBOARD)} 
                onStatusChange={refreshConfig} 
             />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-latam-text bg-latam-bg transition-all duration-300">
      
      {/* Safety Disclaimer Banner - ONLY shown if Unverified */}
      {showDisclaimer && regConfig.validationStatus !== 'VERIFIED_OPERATIONAL' && (
        <div className="bg-yellow-400 text-yellow-900 px-4 py-3 relative z-50 shadow-md">
          <div className="container mx-auto flex items-start justify-center pr-8">
            <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm font-bold">
              <span className="uppercase block md:inline md:mr-2">Ambiente de Simulação:</span>
              <span className="font-medium">
                Os dados regulatórios apresentados são gerados proceduralmente.
                <span className="underline ml-1">Não utilize para embarques operacionais reais até validação.</span>
              </span>
            </div>
            <button 
              onClick={() => setShowDisclaimer(false)}
              className="absolute right-4 top-2 p-1 hover:bg-yellow-500 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modern Sticky Header with Glassmorphism and Gradient */}
      <header 
        className={`fixed left-0 right-0 z-40 transition-all duration-500 ease-in-out ${
          isHeaderActive
            ? 'bg-gradient-to-r from-latam-indigo via-[#2e1065] to-latam-coral shadow-lg backdrop-blur-lg py-3 border-b border-white/10 top-0' 
            : `bg-transparent py-5 ${showDisclaimer && regConfig.validationStatus !== 'VERIFIED_OPERATIONAL' ? 'top-12' : 'top-0'}`
        }`}
      >
        <div className="container mx-auto px-6 h-12 flex items-center justify-between text-white relative">
          
          {/* LEFT COLUMN: Logo Area */}
          <div className="flex-1 flex items-center justify-start min-w-0 z-30">
            <div 
                className="flex items-center space-x-3 cursor-pointer group shrink-0"
                onClick={handleBackToDashboard}
            >
                <div className={`p-1.5 rounded-lg transition-colors duration-300 ${isHeaderActive ? 'bg-white/20' : 'bg-white/10 backdrop-blur-sm'}`}>
                <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight leading-none">IATA DGR</h1>
                <div className="flex items-center space-x-2">
                    <div className="text-[10px] opacity-80 uppercase tracking-[0.2em] font-medium">Ferramenta de Referência</div>
                    {regConfig.validationStatus === 'VERIFIED_OPERATIONAL' && (
                        <span className="bg-green-500 text-[9px] px-1.5 py-0.5 rounded text-white font-bold tracking-wider">VALIDADO</span>
                    )}
                </div>
                </div>
            </div>
          </div>

          {/* CENTER COLUMN: Search Bar (Flexbox Centered) */}
          <div className="flex-1 flex items-center justify-center z-20 hidden md:flex">
            <div className={`relative w-full max-w-lg transition-all duration-500 transform ${
                isHeaderActive ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
            }`}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-white/60" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar..."
                className="block w-full pl-11 pr-11 py-2.5 border border-white/20 rounded-full leading-5 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/40 focus:border-white/40 sm:text-sm transition-all shadow-lg backdrop-blur-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <button
                    onClick={() => setSearchTerm('')}
                    className="p-1 text-white/50 hover:text-white hover:bg-white/20 rounded-full"
                    title="Limpar busca"
                    >
                    <X className="w-4 h-4" />
                    </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Actions */}
          <div className="flex-1 flex items-center justify-end space-x-4 min-w-0 z-30">
            
            {/* AI Status Indicator */}
            <div className={`flex flex-col items-end md:items-start justify-center md:border-l md:pl-4 transition-colors duration-300 ${isHeaderActive ? 'border-white/20' : 'border-white/20'}`}>
                <div className="flex items-center space-x-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${aiStatus === 'online' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${aiStatus === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    </span>
                    <span className={`text-[10px] font-bold tracking-wider uppercase text-white shadow-sm`}>
                        {aiStatus === 'online' ? 'IA ONLINE' : 'VERIFICANDO'}
                    </span>
                </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {viewState === ViewState.DASHBOARD ? (
        <>
          {/* Parallax Hero Section */}
          <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-24">
            {/* Background Image with Parallax Class */}
            <div 
              className="absolute inset-0 parallax-bg z-0"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")',
              }}
            ></div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-latam-indigo/90 via-[#2e1065]/80 to-latam-coral/80 z-10"></div>
            
            {/* Hero Content */}
            <div className="relative z-40 container mx-auto px-6 text-center text-white">
              <div className="inline-block px-3 py-1 mb-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-semibold tracking-wider uppercase text-white/90 animate-fade-in-up">
                {APP_VERSION}
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                Regulamentação de <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Mercadorias Perigosas</span>
              </h2>
              <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                A referência global para o transporte aéreo de mercadorias perigosas e o único padrão reconhecido pelas companhias aéreas.
              </p>

              {/* Validation Status Indicator (Large) */}
              {regConfig.validationStatus === 'VERIFIED_OPERATIONAL' && (
                  <div className="inline-flex items-center bg-green-500/20 border border-green-400/50 backdrop-blur-md px-4 py-2 rounded-full mb-8 animate-fade-in-up" style={{animationDelay: '0.25s'}}>
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-sm font-bold text-white tracking-wide">BASE DE DADOS OPERACIONAL VERIFICADA</span>
                  </div>
              )}

              {/* Big Central Search Bar */}
              <div className="max-w-2xl mx-auto relative group animate-fade-in-up z-40" style={{animationDelay: '0.3s'}}>
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400 group-focus-within:text-latam-coral transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquise por palavra-chave, número UN (ex: 3481) ou capítulo..."
                  className="block w-full pl-14 pr-12 py-4 md:py-5 rounded-xl text-base md:text-lg bg-white shadow-2xl border-none outline-none text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-latam-indigo/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <button
                        onClick={() => setSearchTerm('')}
                        className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                        title="Limpar busca"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Cards Grid Section - Overlapping Hero */}
          <main className="relative z-30 container mx-auto px-6 -mt-10 md:-mt-20 pb-20">
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8`}>
              {filteredChapters.map((chapter, index) => (
                <div key={chapter.id} className="animate-fade-in-up" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                  <ChapterCard 
                    chapter={chapter} 
                    onClick={handleChapterClick} 
                  />
                </div>
              ))}
            </div>

            {filteredChapters.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Nenhum capítulo encontrado correspondente a "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-latam-coral font-medium hover:underline"
                >
                  Limpar filtro
                </button>
              </div>
            )}
          </main>
        </>
      ) : (
        <div className={`bg-gray-50 min-h-screen transition-all duration-300 ${showDisclaimer && regConfig.validationStatus !== 'VERIFIED_OPERATIONAL' ? 'pt-32' : 'pt-20'}`}>
          <main className="container mx-auto px-4 py-6 min-h-[calc(100vh-80px)]">
            {selectedChapter && (
              <ChapterDetail 
                chapter={selectedChapter} 
                onBack={handleBackToDashboard} 
                initialSearchTerm={searchTerm}
                initialScrollId={initialScrollId}
                onClearInitialScroll={() => setInitialScrollId(null)}
              />
            )}
          </main>
        </div>
      )}

      {/* Floating Action Button for AI (Persistent) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsAiModalOpen(true)}
          className="group relative bg-latam-coral text-white p-4 rounded-full shadow-xl shadow-latam-coral/30 hover:bg-latam-coralHover transition-all duration-300 hover:scale-110 flex items-center justify-center ring-4 ring-white/20"
          title="Assistente IA"
        >
          <Bot className="w-8 h-8" />
          
          {/* Tooltip Label */}
          <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none transform translate-x-2 group-hover:translate-x-0 transition-transform shadow-lg">
            Assistente IA
          </span>
          
          {/* Notification Dot */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-500 border-2 border-latam-coral"></span>
          </span>
        </button>
      </div>

      {/* AI Modal */}
      <AISearchModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
               <Plane className="w-4 h-4 text-latam-indigo" />
               <span className="font-medium text-latam-indigo">Ferramenta de Referência IATA DGR</span>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p>Baseado no IATA DGR {APP_VERSION} ({regConfig.validationStatus === 'VERIFIED_OPERATIONAL' ? 'Validado' : 'Simulação'})</p>
              <div className="flex space-x-4 mt-2 text-xs items-center">
                <a href="#" className="hover:text-latam-indigo transition-colors">Privacidade</a>
                <a href="#" className="hover:text-latam-indigo transition-colors">Termos</a>
                <button 
                    onClick={() => setViewState(ViewState.COMPLIANCE_ADMIN)}
                    className="hover:text-latam-indigo transition-colors flex items-center"
                    title="Acesso Administrativo"
                >
                    <Settings className="w-3 h-3 mr-1" />
                    Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
