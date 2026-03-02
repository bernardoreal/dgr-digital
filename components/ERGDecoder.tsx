import React, { useState } from 'react';
import { Search, ShieldAlert, Info, AlertTriangle, Wind, Flame, Droplets } from 'lucide-react';

const ERG_NUMBERS: Record<string, { title: string, description: string, icon: any }> = {
  '1': { title: 'Explosivo', description: 'Risco de explosão em massa ou projeção. Mantenha distância.', icon: Flame },
  '2': { title: 'Gás', description: 'Risco de asfixia ou toxicidade. Use proteção respiratória.', icon: Wind },
  '3': { title: 'Líquido Inflamável', description: 'Risco de incêndio. Evite fontes de ignição.', icon: Flame },
  '4': { title: 'Sólido Inflamável', description: 'Risco de incêndio por fricção ou combustão espontânea.', icon: Flame },
  '5': { title: 'Oxidante', description: 'Pode causar ou intensificar incêndios.', icon: Flame },
  '6': { title: 'Tóxico', description: 'Risco à saúde por inalação, ingestão ou contato com a pele.', icon: ShieldAlert },
  '7': { title: 'Radioativo', description: 'Risco de radiação. Mantenha distância e limite o tempo de exposição.', icon: AlertTriangle },
  '8': { title: 'Corrosivo', description: 'Causa queimaduras severas na pele e danos a metais.', icon: Droplets },
  '9': { title: 'Miscelânea', description: 'Riscos variados, incluindo baterias de lítio e substâncias perigosas ao meio ambiente.', icon: Info },
  '10': { title: 'Gás Inflamável', description: 'Risco extremo de incêndio e explosão.', icon: Flame },
  '11': { title: 'Infeccioso', description: 'Risco biológico. Evite qualquer contato.', icon: ShieldAlert },
  '12': { title: 'Baterias de Lítio', description: 'Risco de incêndio e fuga térmica. Não use água se houver metal exposto.', icon: Flame }
};

const ERG_LETTERS: Record<string, string> = {
  'A': 'Anestésico',
  'C': 'Corrosivo',
  'E': 'Explosivo',
  'F': 'Inflamável',
  'H': 'Altamente Inflamável',
  'L': 'Baixo Risco (Outros)',
  'M': 'Magnético',
  'N': 'Nocivo',
  'P': 'Tóxico (Poison)',
  'S': 'Combustão Espontânea',
  'W': 'Perigoso quando molhado',
  'X': 'Oxidante',
  'Z': 'Risco Múltiplo'
};

const ERGDecoder: React.FC = () => {
  const [code, setCode] = useState('');

  const parseCode = (input: string) => {
    const clean = input.trim().toUpperCase();
    if (!clean) return null;

    const match = clean.match(/^(\d+)([A-Z]+)$/);
    if (!match) return null;

    const num = match[1];
    const letters = match[2].split('');

    const primary = ERG_NUMBERS[num];
    const secondary = letters.map(l => ({ letter: l, meaning: ERG_LETTERS[l] || 'Desconhecido' }));

    if (!primary) return null;

    return { primary, secondary };
  };

  const result = parseCode(code);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden my-8 font-sans">
      <div className="bg-gray-900 text-white p-6 border-b-4 border-latam-coral">
        <div className="flex items-center">
          <ShieldAlert className="w-6 h-6 mr-3 text-latam-coral" />
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">
              Decodificador ERG (Emergency Response Drill Code)
            </h3>
            <p className="text-gray-400 text-sm mt-1 font-medium">
              Traduza os códigos ERG encontrados na DGD ou NOTOC para instruções de emergência.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-md mx-auto mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Insira o Código ERG (ex: 3L, 10P, 12FZ)
          </label>
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: 3L"
              className="w-full text-2xl font-black uppercase tracking-widest pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-latam-indigo focus:ring-4 focus:ring-latam-indigo/20 transition-all outline-none"
              maxLength={5}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          </div>
        </div>

        {code && !result && (
          <div className="text-center p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold">
            Código ERG inválido ou não reconhecido. Formato esperado: Número + Letra(s) (ex: 3L).
          </div>
        )}

        {result && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex items-start">
              <div className="bg-latam-indigo text-white p-3 rounded-lg mr-4">
                <result.primary.icon className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Risco Principal</h4>
                <h5 className="text-2xl font-black text-indigo-900 mb-2">{result.primary.title}</h5>
                <p className="text-indigo-800 font-medium leading-relaxed">{result.primary.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.secondary.map((sec, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center">
                  <div className="w-12 h-12 bg-white border-2 border-gray-900 rounded-lg flex items-center justify-center text-xl font-black text-gray-900 mr-4 shadow-sm">
                    {sec.letter}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Risco Adicional</h4>
                    <p className="text-lg font-bold text-gray-800">{sec.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ERGDecoder;
