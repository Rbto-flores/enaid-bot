import repository from "../../database/repository/index.js"
import type { CreateContactType } from "../converter/receivedContacts.js"


export async function saveManyContacts(contacts: CreateContactType[]): Promise<void> {
  await repository.contacts.insertManyContacts(contacts)
}