import { describe, expect, test } from "bun:test";
import { applyMove, createBoard, isLegal, type Board, type Player } from "../lib/board";
import { bestMove, scoreMove } from "../lib/search";
import { checkWin, isFull } from "../lib/win";

function build(placements: Array<[column: number, player: Player]>): Board {
  let board = createBoard();
  for (const [column, player] of placements) board = applyMove(board, column, player);
  return board;
}

describe("bestMove — tactics", () => {
  test("takes an available win in one", () => {
    // p1 has three in column 0; playing column 0 wins immediately
    const b = build([
      [0, 1],
      [0, 1],
      [0, 1],
      [1, 2],
      [1, 2],
      [1, 2],
    ]);
    expect(bestMove(b, 1, 4)).toBe(0);
  });

  test("blocks an opponent's win in one", () => {
    // p2 has three in column 3; p1 must play column 3
    const b = build([
      [3, 2],
      [3, 2],
      [3, 2],
      [0, 1],
      [1, 1],
    ]);
    expect(bestMove(b, 1, 4)).toBe(3);
  });

  test("prefers its own win over blocking the opponent's", () => {
    // Both sides have three in a row. Winning now beats defending.
    const b = build([
      [0, 1],
      [0, 1],
      [0, 1],
      [3, 2],
      [3, 2],
      [3, 2],
    ]);
    expect(bestMove(b, 1, 4)).toBe(0);
  });

  test("plays the centre on an empty board", () => {
    expect(bestMove(createBoard(), 1, 6)).toBe(3);
  });
});

describe("bestMove — contract", () => {
  test("always returns a legal column", () => {
    let board = createBoard();
    let player: Player = 1;
    for (let i = 0; i < 20; i++) {
      if (checkWin(board, 1) || checkWin(board, 2) || isFull(board)) break;
      const column = bestMove(board, player, 4);
      expect(isLegal(board, column)).toBe(true);
      board = applyMove(board, column, player);
      player = player === 1 ? 2 : 1;
    }
  });

  test("is deterministic for identical inputs", () => {
    const b = build([
      [3, 1],
      [3, 2],
      [4, 1],
      [4, 2],
      [2, 1],
    ]);
    expect(bestMove(b, 2, 6)).toBe(bestMove(b, 2, 6));
  });

  test("throws when no legal move exists", () => {
    let board = createBoard();
    for (let c = 0; c < 7; c++) {
      for (let r = 0; r < 6; r++) board = applyMove(board, c, 1);
    }
    expect(() => bestMove(board, 1, 4)).toThrow(/no legal moves/i);
  });
});

describe("scoreMove", () => {
  test("scores a winning move above a neutral one", () => {
    const b = build([
      [0, 1],
      [0, 1],
      [0, 1],
      [1, 2],
      [1, 2],
      [1, 2],
    ]);
    expect(scoreMove(b, 1, 0, 4)).toBeGreaterThan(scoreMove(b, 1, 5, 4));
  });

  test("scores a move that hands the opponent a win as very negative", () => {
    // p2 has three in column 3. Any p1 move other than column 3 loses.
    const b = build([
      [3, 2],
      [3, 2],
      [3, 2],
      [0, 1],
      [1, 1],
    ]);
    expect(scoreMove(b, 1, 6, 4)).toBeLessThan(-5000);
    expect(scoreMove(b, 1, 3, 4)).toBeGreaterThan(-5000);
  });
});

describe("bestMove — strength and speed", () => {
  test("depth 8 beats depth 2 in most self-play games", () => {
    let strongWins = 0;
    const GAMES = 6;

    for (let game = 0; game < GAMES; game++) {
      let board = createBoard();
      let player: Player = 1;
      const strong: Player = game % 2 === 0 ? 1 : 2;
      let moveCount = 0;

      for (;;) {
        const previous: Player = player === 1 ? 2 : 1;
        if (checkWin(board, previous)) {
          if (previous === strong) strongWins++;
          break;
        }
        if (isFull(board)) break;

        // Vary the opening so the games are not identical
        const column =
          moveCount === 0 ? game % 7 : bestMove(board, player, player === strong ? 7 : 2);

        board = applyMove(board, column, player);
        player = player === 1 ? 2 : 1;
        moveCount++;
      }
    }

    expect(strongWins).toBeGreaterThanOrEqual(4);
  });

  test("depth 7 on an empty board completes quickly", () => {
    const start = performance.now();
    bestMove(createBoard(), 1, 7);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });
});
