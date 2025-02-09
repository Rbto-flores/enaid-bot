import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

/**
 * Valida que las variables de entorno requeridas estén definidas.
 */
function validateEnvironment(): void {
    const missingVars: string[] = [];
    const requiredVars = ["OPENAI_API_KEY", "CDP_API_KEY_NAME", "CDP_API_KEY_PRIVATE_KEY"];

    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });

    if (missingVars.length > 0) {
        console.error("Error: Las siguientes variables de entorno son requeridas y no están definidas:");
        missingVars.forEach(varName => {
            console.error(`${varName}=your_${varName.toLowerCase()}_here`);
        });
        process.exit(1);
    }

    if (!process.env['NETWORK_ID']) {
        console.warn("Warning: NETWORK_ID no está definido, se usará 'base-sepolia' por defecto.");
    }
}

validateEnvironment();

// Archivo para persistir la información del Wallet CDP MPC
const WALLET_DATA_FILE = "wallet_data.txt";

/**
 * Inicializa el agente usando CDP Agentkit y configura la sesión.
 *
 * @returns Un objeto con el agente y su configuración.
 */
async function initializeAgent() {
    // Inicializa el LLM
    const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
    });

    let walletDataStr: string | null = null;
    if (fs.existsSync(WALLET_DATA_FILE)) {
        try {
            walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
        } catch (error) {
            console.error("Error leyendo la data del wallet:", error);
        }
    }

    const config = {
        cdpWalletData: walletDataStr || "",
        networkId: process.env['NETWORK_ID'] || "base-sepolia",
    };

    // Configura CDP Agentkit
    const agentkit = await CdpAgentkit.configureWithWallet(config);
    const cdpToolkit = new CdpToolkit(agentkit);
    const tools = cdpToolkit.getTools();

    // Guarda el historial de la conversación en memoria para mantener el contexto
    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: "CDP AgentKit Chatbot Session" } };

    // Crea el agente React usando LLM y las herramientas de CDP Agentkit
    const agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        messageModifier: `
      You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
      empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
      faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
      funds from the user. Before executing your first action, get the wallet details to see what network 
      you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
      asks you to do something you can't do with your currently available tools, you must say so, and 
      encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
      docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
      restating your tools' descriptions unless it is explicitly requested.
      `,
    });

    // Guarda la data actualizada del wallet
    const exportedWallet = await agentkit.exportWallet();
    fs.writeFileSync(WALLET_DATA_FILE, exportedWallet);

    return { agent, config: agentConfig };
}

/**
 * Clase que encapsula la sesión del chatbot.
 */
export class ChatbotAgent {
    private agent: any;
    private config: any;

    /**
     * Constructor privado; usa el método estático create() para obtener una instancia.
     */
    private constructor(agent: any, config: any) {
        this.agent = agent;
        this.config = config;
    }

    /**
     * Método de fábrica asíncrono para crear e inicializar la instancia del ChatbotAgent.
     *
     * @returns Una instancia de ChatbotAgent.
     */
    public static async create(): Promise<ChatbotAgent> {
        const { agent, config } = await initializeAgent();
        return new ChatbotAgent(agent, config);
    }

    /**
     * Envía un mensaje al agente y retorna la respuesta completa.
     * La sesión se mantiene abierta para conservar el contexto de la conversación.
     *
     * @param message El mensaje de entrada.
     * @returns La respuesta generada por el agente.
     */
    public async sendMessage(message: string): Promise<string> {
        try {
            const stream = await this.agent.stream({ messages: [new HumanMessage(message)] }, this.config);
            let response = "";
            for await (const chunk of stream) {
                if ("agent" in chunk) {
                    response += chunk.agent.messages[0].content;
                } else if ("tools" in chunk) {
                    response += chunk.tools.messages[0].content;
                }
            }
            return response;
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
            throw error;
        }
    }
}
