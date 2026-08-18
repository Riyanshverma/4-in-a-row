import { describe, expect, test } from "bun:test";
import * as engine from "./index";

describe("public API", () => {
  test("exports every function the rest of the system imports", () => {
    const required = [
      "createBoard",
      "applyMove",
      "isLegal",
      "legalMoves",
      "opponentOf",
      "discsOf",
      "bitFor",
      "checkWin",
      "isDraw",
      "isFull",
      "evaluate",
      "popcount",
      "bestMove",
      "scoreMove",
      "search",
      "analyze",
      "findWinningColumn",
      "renderBoard",
      "serializeBoard",
      "deserializeBoard",
    ] as const;

    for (const name of required) {
      expect(typeof engine[name]).toBe("function");
    }
  });

  test("exports the constants the server depends on", () => {
    expect(engine.COLS).toBe(7);
    expect(engine.ROWS).toBe(6);
    expect(engine.STRIDE).toBe(7);
    expect(engine.AUTO_MOVE_DEPTH).toBe(5);
    expect(engine.DIFFICULTY_DEPTH).toEqual({ easy: 2, medium: 5, hard: 8 });
  });

  test("no longer exports the Phase 1 placeholder", () => {
    expect("PLACEHOLDER_REMOVE_IN_PHASE_2" in engine).toBe(false);
  });
});

describe("end-to-end integration", () => {
  test("plays a complete bot-versus-bot game to a terminal state", () => {
    let board = engine.createBoard();
    let player: engine.Player = 1;
    let moves = 0;

    for (;;) {
      const previous = engine.opponentOf(player);
      if (engine.checkWin(board, previous) || engine.isFull(board)) break;

      const column = engine.bestMove(board, player, 4);
      expect(engine.isLegal(board, column)).toBe(true);

      board = engine.applyMove(board, column, player);
      player = engine.opponentOf(player);
      moves++;

      expect(moves).toBeLessThanOrEqual(42);
    }

    const finished =
      engine.checkWin(board, 1) || engine.checkWin(board, 2) || engine.isDraw(board);
    expect(finished).toBe(true);
  });

  test("serialises, restores, and continues a game unchanged", () => {
    let board = engine.createBoard();
    board = engine.applyMove(board, 3, 1);
    board = engine.applyMove(board, 3, 2);

    const restored = engine.deserializeBoard(engine.serializeBoard(board));

    expect(engine.bestMove(restored, 1, 5)).toBe(engine.bestMove(board, 1, 5));
    expect(engine.analyze(restored, 1).bestColumn).toBe(engine.analyze(board, 1).bestColumn);
  });

  test("analysis is consistent with search at the same depth", () => {
    const board = engine.applyMove(engine.createBoard(), 3, 1);
    const analysis = engine.analyze(board, 2, 5);
    expect(analysis.bestColumn).toBe(engine.bestMove(board, 2, 5));
  });
});
