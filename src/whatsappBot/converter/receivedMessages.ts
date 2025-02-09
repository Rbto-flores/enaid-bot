import type {
  proto,
  WAMessage,
  MessageUpsertType,
  WAMessageKey,
} from "@whiskeysockets/baileys"

interface MessageUpsertEventType {
  messages: WAMessage[]
  type: MessageUpsertType
  requestId?: string
}

interface ReactionEventType {
  key: WAMessageKey
  reaction: proto.IReaction
}

export interface MessageReceivedType {
  id: string | null | undefined
  timestamp: Date
  isText: boolean
  isImage: boolean
  isDocument: boolean
  fromMe: boolean | null | undefined
  fromGroup: boolean
  pushName: string
  jid: string
  senderJid: string
  internal: proto.IWebMessageInfo
  content: string
  quotedContent: {
    content: string | undefined
    id: string | null | undefined
  }
}

export interface ReactionReceivedType {
  jid: string // The chat jid
  internal: {
    key: WAMessageKey
    reaction: proto.IReaction
  }
  text: string
  timestamp: Date
  senderJid: string
  reactionId: string
  messageReactedId: string
}

function isTextMessage(message: proto.IWebMessageInfo) {
  const content = message.message
  if (content?.conversation) {
    return true
  }
  if (content?.extendedTextMessage?.text) {
    return true
  }
  return false
}

function isImageMessage(message: proto.IWebMessageInfo) {
  return !!message.message?.imageMessage
}

function isDocumentMessage(message: proto.IWebMessageInfo) {
  return !!message.message?.documentMessage
}

function isFromMe(message: proto.IWebMessageInfo) {
  return message.key.fromMe
}

function isMessageFromGroup(message: proto.IWebMessageInfo) {
  return !!message.key.participant
}

function getMessageTimestamp(message: proto.IWebMessageInfo) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const timestamp = message.messageTimestamp
  if (timestamp) {
    return new Date(Number(timestamp) * 1000)
  }
  return new Date()
}

function getMessagePushName(message: proto.IWebMessageInfo) {
  return message.pushName ?? message.key.remoteJid?.split("@")[0] ?? ""
}

function getQuotedContent(message: proto.IWebMessageInfo) {
  const quotedMessage =
    message.message?.extendedTextMessage?.contextInfo?.quotedMessage
  let content = quotedMessage?.conversation

  if (!content) {
    content = quotedMessage?.extendedTextMessage?.text
  }
  return {
    content: content ?? undefined,
    id: message.message?.extendedTextMessage?.contextInfo?.stanzaId,
  }
}

export function getMessageContent(
  message: proto.IWebMessageInfo,
): MessageReceivedType {
  const jid = message.key.remoteJid ?? ""
  const internal = message
  const timestamp = getMessageTimestamp(message)
  const isText = isTextMessage(message)
  const isImage = isImageMessage(message)
  const isDocument = isDocumentMessage(message)
  const fromMe = isFromMe(message)
  const fromGroup = isMessageFromGroup(message)
  const pushName = getMessagePushName(message)
  let content = message.message?.conversation
  let senderJid = message.key.participant
  const id = message.key.id

  if (!senderJid) {
    senderJid = message.key.remoteJid ?? ""
  }
  if (!content) {
    content = message.message?.extendedTextMessage?.text
  }
  if (!content) {
    content = ""
  }

  const quotedContent = getQuotedContent(message)
  return {
    id,
    timestamp,
    isText,
    isDocument,
    senderJid,
    fromMe,
    isImage,
    internal,
    fromGroup,
    pushName,
    jid,
    content,
    quotedContent,
  }
}

function getReactionContent(
  reaction: ReactionEventType,
): ReactionReceivedType | undefined {
  const jid = reaction.key.remoteJid
  const internal = reaction
  const text = reaction.reaction.text
  const reactionId = reaction.reaction.key?.id

  let senderJid = reaction.reaction.key?.participant
  if (!senderJid) {
    senderJid = reaction.reaction.key?.remoteJid
  }
  const messageReactedId = reaction.key.id ?? ""
  if (!jid || !text || !reactionId || !reaction.key.id || !senderJid) {
    return undefined
  }
  const timestamp = getMessageTimestamp(reaction)

  return {
    internal,
    senderJid,
    jid,
    timestamp,
    text,
    reactionId,
    messageReactedId,
  }
}
export function handleReceivedReactions(
  event: ReactionEventType[],
): ReactionReceivedType[] {
  const reactions: ReactionReceivedType[] = []
  for (const reaction of event) {
    const receivedReaction = getReactionContent(reaction)
    if (!receivedReaction) continue
    reactions.push(receivedReaction)
  }
  return reactions
}
export function handleReceivedMessages(
  event: MessageUpsertEventType,
): MessageReceivedType[] {
  const messages: MessageReceivedType[] = []
  for (const message of event.messages) {
    const receivedEvent = getMessageContent(message)
    if (receivedEvent.isText || receivedEvent.isImage) {
      messages.push(receivedEvent)
    }
  }

  return messages
}
