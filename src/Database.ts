import { PgClient } from "@effect/sql-pg"
import { Effect, Layer, Redacted } from "effect"

const connectionString = process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error("POSTGRES_URL não definida. Configure a variável de ambiente com a connection string do Postgres.")
}

const isLocal = /localhost|127\.0\.0\.1/.test(connectionString)

export const SqlLive = PgClient.layer({
  url: Redacted.make(connectionString),
  ssl: isLocal ? undefined : true
})

const migrate = Effect.gen(function* () {
  const sql = yield* PgClient.PgClient

  yield* sql`
    CREATE TABLE IF NOT EXISTS phrases (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Sabedoria Popular do Escritorio',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
})

export const MigrationLive = Layer.effectDiscard(migrate)
