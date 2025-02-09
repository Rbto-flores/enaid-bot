import type {
  CommandTask,
  MessageOrReactionInterceptorType,
} from "./CommandTask.js"
import type {
  MessageReceivedType,
  ReactionReceivedType,
} from "./converter/receivedMessages.js"
import type { WhatsappBot } from "./WhatsappBot.js"

export interface CommandConstructorType {
  name: string
  execute: (
    message: MessageReceivedType,
    self: CommandTask,
    bot: WhatsappBot,
  ) => Promise<void> | void
  executeIfMessage?: (
    message: MessageReceivedType | ReactionReceivedType,
  ) => boolean
  description?: string
}

export class Command {
  name: string
  executeIfMessage: MessageOrReactionInterceptorType

  execute: (
    message: MessageReceivedType,
    self: CommandTask,
    bot: WhatsappBot,
  ) => Promise<void> | void

  constructor(params: CommandConstructorType) {
    this.name = params.name

    function executeIfMessage(
      message: MessageReceivedType | ReactionReceivedType,
    ) {
      if ("content" in message) {
        return message.content.startsWith(params.name)
      }
      // Por defecto el ReactionReceivedType no hace nada
      return false
    }
    this.executeIfMessage = params.executeIfMessage ?? executeIfMessage
    this.execute = params.execute
  }

  _safeExecute(
    message: MessageReceivedType,
    self: CommandTask,
    bot: WhatsappBot,
  ): void {
    try {
      this.execute(message, self, bot)?.catch((e: unknown) => {
        console.log(
          `[-] COMMAND: Error while executing async command '${this.name}': `,
          e,
        )
      })
    } catch (e) {
      console.log(
        `[-] COMMAND: Error while executing command '${this.name}': `,
        e,
      )
    }
  }
}
