import type { VercelRequest, VercelResponse } from "@vercel/node"
import { Effect } from "effect"
import { PhrasesRepo } from "../src/Phrases.js"
import { runtime } from "../src/runtime.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    res.status(405).json({ error: "Método não permitido." })
    return
  }

  const phrase = await runtime.runPromise(
    Effect.gen(function* () {
      const repo = yield* PhrasesRepo
      return yield* repo.random
    })
  )
  res.status(200).json(phrase ?? null)
}
