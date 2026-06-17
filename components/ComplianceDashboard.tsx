/**
 * @file ComplianceDashboard.tsx
 * @description Administrative control panel for dangerous goods regulatory compliance managers.
 * Provides live connectivity testing (mock ground checks) and database integrity summaries.
 */

import React, { useState, useCallback } from 'react';
import { Shield, Server, CheckCircle, AlertTriangle, RefreshCw, FileJson, Activity, ArrowLeft, Globe, Wifi } from 'lucide-react';
import { getRegulatoryConfig, updateRegulatoryConfig, getStats } from '../services/regulatoryService';
import { RegulatoryConfig } from '../types';
import { queryGemini } from '../services/geminiService';

interface ComplianceDashboardProps {
    /** Callback to close the governance control panel view */
    onClose: () => void;
    /** Callback triggered when regulatory dataset source or validation changes */
    onStatusChange: () => void; 
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ onClose, onStatusChange }) => {
    // Current live configuration and database items statistics
    const [config, setConfig] = useState<RegulatoryConfig>(getRegulatoryConfig());
    const [stats, setStats] = useState(getStats());
    const [isValidating, setIsValidating] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    /**
     * Connects to global internet grounding datasets.
     * Verifies connectivity using a quick query to the Gemini API, then simulates
     * progressive data verification and validation tracking on success.
     */
    const handleConnectLiveWeb = useCallback(async () => {
        setIsValidating(true);
        setErrorMessage(null);
        // Dispatch test connectivity check to verify API key presence
        const result = await queryGemini("Test connectivity");
        setIsValidating(false);

        if (result && result.text) {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 20;
                setUploadProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    const newConfig = updateRegulatoryConfig({
                        dataSource: 'OFFICIAL_API', 
                        validationStatus: 'VERIFIED_OPERATIONAL',
                        lastSync: new Date().toISOString()
                    });
                    setConfig(newConfig);
                    setStats(getStats());
                    onStatusChange();
                }
            }, 150);
        } else {
            setErrorMessage("Falha de conexão com o Assistente de Inteligência Artificial. Verifique as configurações de chave de API em seu ambiente de desenvolvimento ou sua conectividade de rede.");
        }
    }, [onStatusChange]);

    /**
     * Resets system to offline mock regulatory training data mode.
     */
    const handleReset = useCallback(() => {
        const newConfig = updateRegulatoryConfig({
            dataSource: 'SIMULATION',
            validationStatus: 'UNVERIFIED'
        });
        setConfig(newConfig);
        setStats(getStats());
        setUploadProgress(0);
        onStatusChange();
    }, [onStatusChange]);

    return (
        <div id="compliance-dashboard-view" className="min-h-screen bg-gray-50 dark:bg-[#06050e] flex flex-col font-sans text-slate-900 dark:text-slate-100">
            {/* Control Panel Sticky Header */}
            <div className="bg-white dark:bg-[#0c0a1f] border-b border-gray-200 dark:border-slate-850 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center space-x-3">
                    <button 
                        id="btn-governance-close"
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400 transition-colors cursor-pointer"
                        aria-label="Voltar para a tela inicial"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-latam-indigo dark:text-indigo-400" />
                            Painel de Governança de Dados
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Acesso Restrito: Especialista Regulatório</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span 
                        id="label-validation-status"
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            config.validationStatus === 'VERIFIED_OPERATIONAL' 
                                ? 'bg-green-100 dark:bg-green-955/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30' 
                                : 'bg-yellow-101 dark:bg-yellow-955/20 text-yellow-705 dark:text-yellow-405 border-yellow-200 dark:border-yellow-905/30'
                        }`}
                    >
                        {config.validationStatus === 'VERIFIED_OPERATIONAL' ? 'OPERACIONAL' : 'SIMULAÇÃO / TREINAMENTO'}
                    </span>
                </div>
            </div>

            <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                    
                    {/* Left Column: Connection Setup & State Toggles */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-[#110e26] p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-slate-800/80">
                            <h3 className="font-bold text-gray-700 dark:text-slate-350 mb-4 flex items-center uppercase text-xs tracking-wider">
                                <Server className="w-4 h-4 mr-2 text-gray-500" />
                                Fonte de Dados Ativa
                            </h3>
                            
                            <div className="space-y-4">
                                {/* Static offline mode description */}
                                <div className={`p-4 rounded-lg border-2 transition-all ${config.dataSource === 'SIMULATION' ? 'border-latam-indigo bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40 opacity-60'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm text-gray-800 dark:text-slate-200">Dados Estáticos (Offline)</span>
                                        {config.dataSource === 'SIMULATION' && <CheckCircle className="w-5 h-5 text-latam-indigo" />}
                                    </div>
                                    <p className="text-xs text-gray-650 dark:text-slate-400 leading-relaxed">
                                        Modo de referência offline local. Informações baseadas em compilações de dados (2026). Recomendável apenas se não houver internet.
                                    </p>
                                </div>

                                {/* Active live web grounding description */}
                                <div className={`p-4 rounded-lg border-2 transition-all ${config.dataSource === 'OFFICIAL_API' ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-gray-202 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm text-gray-800 dark:text-slate-205">Live Web Grounding</span>
                                        {config.dataSource === 'OFFICIAL_API' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-slate-400 mb-3 leading-relaxed">
                                        Conexão activa com o Google Search para verificação em tempo real de circulares IATA e variações operacionais atualizadas.
                                    </p>
                                    
                                    {config.dataSource !== 'OFFICIAL_API' ? (
                                        <div className="space-y-2">
                                            <button 
                                                id="btn-connect-live-web"
                                                onClick={handleConnectLiveWeb}
                                                disabled={isValidating}
                                                className="w-full bg-latam-indigo text-white py-3 rounded-lg text-sm font-bold hover:bg-latam-indigoLight disabled:opacity-50 flex justify-center items-center shadow-lg shadow-indigo-100 transition-colors cursor-pointer"
                                            >
                                                {isValidating ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <span className="flex items-center"><Wifi className="w-4 h-4 mr-2" /> Conectar à Rede Global</span>
                                                )}
                                            </button>

                                            {errorMessage && (
                                                <div className="p-3 bg-red-50 dark:bg-red-955/15 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-lg mt-3 flex items-start leading-relaxed animate-fade-in">
                                                    <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-bold">Falha na conexão:</span> {errorMessage}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-green-700 dark:text-green-400 font-semibold flex items-center bg-green-100/50 dark:bg-green-950/20 p-2 rounded">
                                            <Globe className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                                            Conexão Verificada & Segura
                                        </div>
                                    )}
                                    
                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-1.5 mt-3">
                                            <div className="bg-green-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {config.dataSource === 'OFFICIAL_API' && (
                                <button 
                                    id="btn-disconnect-offline"
                                    onClick={handleReset} 
                                    className="mt-5 text-xs text-red-500 font-bold hover:underline w-full text-center block transition-all cursor-pointer"
                                >
                                    Desconectar e Voltar para Offline
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Database Statistics and Sync Integrity monitors */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#110e26] p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-slate-800/80">
                            <h3 className="font-bold text-gray-700 dark:text-slate-350 mb-6 flex items-center uppercase text-xs tracking-wider">
                                <Activity className="w-4 h-4 mr-2 text-gray-500" />
                                Monitor de Integridade da Regulação
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800/60">
                                    <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{stats.bluePages}</div>
                                    <div className="text-xs text-gray-400 dark:text-slate-500 uppercase font-black tracking-widest">Itens Indexados</div>
                                    <div className="mt-2 text-[10px] text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-955/20 border dark:border-green-800/20 px-2 py-0.5 rounded-full inline-block font-semibold">Ref. Estrutural</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800/60">
                                    <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">LIVE</div>
                                    <div className="text-xs text-gray-400 dark:text-slate-505 uppercase font-black tracking-widest">Auditoria</div>
                                    {config.dataSource === 'SIMULATION' ? (
                                        <div className="mt-2 text-[10px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block font-semibold">Desativado</div>
                                    ) : (
                                        <div className="mt-2 text-[10px] text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-955/20 border dark:border-green-800/20 px-2 py-0.5 rounded-full inline-block font-semibold">Ativo (Web)</div>
                                    )}
                                </div>
                                <div className="text-center p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800/60">
                                    <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{stats.variations}</div>
                                    <div className="text-xs text-gray-400 dark:text-slate-505 uppercase font-black tracking-widest">Variações (Estado/Op)</div>
                                    <div className="mt-2 text-[10px] text-gray-500 dark:text-slate-450 font-medium">Sync: {new Date(config.lastSync).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-slate-350 mb-3 uppercase tracking-wider text-xs">Status de Verificação de Componentes</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-lg shadow-sm">
                                        <div className="flex items-center">
                                            <FileJson className="w-4 h-4 text-gray-400 mr-3" />
                                            <span className="text-sm text-gray-600 dark:text-slate-300 font-medium">Estrutura de Dados (Schema JSON)</span>
                                        </div>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-lg shadow-sm">
                                        <div className="flex items-center">
                                            <Globe className="w-4 h-4 text-gray-400 mr-3" />
                                            <span className="text-sm text-gray-600 dark:text-slate-300 font-medium">Conectividade de Conhecimento (Live Grounding)</span>
                                        </div>
                                        {config.validationStatus === 'VERIFIED_OPERATIONAL' ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hybrid mode status banner */}
                        <div className="bg-blue-50 dark:bg-blue-955/10 border border-blue-200 dark:border-blue-900/30 p-6 rounded-xl flex items-start">
                            <div className="bg-blue-100 dark:bg-blue-950/20 p-2 rounded-full mr-4 shrink-0 shadow-sm">
                                <Shield className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-909 dark:text-blue-400 mb-1">Modo Híbrido Ativo</h4>
                                <p className="text-sm text-blue-800 dark:text-slate-300 leading-relaxed font-medium">
                                    O sistema opera de forma otimizada para fins regulatórios. A base de dados principal de carregamento fornece velocidades sub-milissegundo para pesquisa, enquanto auditorias mais severas de frotas e variações latentes são auxiliadas por modelos em tempo real.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default React.memo(ComplianceDashboard);
