
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Category, Prediction, Language, PredictionSource } from "../types";

// Simple cache for predictions to avoid duplicate API calls
const predictionCache = new Map<string, { data: Prediction; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const languageMap: Record<Language, string> = {
  sk: 'slovenčine',
  en: 'English',
  de: 'Deutsch',
  pl: 'polskim',
  es: 'español',
  fr: 'français',
  it: 'italiano',
  ja: '日本語',
  pt: 'português',
  zh: '中文'
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

export const getFuturePrediction = async (year: number, category: Category, lang: Language): Promise<Prediction> => {
  // Create cache key
  const cacheKey = `${year}-${category}-${lang}`;
  
  // Check cache first
  const cached = predictionCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Conduct a highly detailed, scientific, and futuristic prediction for the year ${year} in the sector: ${category}. 
    Utilize real-time trends and breakthrough research. 
    Respond strictly in: ${languageMap[lang]}. 
    The output must be a clean JSON object following the schema provided.`,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 32768 },
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

  const sources: PredictionSource[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          uri: chunk.web.uri,
          title: chunk.web.title
        });
      } else if (chunk.maps) {
        sources.push({
            uri: chunk.maps.uri,
            title: chunk.maps.title
        });
      }
    });
  }

  const text = response.text;
  if (!text) throw new Error("AI Signal Lost.");

  let prediction;
  try {
    prediction = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
  } catch (err) {
    throw new Error(lang === 'sk' ? "Chyba syntézy dát." : "Data Synthesis Failure.");
  }
  
  const result = { 
    ...prediction, 
    year, 
    category, 
    sources: sources.length > 0 ? sources : undefined 
  };

  // Cache the result
  predictionCache.set(cacheKey, { data: result, timestamp: Date.now() });
  
  return result;
};

export const deepTemporalAnalysis = async (prediction: Prediction, query: string, lang: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze this prediction:
    Title: ${prediction.title} (${prediction.year})
    Analysis: ${prediction.analysis}
    
    User Inquiry: ${query}
    
    Think deeply about logical consistency and sociological ripple effects. Respond in ${languageMap[lang]}.`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return response.text || "Analysis link unstable.";
};

export const generateFutureImage = async (prediction: Prediction): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Futuristic cinematic visualization of ${prediction.year} ${prediction.title}. Style: Neo-realism, 8k, detailed shadows.` }
      ]
    },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : '';
};

export const editFutureImage = async (base64Image: string, editPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const base64Data = base64Image.split(',')[1] || base64Image;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: 'image/png' } },
        { text: editPrompt }
      ]
    }
  });
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : '';
};

export const generateFutureAudio = async (text: string, lang: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read clearly in ${languageMap[lang]}: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
};
