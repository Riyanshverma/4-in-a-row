import { describe, expect, test } from "bun:test";
import { applyMove, createBoard, type Board, type Player } from "../lib/board";
import { analyze, findWinningColumn, renderBoard } from "../lib/analyze";

function build(placements: Array<[column: number, player: Player]>): Board {
  let board = createBoard();
  for (const [column, player] of placements) board = applyMove(board, column, player);
  return board;
}

describe("findWinningColumn", () => {
  test("finds an immediate vertical win", () => {
    const b = build([
      [2, 1],
      [2, 1],
      [2, 1],
    ]);
    expect(findWinningColumn(b, 1)).toBe(2);
  });

  test("finds an immediate horizontal win", () => {
    const b = build([
      [0, 1],
      [1, 1],
      [2, 1],
    ]);
    expect(findWinningColumn(b, 1)).toBe(3);
  });

  test("returns null when there is no immediate win", () => {
    expect(findWinningColumn(createBoard(), 1)).toBeNull();
  });
});

describe("analyze", () => {
  test("reports an immediate win", () => {
    const b = build([
      [2, 1],
      [2, 1],
      [2, 1],
    ]);
    const a = analyze(b, 1);
    expect(a.immediateWin).toBe(2);
    expect(a.bestColumn).toBe(2);
    expect(a.score).toBeGreaterThan(5000);
  });

  test("reports a column that must be blocked", () => {
    const b = build([
      [3, 2],
      [3, 2],
      [3, 2],
      [0, 1],
    ]);
    const a = analyze(b, 1);
    expect(a.mustBlock).toBe(3);
    expect(a.bestColumn).toBe(3);
  });

  test("prefers its own win over blocking", () => {
    const b = build([
      [0, 1],
      [0, 1],
      [0, 1],
      [3, 2],
      [3, 2],
      [3, 2],
    ]);
    const a = analyze(b, 1);
    expect(a.immediateWin).toBe(0);
    expect(a.mustBlock).toBe(3);
    expect(a.bestColumn).toBe(0);
  });

  test("lists losing moves when the opponent threatens", () => {
    const b = build([
      [3, 2],
      [3, 2],
      [3, 2],
      [0, 1],
    ]);
    const a = analyze(b, 1);
    // Every column except 3 lets p2 complete the vertical four
    expect(a.losingMoves.length).toBeGreaterThan(0);
    expect(a.losingMoves).not.toContain(3);
  });

  test("reports no losing moves on an empty board", () => {
    expect(analyze(createBoard(), 1).losingMoves).toEqual([]);
  });

  test("scores every legal column", () => {
    const a = analyze(createBoard(), 1);
    expect(a.columnScores).toHaveLength(7);
    expect(a.columnScores.map((c) => c.column).sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  test("omits full columns from column scores", () => {
    let board = createBoard();
    for (let i = 0; i < 6; i++) board = applyMove(board, 0, ((i % 2) + 1) as Player);
    const a = analyze(board, 1);
    expect(a.columnScores.map((c) => c.column)).not.toContain(0);
    expect(a.columnScores).toHaveLength(6);
  });

  test("identifies opponent threats", () => {
    const b = build([
      [3, 2],
      [3, 2],
      [3, 2],
      [0, 1],
    ]);
    const a = analyze(b, 1);
    const opponentThreats = a.threats.filter((t) => t.owner === "opponent");
    expect(opponentThreats.length).toBeGreaterThan(0);
    expect(opponentThreats.some((t) => t.column === 3)).toBe(true);
  });

  test("bestColumn always matches the highest column score", () => {
    const b = build([
      [3, 1],
      [3, 2],
      [2, 1],
      [4, 2],
    ]);
    const a = analyze(b, 1);
    const top = a.columnScores.reduce((x, y) => (y.score > x.score ? y : x));
    expect(a.bestColumn).toBe(top.column);
  });
});

describe("renderBoard", () => {
  test("renders an empty board with a column header", () => {
    const text = renderBoard(createBoard());
    expect(text).toContain("0 1 2 3 4 5 6");
    expect(text).toContain(".");
  });

  test("renders discs in the correct cells", () => {
    const b = build([
      [0, 1],
      [6, 2],
    ]);
    const lines = renderBoard(b).split("\n");
    const bottom = lines[lines.length - 2]!; // last line is the header
    expect(bottom.trim().startsWith("X")).toBe(true);
    expect(bottom.trim().endsWith("O")).toBe(true);
  });
});
