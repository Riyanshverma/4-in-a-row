import { COLS, MOVE_ORDER, ROWS, STRIDE } from "./constants";

export type Player = 1 | 2;

/**
 * A Connect Four position.
 *
 * Each player's discs are a bitmask over a 49-bit space: 7 columns of
 * 7 bits (6 playable rows plus 1 unused sentinel). `heights[c]` is the
 * row index the next disc in column `c` will occupy.
 *
 * Boards are immutable. Every operation returns a new board.
 */
export type Board = {
  readonly p1: bigint;
  readonly p2: bigint;
  readonly heights: readonly number[];
};

/** The bit representing the cell at (column, row). Row 0 is the bottom. */
export function bitFor(column: number, row: number): bigint {
  return 1n << BigInt(column * STRIDE + row);
}

export function createBoard(): Board {
  return { p1: 0n, p2: 0n, heights: new Array<number>(COLS).fill(0) };
}

export function isLegal(board: Board, column: number): boolean {
  if (column < 0 || column >= COLS) return false;
  const height = board.heights[column];
  return height !== undefined && height < ROWS;
}

/** Legal columns in centre-out order, which is what makes alpha-beta prune well. */
export function legalMoves(board: Board): number[] {
  return MOVE_ORDER.filter((column) => isLegal(board, column));
}

/**
 * Drop a disc into a column.
 * @throws if the move is illegal — callers must check `isLegal` first.
 */
export function applyMove(board: Board, column: number, player: Player): Board {
  if (!isLegal(board, column)) {
    throw new Error(`illegal move: column ${column}`);
  }

  const row = board.heights[column]!;
  const bit = bitFor(column, row);

  const heights = [...board.heights];
  heights[column] = row + 1;

  return player === 1
    ? { p1: board.p1 | bit, p2: board.p2, heights }
    : { p1: board.p1, p2: board.p2 | bit, heights };
}

/** The bitmask belonging to a player. */
export function discsOf(board: Board, player: Player): bigint {
  return player === 1 ? board.p1 : board.p2;
}

/** The player whose turn follows this one. */
export function opponentOf(player: Player): Player {
  return player === 1 ? 2 : 1;
}
