# effect-phrases

Um sisteminha simples e bonito que fica passando frases "profundas" — que na
verdade são piadas internas ditas no trabalho, disfarçadas de máximas
filosóficas.

Backend em [Effect](https://effect.website) (TypeScript) + Postgres, rodando
como Serverless Functions na [Vercel](https://vercel.com). Frontend estático
elegante com transições suaves.

## Estrutura

- `api/phrases.ts` — Serverless Function: `GET` lista todas as frases, `POST` adiciona uma nova.
- `api/random.ts` — Serverless Function: `GET` retorna uma frase aleatória.
- `src/Database.ts` — conexão Postgres (via `@effect/sql-pg`) e migração da tabela `phrases`.
- `src/Phrases.ts` — serviço Effect com `all`, `random` e `add`.
- `src/runtime.ts` — `ManagedRuntime` compartilhado entre invocações "quentes" da function (evita reabrir conexão a cada request).
- `public/` — frontend (HTML/CSS/JS puro), servido estaticamente pela Vercel.

## Rodando localmente

Precisa de um Postgres para desenvolvimento. Duas opções:

**A) Postgres local via Docker (mais simples para começar):**

```bash
docker run -d --name effect-phrases-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=phrases -p 5432:5432 postgres:16-alpine
```

Crie um `.env.local` na raiz do projeto:

```
POSTGRES_URL=postgres://postgres:postgres@localhost:5432/phrases
```

**B) Usar o mesmo Postgres da Vercel (depois de configurar o deploy, veja abaixo):**

```bash
npx vercel link
npx vercel env pull .env.local
```

Depois, em qualquer um dos dois casos:

```bash
npm install
npm run dev    # roda `vercel dev`, emulando localmente API + estáticos como na Vercel
```

Abra http://localhost:3000 — as frases trocam sozinhas a cada 8s. Setas do
teclado (`←`/`→`) navegam manualmente, `espaço` pausa/retoma.

## API

- `GET /api/phrases` — lista todas as frases.
- `GET /api/random` — retorna uma frase aleatória.
- `POST /api/phrases` — adiciona uma nova frase. Body: `{ "text": "...", "author": "..." }` (`author` é opcional).

Para proteger o `POST` em produção, defina a variável de ambiente
`PHRASES_API_KEY` (no dashboard da Vercel, em Settings → Environment
Variables) e envie o header `x-api-key` nas requisições de escrita.

## Variáveis de ambiente

- `POSTGRES_URL` — connection string do Postgres (obrigatória).
- `PHRASES_API_KEY` — se definida, exige o header `x-api-key` no `POST /api/phrases`.
