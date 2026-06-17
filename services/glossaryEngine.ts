import { GLOSSARY_DATA } from '../constants';

export interface GlossaryLookup {
  key: string;
  term: string;
  definition: string;
  caseSensitive: boolean;
}

export interface TextInterval {
  start: number;
  end: number;
  type: 'search' | 'glossary';
  key: string;
  term?: string;
  definition?: string;
}

// Generate the map of all possible keys and synonyms
const SYNONYMS_MAP: Record<string, string[]> = {
  "A1 Value": ["A1 Value", "Valor A1"],
  "A2 Value": ["A2 Value", "Valor A2"],
  "Approval": ["Approval", "Aprovação", "Aprovações"],
  "Baggage": ["Baggage", "Bagagem", "Bagagens"],
  "Cargo": ["Cargo", "Carga", "Cargas"],
  "Cargo Aircraft": ["Cargo Aircraft", "Aeronave de Carga", "Aeronaves de Carga", "CAO"],
  "Combination Packaging": ["Combination Packaging", "Embalagem Combinada", "Embalagens Combinadas"],
  "Competent Authority": ["Competent Authority", "Autoridade Competente", "Autoridades Competentes"],
  "Consignee": ["Consignee", "Destinatário", "Destinatários"],
  "Consignment": ["Consignment", "Remessa", "Remessas"],
  "Dangerous Goods": ["Dangerous Goods", "Mercadorias Perigosas", "Mercadoria Perigosa", "Artigos Perigosos", "Artigo Perigoso"],
  "Dangerous Goods Accident": ["Dangerous Goods Accident", "Acidente com Mercadorias Perigosas"],
  "Dangerous Goods Incident": ["Dangerous Goods Incident", "Incidente com Mercadorias Perigosas"],
  "Exception": ["Exception", "Exceção", "Exceções"],
  "Exemption": ["Exemption", "Isenção", "Isenções"],
  "Flash Point": ["Flash Point", "Ponto de Fulgor", "Temperatura de Fulgor"],
  "Freight Forwarder": ["Freight Forwarder", "Agente de Carga", "Transitário"],
  "GHS": ["GHS", "SGA"],
  "Gross Weight": ["Gross Weight", "Peso Bruto"],
  "Handling Agent": ["Handling Agent", "Agente de Manuseio", "Agentes de Manuseio"],
  "ID Number": ["ID Number", "Número ID"],
  "Inner Packaging": ["Inner Packaging", "Embalagem Interna", "Embalagens Internas"],
  "Labels": ["Labels", "Etiquetas", "Rótulos", "Rótulo de Risco", "Etiqueta de Risco"],
  "Limited Quantity": ["Limited Quantity", "Quantidade Limitada", "Quantidades Limitadas", "LQ", "QL"],
  "Marking": ["Marking", "Marcação", "Marcações"],
  "Net Quantity": ["Net Quantity", "Quantidade Líquida", "Quantidades Líquidas"],
  "Operator": ["Operator", "Operador", "Operadores"],
  "Overpack": ["Overpack", "Sobreembalagem", "Sobreembalagens", "Sobreadensamento"],
  "Package": ["Package", "Volume", "Volumes"],
  "Packaging": ["Packaging", "Embalagem", "Embalagens"],
  "Packing Group": ["Packing Group", "Grupo de Embalagem", "Grupos de Embalagem", "GE I", "GE II", "GE III", "GE"],
  "Passenger Aircraft": ["Passenger Aircraft", "Aeronave de Passageiros", "Aeronaves de Passageiros", "PAX"],
  "Pilot-in-Command": ["Pilot-in-Command", "Piloto em Comando", "Comandante"],
  "Proper Shipping Name": ["Proper Shipping Name", "Nome Apropriado para Embarque", "NAPE"],
  "Radioactive Material": ["Radioactive Material", "Material Radioativo", "Materiais Radioativos"],
  "Segregation": ["Segregation", "Segregação", "Segregados"],
  "Self-Reactive Substances": ["Self-Reactive Substances", "Substâncias Auto-reativas", "Substância Auto-reativa"],
  "Shipper": ["Shipper", "Expedidor", "Expedidores"],
  "State of Origin": ["State of Origin", "Estado de Origem"],
  "State of the Operator": ["State of the Operator", "Estado do Operador"],
  "Transport Index (TI)": ["Transport Index", "TI", "Índice de Transporte"],
  "UN Number": ["UN Number", "Número UN", "Número ONU", "UN"],
  "Unit Load Device (ULD)": ["Unit Load Device", "ULD", "Dispositivo de Carga Unitária"],
  "Wetting Agent": ["Wetting Agent", "Agente de Umectação"]
};

// Compile into flat lookups sorted by length descending
export const GLOSSARY_LOOKUPS: GlossaryLookup[] = (() => {
  const result: GlossaryLookup[] = [];

  GLOSSARY_DATA.forEach(item => {
    const list = SYNONYMS_MAP[item.term] || [item.term];
    list.forEach(key => {
      // Short acronyms or common articles like UN, GE, TI, CAO should be matched case-sensitively to avoid spam mismatches
      const isShortAcronym = key.length <= 3 && key === key.toUpperCase();
      result.push({
        key,
        term: item.term,
        definition: item.definition,
        caseSensitive: isShortAcronym
      });
    });
  });

  // Sort by length (descending) to match longer terms first and prevent partial-term matches
  return result.sort((a, b) => b.key.length - a.key.length);
})();

// Build non-overlapping intervals for search text highlighting + glossary matching
export const getGlossaryIntervals = (text: string, search: string): TextInterval[] => {
  const intervals: TextInterval[] = [];

  // 1. Process search terms first (highest priority)
  if (search && search.trim()) {
    const tokens = search.trim().split(/\s+/).filter(Boolean);
    if (tokens.length > 0) {
      const searchRegex = new RegExp(`(${tokens.map(t => t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'gi');
      let match;
      while ((match = searchRegex.exec(text)) !== null) {
        intervals.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'search',
          key: match[0]
        });
      }
    }
  }

  // 2. Process glossary terms (fill non-overlapping gaps)
  for (const gloss of GLOSSARY_LOOKUPS) {
    const escapedGlossKey = gloss.key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const flags = gloss.caseSensitive ? 'g' : 'gi';
    
    // Custom word boundaries handling accents correctly
    const regex = new RegExp(`(?<=^|[^a-zA-Z0-9áéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ])${escapedGlossKey}(?=$|[^a-zA-Z0-9áéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ])`, flags);
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      
      // Determine if this match overlaps with any previously accepted interval
      const hasOverlap = intervals.some(inv => 
        (start >= inv.start && start < inv.end) ||
        (end > inv.start && end <= inv.end) ||
        (inv.start >= start && inv.start < end)
      );
      
      if (!hasOverlap) {
        intervals.push({
          start,
          end,
          type: 'glossary',
          key: match[0],
          term: gloss.term,
          definition: gloss.definition
        });
      }
    }
  }

  // Sort intervals by their start index ascending
  return intervals.sort((a, b) => a.start - b.start);
};
