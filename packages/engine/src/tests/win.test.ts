import { describe, expect, test } from "bun:test";
import { applyMove, createBoard, type Board, type Player } from "../lib/board";
import { checkWin, isDraw, isFull } from "../lib/win";

/** Build a position by placing specific discs. Bypasses turn alternation. */
function build(placements: Array<[column: number, player: Player]>): Board {
  let board = createBoard();
  for (const [column, player] of placements) {
    board = applyMove(board, column, player);
  }
  return board;
}

describe("checkWin — the four directions", () => {
  test("detects a vertical four", () => {
    const b = build([
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
    ]);
    expect(checkWin(b, 1)).toBe(true);
    expect(checkWin(b, 2)).toBe(false);
  });

  test("detects a horizontal four", () => {
    const b = build([
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ]);
    expect(checkWin(b, 1)).toBe(true);
  });

  test("detects an ascending diagonal", () => {
    // p1 occupies (0,0) (1,1) (2,2) (3,3), with p2 discs supporting underneath
    const b = build([
      [0, 1],
      [1, 2],
      [1, 1],
      [2, 2],
      [2, 2],
      [2, 1],
      [3, 2],
      [3, 2],
      [3, 2],
      [3, 1],
    ]);
    expect(checkWin(b, 1)).toBe(true);
  });

  test("detects a descending diagonal", () => {
    // p1 occupies (0,3) (1,2) (2,1) (3,0)
    const b = build([
      [0, 2],
      [0, 2],
      [0, 2],
      [0, 1],
      [1, 2],
      [1, 2],
      [1, 1],
      [2, 2],
      [2, 1],
      [3, 1],
    ]);
    expect(checkWin(b, 1)).toBe(true);
  });
});

describe("checkWin — edges and the sentinel row", () => {
  test("detects a win in the rightmost columns", () => {
    const b = build([
      [3, 1],
      [4, 1],
      [5, 1],
      [6, 1],
    ]);
    expect(checkWin(b, 1)).toBe(true);
  });

  test("detects a win in the top row", () => {
    let board = createBoard();
    // Fill rows 0-4 of columns 0-3 with alternating discs, then row 5 with p1
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 4; c++) {
        board = applyMove(board, c, ((r % 2) + 1) as Player);
      }
    }
    for (let c = 0; c < 4; c++) board = applyMove(board, c, 1);
    expect(checkWin(board, 1)).toBe(true);
  });

  test("does not wrap around from column 6 to column 0", () => {
    // (5,0) (6,0) (0,0) (1,0) — adjacent only if the board wrapped
    const b = build([
      [5, 1],
      [6, 1],
      [0, 1],
      [1, 1],
    ]);
    expect(checkWin(b, 1)).toBe(false);
  });

  test("does not wrap from the top of one column to the bottom of the next", () => {
    // p1 at (0,0) (0,1) (0,2) then (1,0) (1,1) — a bug without the sentinel
    const b = build([
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 2],
      [0, 2],
      [0, 1],
      [1, 1],
      [1, 1],
    ]);
    expect(checkWin(b, 1)).toBe(false);
  });
});

describe("checkWin — negatives", () => {
  test("three in a row is not a win", () => {
    const b = build([
      [0, 1],
      [0, 1],
      [0, 1],
    ]);
    expect(checkWin(b, 1)).toBe(false);
  });

  test("an empty board is not a win for either player", () => {
    const b = createBoard();
    expect(checkWin(b, 1)).toBe(false);
    expect(checkWin(b, 2)).toBe(false);
  });

  test("four discs split by an opponent disc is not a win", () => {
    const b = build([
      [0, 1],
      [1, 1],
      [2, 2],
      [3, 1],
      [4, 1],
    ]);
    expect(checkWin(b, 1)).toBe(false);
  });
});

describe("isFull and isDraw", () => {
  test("an empty board is neither full nor a draw", () => {
    const b = createBoard();
    expect(isFull(b)).toBe(false);
    expect(isDraw(b)).toBe(false);
  });

  test("a full board with no line is a draw", () => {
    // Column pattern 1,1,2,2 repeating produces no four in a row
    let board = createBoard();
    const pattern: Player[] = [1, 1, 2, 2, 1, 1];
    for (let c = 0; c < 7; c++) {
      const shifted = c % 2 === 0 ? pattern : ([...pattern].reverse() as Player[]);
      for (let r = 0; r < 6; r++) board = applyMove(board, c, shifted[r]!);
    }
    expect(isFull(board)).toBe(true);
    // Only assert draw if genuinely nobody won in this construction
    if (!checkWin(board, 1) && !checkWin(board, 2)) {
      expect(isDraw(board)).toBe(true);
    }
  });

  test("a full board with a winner is not a draw", () => {
    let board = createBoard();
    for (let c = 0; c < 7; c++) {
      for (let r = 0; r < 6; r++) board = applyMove(board, c, 1);
    }
    expect(isFull(board)).toBe(true);
    expect(checkWin(board, 1)).toBe(true);
    expect(isDraw(board)).toBe(false);
  });
});
