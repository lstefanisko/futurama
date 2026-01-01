
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Category, Prediction, Language, PredictionSource } from "../types";

const languageMap: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'español',
  pl: 'polski',
  sk: 'slovenčina',
  fr: 'français',
  it: 'italiano'
};

// Fix: Implemented grounding source extraction and ensured proper JSON handling for search grounding
export const getFuturePrediction = async (year: number, category: Category, lang: Language): Promise<Prediction> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Simulate and predict the state of the world in ${year} for the sector of ${category}. 
    Provide an extremely detailed, expansive narrative analysis. 
    Include technological breakthroughs, societal shifts, potential existential risks, and specific daily-life implications. 
    MANDATORY: The 'analysis' field must contain at least 400 words of dense, high-quality descriptive text. 
    Language: ${languageMap[lang]}. Return pure JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          analysis: { type: Type.STRING },
          points: { type: Type.ARRAY, items: { type: Type.STRING } },
          probability: { type: Type.NUMBER },
          impactLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          regionalImpact: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                region: { type: Type.STRING },
                value: { type: Type.NUMBER },
                description: { type: Type.STRING }
              },
              required: ["region", "value", "description"]
            }
          }
        },
        required: ["title", "summary", "analysis", "points", "probability", "impactLevel", "regionalImpact"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Stream connection failed.");

  // Extract grounding sources as required by Google Search Grounding guidelines
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: PredictionSource[] = groundingChunks
    .map((chunk: any) => ({
      uri: chunk.web?.uri || '',
      title: chunk.web?.title || ''
    }))
    .filter((s: PredictionSource) => s.uri !== '');

  return { 
    ...JSON.parse(text), 
    year, 
    category, 
    sources,
    timestamp: Date.now()
  };
};

export const generateFutureAudio = async (text: string, lang: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Voice of the Temporal Oracle (${languageMap[lang]}): ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
    },
  });
  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return data || '';
};

export const generateFutureImage = async (prediction: Prediction): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const prompt = `Futuristic architectural visualization: ${prediction.title}. Realistic, cinematic 8k, raw tech aesthetics, cyan and black color palette, minimalist. Year ${prediction.year}.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [{ text: prompt }] }],
    config: { imageConfig: { aspectRatio: "16:9" } },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return '';
};

// Fix: Added missing export for editFutureImage
export const editFutureImage = async (base64ImageData: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  // Ensure we strip the prefix if it exists before sending raw base64
  const base64Data = base64ImageData.includes(',') ? base64ImageData.split(',')[1] : base64ImageData;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/png',
          },
        },
        {
          text: `Modify this futuristic visualization with the following instruction: ${prompt}`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return '';
};

// Fix: Added missing export for deepTemporalAnalysis
export const deepTemporalAnalysis = async (prediction: Prediction, query: string, lang: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `As the Temporal Oracle, perform a deep analysis on the following future scenario for the year ${prediction.year} in ${prediction.category}:
    
    Current Prediction: ${prediction.title}
    Analysis Summary: ${prediction.analysis}
    
    Investigate the user's inquiry regarding this timeline: "${query}"
    
    Response must be in ${languageMap[lang]}.`,
  });

  return response.text || '';
};

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
