import { PgClient } from "@effect/sql-pg"
import { Effect, Schema } from "effect"

export class Phrase extends Schema.Class<Phrase>("Phrase")({
  id: Schema.Number,
  text: Schema.String,
  author: Schema.String,
  created_at: Schema.DateFromSelf
}) {}

export class PhrasesRepo extends Effect.Service<PhrasesRepo>()("PhrasesRepo", {
  effect: Effect.gen(function* () {
    const sql = yield* PgClient.PgClient

    const all = Effect.gen(function* () {
      const rows = yield* sql`SELECT * FROM phrases ORDER BY id ASC`
      return yield* Schema.decodeUnknown(Schema.Array(Phrase))(rows)
    })

    const random = Effect.gen(function* () {
      const rows = yield* sql`SELECT * FROM phrases ORDER BY RANDOM() LIMIT 1`
      return yield* Schema.decodeUnknown(Schema.Array(Phrase))(rows)
    }).pipe(Effect.map((rows) => rows[0]))

    const add = (text: string, author: string) =>
      Effect.gen(function* () {
        const rows =
          yield* sql`INSERT INTO phrases (text, author) VALUES (${text}, ${author}) RETURNING *`
        return yield* Schema.decodeUnknown(Schema.Array(Phrase))(rows)
      }).pipe(Effect.map((rows) => rows[0]))

    return { all, random, add } as const
  })
}) {}
