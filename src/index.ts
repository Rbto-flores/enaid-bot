
import { chatbotAutocompleteText } from "./commands/coinbase/gpt_coinbase_listen.js"


import { WhatsappBot } from "./whatsappBot/WhatsappBot.js"
const sessionName = "coinbaseSession"
const bot = new WhatsappBot(sessionName)


bot.addCommand({
  name: "/coinbase",
  execute: async (message, self, bot) => {
    console.log("Enviando mensaje al agente");
    // Envía una reacción para indicar que se recibió el mensaje
    bot.sendReaction(message.jid, message.internal.key, "✅");

    // Se separa el primer elemento del mensaje (el comando) del resto (el prompt)
    const [firstWord, ...rest] = message.content.split(" ");
    if (firstWord === "/coinbase") {
      const prompt = rest.join(" ");

      try {
        // Se consume el agente para obtener la respuesta
        const response = await chatbotAutocompleteText(prompt);
        // Se envía la respuesta formateada al chat
        bot.sendSimpleMessage(message.jid, `Bot: ${response}`);
      } catch (error) {
        console.error("Error en el chatbot:", error);
        bot.sendSimpleMessage(message.jid, `Bot: Ocurrió un error al procesar tu solicitud.`);
      }
    }

    // Finaliza la ejecución del comando
    self.finishExecution();
  },
});




