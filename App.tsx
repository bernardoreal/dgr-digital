import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { Plane, Search, ShieldCheck, ArrowRight, Sparkles, Bot, AlertTriangle, X, Settings, CheckCircle, Loader2, Zap, BookOpen, FileText, Sun, Moon } from 'lucide-react';
import { DGR_CHAPTERS, APP_VERSION } from './constants';
import { DGRChapter, ViewState, DGRTable, DGRDatabase, RecentQuery } from './types';
import ChapterCard from './components/ChapterCard';
import RecentQueriesPanel from './components/RecentQueriesPanel';
import BookmarksPanel from './components/BookmarksPanel';
import AISearchModal from './components/AISearchModal';
import ComplianceDashboard from './components/ComplianceDashboard';
import DatabasePopup from './components/DatabasePopup';
import OperatorAuth from './components/OperatorAuth';
import { getRegulatoryConfig } from './services/regulatoryService';
import { bootstrapIndexedDB } from './services/storageService';

const ChapterDetail = lazy(() => import('./components/ChapterDetail'));
const AnacLatamAudit = lazy(() => import('./components/AnacLatamAudit'));
const LithiumCalculator = lazy(() => import('./components/LithiumCalculator'));
const AnacQuiz = lazy(() => import('./components/AnacQuiz'));
const FdsExplorer = lazy(() => import('./components/FdsExplorer'));

const findDatabaseById = (id: string, chapters: DGRChapter[] = DGR_CHAPTERS): DGRDatabase | null => {
  for (const chapter of chapters) {
    for (const section of chapter.sections) {
      for (const block of section.blocks) {
        if (block.type === 'database') {
          const db = block.content as DGRDatabase;
          if (db.id === id) {
            return db;
          }
        }
      }
    }
  }
  return null;
};

