import type {
  MessageReceivedType,
  ReactionReceivedType,
} from "./converter/receivedMessages.js"

interface CommandTaskConstructorType {
  messageHandler?: MessageHandler
  reactionHandler?: ReactionHandler
}
export type PartialPick<T, F extends keyof T> = Omit<T, F> & Partial<Pick<T, F>>

export type MessageOrReactionInterceptorType = (message: MessageReceivedType | ReactionReceivedType) => boolean
export type MessageInterceptorType = (message: MessageReceivedType) => boolean
type OnMessageTaskType = (message: MessageReceivedType) => Promise<void> | void

type ReactionInterceptorType = (reaction: ReactionReceivedType) => boolean
type OnReactionTaskType = (
  reaction: ReactionReceivedType,
) => Promise<void> | void

interface EventHandlerOptions {
  blockOthers: boolean
}

export interface MessageHandler {
  when: MessageInterceptorType
  do: OnMessageTaskType
  options?: EventHandlerOptions
}

export interface ReactionHandler {
  when: ReactionInterceptorType
  do: OnReactionTaskType
  options?: EventHandlerOptions
}

export class CommandTask {
  messageHandler?: MessageHandler | undefined
  reactionHandler?: ReactionHandler | undefined
  taskCompleted = false

  constructor(params?: CommandTaskConstructorType) {
    this.messageHandler = params?.messageHandler
    this.reactionHandler = params?.reactionHandler
  }

  onMessage(params: MessageHandler): void {
    this.messageHandler = {
      ...params,
      options: {
        blockOthers: params.options?.blockOthers ?? false,
      },
    }
  }

  onReaction(params: ReactionHandler): void {
    this.reactionHandler = {
      ...params,
      options: {
        blockOthers: params.options?.blockOthers ?? false,
      },
    }
  }

  finishExecution(): void {
    this.messageHandler = undefined
    this.reactionHandler = undefined
    this.taskCompleted = true
  }

  _safeMessageDo(message: MessageReceivedType): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      this.messageHandler?.do(message)?.catch((e: unknown) => {
        console.log(
          `[-] COMMAND TASK: Error while executing message handler '${message.content}': `,
          e,
        )
        this.finishExecution()
      })
    } catch (e) {
      console.log(
        `[-] COMMAND TASK: Error while executing async message handler '${message.content}': `,
        e,
      )
      this.finishExecution()
    }
  }

  _safeReactionDo(reaction: ReactionReceivedType): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      this.reactionHandler?.do(reaction)?.catch((e: unknown) => {
        console.log(
          `[-] COMMAND TASK: Error while executing async reaction handler '${reaction.text}': `,
          e,
        )
        this.finishExecution()
      })
    } catch (e) {
      console.log(
        `[-] COMMAND TASK: Error while executing reaction handler '${reaction.text}': `,
        e,
      )
      this.finishExecution()
    }
  }
}
