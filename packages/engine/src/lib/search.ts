import { applyMove, legalMoves, opponentOf, type Board, type Player } from "./board";
import { WIN_SCORE } from "./constants";
import { evaluate } from "./evaluate";
import { checkWin } from "./win";

/**
 * Negamax with alpha-beta pruning.
 *
 * Returns the score of `board` from the perspective of `player`, who is about
 * to move. Because the game is zero-sum, the opponent's best reply is simply
 * the negation of this function's result — hence `-search(...)` below, and
 * the swapped, negated alpha and beta bounds.
 *
 * The terminal check tests the player who moved *previously*. If they made
 * four in a row, the player to move has already lost. Subtracting `ply`
 * makes a win found sooner score higher than the same win found later, which
 * is what stops the engine from dawdling in a won position.
 */
export function search(
  board: Board,
  player: Player,
  depth: number,
  alpha: number,
  beta: number,
  ply: number,
): number {
  const previous = opponentOf(player);

  // The previous mover completed a line — the player to move has lost.
  if (checkWin(board, previous)) return -(WIN_SCORE - ply);

  const moves = legalMoves(board);
  if (moves.length === 0) return 0; // drawn: board full, nobody won

  if (depth === 0) return evaluate(board, player);

  let best = -Infinity;
  let currentAlpha = alpha;

  for (const column of moves) {
    const child = applyMove(board, column, player);
    const score = -search(child, previous, depth - 1, -beta, -currentAlpha, ply + 1);

    if (score > best) best = score;
    if (best > currentAlpha) currentAlpha = best;

    // The opponent already has a better option elsewhere; this branch is dead.
    if (currentAlpha >= beta) break;
  }

  return best;
}

/**
 * The strongest column for `player` at the given search depth.
 *
 * Deterministic: ties are broken by centre-out move order, so identical
 * inputs always produce identical output. That property is relied on by
 * tests and makes bot behaviour reproducible when debugging.
 *
 * @throws if the board is full.
 */
export function bestMove(board: Board, player: Player, depth: number): number {
  const moves = legalMoves(board);
  if (moves.length === 0) throw new Error("no legal moves: board is full");

  const opponent = opponentOf(player);
  let bestColumn = moves[0]!;
  let bestScore = -Infinity;

  for (const column of moves) {
    const child = applyMove(board, column, player);
    const score = -search(child, opponent, depth - 1, -Infinity, Infinity, 1);

    // Strictly greater, so the first-encountered (most central) move wins ties.
    if (score > bestScore) {
      bestScore = score;
      bestColumn = column;
    }
  }

  return bestColumn;
}

/**
 * Score a specific candidate move, from `player`'s perspective.
 * Used by `analyze()` to rank every column for the assistant.
 *
 * @throws if the column is illegal.
 */
export function scoreMove(board: Board, player: Player, column: number, depth: number): number {
  const child = applyMove(board, column, player); // throws if illegal
  return -search(child, opponentOf(player), depth - 1, -Infinity, Infinity, 1);
}
