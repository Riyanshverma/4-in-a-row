import { bitFor, discsOf, opponentOf, type Board, type Player } from "./board";
import { COLS, SHIFTS } from "./constants";

/**
 * Positional weight per column. A disc in the centre participates in more
 * possible lines of four than one at the edge, so it is worth more.
 */
const CENTRE_WEIGHT = [1, 2, 3, 4, 3, 2, 1] as const;

const PAIR_VALUE = 4;
const TRIPLE_VALUE = 12;

/** Number of set bits. Brian Kernighan's method — clears the lowest set bit each pass. */
export function popcount(bits: bigint): number {
  let count = 0;
  let value = bits;
  while (value) {
    value &= value - 1n;
    count++;
  }
  return count;
}

/** Sum of centre weights for every disc a player holds. */
function positionalScore(board: Board, player: Player): number {
  const discs = discsOf(board, player);
  let score = 0;

  for (let column = 0; column < COLS; column++) {
    const height = board.heights[column] ?? 0;
    for (let row = 0; row < height; row++) {
      if (discs & bitFor(column, row)) score += CENTRE_WEIGHT[column]!;
    }
  }

  return score;
}

/** Count adjacent pairs and triples in all four directions. */
function connectionScore(discs: bigint): number {
  let score = 0;

  for (const shift of SHIFTS) {
    const pairs = discs & (discs >> shift);
    if (pairs) {
      score += PAIR_VALUE * popcount(pairs);
      const triples = pairs & (pairs >> shift);
      if (triples) score += TRIPLE_VALUE * popcount(triples);
    }
  }

  return score;
}

/**
 * Heuristic score for a non-terminal position, from `player`'s perspective.
 * Positive favours `player`. Guaranteed symmetric:
 * `evaluate(b, 1) === -evaluate(b, 2)`.
 *
 * Only called at leaf nodes — terminal positions are scored by the search
 * itself, which knows the ply depth and so can prefer faster wins.
 */
export function evaluate(board: Board, player: Player): number {
  const opponent = opponentOf(player);

  const mine = positionalScore(board, player) + connectionScore(discsOf(board, player));
  const theirs = positionalScore(board, opponent) + connectionScore(discsOf(board, opponent));

  return mine - theirs;
}