const App: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tableId = urlParams.get('table');

  if (tableId) {
    const db = findDatabaseById(tableId);
    if (db) {
      const initialFilter: Record<string, string> = {};
      urlParams.forEach((value, key) => {
        if (key.startsWith('filter_')) {
          const filterKey = key.replace('filter_', '');
          initialFilter[filterKey] = value;
        }
      });
      return <DatabasePopup initialDb={db} initialFilter={Object.keys(initialFilter).length > 0 ? initialFilter : undefined} />;
    } else {
      return <div className="p-8 text-center text-red-500 font-bold">Tabela não encontrada.</div>;
    }
  }

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('iata_dgr_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [operatorBP, setOperatorBP] = useState<string | null>(() => {
    try {
      return localStorage.getItem('iata_dgr_operator_bp');
    } catch {
      return null;
    }
  });

  const handleAuthenticate = useCallback((bp: string) => {
    setIsAuthenticated(true);
    setOperatorBP(bp);
    try {
      localStorage.setItem('iata_dgr_authenticated', 'true');
      localStorage.setItem('iata_dgr_operator_bp', bp);
    } catch (e) {
      console.error('Error saving auth state:', e);
    }
  }, []);

  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedChapterId, setSelectedChapterId] = useState<number | string | null>(null);

  const [dgrUpdates, setDgrUpdates] = useState<{hasUpdates: boolean, version: string, date: string, changes: string[], chapterUpdates?: any[]} | null>(null);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [appVersion, setAppVersion] = useState(APP_VERSION);
  const [updateApplied, setUpdateApplied] = useState(false);
  const [chaptersConfig, setChaptersConfig] = useState<DGRChapter[]>(DGR_CHAPTERS);

  // Initialize from IndexedDB for permanent cache
  useEffect(() => {
    bootstrapIndexedDB().then(dbChapters => {
      if (dbChapters) {
        setChaptersConfig(dbChapters);
      }
    });
  }, []);

  const selectedChapter = useMemo(() => {
    if (selectedChapterId === null) return null;
    return chaptersConfig.find(c => c.id === selectedChapterId) || null;
  }, [chaptersConfig, selectedChapterId]);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [aiStatus, setAiStatus] = useState<'checking' | 'online'>('checking');
  const [initialScrollId, setInitialScrollId] = useState<string | null>(null);
  
  // Recent queries state
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>(() => {
    try {
      const stored = localStorage.getItem('iata_dgr_recent_queries_v1');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('iata_dgr_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleBookmark = useCallback((sectionId: string) => {
    setBookmarks(prev => {
      const isBookmarked = prev.includes(sectionId);
      const updated = isBookmarked ? prev.filter(id => id !== sectionId) : [...prev, sectionId];
      try {
        localStorage.setItem('iata_dgr_bookmarks', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving bookmarks:', e);
      }
      return updated;
    });
  }, []);

  const trackRecentQuery = useCallback((type: 'chapter' | 'table', itemId: string | number, title: string, subtitle?: string) => {
    const prefix = type === 'chapter' ? 'Capítulo' : 'Tabela';
    const finalSubtitle = subtitle || `${prefix} ${itemId}`;
    setRecentQueries(prev => {
      const id = `${type}-${itemId}`;
      const filtered = prev.filter(q => q.id !== id);
      const newQuery: RecentQuery = {
        id,
        type,
        itemId,
        title,
        subtitle: finalSubtitle,
        timestamp: Date.now()
      };
      const updated = [newQuery, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('iata_dgr_recent_queries_v1', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving recent queries:', e);
      }
      return updated;
    });
  }, []);
  
  // Regulatory Config State
  const [regConfig, setRegConfig] = useState(getRegulatoryConfig());
  // Initialize based on config status so it doesn't show if already verified
  const [showDisclaimer, setShowDisclaimer] = useState(getRegulatoryConfig().validationStatus !== 'VERIFIED_OPERATIONAL');

  // Dark mode state with localStorage persistence for hangar night-shift operators
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('latam_dgr_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (_) {
      return false;
    }
  });

  // Dark mode class toggle sync
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
        localStorage.setItem('latam_dgr_theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('latam_dgr_theme', 'light');
      }
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  // Sync state whenever regulatory config changes
  const refreshConfig = useCallback(() => {
      const newConfig = getRegulatoryConfig();
      setRegConfig(newConfig);
      // Auto-hide disclaimer if operational
      if (newConfig.validationStatus === 'VERIFIED_OPERATIONAL') {
          setShowDisclaimer(false);
      } else {
          setShowDisclaimer(true);
      }
  }, []);

  // Handle scroll for header transparency effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate AI System Check
  useEffect(() => {
    const timer = setTimeout(() => {
      setAiStatus('online');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const applyUpdatesToChapters = (updatesData: any) => {
    if (!updatesData.chapterUpdates) return;
    setChaptersConfig(prevChapters => {
      const newChapters = [...prevChapters];
      updatesData.chapterUpdates.forEach((chUpdate: any) => {
         const chapterIndex = newChapters.findIndex(c => c.id === chUpdate.chapterId);
         if (chapterIndex >= 0) {
           const chapter = { ...newChapters[chapterIndex] };
           const sectionIndex = chapter.sections.findIndex((s: any) => s.id === chUpdate.sectionId);
           if (sectionIndex >= 0) {
             const section = { ...chapter.sections[sectionIndex] };
             section.blocks = [...section.blocks, ...chUpdate.newBlocks];
             chapter.sections[sectionIndex] = section;
           }
           newChapters[chapterIndex] = chapter;
         }
      });
      return newChapters;
    });
  };

  // Check for DGR updates
  useEffect(() => {
    fetch('/dgr-updates.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.hasUpdates) {
          const appliedVersion = localStorage.getItem('appliedDgrUpdateVersion');
          if (appliedVersion === data.version) {
            // Already applied
            setAppVersion(`${APP_VERSION} + Atualização ${data.version}`);
            applyUpdatesToChapters(data);
          } else {
            setDgrUpdates(data);
          }
        }
      })
      .catch(err => console.log('No DGR updates found or error fetching.'));
  }, []);

  const handleDownloadUpdate = () => {
    if (!dgrUpdates) return;
    setDownloadingUpdate(true);
    // Simulate apply delay
    setTimeout(() => {
      localStorage.setItem('appliedDgrUpdateVersion', dgrUpdates.version);
      
      setDownloadingUpdate(false);
      setUpdateApplied(true);
      setAppVersion(`${APP_VERSION} + Atualização ${dgrUpdates.version}`);
      applyUpdatesToChapters(dgrUpdates);
      
      setTimeout(() => {
         setDgrUpdates(null); // Hide banner after success msg
      }, 3000);
    }, 2000);
  };

  const handleChapterClick = useCallback((chapter: DGRChapter) => {
    setSelectedChapterId(chapter.id);
    setViewState(ViewState.CHAPTER_DETAIL);
    trackRecentQuery('chapter', chapter.id, chapter.title, `Capítulo ${chapter.id}`);
    window.scrollTo(0, 0);
  }, [trackRecentQuery]);

  const handleBackToDashboard = useCallback(() => {
    setSelectedChapterId(null);
    setViewState(ViewState.DASHBOARD);
  }, []);

  // Memoized deep Search Logic computation
  const filteredChapters = useMemo(() => {
    return chaptersConfig.filter(chapter => {
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
              if (block.type === 'table' || block.type === 'database') {
                  const table = block.content as DGRTable | DGRDatabase;
                  const rows = 'rows' in table ? table.rows : table.data;
                  return rows.some(row => 
                      Object.values(row).some(cell => String(cell).toLowerCase().includes(lowerTerm))
                  );
              }
              
              return false;
          });
      });
    });
  }, [searchTerm]);

  const isHeaderActive = scrolled || viewState !== ViewState.DASHBOARD;

  const FullPageLoader = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-latam-indigo animate-spin" />
            <p className="mt-4 text-lg font-semibold text-latam-indigo">Carregando Seção...</p>
        </div>
    </div>
  );

  if (!isAuthenticated) {
    return <OperatorAuth onAuthenticate={handleAuthenticate} />;
  }

  if (viewState === ViewState.COMPLIANCE_ADMIN) {
      return <ComplianceDashboard 
                onClose={() => setViewState(ViewState.DASHBOARD)} 
                onStatusChange={refreshConfig} 
             />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col font-sans text-latam-text bg-latam-bg dark:bg-[#06050e] dark:text-slate-100 transition-all duration-300">
      
      {/* Safety Disclaimer Banner */}
      {(showDisclaimer || regConfig.validationStatus !== 'VERIFIED_OPERATIONAL' || new Date().getFullYear() > 2026) && (
        <div className={`px-4 py-3 relative z-[60] shadow-md ${
          new Date().getFullYear() > 2026 
            ? 'bg-red-600 text-white' 
            : 'bg-yellow-400 text-yellow-900'
        }`}>
          <div className="container mx-auto flex items-start justify-center pr-8">
            <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm font-bold">
              {new Date().getFullYear() > 2026 ? (
                <span>
                  ALERTA DE SEGURANÇA: Esta versão (67ª Edição - 2026) expirou. As regulamentações IATA DGR são renovadas anualmente. Operações baseadas nestes dados configuram infração gravíssima.
                </span>
              ) : (
                <>
                  <span className="uppercase block md:inline md:mr-2">
                    {regConfig.validationStatus !== 'VERIFIED_OPERATIONAL' ? 'Ambiente de Simulação:' : 'Aviso Legal:'}
                  </span>
                  <span className="font-medium">
                    {regConfig.validationStatus !== 'VERIFIED_OPERATIONAL' 
                      ? 'Os dados são simulados. Não utilize para embarques operacionais reais até validação.'
                      : 'Uso restrito. Consulte a edição física atualizada para processamentos críticos.'}
                  </span>
                </>
              )}
            </div>
            {new Date().getFullYear() <= 2026 && (
              <button 
                onClick={() => setShowDisclaimer(false)}
                className="absolute right-4 top-2 p-1 hover:bg-black/10 rounded-full transition-colors"
                title="Fechar Aviso"
              >
                <X className="w-5 h-5" />
              </button>
            )}
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
          <div className={`flex-[2] md:flex-1 flex items-center justify-center z-20 ${
              isHeaderActive ? 'flex mx-2' : 'hidden md:flex'
          }`}>
            <div className={`relative w-full max-w-xs sm:max-w-md md:max-w-lg transition-all duration-500 transform ${
                isHeaderActive ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
            }`}>
              <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none font-sans">
                <Search className="h-3.5 w-3.5 md:h-4 md:w-4 text-white/60" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar..."
                className="block w-full pl-8 md:pl-11 pr-8 md:pr-11 py-1.5 md:py-2.5 border border-white/20 rounded-full leading-5 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/40 focus:border-white/40 text-xs sm:text-sm transition-all shadow-lg backdrop-blur-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                    onClick={() => setSearchTerm('')}
                    className="p-1 text-white/50 hover:text-white hover:bg-white/20 rounded-full"
                    title="Limpar busca"
                    >
                    <X className="w-3.5 h-3.5" />
                    </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Actions */}
          <div className="flex-1 flex items-center justify-end space-x-4 min-w-0 z-30">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(prev => !prev)}
              className="px-3 py-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-all duration-300 flex items-center space-x-2 cursor-pointer border border-white/20 text-xs font-black shrink-0 shadow-sm"
              title={darkMode ? "Ativar Modo Diurno" : "Ativar Modo Noturno (Turno de Hangar / TECA)"}
              aria-label="Alternar modo escuro"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline uppercase tracking-widest text-[9px]">Turno Noite</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-200" />
                  <span className="hidden sm:inline uppercase tracking-widest text-[9px]">Turno Dia</span>
                </>
              )}
            </button>
            
            {/* AI Status Indicator */}
            <div className={`flex flex-col items-end md:items-start justify-center md:border-l md:pl-4 transition-colors duration-300 ${isHeaderActive ? 'border-white/20' : 'border-white/20'}`}>
                <div className="flex items-center space-x-1.5 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${aiStatus === 'online' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${aiStatus === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    </span>
                    <span className={`text-[10px] font-bold tracking-wider uppercase text-white shadow-sm`}>
                        {aiStatus === 'online' ? 'IA ONLINE' : 'VERIFICANDO'}
                    </span>
                </div>
                {operatorBP && (
                  <div className="text-[9px] font-medium text-white/70 uppercase tracking-widest hidden md:block">
                    Ope: {operatorBP}
                  </div>
                )}
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
                {appVersion}
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


            {/* Compliance Portal Section */}
            {searchTerm === '' && (
              <div className="mb-12 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-white drop-shadow-md flex items-center">
                      <ShieldCheck className="w-6 h-6 mr-2 text-latam-coral" />
                      Central de Compliance Operacional (IATA, LATAM & ANAC)
                    </h3>
                    <p className="text-sm text-white/90 drop-shadow font-medium mt-1">
                      Ferramentas integradas para verificação operacional preliminar e validação regulatória de despacho de cargas.
                    </p>
                  </div>
                  <span className="self-start md:self-auto mt-2 md:mt-0 bg-white/10 text-white backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm animate-pulse">
                    Filtros de Solo Ativos
                  </span>
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {/* Card 1: Auditoria */}
                   <div 
                     onClick={() => setViewState(ViewState.ANAC_LATAM_AUDIT)}
                     className="bg-white dark:bg-[#110e26] rounded-2xl border border-gray-200/85 dark:border-slate-800/80 p-6 shadow-xl shadow-gray-200/20 dark:shadow-none hover:shadow-2xl hover:border-latam-indigo/30 hover:-translate-y-1.5 transition-all cursor-pointer group flex flex-col justify-between"
                   >
                     <div>
                       <div className="bg-indigo-50 dark:bg-indigo-950/40 text-latam-indigo dark:text-indigo-300 p-3 rounded-xl inline-block mb-4 group-hover:bg-latam-indigo group-hover:text-white transition-all">
                         <ShieldCheck className="w-6 h-6" />
                       </div>
                       <h4 className="text-base font-black text-gray-900 dark:text-white group-hover:text-latam-indigo dark:group-hover:text-indigo-300 transition-colors mb-2">
                         Auditoria de Carga ANAC RBAC 175
                       </h4>
                       <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-semibold">
                         Gere pareceres digitais de liberação de solo e validação de minuta AWB contra exigências de operador LATAM Cargo.
                       </p>
                     </div>
                     <div className="mt-6 flex items-center font-bold text-xs text-latam-indigo dark:text-indigo-300">
                       <span>Iniciar Auditoria Integrada</span>
                       <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                     </div>
                   </div>

                   {/* Card 2: Calculadora de Lítio */}
                   <div 
                     onClick={() => setViewState(ViewState.LITHIUM_CALCULATOR)}
                     className="bg-white dark:bg-[#110e26] rounded-2xl border border-gray-200/85 dark:border-slate-800/80 p-6 shadow-xl shadow-gray-200/20 dark:shadow-none hover:shadow-2xl hover:border-amber-500/30 hover:-translate-y-1.5 transition-all cursor-pointer group flex flex-col justify-between"
                   >
                     <div>
                       <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 p-3 rounded-xl inline-block mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all">
                         <Zap className="w-6 h-6" />
                       </div>
                       <h4 className="text-base font-black text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-2">
                         Calculadora de Baterias de Lítio
                       </h4>
                       <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-semibold">
                         Calcule limitações de Watt-Hora/gramas na Seção II/IB e monitore vedações específicas (como restrição de baterias soltas TAM/ABSA).
                       </p>
                     </div>
                     <div className="mt-6 flex items-center font-bold text-xs text-amber-600 dark:text-amber-400">
                       <span>Calcular Limites & Regras</span>
                       <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                     </div>
                   </div>

                   {/* Card 3: Treinamento Quiz */}
                   <div 
                     onClick={() => setViewState(ViewState.ANAC_QUIZ)}
                     className="bg-white dark:bg-[#110e26] rounded-2xl border border-gray-200/85 dark:border-slate-800/80 p-6 shadow-xl shadow-gray-200/20 dark:shadow-none hover:shadow-2xl hover:border-latam-coral/30 hover:-translate-y-1.5 transition-all cursor-pointer group flex flex-col justify-between"
                   >
                     <div>
                       <div className="bg-rose-50 dark:bg-rose-950/40 text-latam-coral dark:text-rose-400 p-3 rounded-xl inline-block mb-4 group-hover:bg-latam-coral group-hover:text-white transition-all">
                         <BookOpen className="w-6 h-6" />
                       </div>
                       <h4 className="text-base font-black text-gray-900 dark:text-white group-hover:text-latam-coral dark:group-hover:text-rose-400 transition-colors mb-2">
                         Simulador de Treinamento ANAC
                       </h4>
                       <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-semibold">
                         Treinamento e e-learning rápido de segurança operacional exigido pelas regras de recorrência bienal em solo.
                       </p>
                     </div>
                     <div className="mt-6 flex items-center font-bold text-xs text-latam-coral dark:text-rose-400">
                       <span>Iniciar Quiz de Recorrência</span>
                       <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                     </div>
                   </div>

                   {/* Card 4: FDS / FISPQ Explorer */}
                   <div 
                     onClick={() => setViewState(ViewState.FDS_INFO)}
                     className="bg-white dark:bg-[#110e26] rounded-2xl border border-gray-200/85 dark:border-slate-800/80 p-6 shadow-xl shadow-gray-200/20 dark:shadow-none hover:shadow-2xl hover:border-indigo-600/30 hover:-translate-y-1.5 transition-all cursor-pointer group flex flex-col justify-between"
                   >
                     <div>
                       <div className="bg-indigo-50 dark:bg-indigo-950/40 text-latam-indigo dark:text-indigo-300 p-3 rounded-xl inline-block mb-4 group-hover:bg-latam-indigo group-hover:text-white transition-all">
                         <FileText className="w-6 h-6" />
                       </div>
                       <h4 className="text-base font-black text-gray-900 dark:text-white group-hover:text-latam-indigo dark:group-hover:text-indigo-300 transition-colors mb-2">
                         FDS / FISPQ & GHS Explorer
                       </h4>
                       <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-semibold">
                         Guia de auditoria documental das 16 Seções de Ficha de Segurança segundo a norma ABNT NBR 14725:2023.
                       </p>
                     </div>
                     <div className="mt-6 flex items-center font-bold text-xs text-latam-indigo dark:text-indigo-300">
                       <span>Validar Documento FDS</span>
                       <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                     </div>
                   </div>
                 </div>

                <div className="mt-8 border-t border-dashed border-gray-300 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider gap-4">
                  <span className="text-center sm:text-left">Normas Ativas: IATA DGR Edição 67 - ANAC RBAC 175 - LATAM Operator Variations JJ/LA/UC</span>
                  <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200 animate-pulse shrink-0">Base Validada</span>
                </div>
              </div>
            )}

            {/* Dual Column Layout: Chapters and Recent Queries */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12 md:mt-20">
              
              {/* Chapters List and Grid (Takes 3 columns on large screens) */}
              <div className={`lg:col-span-3 ${
                recentQueries.length === 0 
                  ? 'order-1 lg:order-1' 
                  : 'order-2 lg:order-1'
              }`}>
                <div className="mb-6">
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    Capítulos & Seções do IATA DGR
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mt-1">
                    Manual Normativo estruturado de referência técnica.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredChapters.map((chapter: DGRChapter, index: number) => (
                    <div key={chapter.id} className="animate-fade-in-up" style={{ animationDelay: `${0.05 * (index + 1)}s` }}>
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
              </div>

              {/* Sidebar Panel: Últimas Consultas (Takes 1 column on large screens) */}
              <div className={`lg:col-span-1 flex flex-col ${
                recentQueries.length === 0 && bookmarks.length === 0
                  ? 'hidden lg:flex lg:order-2' 
                  : 'order-1 lg:order-2'
              }`}>
                <BookmarksPanel
                  bookmarks={bookmarks}
                  chaptersConfig={chaptersConfig}
                  onRemoveBookmark={toggleBookmark}
                  onSelectBookmark={(chapterId, sectionId) => {
                    const ch = chaptersConfig.find(c => c.id === chapterId || String(c.id) === String(chapterId));
                    if (ch) {
                      setInitialScrollId(sectionId);
                      handleChapterClick(ch);
                    }
                  }}
                />
                <RecentQueriesPanel
                  recentQueries={recentQueries}
                  onClear={() => {
                    setRecentQueries([]);
                    localStorage.removeItem('iata_dgr_recent_queries_v1');
                  }}
                  onSelectChapter={(chapterId) => {
                    const ch = chaptersConfig.find(c => c.id === chapterId || String(c.id) === String(chapterId));
                    if (ch) handleChapterClick(ch);
                  }}
                  onSelectTable={(dbId) => {
                    // Navigate to dashboard and append the table parameter
                    window.location.href = `/?table=${dbId}`;
                  }}
                />
              </div>

            </div>
          </main>
        </>
      ) : (
        <div className={`bg-gray-50 min-h-screen transition-all duration-300 ${showDisclaimer && regConfig.validationStatus !== 'VERIFIED_OPERATIONAL' ? 'pt-32' : 'pt-20'}`}>
          <main className="container mx-auto px-4 py-6 min-h-[calc(100vh-80px)]">
            <Suspense fallback={<FullPageLoader />}>
                {selectedChapter && viewState === ViewState.CHAPTER_DETAIL && (
                <ChapterDetail 
                    chapter={selectedChapter} 
                    onBack={handleBackToDashboard} 
                    initialSearchTerm={searchTerm}
                    initialScrollId={initialScrollId}
                    onClearInitialScroll={() => setInitialScrollId(null)}
                    onOpenTable={(db) => trackRecentQuery('table', db.id, db.title, db.type === 'blue-pages' ? 'Tabela Azul (4.2)' : 'Tabela Regulamentar')}
                    bookmarks={bookmarks}
                    onToggleBookmark={toggleBookmark}
                />
                )}
                {viewState === ViewState.ANAC_LATAM_AUDIT && (
                  <AnacLatamAudit onClose={handleBackToDashboard} />
                )}
                {viewState === ViewState.LITHIUM_CALCULATOR && (
                  <LithiumCalculator onClose={handleBackToDashboard} />
                )}
                {viewState === ViewState.ANAC_QUIZ && (
                  <AnacQuiz onClose={handleBackToDashboard} />
                )}
                {viewState === ViewState.FDS_INFO && (
                  <FdsExplorer onBack={handleBackToDashboard} />
                )}
            </Suspense>
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
              <p>Baseado no IATA DGR {appVersion} ({regConfig.validationStatus === 'VERIFIED_OPERATIONAL' ? 'Validado' : 'Simulação'})</p>
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
    </ErrorBoundary>
  );
};

export default App;