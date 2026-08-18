import { describe, expect, test } from "bun:test";
import { applyMove, createBoard, type Board, type Player } from "../lib/board";
import { evaluate, popcount } from "../lib/evaluate";

function build(placements: Array<[column: number, player: Player]>): Board {
  let board = createBoard();
  for (const [column, player] of placements) board = applyMove(board, column, player);
  return board;
}

describe("popcount", () => {
  test("counts set bits", () => {
    expect(popcount(0n)).toBe(0);
    expect(popcount(1n)).toBe(1);
    expect(popcount(0b1011n)).toBe(3);
    expect(popcount((1n << 40n) | 1n)).toBe(2);
  });
});

describe("evaluate", () => {
  test("scores an empty board as neutral", () => {
    expect(evaluate(createBoard(), 1)).toBe(0);
  });

  test("is symmetric — what is good for one is bad for the other", () => {
    const b = build([
      [3, 1],
      [0, 2],
      [3, 1],
    ]);
    expect(evaluate(b, 1)).toBe(-evaluate(b, 2));
  });

  test("prefers the centre column over an edge column", () => {
    const centre = build([[3, 1]]);
    const edge = build([[0, 1]]);
    expect(evaluate(centre, 1)).toBeGreaterThan(evaluate(edge, 1));
  });

  test("rewards connected discs over scattered ones", () => {
    const connected = build([
      [2, 1],
      [3, 1],
    ]);
    const scattered = build([
      [0, 1],
      [6, 1],
    ]);
    expect(evaluate(connected, 1)).toBeGreaterThan(evaluate(scattered, 1));
  });

  test("rewards a three-run more than a two-run", () => {
    const two = build([
      [0, 1],
      [0, 1],
    ]);
    const three = build([
      [0, 1],
      [0, 1],
      [0, 1],
    ]);
    expect(evaluate(three, 1)).toBeGreaterThan(evaluate(two, 1));
  });
});
