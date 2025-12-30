
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Category, Prediction, Language, PredictionSource } from "../types";

// Always use the process.env.API_KEY which will be provided by Vite/Vercel
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const languageMap: Record<Language, string> = {
  sk: 'slovenčine',
  en: 'English',
  de: 'Deutsch',
  pl: 'polskim',
  es: 'español'
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
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Urob detailnú a vedecky podloženú predpoveď budúcnosti pre rok ${year} v oblasti ${category}. 
    Využi dostupné informácie o aktuálnych trendoch a vedeckom pokroku. 
    Odpovedaj v jazyku: ${languageMap[lang]}. 
    Odpoveď musí byť v čistom formáte JSON podľa zadanej schémy.`,
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
  if (!text) {
    throw new Error("Model nevrátil žiadne dáta.");
  }

  const sources: PredictionSource[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          uri: chunk.web.uri,
          title: chunk.web.title
        });
      }
    });
  }

  // Handle cases where model might include Markdown delimiters even with responseMimeType: "application/json"
  let prediction;
  try {
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    prediction = JSON.parse(cleanJson);
  } catch (err) {
    console.error("Failed to parse prediction JSON:", err, text);
    throw new Error(lang === 'sk' ? "Nepodarilo sa spracovať odpoveď od AI." : "Failed to parse AI response.");
  }
  
  return { 
    ...prediction, 
    year, 
    category, 
    sources: sources.length > 0 ? sources : undefined 
  };
};

export const generateFutureImage = async (prediction: Prediction): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Cinematic ultra-realistic visualization of the future year ${prediction.year}: ${prediction.title}. Category: ${prediction.category}. Futuristic aesthetic, 8k, detailed lighting.` }
      ]
    },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });

  const candidate = response.candidates?.[0];
  const part = candidate?.content?.parts?.find(p => p.inlineData);
  
  if (part?.inlineData?.data) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  
  return '';
};

export const editFutureImage = async (base64Image: string, editPrompt: string): Promise<string> => {
  const ai = getAI();
  // Odstránime prefix "data:image/png;base64," ak existuje
  const base64Data = base64Image.split(',')[1] || base64Image;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/png'
          }
        },
        { text: editPrompt }
      ]
    }
  });

  const candidate = response.candidates?.[0];
  const part = candidate?.content?.parts?.find(p => p.inlineData);
  
  if (part?.inlineData?.data) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  
  return '';
};

export const generateFutureAudio = async (text: string, lang: Language): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say this in ${languageMap[lang]}: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  const candidate = response.candidates?.[0];
  const part = candidate?.content?.parts?.[0];
  
  return part?.inlineData?.data || '';
};
