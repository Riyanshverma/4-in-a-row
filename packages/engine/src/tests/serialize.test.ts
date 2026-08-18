import { describe, expect, test } from "bun:test";
import { applyMove, createBoard, type Board, type Player } from "../lib/board";
import { deserializeBoard, serializeBoard } from "../lib/serialize";

function build(placements: Array<[column: number, player: Player]>): Board {
  let board = createBoard();
  for (const [column, player] of placements) board = applyMove(board, column, player);
  return board;
}

describe("serializeBoard / deserializeBoard", () => {
  test("round-trips an empty board", () => {
    const original = createBoard();
    const restored = deserializeBoard(serializeBoard(original));
    expect(restored).toEqual(original);
  });

  test("round-trips a played board", () => {
    const original = build([
      [3, 1],
      [3, 2],
      [4, 1],
      [0, 2],
      [6, 1],
    ]);
    const restored = deserializeBoard(serializeBoard(original));
    expect(restored.p1).toBe(original.p1);
    expect(restored.p2).toBe(original.p2);
    expect(restored.heights).toEqual(original.heights);
  });

  test("round-trips a board using high bit positions", () => {
    let board = createBoard();
    for (let r = 0; r < 6; r++) board = applyMove(board, 6, ((r % 2) + 1) as Player);
    const restored = deserializeBoard(serializeBoard(board));
    expect(restored.p1).toBe(board.p1);
    expect(restored.p2).toBe(board.p2);
  });

  test("produces only string values, as Redis requires", () => {
    const data = serializeBoard(build([[3, 1]]));
    expect(typeof data.p1).toBe("string");
    expect(typeof data.p2).toBe("string");
    expect(typeof data.heights).toBe("string");
  });

  test("survives a JSON round-trip", () => {
    // The bug this guards: JSON.stringify throws on bigint.
    const original = build([
      [1, 1],
      [2, 2],
    ]);
    const json = JSON.stringify(serializeBoard(original));
    const restored = deserializeBoard(JSON.parse(json));
    expect(restored.p1).toBe(original.p1);
  });

  test("rejects malformed data", () => {
    expect(() => deserializeBoard({ p1: "nonsense", p2: "0", heights: "[0,0,0,0,0,0,0]" })).toThrow();
    expect(() => deserializeBoard({ p1: "0", p2: "0", heights: "[1,2]" })).toThrow(/heights/i);
  });
});
