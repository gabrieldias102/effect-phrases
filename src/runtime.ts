import { Layer, ManagedRuntime } from "effect"
import { MigrationLive, SqlLive } from "./Database.js"
import { PhrasesRepo } from "./Phrases.js"

const AppLive = Layer.mergeAll(PhrasesRepo.Default, MigrationLive).pipe(
  Layer.provide(SqlLive)
)

export const runtime = ManagedRuntime.make(AppLive)
