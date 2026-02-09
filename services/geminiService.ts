
import { GoogleGenAI } from "@google/genai";

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AIResponse {
  text: string;
  sources: GroundingSource[];
}

const getClient = () => { if (!process.env.API_KEY) return null;
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const queryGemini = async (userQuery: string): Promise<AIResponse> => {
  const ai = getClient();
  if (!ai) {
    return {
      text: "A chave da API está faltando. Por favor, configure a variável de ambiente.",
      sources: []
    };
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are a Senior IATA Dangerous Goods Regulations (DGR) Specialist. 
        
        YOUR MANDATE:
        1. You do NOT rely on internal training data. You MUST use the Google Search tool to find the most current regulations for the 2026 Edition (67th Edition).
        2. When asked about a UN Number, search for "IATA DGR UN [Number] packing instruction" and "state variations" specifically.
        3. You must verify State and Operator variations (e.g., "USG-02", "Lufthansa Cargo variations") via search.
        4. If you find conflicting information, prioritize official sources (iata.org, phmsa.dot.gov, airline cargo manuals).
        5. Answer strictly in Portuguese (Brazil).
        6. Always provide the source of your information.`,
      }
    });

    const text = response.text || "Não consegui gerar uma resposta.";
    
    // Extract grounding sources (web citations) provided by the search tool
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web) || [];

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Erro de conexão com a rede de dados regulatórios. Verifique sua conexão.",
      sources: []
    };
  }
};

export const analyzeShipment = async (scenario: string): Promise<AIResponse> => {
    const ai = getClient();
    if (!ai) return { text: "Erro de Configuração de API", sources: [] };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: scenario,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: `
                ACT AS: The Chief Dangerous Goods Inspector for a major cargo hub.
                
                TASK: Audit the provided Shipment Scenario for "Ready for Carriage" status.
                
                YOU MUST CHECK:
                1. UN Number & Proper Shipping Name accuracy.
                2. Packing Group & Quantity Limits (Is it allowed on Passenger Aircraft? Cargo Only?).
                3. OPERATOR VARIATIONS: Search specifically for the Airline's current variation (e.g., "Lufthansa variation UN 3480", "Emirates restrictions Class 1").
                4. SEGREGATION: If multiple items are listed, check Table 9.3.A.
                
                OUTPUT FORMAT (Markdown):
                ## 🚦 VERDICT: [ACCEPTED / REJECTED / CONDITIONAL]
                
                ### 📋 Análise dos Itens
                [List each item and its status]
                
                ### ⚠️ Restrições Críticas Encontradas
                [List specific State/Operator variations found via Search, e.g., "LH-04 prohibits this..."]
                
                ### 📐 Cálculo de Segregação & Q-Value
                [Brief check on compatibility and quantity limits]
                
                ### 📝 Ação Requerida
                [What must the shipper do to fix this? e.g., "Re-pack separately", "Add labels", "Use Cargo Aircraft Only"]
                
                TONE: Professional, authoritative, strict.
                LANGUAGE: Portuguese (Brazil).
                `
            }
        });

        const text = response.text || "Não foi possível analisar o embarque.";
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter((web: any) => web) || [];

        return { text, sources };

    } catch (error) {
        console.error("Shipment Analysis Error", error);
        return { text: "Erro ao processar auditoria de embarque.", sources: [] };
    }
}

export const fetchOfficialUNData = async (unNumber: string): Promise<any | null> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Fetch official IATA DGR 2026 data for UN ${unNumber}. Return ONLY a JSON object.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                systemInstruction: `
                You are a data extractor for the IATA Dangerous Goods Regulations (Blue Pages).
                
                TASK: Search the web for the official specifications of UN ${unNumber}.
                
                RETURN JSON FORMAT ONLY:
                {
                    "un": "${unNumber}",
                    "name": "Official Proper Shipping Name (English)",
                    "class": "Hazard Class",
                    "sub": "Subrisk (or empty string)",
                    "pg": "Packing Group (I, II, III or empty)",
                    "eq": "E-Code (E0, E1, etc)",
                    "lq_pi": "Y...",
                    "lq_max": "Qty (e.g. 1 L)",
                    "pax_pi": "Number (e.g. 353)",
                    "pax_max": "Qty (e.g. 5 L)",
                    "cao_pi": "Number (e.g. 364)",
                    "cao_max": "Qty (e.g. 60 L)",
                    "sp": "Space separated codes (e.g. A3 A72)",
                    "erg": "Code (e.g. 3L)"
                }
                
                If exact data is ambiguous, find the most common configuration for this UN.
                Values like "Forbidden" are valid.
                `
            }
        });

        const text = response.text;
        if (!text) return null;
        
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON", e);
            return null;
        }

    } catch (error) {
        console.error("UN Hydration Error", error);
        return null;
    }
};