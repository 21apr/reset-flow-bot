import { GoogleGenAI, Chat } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY не найден. AI-функционал будет отключен.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
export const GEMINI_MODEL = "gemini-2.5-flash";

export const activeAIChats = new Map<number, Chat>();

export function getGeminiClient() {
  return ai;
}
