import { GoogleGenAI, Type } from "@google/genai";

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AIResponse {
  text: string;
  sources: GroundingSource[];
}

// Refactored to a standard function declaration to prevent potential parsing issues.
function getClient() {
  if (!process.env.API_KEY) {
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

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
}

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
                ACT AS: The Chief Dangerous Goods Inspector for a major international cargo hub.
                
                TASK: Perform a high-precision audit of the provided Shipment Scenario for "Ready for Carriage" status.
                
                AUDIT PROTOCOL:
                1. UN & PSN VERIFICATION: Validate against 2026 IATA DGR.
                2. LIMITS & PACKING: Check quantity vs. Pax/CAO limits.
                3. VARIATIONS CHECK: Search specifically for Airline variations (e.g., "LATAM variation LA-01", "LA-07"). 
                   IMPORTANT: LATAM often prohibits Lithium Ion Batteries on Passenger Aircraft (LA-01). 
                4. SEGREGATION: Cross-reference classes using Table 9.3.A.
                
                CRITICAL INSTRUCTION: AUTOMATIC CORRECTIVE ACTION
                If any item is REJECTED or CONDITIONAL, you MUST provide a "PASSO-A-PASSO PARA CORREÇÃO". 
                Be technical: suggest specific PI numbers, required labels, or aircraft type changes.
                
                OUTPUT FORMAT (Markdown):
                ## 🚦 VERDICT: [ACCEPTED / REJECTED / CONDITIONAL]
                
                ### 📋 Análise Técnica dos Itens
                [Detailed breakdown of each item's compliance]
                
                ### ⚠️ Discrepâncias e Variações Encontradas
                [List specific variations like LA-01 or USG-13 that cause issues]
                
                ### 📐 Resultado da Segregação (Tabela 9.3.A)
                [Detailed result of class compatibility]
                
                ### 🛠️ AÇÃO REQUERIDA (CORREÇÃO IMEDIATA)
                [THIS SECTION IS MANDATORY IF VERDICT IS NOT 'ACCEPTED']
                - Forneça instruções exatas ao expedidor.
                - Ex: "Trocar para PI Y341 (LQ)", "Mudar aeronave para CAO", "Separar UN 1263 de UN 3105".
                
                TONE: Technical, decisive, authoritative.
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
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        un: { type: Type.STRING, description: "UN Number" },
                        name: { type: Type.STRING, description: "Official Proper Shipping Name (English)" },
                        class: { type: Type.STRING, description: "Hazard Class" },
                        sub: { type: Type.STRING, description: "Subrisk (or empty string)" },
                        pg: { type: Type.STRING, description: "Packing Group (I, II, III or empty)" },
                        eq: { type: Type.STRING, description: "E-Code (E0, E1, etc)" },
                        lq_pi: { type: Type.STRING, description: "Limited Quantity Packing Instruction" },
                        lq_max: { type: Type.STRING, description: "Limited Quantity Max quantity" },
                        pax_pi: { type: Type.STRING, description: "Passenger Aircraft Packing Instruction" },
                        pax_max: { type: Type.STRING, description: "Passenger Aircraft Max quantity" },
                        cao_pi: { type: Type.STRING, description: "Cargo Aircraft Only Packing Instruction" },
                        cao_max: { type: Type.STRING, description: "Cargo Aircraft Only Max quantity" },
                        sp: { type: Type.STRING, description: "Space separated Special Provision codes" },
                        erg: { type: Type.STRING, description: "Emergency Response Guidebook code" },
                    },
                },
                systemInstruction: `
                You are a data extractor for the IATA Dangerous Goods Regulations (Blue Pages).
                
                TASK: Search the web for the official specifications of UN ${unNumber}.
                
                RETURN JSON FORMAT ONLY based on the provided schema.
                
                If exact data is ambiguous, find the most common configuration for this UN.
                Values like "Forbidden" are valid.
                `
            }
        });

        const text = response.text;
        if (!text) return null;
        
        try {
            return JSON.parse(text.trim());
        } catch (e) {
            console.error("Failed to parse JSON", e);
            return null;
        }

    } catch (error) {
        console.error("UN Hydration Error", error);
        return null;
    }
}