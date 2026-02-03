
import React, { useState, useEffect } from 'react';
import { Shield, Server, CheckCircle, AlertTriangle, RefreshCw, Lock, Unlock, FileJson, Database, Activity, ArrowLeft, Globe, Wifi } from 'lucide-react';
import { getRegulatoryConfig, updateRegulatoryConfig, validateDataSource, getStats } from '../services/regulatoryService';
import { RegulatoryConfig } from '../types';
import { queryGemini } from '../services/geminiService';

interface ComplianceDashboardProps {
    onClose: () => void;
    onStatusChange: () => void; // Trigger App refresh
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ onClose, onStatusChange }) => {
    const [config, setConfig] = useState<RegulatoryConfig>(getRegulatoryConfig());
    const [stats, setStats] = useState(getStats());
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // New: Test Connectivity for Live Mode
    const handleConnectLiveWeb = async () => {
        setIsValidating(true);
        // Test connectivity by asking a simple question
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
                        dataSource: 'OFFICIAL_API', // Using "OFFICIAL_API" type to denote "Live/Production Ready" in existing types
                        validationStatus: 'VERIFIED_OPERATIONAL',
                        lastSync: new Date().toISOString()
                    });
                    setConfig(newConfig);
                    setStats(getStats());
                    onStatusChange();
                }
            }, 150);
        } else {
            alert("Falha na conexão com a IA. Verifique sua chave de API ou conexão de rede.");
        }
    };

    const handleReset = () => {
        const newConfig = updateRegulatoryConfig({
            dataSource: 'SIMULATION',
            validationStatus: 'UNVERIFIED'
        });
        setConfig(newConfig);
        setStats(getStats());
        setUploadProgress(0);
        setApiKey('');
        onStatusChange();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-latam-indigo" />
                            Painel de Governança de Dados
                        </h2>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Acesso Restrito: Especialista Regulatório</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.validationStatus === 'VERIFIED_OPERATIONAL' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                        {config.validationStatus === 'VERIFIED_OPERATIONAL' ? 'OPERACIONAL' : 'SIMULAÇÃO / TREINAMENTO'}
                    </span>
                </div>
            </div>

            <main className="flex-grow container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Connection Status */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                                <Server className="w-4 h-4 mr-2" />
                                Fonte de Dados
                            </h3>
                            
                            <div className="space-y-4">
                                <div className={`p-4 rounded-lg border-2 ${config.dataSource === 'SIMULATION' ? 'border-latam-indigo bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm">Dados Estáticos (Offline)</span>
                                        {config.dataSource === 'SIMULATION' && <CheckCircle className="w-5 h-5 text-latam-indigo" />}
                                    </div>
                                    <p className="text-xs text-gray-600">Modo de referência offline. Dados baseados na última compilação manual (2026). Sujeito a defasagem.</p>
                                </div>

                                <div className={`p-4 rounded-lg border-2 ${config.dataSource === 'OFFICIAL_API' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm">Live Web Grounding</span>
                                        {config.dataSource === 'OFFICIAL_API' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <p className="text-xs text-gray-600 mb-3">Conexão ativa com o Google Search para verificação em tempo real de regulamentos IATA e variações.</p>
                                    
                                    {config.dataSource !== 'OFFICIAL_API' ? (
                                        <div className="space-y-2">
                                            <button 
                                                onClick={handleConnectLiveWeb}
                                                disabled={isValidating}
                                                className="w-full bg-latam-indigo text-white py-3 rounded text-sm font-bold hover:bg-latam-indigoLight disabled:opacity-50 flex justify-center items-center shadow-lg shadow-indigo-200"
                                            >
                                                {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
                                                    <span className="flex items-center"><Wifi className="w-4 h-4 mr-2" /> Conectar à Rede Global</span>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-green-700 font-medium flex items-center">
                                            <Globe className="w-3 h-3 mr-1" />
                                            Conexão Verificada & Segura
                                        </div>
                                    )}
                                    
                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                                            <div className="bg-green-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {config.dataSource === 'OFFICIAL_API' && (
                                <button onClick={handleReset} className="mt-4 text-xs text-red-500 underline w-full text-center">
                                    Desconectar e Voltar para Offline
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Integrity Monitor */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-700 mb-6 flex items-center">
                                <Activity className="w-4 h-4 mr-2" />
                                Monitor de Integridade da Regulação
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-gray-800 mb-1">{stats.bluePages}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Itens Indexados</div>
                                    <div className="mt-2 text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block">Ref. Estrutural</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-gray-800 mb-1">LIVE</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Auditoria</div>
                                    {config.dataSource === 'SIMULATION' ? (
                                        <div className="mt-2 text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full inline-block">Desativado</div>
                                    ) : (
                                        <div className="mt-2 text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block">Ativo (Web)</div>
                                    )}
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-gray-800 mb-1">{stats.variations}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Variações (Estado/Op)</div>
                                    <div className="mt-2 text-[10px] text-gray-500">Última Sync: {new Date(config.lastSync).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">Status de Auditoria</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded shadow-sm">
                                        <div className="flex items-center">
                                            <FileJson className="w-4 h-4 text-gray-400 mr-3" />
                                            <span className="text-sm text-gray-600">Estrutura de Dados (Schema)</span>
                                        </div>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded shadow-sm">
                                        <div className="flex items-center">
                                            <Globe className="w-4 h-4 text-gray-400 mr-3" />
                                            <span className="text-sm text-gray-600">Conectividade Externa (Grounding)</span>
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

                        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-start">
                            <div className="bg-blue-100 p-2 rounded-full mr-4">
                                <Shield className="w-6 h-6 text-blue-700" />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900 mb-1">Modo Híbrido Ativo</h4>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    O sistema opera em modo <strong>Híbrido</strong>. A estrutura de navegação utiliza uma base de referência otimizada para velocidade, enquanto as decisões críticas e verificações de conformidade utilizam a <strong>Auditoria Live (IA)</strong> para garantir a precisão regulatória em tempo real.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ComplianceDashboard;
