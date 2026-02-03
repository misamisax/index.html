
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getZenBuddyResponse = async (history: { role: 'user' | 'model', text: string }[], userInput: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: userInput }] }
    ],
    config: {
      systemInstruction: `You are ZenBuddy, a supportive, witty, and empathetic health coach. 
      Your goal is to help users maintain their Intermittent Fasting (IF) streak.
      When they are stressed or want to 'stress eat', provide calming techniques.
      Keep responses concise and engaging.`,
    }
  });
  return response.text || "I'm here for you!";
};

export const analyzeMeal = async (description: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Estimate the PFC (Protein, Fats, Carbs) and Calories for this meal: "${description}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          protein: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          calories: { type: Type.NUMBER },
        },
        required: ["name", "protein", "fats", "carbs", "calories"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getDailyMealComment = async (meals: any[], goals: any) => {
  const totalKcal = meals.reduce((sum, m) => sum + m.pfc.calories, 0);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Today I ate: ${meals.map(m => m.name).join(', ')}. Total calories: ${totalKcal}. My goal is ${goals.calories} kcal. Give me a 30-word comment on my performance and a suggestion for my next meal. Speak as a cute bunny Mochi.`,
  });
  return response.text || "You are eating well! Keep hopping! 🐰";
};

export const getWeeklyReviewLetter = async (fastHistory: any[], weightHistory: any[], sleepHistory: any[], profile: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Write a supportive, heart-warming letter (max 100 words) from Mochi the bunny reviewing the past week. 
    Fasts: ${fastHistory.length} successful.
    Weight change: from ${weightHistory[0]?.weight} to ${weightHistory[weightHistory.length - 1]?.weight}.
    Sleep avg: ${sleepHistory.length > 0 ? (sleepHistory.reduce((s: any, l: any) => s + l.durationMinutes, 0) / sleepHistory.length / 60).toFixed(1) : 'unknown'} hours.
    Use emojis and bunny-related puns. Tone: Cheerful and motivating.`,
  });
  return response.text || "Dearest Hopping Friend, you did amazing this week! 🐰✨";
};

export const predictWeightGoalDate = async (currentWeight: number, targetWeight: number, age: number, sex: string, height: number) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Calculate a realistic date for reaching ${targetWeight}kg from ${currentWeight}kg for a ${age}yo ${sex}, ${height}cm tall, assuming strict 16:8 Intermittent Fasting. Output only a short string like 'March 2024' or '12 weeks'.`,
  });
  return response.text?.trim() || "unknown weeks";
};

export const getGoalRecommendation = async (profile: any, currentWeight: number) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on a ${profile.age}yo ${profile.sex}, ${profile.height}cm, weighing ${currentWeight}kg, recommend daily Calories, Protein, Fats, and Carbs for healthy weight loss through IF.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          reasoning: { type: Type.STRING }
        },
        required: ["calories", "protein", "fats", "carbs"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
