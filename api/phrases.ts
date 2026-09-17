import type { VercelRequest, VercelResponse } from "@vercel/node"
import { Effect, Schema } from "effect"
import { PhrasesRepo } from "../src/Phrases.js"
import { runtime } from "../src/runtime.js"

const API_KEY = process.env.PHRASES_API_KEY

class NewPhrase extends Schema.Class<NewPhrase>("NewPhrase")({
  text: Schema.NonEmptyString,
  author: Schema.optional(Schema.String)
}) {}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const phrases = await runtime.runPromise(
      Effect.gen(function* () {
        const repo = yield* PhrasesRepo
        return yield* repo.all
      })
    )
    res.status(200).json(phrases)
    return
  }

  if (req.method === "POST") {
    if (API_KEY && req.headers["x-api-key"] !== API_KEY) {
      res.status(401).json({ error: "Não autorizado." })
      return
    }

    const parsed = Schema.decodeUnknownEither(NewPhrase)(req.body)
    if (parsed._tag === "Left") {
      res.status(400).json({ error: "Corpo inválido. Esperado { text, author? }." })
      return
    }

    const created = await runtime.runPromise(
      Effect.gen(function* () {
        const repo = yield* PhrasesRepo
        return yield* repo.add(parsed.right.text, parsed.right.author ?? "Anônimo do Escritório")
      })
    )
    res.status(201).json(created)
    return
  }

  res.setHeader("Allow", "GET, POST")
  res.status(405).json({ error: "Método não permitido." })
}
