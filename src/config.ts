import dotenv from "dotenv"


dotenv.config()

const v = process.env

const googleClientEmail = "GOOGLE_CLIENT_EMAIL"
const googlePrivateKey = "GOOGLE_PRIVATE_KEY"
const databaseURL = "DATABASE_URL"


if (!v[googleClientEmail])
  throw new Error(`${googleClientEmail} not found in .env`)
if (!v[googlePrivateKey])
  throw new Error(`${googlePrivateKey} not found in .env`)
if (!v[databaseURL]) throw new Error(`${databaseURL} not found in .env`)

export const env: {
  [googleClientEmail]: string
  [googlePrivateKey]: string
  [databaseURL]: string
} = {
  [googleClientEmail]: v[googleClientEmail],
  [googlePrivateKey]: v[googlePrivateKey].split(String.raw`\n`).join("\n"),
  [databaseURL]: v[databaseURL],
}
