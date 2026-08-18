import type { Board } from "./board";
import { COLS, ROWS } from "./constants";

/**
 * A board in the shape Redis stores: every field a string.
 * `bigint` cannot be JSON-serialised, so the bitmasks are written in base 10.
 */
export type SerializedBoard = {
  p1: string;
  p2: string;
  heights: string;
};

export function serializeBoard(board: Board): SerializedBoard {
  return {
    p1: board.p1.toString(),
    p2: board.p2.toString(),
    heights: JSON.stringify(board.heights),
  };
}

export function deserializeBoard(data: SerializedBoard): Board {
  let p1: bigint;
  let p2: bigint;
  try {
    p1 = BigInt(data.p1);
    p2 = BigInt(data.p2);
  } catch {
    throw new Error(`invalid board bitmask: p1="${data.p1}" p2="${data.p2}"`);
  }

  const heights: unknown = JSON.parse(data.heights);

  if (
    !Array.isArray(heights) ||
    heights.length !== COLS ||
    !heights.every((h) => typeof h === "number" && Number.isInteger(h) && h >= 0 && h <= ROWS)
  ) {
    throw new Error(`invalid heights array: ${data.heights}`);
  }

  return { p1, p2, heights: heights as number[] };
}
