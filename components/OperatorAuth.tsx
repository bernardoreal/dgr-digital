import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';

interface OperatorAuthProps {
  onAuthenticate: (bp: string) => void;
}

const OperatorAuth: React.FC<OperatorAuthProps> = ({ onAuthenticate }) => {
  const [bpNumber, setBpNumber] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate BP Number (e.g., numeric, 6-8 digits for LATAM employees)
    if (!/^\d{6,8}$/.test(bpNumber)) {
      setError('BP inválido. Insira um número de matrícula válido (ex: 4364898).');
      return;
    }

    if (!acceptedTerms) {
      setError('Você deve aceitar os termos de responsabilidade para continuar.');
      return;
    }

    onAuthenticate(bpNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#06050e] flex flex-col justify-center items-center p-4 font-sans text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md bg-white dark:bg-[#110e26] rounded-3xl shadow-2xl border border-gray-200/80 dark:border-slate-800/80 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-latam-indigo to-[#2e1065] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Autenticação de Operador</h2>
            <p className="text-indigo-200 text-sm font-medium">IATA DGR Reference 2026 - Acesso Restrito</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-400 text-xs font-bold flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="bp" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
              BP / Matrícula
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCheck className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="bp"
                value={bpNumber}
                onChange={(e) => setBpNumber(e.target.value)}
                placeholder="Ex: 4364898"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-latam-indigo outline-none transition-all font-bold text-gray-900 dark:text-white"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded-r-xl">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 text-latam-indigo bg-gray-100 border-gray-300 rounded focus:ring-latam-indigo"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-bold text-amber-900 dark:text-amber-500 cursor-pointer text-xs uppercase tracking-wider">
                  Termo de Responsabilidade
                </label>
                <p className="text-amber-800 dark:text-amber-400/80 text-[10px] mt-1 font-medium leading-relaxed">
                  Reconheço que este aplicativo é uma ferramenta de consulta rápida. O <strong>Manual DGR Físico da IATA</strong> e o <strong>MCOM da LATAM Cargo</strong> são os documentos mandatórios para decisões operacionais, aceitação de cargas e segregação. Confirmo que usarei as informações com o devido discernimento técnico.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-latam-indigo hover:bg-[#2e1065] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Acessar Sistema</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 text-center border-t border-gray-100 dark:border-slate-800">
          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
            LATAM Cargo Compliance & Standards &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperatorAuth;
