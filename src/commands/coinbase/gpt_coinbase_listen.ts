// chatbotInstance.ts

import { ChatbotAgent } from "../../coinbase/chatbots.js";



// Constante que podrías usar para definir el máximo de items en el contexto (si lo requieres)
export const MAX_CONTEXT_ITEMS = 10;

// Variable para almacenar la instancia del chatbot (singleton)
let chatbotInstance: ChatbotAgent | null = null;

/**
 * Inicializa (o retorna) la instancia del ChatbotAgent.
 *
 * @returns Una promesa que se resuelve con la instancia de ChatbotAgent.
 */
export async function initializeChatbotAgent(): Promise<ChatbotAgent> {
  if (!chatbotInstance) {
    chatbotInstance = await ChatbotAgent.create();
  }
  return chatbotInstance;
}

/**
 * Envía un mensaje al agente y retorna la respuesta generada.
 * La sesión se mantiene abierta y el contexto se acumula internamente.
 *
 * @param prompt El mensaje de entrada.
 * @returns Una promesa que se resuelve con la respuesta del agente.
 */
export async function chatbotAutocompleteText(prompt: string): Promise<string> {
  const chatbot = await initializeChatbotAgent();
  const respuesta = await chatbot.sendMessage(prompt);
  return respuesta;
}
