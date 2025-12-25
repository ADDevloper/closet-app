
import { GoogleGenAI, Type } from "@google/genai";
import { ClothingItem, Category, Conversation, ChatMessage } from '../types';

// ALWAYS use the named parameter and direct environment variable reference.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeClothingImage = async (base64Image: string): Promise<{ category: Category; colors: string[] }> => {
  const model = "gemini-3-flash-preview";
  
  // Strip data:image/...;base64, prefix if present
  const data = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data, mimeType: 'image/jpeg' } },
        { text: 'Analyze this clothing item. Identify its primary category (shirt, pants, dress, shoes, jacket, accessories, skirt, outerwear, or other) and dominant colors.' }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          colors: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["category", "colors"]
      }
    }
  });

  try {
    // Correctly accessing .text property as per guidelines
    const jsonStr = response.text || "{}";
    const result = JSON.parse(jsonStr);
    return {
      category: (result.category?.toLowerCase() as Category) || 'other',
      colors: result.colors || []
    };
  } catch (e) {
    console.error("Failed to parse analysis result", e);
    return { category: 'other', colors: [] };
  }
};

export const getFashionAdvice = async (
  query: string, 
  closet: ClothingItem[], 
  history: ChatMessage[]
): Promise<{ text: string; outfits?: any[] }> => {
  const model = "gemini-3-flash-preview";

  const closetSummary = closet.map(item => ({
    id: item.id,
    category: item.category,
    colors: item.colors,
    occasions: item.occasions,
    seasons: item.seasons,
    brand: item.brand
  }));

  const systemInstruction = `
    You are 'Closet', a friendly and professional fashion-savvy assistant. 
    You have access to the user's digital closet.
    Your goal is to provide outfit suggestions, styling tips, and general fashion advice.
    When suggesting outfits, ONLY use items from the user's closet IDs provided.
    
    User's Closet: ${JSON.stringify(closetSummary)}

    Instructions:
    - If the user asks for an outfit, provide 1-3 specific outfit options.
    - Each outfit must include a list of item IDs from the user's closet.
    - Provide a catchy name, description, and styling tips for each outfit.
    - Be encouraging and friendly.
    - If they don't have enough items for a specific request, suggest what type of generic item they might want to add to their wardrobe.
    - Return a JSON object with a 'text' property for your conversational response and an optional 'outfits' array.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      { role: 'user', parts: [{ text: query }] }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          outfits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                itemIds: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                stylingTips: { type: Type.STRING }
              },
              required: ["name", "description", "itemIds", "stylingTips"]
            }
          }
        },
        required: ["text"]
      }
    }
  });

  try {
    // Correctly accessing .text property as per guidelines
    const jsonStr = response.text || '{"text": "I\'m sorry, I couldn\'t process that fashion request."}';
    return JSON.parse(jsonStr);
  } catch (e) {
    return { text: response.text || "I'm sorry, I couldn't process that fashion request." };
  }
};
