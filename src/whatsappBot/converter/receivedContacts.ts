import type { Contact } from "@whiskeysockets/baileys"

export interface CreateContactType {
  jid: string
  name: string
  status: string
  whatsapp_id: string
}

export interface ContactReceivedType {
  jid: string
  name: string
  status: string
  whatsapp_id: string
}

export function handleReceivedContacts(
  contacts: Contact[],
): ContactReceivedType[] {
  const formattedContacts: ContactReceivedType[] = []
  for (const contact of contacts) {
    formattedContacts.push({
      whatsapp_id: contact.id,
      jid: contact.lid ?? "",
      name: contact.name ?? "Unknown",
      status: contact.status ?? "No status",
    })
  }
  return formattedContacts
}
