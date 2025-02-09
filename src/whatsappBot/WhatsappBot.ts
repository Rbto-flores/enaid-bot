import type { proto } from "@whiskeysockets/baileys"
import makeWASocket, {
  DisconnectReason,
  makeInMemoryStore,
  useMultiFileAuthState,
  type AnyMessageContent,
} from "@whiskeysockets/baileys"
import {
  getMessageContent,
  handleReceivedMessages,
  handleReceivedReactions,
  type MessageReceivedType,
  type ReactionReceivedType,
} from "./converter/receivedMessages.js"
import { TaskQueue } from "./taskQueue.js"
import pino from "pino"
import { Command, type CommandConstructorType } from "./Command.js"
import { CommandTask } from "./CommandTask.js"
import { handleReceivedContacts } from "./converter/receivedContacts.js"

export type WASocketType = ReturnType<typeof makeWASocket.makeWASocket>
export type AuthStateType = Awaited<ReturnType<typeof useMultiFileAuthState>>
type SendMessageOptions = makeWASocket.MiscMessageGenerationOptions

interface BoomType {
  output?: {
    statusCode: number
  }
}

interface WhatsappBotOptionsType {
  thresholdOldIgnoreOldMessages: number
}
export class WhatsappBot {
  socket: WASocketType | null = null
  private authState: AuthStateType | null = null
  private commandTasks: CommandTask[] = []
  private readonly commands: Command[] = []
  private readonly options: WhatsappBotOptionsType
  private readonly executeTaskQueue: TaskQueue = new TaskQueue()
  private readonly messagesTaskQueue: TaskQueue = new TaskQueue({ delay: 400 })
  private saveStoreInterval: Timer | undefined
  constructor(session: string, options?: WhatsappBotOptionsType) {
    void this.initialize(session)
    this.options = {
      thresholdOldIgnoreOldMessages: 1000 * 60,
      ...options,
    }
  }

  private async initialize(session: string): Promise<void> {
    this.authState = await useMultiFileAuthState(`sessions/${session}`)
    this.createConnection()
    this.cleanUpCompletedTasksInterval()
  }

  private createConnection(): void {
    if (!this.authState?.state) throw Error("[-] BOT: State check failed")

    const store = makeInMemoryStore({})
    const storeFilePath = "./baileys_store.json"
    store.readFromFile(storeFilePath)

    this.saveStoreInterval = setInterval(() => {
      store.writeToFile(storeFilePath)
    }, 10_000)

    this.socket = makeWASocket.makeWASocket({
      auth: this.authState.state,
      printQRInTerminal: true,
      logger: pino.pino({ level: "silent" }),
    })
    store.bind(this.socket.ev)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.socket.ev.on("creds.update", this.authState.saveCreds)

    this.socket.ev.on("connection.update", update => {
      const { connection, lastDisconnect } = update

      if (connection === "close") {
        const errorBoom = lastDisconnect?.error as BoomType

        if (errorBoom.output?.statusCode) {
          // Known error
          const shouldReconnect =
            (lastDisconnect?.error as BoomType).output?.statusCode !==
            DisconnectReason.loggedOut

          console.log(
            "[-] BOT: Connection closed due to",
            lastDisconnect?.error,
          )
          if (shouldReconnect) {
            this.restartConnection()
          }
        } else {
          console.log(
            "[-] BOT: Disconnected due to unexpected error: ",
            lastDisconnect?.error,
          )
          setTimeout(() => {
            this.restartConnection()
          }, 1000)
        }
      } else if (connection === "open") {
        console.log("[+] BOT: Connected to WhatsApp")
      }
    })
    this.socket.ev.on("messages.reaction", m => {
      const reactions = handleReceivedReactions(m)
      for (const reaction of reactions) {
        this.processReaction(reaction)
      }
    })
    this.socket.ev.on("messages.upsert", m => {
      const messages = handleReceivedMessages(m)

      for (const message of messages) {
        this.processMessage(message)
      }
    })

   
  }

  private restartConnection(): void {
    console.log("[+] BOT: Restarting WhatsApp connection...")
    //await this.authState?.saveCreds()
    this.createConnection()
    clearInterval(this.saveStoreInterval)
  }
  private cleanUpCompletedTasksInterval() {
    setInterval(() => {
      this.commandTasks = this.commandTasks.filter(task => !task.taskCompleted)
    }, 5000)
  }

  private isOldMessage(timestamp: Date): boolean {
    const now = new Date()
    const difference = now.getTime() - timestamp.getTime()
    return difference >= this.options.thresholdOldIgnoreOldMessages
  }

  private processReaction(reaction: ReactionReceivedType) {
    if (this.isOldMessage(reaction.timestamp)) return
    for (const task of this.commandTasks) {
      if (task.reactionHandler?.when(reaction) && !task.taskCompleted) {
        task._safeReactionDo(reaction)
      }
    }

    
  private processMessage(message: MessageReceivedType) {
    if (this.isOldMessage(message.timestamp)) return

    for (const task of this.commandTasks) {
      let executed = false
      if (task.messageHandler?.when(message) && !task.taskCompleted) {
        task._safeMessageDo(message)
        executed = true
      }
      if (executed && task.messageHandler?.options?.blockOthers) return
    }

    for (const command of this.commands) {
      const shouldExecute = command.executeIfMessage(message)
      if (shouldExecute) {
        const commandTask = new CommandTask()
        void this.executeTaskQueue.enqueue(() => {
          command._safeExecute(message, commandTask, this)
        })

        this.commandTasks.push(commandTask)
        return
      }
    }
  }
  kill(): void {
    if (this.socket) {
      this.socket.end(new Error("Socket connection killed."))
      console.log("[-] BOT: Socket connection killed")
    }
  }

  addCommand(params: CommandConstructorType): void {
    const newCommand = new Command(params)
    this.commands.push(newCommand)
  }

  sendMessage(
    jid: string,
    content: AnyMessageContent,
    options?: SendMessageOptions,
  ): void {
    void this.messagesTaskQueue.enqueue(() => {
      void this.socket
        ?.sendMessage(jid, content, options)
        .catch((e: unknown) => {
          console.log("[-] BOT: Failed to send message: ", e)
        })
    })
  }

  async sendMessageAdvanced(
    jid: string,
    content: AnyMessageContent,
    options?: SendMessageOptions,
  ): Promise<MessageReceivedType> {
    return new Promise<MessageReceivedType>(res => {
      void this.messagesTaskQueue.enqueue(() => {
        void this.socket?.sendMessage(jid, content, options).then(message => {
          if (!message) return
          const content = getMessageContent(message)
          res(content)
        })
      })
    })
  }

  sendSimpleMessage(jid: string, text: string): void {
    this.sendMessage(jid, {
      text,
    })
  }

  sendReaction(jid: string, reactTo: proto.IMessageKey, text: string): void {
    this.sendMessage(jid, {
      react: {
        key: reactTo,
        text,
      },
    })
  }
  sendSimpleImage(jid: string, imageUrl: string, text = ""): void {
    this.sendMessage(jid, {
      image: { url: imageUrl },
      caption: text,
    })
  }
}
