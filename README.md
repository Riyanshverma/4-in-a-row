# 4 in a Row

A real-time, backend-driven Connect Four game. Two players compete over WebSockets; if no opponent
appears within 10 seconds, a minimax bot takes their place. During player-vs-player matches, either
side can ask an AI assistant for grounded advice on the current position.

This README is the single reference document for the project: what it is, how it is built, and how
each feature works end to end.

---

## Table of Contents

1. [What This Is](#what-this-is)
2. [Game Rules](#game-rules)
3. [Feature List](#feature-list)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Repository Layout](#repository-layout)
7. [The Engine](#the-engine)
8. [Data Model](#data-model)
9. [Sequence Flows](#sequence-flows)
10. [Socket & API Contracts](#socket--api-contracts)
11. [Security](#security)
12. [Testing](#testing)
13. [Running Locally](#running-locally)
14. [Design Decisions](#design-decisions)
15. [Out of Scope](#out-of-scope)

---

## What This Is

The project fulfils a backend engineering assignment: build a real-time multiplayer 4 in a Row
server with matchmaking, a competitive bot, reconnection handling, persistent game history, and a
leaderboard, plus a simple frontend.

Two additions go beyond the brief, chosen deliberately as learning goals:

- **An AI assistant** that explains the position in natural language during PvP matches.
- **A second backend service in Python/FastAPI** that owns the assistant, so the system is a genuine
  two-service architecture rather than a monolith.

The guiding principle throughout: **the game engine computes truth, the language model only supplies
wording.** The assistant never invents a move.

---

## Game Rules

Played on a **7 columns × 6 rows** grid. Players alternate dropping discs into a column; the disc
falls to the lowest empty cell in that column.

- First to connect **four discs** vertically, horizontally, or diagonally wins.
- If the board fills with no line of four, the game is a **draw**.

---

## Feature List

### Core (assignment requirements)

| # | Feature | Behaviour |
|---|---------|-----------|
| 1 | **Matchmaking** | Player enters a username and joins a queue. Paired with the next waiting player. |
| 2 | **Bot fallback** | If no opponent arrives within **10 seconds**, a bot starts the game instead. |
| 3 | **Competitive bot** | Minimax with alpha-beta pruning. Blocks immediate losses, takes immediate wins, plays positionally otherwise. Never random. |
| 4 | **Real-time play** | Socket.io. Both clients see every move immediately. |
| 5 | **Reconnection** | A disconnected player has **30 seconds** to rejoin the same game. After that the game is forfeited and the opponent wins. |
| 6 | **Live state** | Active games live in Redis, not process memory. |
| 7 | **Persistence** | Finished games, every move, and every hint are written to Postgres. |
| 8 | **Leaderboard** | Wins per player. Served live from a Redis sorted set, durable in Postgres. |
| 9 | **Frontend** | React board, username entry, live opponent moves, result screen, leaderboard. |

### Additions

| # | Feature | Behaviour |
|---|---------|-----------|
| 10 | **AI assistant** | PvP only. Explains the best move, names threats, answers follow-up questions about the position. Streamed token by token over SSE. |
| 11 | **Hint budget** | 3 hints per player per game. The opponent is notified when a hint is used and how many remain. |
| 12 | **Difficulty selector** | Easy / Medium / Hard, chosen before queueing. Sets bot search depth (2 / 5 / 8) if the bot ends up playing. |
| 13 | **Move timer** | 30 seconds per move. On expiry the engine plays for you (auto-pilot). Three consecutive auto-moves forfeits the game. |
| 14 | **Game replay** | Moves are stored as rows, so any finished game can be replayed move by move. |

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Monorepo | **Turborepo** | Shared packages between web and server; one command starts everything. |
| Game server | **Bun + Fastify + Socket.io** | Fast runtime, native TypeScript, first-class WebSocket support. |
| Assistant service | **Python + FastAPI + Pydantic** | Owns LLM narration. Pydantic validates the facts it receives and the responses it returns. |
| Frontend | **React + Vite** | Fast dev loop, simple board rendering. |
| Live state | **Redis** | Authoritative game state, matchmaking queue, TTL timers, pub/sub, leaderboard. |
| Durable state | **Supabase Postgres** | Players, finished games, moves, hints. |
| Validation | **Zod** (TS) / **Pydantic** (Python) | Zod schemas in `packages/contracts` validate every socket event on both sides of the wire. |
| LLM | **Ollama** running `qwen2.5:3b` | Local, free, no API key needed to run the project. |
| Package manager | **Bun** (JS) / **uv** (Python) | Fast installs on both sides. |
| Testing | **bun test** | Engine unit tests plus socket integration tests. |

### LLM provider chain

The assistant resolves its provider in order, falling through on failure:

```
ollama (default)  →  openrouter (if OPENROUTER_API_KEY set)  →  template (no LLM)
```

The `template` provider formats the engine's facts as plain text. This means **the project runs with
no API key and no local model** — the assistant degrades to terse but correct advice rather than
breaking.

---

## Architecture

```
                          ┌──────────────────────────┐
                          │        apps/web          │
                          │      React + Vite        │
                          └───┬──────────────────┬───┘
             Socket.io (game) │                  │ SSE + REST (hints)
                              ▼                  ▼
              ┌───────────────────────┐   ┌────────────────────────┐
              │     apps/server       │   │    apps/assistant      │
              │   Bun + Fastify       │◄──┤   Python + FastAPI     │
              │  game authority       │──►│   hint narration       │
              │  Socket.io            │   │   Pydantic + Ollama    │
              │  imports engine       │   │                        │
              └───┬───────────────┬───┘   └────┬──────────────┬────┘
                  │               │            │              │
                  ▼               ▼            ▼              ▼
          ┌──────────────┐  ┌──────────┐  ┌────────┐   ┌────────────┐
          │    Redis     │  │ Supabase │  │ Redis  │   │   Ollama   │
          │  game:*      │  │ Postgres │  │hint:*  │   │qwen2.5:3b  │
          │  queue:*     │  │ players  │  │chat:*  │   └────────────┘
          │  leaderboard │  │ games    │  │reads   │
          │  pub/sub     │  │ moves    │  │game:*  │
          └──────────────┘  │ hints    │  └────────┘
                            └──────────┘
                  ▲
                  │ imported (pure TS, no I/O)
          ┌───────┴─────────┐
          │ packages/engine │  bitboard · minimax+αβ · threat analysis
          └─────────────────┘
```

### Two services, one authority

Fastify owns the game. Every move, every win check, every state write goes through it. FastAPI reads
game state but never writes it. **There is exactly one writer for live game truth** — this is what
keeps a two-service design from becoming a distributed-state problem.

### Truth boundaries

| Concern | Owner | Never lives in |
|---------|-------|----------------|
| Live board, turn, timers | Redis | Client, process memory |
| Move legality, win detection | `packages/engine`, server-side | Client |
| Finished games, moves, hints | Postgres | Redis |
| Live leaderboard reads | Redis sorted set | — |
| Hint **facts** (best column, threats, score) | Engine | LLM |
| Hint **wording** | Ollama | Engine |

### Redis key ownership

One writer per prefix. FastAPI reads `game:*` but never writes it.

| Key | Type | Writer | TTL | Contents |
|-----|------|--------|-----|----------|
| `game:{gameId}` | hash | Fastify | 2h | board, turn, players, status, difficulty, moveDeadline |
| `queue:waiting` | list | Fastify | — | players awaiting a match |
| `player:{playerId}:game` | string | Fastify | 2h | current gameId, for reconnect lookup |
| `disconnect:{gameId}:{playerId}` | string | Fastify | **30s** | presence of this key means "grace period active" |
| `leaderboard` | zset | Fastify | — | wins, scored per `playerId` |
| `hint:{gameId}:{playerId}` | string | FastAPI | 2h | hints used (max 3) |
| `chat:{gameId}:{playerId}` | list | FastAPI | 2h | conversation turns |

Two requirements map directly onto Redis TTL rather than application timers: the 30-second
reconnect window and the 2-hour abandoned-game cleanup.

### Statelessness

Neither service keeps game state in process memory. Socket.io uses the Redis adapter for cross-node
fanout, so a reconnecting player can land on any server node and still reach their opponent. No
sticky sessions required.

### Failure behaviour

| Failure | Effect |
|---------|--------|
| Ollama unreachable | Provider chain falls to OpenRouter, then to templated engine facts. |
| FastAPI down | Hint button disabled. **Gameplay unaffected** — the assistant is a side channel. |
| Redis down | Fatal. Redis is the source of truth by design. |
| Postgres down | Games play normally; persistence is queued and retried at game end. |

---

## Repository Layout

```
4-in-a-row/
├── apps/
│   ├── web/                  React + Vite frontend
│   ├── server/               Bun + Fastify + Socket.io  (game authority)
│   └── assistant/            Python + FastAPI           (AI assistant)
│       ├── pyproject.toml    uv-managed Python deps
│       └── package.json      6-line shim so `turbo dev` starts it
├── packages/
│   ├── engine/               Pure TypeScript game logic — no I/O
│   ├── contracts/            Zod schemas for every wire message
│   └── types/                Shared types (mostly z.infer re-exports)
├── docs/
│   └── superpowers/specs/    Design documents
├── turbo.json
└── README.md
```

**Why `types` and `contracts` are separate:** `contracts` holds Zod schemas — runtime validators.
`types` re-exports the types those schemas infer, plus hand-written types with no runtime shape
(socket event maps, engine result types). The Zod schema stays the single source of truth; `types`
never declares a parallel interface.

---

## The Engine

`packages/engine` is a pure library. No network, no database, no Redis, no I/O of any kind.
Functions in, values out. That is what makes it trivially testable and safe to import anywhere.

### API

| Function | Returns | Used by |
|----------|---------|---------|
| `createBoard()` | empty bitboard | game creation |
| `applyMove(board, column)` | new board | every move |
| `isLegal(board, column)` | boolean | move validation |
| `checkWin(board)` | winner or null | after every move |
| `isDraw(board)` | boolean | after every move |
| `bestMove(board, depth)` | column | bot turn, auto-pilot |
| `analyze(board, player)` | facts object | AI assistant |

### What minimax is

A game-tree search algorithm — plain code, no machine learning, no training data. From the current
board it simulates every legal move, then every reply, down to a fixed depth. You pick the move with
the **max**imum score; the opponent is assumed to pick the one that **min**imises it. Hence
*minimax*.

Two optimisations make it fast enough to run inside a live request:

- **Alpha-beta pruning** — abandon a branch once it is proven worse than one already evaluated. Cuts
  roughly 90% of the tree with no loss of accuracy.
- **Bitboards** — the 7×6 board is two 64-bit integers (one bitmask per player) rather than an array.
  Checking for four in a row becomes four shift-and-AND operations instead of scanning lines.

Depth 7 evaluates on the order of 10⁵–10⁶ positions and returns in well under 50 ms.

### Difficulty

| Level | Depth | Character |
|-------|-------|-----------|
| Easy | 2 | Sees the immediate threat only. Beatable. |
| Medium | 5 | Solid. Punishes obvious mistakes. |
| Hard | 8 | Beats most human players. |

Difficulty is chosen on the username screen, before queueing, so it is already known if the
10-second timeout hands the game to a bot.

### Three consumers, one implementation

1. **The bot** calls `bestMove(board, depth)` on its turn.
2. **Auto-pilot** calls the same function when a player's 30-second move timer expires.
3. **The assistant** calls `analyze(board, player)` and hands the result to the LLM.

`analyze()` returns structured facts:

```ts
{
  bestColumn: 4,
  score: 120,                        // positive favours the asking player
  immediateWin: null,                // column that wins now, if any
  mustBlock: 3,                      // opponent wins here next turn
  losingMoves: [2, 6],               // columns that lose within N plies
  threats: [{ column: 3, row: 2, direction: "diagonal", owner: "opponent" }]
}
```

The LLM is **never** asked "what is the best move?" It is told the facts and asked only to phrase
them. This is why the assistant cannot hallucinate a move.

---

## Data Model

### Redis (live)

`game:{gameId}` — hash:

```
boardP1        bigint as string   bitmask of player 1 discs
boardP2        bigint as string   bitmask of player 2 discs
heights        JSON [7]           next free row per column
turn           playerId
players        JSON               [{playerId, username, disc}]
mode           "pvp" | "bot"
difficulty     "easy" | "medium" | "hard"
status         "active" | "finished"
moveDeadline   unix ms
autoMoves      JSON               consecutive auto-moves per player
moveCount      int
```

### Postgres (durable)

```sql
players
  id            uuid primary key
  username      text not null              -- display name, NOT unique
  created_at    timestamptz default now()
  index on (username)                      -- lookup only, duplicates allowed

games
  id            uuid primary key
  player1_id    uuid references players(id)
  player2_id    uuid references players(id) null   -- null when opponent is the bot
  mode          text not null                      -- 'pvp' | 'bot'
  difficulty    text null
  winner_id     uuid references players(id) null   -- null on draw or bot win
  is_draw       bool not null default false
  end_reason    text not null                      -- 'win' | 'draw' | 'forfeit' | 'timeout' | 'abandoned'
  started_at    timestamptz not null
  finished_at   timestamptz not null

moves
  id            bigserial primary key
  game_id       uuid references games(id)
  move_number   int not null
  player_id     uuid null                          -- null for bot moves
  column        smallint not null
  was_auto      bool not null default false        -- played by the move timer
  created_at    timestamptz not null
  unique (game_id, move_number)

hints
  id            bigserial primary key
  game_id       uuid references games(id)
  player_id     uuid references players(id)
  move_number   int not null                       -- position when the hint was asked
  suggested_column smallint not null               -- what the engine recommended
  followed      bool null                          -- did the player play it?
  created_at    timestamptz not null
```

`moves` stored as rows gives replay for free. `hints.followed` allows an "assistant accuracy"
statistic without extra bookkeeping.

The leaderboard is served from the Redis sorted set for reads and derived from
`games` for durability. Postgres is the recovery source if Redis is flushed.

---

## Sequence Flows

### 1. Matchmaking — player found

```
Player A                Fastify              Redis                Player B
   │                       │                   │                     │
   ├── join {username} ────►                   │                     │
   │                       ├── LPUSH queue ────►                     │
   │                       │                   │                     │
   ◄── queued ─────────────┤                   │                     │
   │                  [10s timer armed]        │                     │
   │                       │                   ◄──── join {username} ┤
   │                       ├── RPOP queue ─────►                     │
   │                  [timer cancelled]        │                     │
   │                       ├── HSET game:{id} ─►                     │
   ◄── game:start ─────────┼───────────────────┼──── game:start ─────►
   │        {gameId, yourDisc, opponent, turn} │                     │
```

### 2. Matchmaking — timeout, bot takes over

```
Player A                Fastify              Redis            Engine
   │                       │                   │                 │
   ├── join {username,     │                   │                 │
   │        difficulty} ───►                   │                 │
   │                       ├── LPUSH queue ────►                 │
   ◄── queued ─────────────┤                   │                 │
   │                  [10 seconds pass]        │                 │
   │                       ├── LREM queue ─────►                 │
   │                       ├── HSET game:{id}  │                 │
   │                       │   mode=bot ───────►                 │
   ◄── game:start ─────────┤                   │                 │
   │   {opponent: "Bot (medium)"}              │                 │
```

The difficulty the player chose before queueing is the difficulty the bot uses.

### 3. A move, and the bot's reply

```
Player               Fastify            Redis           Engine          Opponent
  │                     │                 │               │                │
  ├─ move {gameId,col} ─►                 │               │                │
  │                     ├─ HGETALL ───────►               │                │
  │                     ◄─ state ─────────┤               │                │
  │              [verify: your turn? column legal? game active?]           │
  │                     ├─ applyMove ─────┼───────────────►                │
  │                     ├─ checkWin ──────┼───────────────►                │
  │                     ├─ HSET (new board, turn flipped) ►                │
  ◄─ move:made ─────────┼─────────────────┼───────────────┼────────────────►
  │                     │                 │               │                │
  │              [if mode = bot]          │               │                │
  │                     ├─ bestMove(board, depth) ────────►                │
  │                     ◄─ column ────────┼───────────────┤                │
  │                     ├─ applyMove + checkWin + HSET ───►                │
  ◄─ move:made (bot) ───┤                 │               │                │
```

Every move is validated server-side against Redis state. The client is never trusted.

### 4. Disconnect and reconnect

```
Player A            Fastify              Redis              Player B
   │                   │                    │                  │
   ╳ connection lost   │                    │                  │
                       ├─ SETEX disconnect: │                  │
                       │   {gameId}:{pid}   │                  │
                       │   TTL 30s ─────────►                  │
                       ├────────────────────┼─ opponent:offline ►
                       │                    │   {secondsLeft:30}│
   │                   │                    │                  │
   ├─ reconnect ───────►                    │                  │
   │  {JWT}            ├─ GET player:{pid}:game ►              │
   │                   ├─ DEL disconnect:… ─►                  │
   ◄─ game:resume ─────┤                    │                  │
   │  {full state}     ├────────────────────┼─ opponent:online ►
```

If the key expires instead:

```
                    Redis                Fastify            Player B
                      │                     │                  │
              [TTL expires, keyspace        │                  │
               notification fires] ─────────►                  │
                      │                     ├─ HSET status=finished
                      │                     ├─ persist to Postgres
                      │                     ├── game:over ──────►
                      │                     │   {reason: forfeit,
                      │                     │    winner: B}
```

Expiry is detected via Redis keyspace notifications, not a polling loop.

### 5. Move timer expiry (auto-pilot)

```
Fastify              Redis           Engine          Both players
   │                   │               │                  │
[moveDeadline reached] │               │                  │
   ├─ HGETALL ─────────►               │                  │
   ├─ bestMove(board, depth 5) ────────►                  │
   ◄─ column ──────────┼───────────────┤                  │
   ├─ applyMove, autoMoves[player]++ ──►                  │
   ├───────────────────┼───────────────┼─ move:made ──────►
   │                   │               │   {wasAuto: true}│
   │                                                      │
[if autoMoves[player] == 3]                               │
   ├─ game:over {reason: timeout, winner: opponent} ──────►
```

### 6. AI hint (PvP only)

```
Player          FastAPI           Fastify          Redis         Ollama
  │                │                 │               │              │
  ├─ GET /hint ────►                 │               │              │
  │  ?gameId       │                 │               │              │
  │  Bearer JWT    │                 │               │              │
  │           [verify JWT with shared secret]        │              │
  │                ├─ HGETALL game:{id} ─────────────►              │
  │                │  (read-only: in this game? pvp? active?)       │
  │                ◄─ game hash ─────┼───────────────┤              │
  │                ├─ INCR hint:{gameId}:{playerId} ─►              │
  │                ◄─ count ─────────┼───────────────┤              │
  │           [if count > 3 → 429, DECR, stop]       │              │
  │                │                 │               │              │
  │                ├─ POST /internal/analyze ────────►              │
  │                │  X-Service-Secret               │              │
  │                │                 ├─ engine.analyze() ───────────►
  │                ◄─ facts JSON ────┤               │              │
  │           [Pydantic validates facts]             │              │
  ◄═ event: meta ══┤  (recommended column, before any prose)        │
  │                ├─ build prompt (facts only) ─────┼──────────────►
  ◄═ event: chunk ═┼─────────────────┼───────────────┼══ tokens ════┤
  │  token by token│                 │               │              │
  │                ├─ PUBLISH hints:used ────────────►              │
  │                │  {gameId, playerId, remaining: 2}              │
  │                │                 ◄─ subscribed ──┤              │
  │                │                 ├── hint:used ──┼──────────────► Both players
  ◄═ event: done ══┤                 │               │              │
```

Four things worth noting:

- The client holds **two connections**: Socket.io for gameplay, SSE for hints. Hint traffic is
  one-directional server-to-client text, which is exactly what SSE is for.
- FastAPI **publishes** to Redis pub/sub; Fastify **subscribes** and relays to the sockets. FastAPI
  knows the hint happened, Fastify owns the sockets — no extra HTTP call back.
- The hint counter is incremented **before** the expensive work and decremented on rejection, so the
  limit holds under concurrent requests.
- The hint request never writes game state. It is strictly a read side channel.

### 7. Game end and persistence

```
Fastify            Redis          Postgres        Both players
   │                 │                │                │
[win / draw / forfeit / timeout]      │                │
   ├─ HSET status=finished ►          │                │
   ├─ ZINCRBY leaderboard 1 {winner} ►│                │
   ├─ INSERT games ──┼────────────────►                │
   ├─ INSERT moves (batch) ───────────►                │
   ├─ INSERT hints (batch) ───────────►                │
   ├─ EXPIRE game:{id} 300 ►          │                │
   ├─────────────────┼────────────────┼─ game:over ────►
   │                 │                │  {winner, reason, finalBoard}
```

The game key is kept for five more minutes so a late reconnect sees the result rather than a
missing game.

---

## Socket & API Contracts

Every payload below is defined once as a Zod schema in `packages/contracts` and validated on both
ends of the wire.

### Client → Server (Socket.io)

| Event | Payload | Notes |
|-------|---------|-------|
| `join` | `{ username, difficulty }` | Enters the matchmaking queue. |
| `move` | `{ gameId, column }` | Server validates turn, legality, game status. |
| `reconnect` | `{ gameId }` | JWT identifies the player. |
| `leave` | `{ gameId }` | Explicit forfeit. |

### Server → Client (Socket.io)

| Event | Payload |
|-------|---------|
| `queued` | `{ position, timeoutMs: 10000 }` |
| `game:start` | `{ gameId, yourDisc, opponent, mode, turn, moveDeadline }` |
| `move:made` | `{ column, row, disc, nextTurn, moveDeadline, wasAuto }` |
| `game:over` | `{ winner, reason, finalBoard }` |
| `opponent:offline` | `{ secondsLeft }` |
| `opponent:online` | `{}` |
| `opponent:hint-used` | `{ remaining }` |
| `game:resume` | `{ full game state }` |
| `error` | `{ code, message }` |

### REST (Fastify)

| Route | Purpose |
|-------|---------|
| `GET /leaderboard?limit=10` | Top players by wins. Redis sorted set. |
| `GET /games/:id` | Finished game with full move list, for replay. |
| `POST /api/auth/token` | Mints a player JWT from a display name. The only unauthenticated route. |
| `GET /api/players/:id/stats` | Played, won, lost, drawn for one player. |
| `POST /internal/analyze` | **Service-to-service only.** Requires `X-Service-Secret`. Returns engine facts. |

### REST + SSE (FastAPI)

| Route | Purpose |
|-------|---------|
| `GET /hint?gameId=…` | SSE stream. Engine-grounded advice for the current position. Requires the player's JWT. |
| `GET /hint/budget?gameId=…` | Hints remaining for the calling player in one game. |
| `GET /health` | Liveness. Deliberately touches nothing external. |
| `GET /ready` | Readiness, including Redis and the Fastify analyze endpoint. |

---

## Security

| Boundary | Mechanism |
|----------|-----------|
| Player identity | Signed JWT issued by Fastify on `join`, stored in an httpOnly cookie. Carries `playerId` and `username`. |
| Socket handshake | JWT verified before the connection is accepted. |
| FastAPI requests | The same player JWT, `Bearer` header, verified with the **shared user secret**. |
| Service-to-service | `X-Service-Secret` header on `POST /internal/analyze`, a **different secret** from the user JWT and never sent to a browser. |
| Move validation | Turn ownership, column legality, and game status all checked server-side against Redis. |
| Hint authorisation | FastAPI confirms the caller is a participant in the requested game before analysing it. |
| Assistant scope | PvP only. Rejected with 403 for bot matches. |

Two separate secrets, because they answer two different questions: *which player is this?* and *is
this call from our own service?*

Username entry is not authentication — it is a display name attached to an anonymous session. The
JWT is what actually identifies a player, which is why reconnection cannot be achieved by simply
typing someone else's name.

---

## Testing

Run with `bun test`.

### Engine unit tests — `packages/engine`

Pure functions, no mocks, no setup.

- Win detection: vertical, horizontal, both diagonals, edge columns, top row.
- Draw detection: full board with no line.
- Legality: full column rejected, out-of-range column rejected.
- Minimax correctness: takes an available win in one; blocks an opponent's win in one; prefers a
  win-in-one over a block; avoids moves that hand the opponent a win.
- Determinism: the same board and depth always return the same column.
- Depth behaviour: depth 8 beats depth 2 across a series of self-play games.

### Integration tests — `apps/server`

Two real socket clients against a running server with a test Redis.

- Two clients join, get matched, play a full game to a win.
- A single client waits 10 seconds and is matched with a bot at its chosen difficulty.
- Client disconnects mid-game, reconnects within 30 seconds, receives full resumed state.
- Client disconnects and does not return; after 30 seconds the opponent wins by forfeit.
- Out-of-turn move rejected. Illegal column rejected. Move on a finished game rejected.
- Move timer expiry triggers an auto-move; three in a row forfeits the game.
- Hint limit: the fourth request in one game returns 429.
- Hint on a bot match returns 403.

The frontend is verified manually. E2E browser tests are deliberately out of scope — the risk in
this system is in socket lifecycle and race conditions, which integration tests cover directly.

---

## Running Locally

### Prerequisites

- Bun ≥ 1.1
- Python ≥ 3.11 with `uv`
- Redis (local or Docker)
- A Supabase project, or local Postgres
- Ollama with `qwen2.5:3b` pulled — *optional*, the assistant falls back to templated advice without it

### Setup

```bash
bun install                       # JS workspaces
cd apps/assistant && uv sync      # Python deps
cp .env.example .env              # fill in secrets
bun run db:migrate                # create Postgres tables
turbo dev                         # starts web, server, and assistant
```

### Environment

```bash
# shared
REDIS_URL=redis://localhost:6379
JWT_SECRET=…                      # user identity, both services
SERVICE_SECRET=…                  # service-to-service, both services

# apps/server
DATABASE_URL=postgresql://…       # Supabase
PORT=3001

# apps/assistant
SERVER_INTERNAL_URL=http://localhost:3001
LLM_PROVIDER=ollama               # ollama | openrouter | template
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
OPENROUTER_API_KEY=               # optional fallback
PORT=8000
```

---

## Design Decisions

Each of these was a fork in the road. The reasoning is recorded so it does not have to be
re-litigated later.

| Decision | Chosen | Rejected | Why |
|----------|--------|----------|-----|
| Live state location | Redis as authoritative | In-memory map | Makes the server stateless and horizontally scalable. The 10s and 30s requirements become TTLs rather than application timers. |
| Bot algorithm | Minimax + alpha-beta + bitboards | Heuristic rules; full solver | Strong enough to be interesting, fast enough for a live request, and the depth parameter gives difficulty levels for free. |
| Assistant grounding | Engine computes, LLM narrates | LLM reasons about the board | A small model plays Connect Four badly. Separating facts from wording makes hallucinated moves structurally impossible. |
| Engine location | TypeScript only; FastAPI calls back | Port minimax to Python as well | Two implementations of one algorithm inevitably drift, and then the bot and the assistant disagree about the same board. |
| Assistant transport | SSE | WebSocket; polling | Hint traffic is one-directional server-to-client text. SSE is exactly that and nothing more. |
| Hint notification | FastAPI publishes to Redis, Fastify relays | FastAPI calls Fastify over HTTP | FastAPI knows the event, Fastify owns the sockets. Pub/sub connects them without a synchronous hop. |
| Identity | Username + signed anonymous session | Username string only; full Supabase Auth | Reconnection needs a credential. A plain username means anyone can impersonate anyone by typing their name. |
| Move timer expiry | Engine plays for you | Auto-forfeit; no timer | Nobody is punished for thinking, stalls are impossible, and it reuses the engine already present. |
| Assistant availability | PvP only | Always available | Asking a minimax engine how to beat itself is meaningless. |
| Postgres schema | Normalised, moves as rows | Single table with a JSON move blob | Replay and hint analytics come free from rows. |
| Vector store for assistant memory | None | Redis vector; a vector DB | There are no documents to retrieve. Board state and chat history are tiny and already in Redis. RAG here would be decoration. |
| Testing depth | Unit + socket integration | Adding Playwright E2E | The real risk is in socket lifecycle and races, which E2E covers slowly and brittlely. |

---

## Out of Scope

**Kafka.** The assignment lists analytics events over Kafka. It is deliberately excluded from this
build. The seam is left in place: game lifecycle events (`game.started`, `move.made`, `game.ended`,
`hint.requested`) are already emitted through a single internal event bus, so adding a Kafka producer
later means implementing one interface rather than instrumenting the codebase.

**Also excluded:** spectator mode, tournaments, ranked matchmaking, chat between players, user
accounts with passwords, mobile-native clients.
# 4-in-a-row
