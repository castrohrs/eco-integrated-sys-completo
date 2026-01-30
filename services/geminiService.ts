
import { GoogleGenAI } from "@google/genai";

// FIX: Consolidate global Window interface augmentation with consistent optional modifiers to resolve duplicate property errors and modifier mismatches
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

/**
 * Helper para tratar erros de entidade não encontrada (404).
 * Conforme as diretrizes, se a chave for inválida ou não encontrada, 
 * devemos abrir o seletor de chaves do AI Studio.
 */
const handleApiError = async (error: any) => {
    console.error("Gemini API Error:", error);
    const errorMessage = error?.message || "";
    
    if (errorMessage.includes("Requested entity was not found.") || error?.status === "NOT_FOUND") {
        console.warn("API Key invalid or not found. Prompting user to select a new one...");
        if (window.aistudio && window.aistudio.openSelectKey) {
            await window.aistudio.openSelectKey();
            // Após a seleção, o app deve prosseguir (process.env.API_KEY será atualizado automaticamente)
        }
    }
    throw error;
};

export const editImageWithGemini = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    // Instanciar SEMPRE dentro da função para usar a chave mais recente do env
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No response content from model.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image was generated in the response.");
  } catch (error) {
    return handleApiError(error);
  }
};

export const analyzeDocument = async (
  base64Data: string,
  mimeType: string
): Promise<{ fullText: string; documentType: string; keyFields: Record<string, string> }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const prompt = `
      Analyze the provided document. It can be an Image, PDF, TXT, XML, or HTML file.
      1. Perform a full text extraction (OCR) or content parsing.
      2. Identify the type of document (e.g., Invoice, Receipt, Contract, ID Card, BOL, XML Data, HTML Page).
      3. Extract key structured information relevant to the document type into a flat key-value pair list.
         - For Invoices/Receipts: Extract Total Amount, Date, Vendor Name, Invoice Number.
         - For IDs: Extract Name, ID Number, Birth Date.
         - For Logistics Documents (CT-e, BOL): Extract Sender, Receiver, Cargo Value, Weight, Origin, Destination.
         - For XML/HTML: Extract main data nodes or relevant content sections.
      
      Return ONLY a valid JSON object with this structure:
      {
        "fullText": "The complete raw text extracted...",
        "documentType": "Type of document",
        "keyFields": {
          "Label": "Value",
          "Date": "YYYY-MM-DD",
          "Total": "0.00"
        }
      }
    `;

    // FIX: Updated model name to 'gemini-3-flash-preview' for basic text/OCR tasks as per coding guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateLogisticsBackgroundVideo = async (): Promise<string> => {
    const prompt = `
        Create a high-speed timelapse background video.
        Scenes blended together:
        - Port of Rio de Janeiro with containers being moved
        - Container cranes operating continuously
        - Trucks carrying containers moving through the city
        - Urban traffic in accelerated motion
        - Computer screens with logistics maps, dashboards and data
        - Subtle AI data flow overlay (lines, nodes, signals)
        
        Style:
        - Hyperlapse / timelapse
        - Very fast motion
        - Smooth continuous transitions
        - Industrial, logistics, technology focused
        - Realistic, not artistic
        
        Visual tone:
        - Dark background
        - Blue, cyan and teal highlights
        - Motion blur for speed feeling
        
        Rules:
        - No text
        - No logos
        - No people in focus
        - No cinematic storytelling
        - No dramatic camera moves
        
        Goal:
        Serve as a looping background for a technology system interface.
    `;

    try {
        // Garantir chave selecionada antes de usar modelo premium
        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
            await window.aistudio.openSelectKey();
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        console.log("Iniciando geração de vídeo com Veo...");
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '1080p',
                aspectRatio: '16:9'
            }
        });

        console.log("Operação iniciada. Aguardando processamento...");
        
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); 
            operation = await ai.operations.getVideosOperation({ operation: operation });
            console.log("Verificando status...");
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        
        if (!videoUri) {
            throw new Error("Video generation completed but no URI returned.");
        }

        const videoUrlWithKey = `${videoUri}&key=${process.env.API_KEY}`;
        const videoResponse = await fetch(videoUrlWithKey);
        const videoBlob = await videoResponse.blob();
        
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        return handleApiError(error);
    }
};
