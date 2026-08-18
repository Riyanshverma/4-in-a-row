import { discsOf, type Board, type Player } from "./board";
import { COLS, ROWS, SHIFTS } from "./constants";

/**
 * Does this player have four in a row?
 *
 * For each direction, `b & (b >> s)` marks every cell that begins a pair.
 * Applying the same shift twice more (`m & (m >> 2s)`) marks every cell that
 * begins a run of four. Four shift-and-AND pairs replace scanning 69 possible
 * lines, and the sentinel row is what stops shifts crossing a column boundary.
 */
export function checkWin(board: Board, player: Player): boolean {
  const discs = discsOf(board, player);

  for (const shift of SHIFTS) {
    const pairs = discs & (discs >> shift);
    if (pairs & (pairs >> (2n * shift))) return true;
  }

  return false;
}

/** Are all 42 cells occupied? */
export function isFull(board: Board): boolean {
  for (let column = 0; column < COLS; column++) {
    if ((board.heights[column] ?? 0) < ROWS) return false;
  }
  return true;
}

/** Full board with no winner. */
export function isDraw(board: Board): boolean {
  return isFull(board) && !checkWin(board, 1) && !checkWin(board, 2);
}
