import { describe, expect, test } from "bun:test";
import { applyMove, bitFor, createBoard, isLegal, legalMoves } from "../lib/board";
import { COLS, ROWS } from "../lib/constants";
import type { Player } from "../lib/board";

describe("createBoard", () => {
  test("starts empty", () => {
    const b = createBoard();
    expect(b.p1).toBe(0n);
    expect(b.p2).toBe(0n);
    expect(b.heights).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("bitFor", () => {
  test("uses a 7-bit stride per column", () => {
    expect(bitFor(0, 0)).toBe(1n);
    expect(bitFor(0, 5)).toBe(1n << 5n);
    expect(bitFor(1, 0)).toBe(1n << 7n);
    expect(bitFor(6, 5)).toBe(1n << 47n);
  });

  test("never returns a sentinel bit", () => {
    // Sentinel bits are column*7 + 6. No playable cell may produce one.
    const sentinels = new Set([6n, 13n, 20n, 27n, 34n, 41n, 48n].map((n) => 1n << n));
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        expect(sentinels.has(bitFor(c, r))).toBe(false);
      }
    }
  });
});

describe("isLegal", () => {
  test("accepts every column on an empty board", () => {
    const b = createBoard();
    for (let c = 0; c < COLS; c++) expect(isLegal(b, c)).toBe(true);
  });

  test("rejects a full column", () => {
    let b = createBoard();
    for (let i = 0; i < ROWS; i++) {
      b = applyMove(b, 0, ((i % 2) + 1) as Player);
    }
    expect(isLegal(b, 0)).toBe(false);
    expect(isLegal(b, 1)).toBe(true);
  });

  test("rejects out-of-range columns", () => {
    const b = createBoard();
    expect(isLegal(b, -1)).toBe(false);
    expect(isLegal(b, 7)).toBe(false);
    expect(isLegal(b, 99)).toBe(false);
  });
});

describe("applyMove", () => {
  test("places a disc at the bottom of an empty column", () => {
    const b = applyMove(createBoard(), 3, 1);
    expect(b.p1).toBe(bitFor(3, 0));
    expect(b.p2).toBe(0n);
    expect(b.heights[3]).toBe(1);
  });

  test("stacks discs upward", () => {
    let b = createBoard();
    b = applyMove(b, 2, 1);
    b = applyMove(b, 2, 2);
    expect(b.p1).toBe(bitFor(2, 0));
    expect(b.p2).toBe(bitFor(2, 1));
    expect(b.heights[2]).toBe(2);
  });

  test("does not mutate the input board", () => {
    const before = createBoard();
    const after = applyMove(before, 0, 1);
    expect(before.p1).toBe(0n);
    expect(before.heights[0]).toBe(0);
    expect(after).not.toBe(before);
  });

  test("throws on an illegal move", () => {
    let b = createBoard();
    for (let i = 0; i < ROWS; i++) b = applyMove(b, 0, 1);
    expect(() => applyMove(b, 0, 1)).toThrow(/illegal/i);
    expect(() => applyMove(b, 9, 1)).toThrow(/illegal/i);
  });
});

describe("legalMoves", () => {
  test("returns centre-out order on an empty board", () => {
    expect(legalMoves(createBoard())).toEqual([3, 2, 4, 1, 5, 0, 6]);
  });

  test("omits full columns", () => {
    let b = createBoard();
    for (let i = 0; i < ROWS; i++) b = applyMove(b, 3, 1);
    expect(legalMoves(b)).toEqual([2, 4, 1, 5, 0, 6]);
  });

  test("returns an empty array on a full board", () => {
    let b = createBoard();
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) b = applyMove(b, c, 1);
    }
    expect(legalMoves(b)).toEqual([]);
  });
});
