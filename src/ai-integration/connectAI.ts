import { GoogleGenAI, Chat } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY не найден. AI-функционал будет отключен.");
}

// Инициализация Gemini
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
export const GEMINI_MODEL = "gemini-2.5-flash";

// Хранение активных чат-сессий
export const activeAIChats = new Map<number, Chat>();

/**
 * Возвращает инициализированный клиент Gemini.
 */
export function getGeminiClient() {
  return ai;
}
