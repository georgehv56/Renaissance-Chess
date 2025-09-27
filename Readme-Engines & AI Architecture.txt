Engines & AI Architecture (Overview)
Decision Layer Orchestration (Move Selection Order)

Opening Book (Polyglot JSON + Zobrist) — up to ~15 moves: look up the Zobrist key and pick a weighted book move.

Endgame Tablebase (Lichess Syzygy, ≤7 pieces) — play the optimal move (win/draw/loss) using a FEN query.

Minimax + Alpha–Beta — default for middlegames: search to a practical depth with a material + positional evaluation.

Note: Stockfish is not integrated by default (unless added later). You can add a Stockfish WASM tier before Minimax for a big jump in strength and speed.

Game Rules Engine (TypeScript)

ChessEngine.ts (Immutable): full rules implementation (castling, en passant, promotion). Each move returns a new instance → React-friendly state.

State/Detection: check, checkmate, stalemate; move history in SAN/PGN and UCI.

FEN: exports standard FEN including side-to-move, castling rights, en-passant target, halfmove/fullmove counters.

Zobrist Hashing (zobrist.ts): 64-bit key covering:

piece-on-square, side-to-move, castling rights (KQkq), en-passant file.

Best practice: include the EP file only when an EP capture is legal; exclude halfmove/fullmove counters from the hash (they stay in FEN, not in the key).

Opening Book (polyglotBookService.ts)

Format: JSON files under /public/books/... mapping Zobrist → weighted UCI moves.

Blending: merge multiple books (e.g., mainline.json + human.json) for variety.

Headless Behavior: if loading fails, gracefully falls back to Tablebase/Minimax (no user-visible error).

Caching: fast in-memory FEN→bookResult cache (typical TTL ~30 min, p95 lookup in a few ms).

ECO Mapping: “In book / Out of book” status; optional local ECO table for labels.

Tablebase (tablebaseService.ts)

Trigger: total pieces on board ≤ 7.

Query: https://tablebase.lichess.ovh/standard?fen=... (async; recommended timeout ~150 ms + 5–10 min cache).

Result: optimal move + WDL; on timeout/error, fall through to next layer.

Recommended upgrade: DTZ-aware preference (choose zeroing moves—capture/pawn move/promotion—when close to the 50-move rule).

AI Service (aiService.ts) — Minimax

Search: Minimax with Alpha–Beta; typical depth 3–4 ply with dynamic deepening when in check.

Evaluation (evaluateBoard):

Material (standard piece values, often scaled ×10).

Positional (Piece-Square Tables): center control, piece activity, king safety, etc.

AI Personalities: slight biases (e.g., value knights/pawn structure) per user selection.

Hint System: “Request Hint” calls the same findBestMove for White and highlights the suggested move.

Supporting UI/Services

OpeningDisplay: shows ECO + opening name while still “in book”; detects “Out of book.”

MoveHistory: SAN/PGN + UCI, synced with engine state.

Audio: sound effects with first-click audio unlock to satisfy browser autoplay policies.

Typical Flags / Config

Book: file paths, blend weights, deterministic seed for tests.

Tablebase: timeout, cache size, DTZ-aware toggle.

Minimax: max depth, time/node budget, personality biases.

Perf: throttle engine/info updates (≤10 Hz), single Worker if you add Stockfish WASM.

Limitations & Notes

Without Stockfish/NNUE, overall strength and latency depend on Minimax. Adding Stockfish WASM (before Minimax) greatly improves both.

Tablebase requires network; use tight timeouts + caching for UX.

Tactical/explanatory overlays (e.g., CCT “Opponent Attack Lens”) are visual modules on top of the engine—they don’t replace it.