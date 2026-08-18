import {
  applyMove,
  bitFor,
  discsOf,
  isLegal,
  legalMoves,
  opponentOf,
  type Board,
  type Player,
} from "./board";
import { COLS, ROWS, WIN_SCORE } from "./constants";
import { scoreMove } from "./search";
import { checkWin } from "./win";

export type ThreatDirection = "vertical" | "horizontal" | "diagonal-up" | "diagonal-down";

/** A cell that would complete four in a row for whoever owns it. */
export type Threat = {
  column: number;
  row: number;
  direction: ThreatDirection;
  owner: "you" | "opponent";
};

/**
 * Everything the AI assistant is told about a position.
 * The language model receives this and writes prose. It is never asked to
 * work out the best move itself — that is what `bestColumn` is for.
 */
export type Analysis = {
  bestColumn: number;
  score: number;
  immediateWin: number | null;
  mustBlock: number | null;
  losingMoves: number[];
  threats: Threat[];
  columnScores: Array<{ column: number; score: number }>;
};

/** Default analysis depth. Deep enough for useful advice, fast enough for a live request. */
const ANALYSIS_DEPTH = 7;

/** A score at or beyond this magnitude means a forced win or loss was found. */
const DECISIVE = WIN_SCORE - 100;

/** The column that wins immediately for this player, if one exists. */
export function findWinningColumn(board: Board, player: Player): number | null {
  for (let column = 0; column < COLS; column++) {
    if (!isLegal(board, column)) continue;
    if (checkWin(applyMove(board, column, player), player)) return column;
  }
  return null;
}

/**
 * Cells that would complete a line for either player.
 * Only playable cells are reported — a threat three rows above the current
 * stack is not actionable advice.
 */
function findThreats(board: Board, player: Player): Threat[] {
  const threats: Threat[] = [];
  const opponent = opponentOf(player);

  for (let column = 0; column < COLS; column++) {
    if (!isLegal(board, column)) continue;
    const row = board.heights[column]!;

    for (const [who, owner] of [
      [player, "you"],
      [opponent, "opponent"],
    ] as const) {
      const after = applyMove(board, column, who);
      if (!checkWin(after, who)) continue;

      threats.push({
        column,
        row,
        direction: directionOfWin(after, who, column, row),
        owner,
      });
    }
  }

  return threats;
}

/** Which direction the line runs through the cell just played. */
function directionOfWin(
  board: Board,
  player: Player,
  column: number,
  row: number,
): ThreatDirection {
  const discs = discsOf(board, player);

  const directions: Array<[ThreatDirection, number, number]> = [
    ["vertical", 0, 1],
    ["horizontal", 1, 0],
    ["diagonal-up", 1, 1],
    ["diagonal-down", 1, -1],
  ];

  for (const [name, dc, dr] of directions) {
    let run = 1;

    for (const sign of [1, -1]) {
      let c = column + dc * sign;
      let r = row + dr * sign;
      while (c >= 0 && c < COLS && r >= 0 && r < ROWS && discs & bitFor(c, r)) {
        run++;
        c += dc * sign;
        r += dr * sign;
      }
    }

    if (run >= 4) return name;
  }

  // Unreachable for a genuine win; kept so the function is total.
  return "horizontal";
}

/**
 * Full structured analysis of a position from `player`'s point of view.
 *
 * `bestColumn` is guaranteed to be the highest-scoring entry in
 * `columnScores`. The assistant relies on that consistency — contradictory
 * facts would produce an explanation that argues against its own advice.
 *
 * @throws if the board is full.
 */
export function analyze(board: Board, player: Player, depth = ANALYSIS_DEPTH): Analysis {
  const moves = legalMoves(board);
  if (moves.length === 0) throw new Error("cannot analyze a full board");

  const opponent = opponentOf(player);

  const columnScores = moves
    .map((column) => ({ column, score: scoreMove(board, player, column, depth) }))
    .sort((a, b) => b.score - a.score);

  const top = columnScores[0]!;

  return {
    bestColumn: top.column,
    score: top.score,
    immediateWin: findWinningColumn(board, player),
    mustBlock: findWinningColumn(board, opponent),
    losingMoves: columnScores.filter((c) => c.score <= -DECISIVE).map((c) => c.column),
    threats: findThreats(board, player),
    columnScores,
  };
}

/**
 * Human-readable board, for inclusion in the assistant's prompt.
 * X is player 1, O is player 2, . is empty. Top row printed first.
 */
export function renderBoard(board: Board): string {
  const lines: string[] = [];

  for (let row = ROWS - 1; row >= 0; row--) {
    const cells: string[] = [];
    for (let column = 0; column < COLS; column++) {
      const bit = bitFor(column, row);
      if (board.p1 & bit) cells.push("X");
      else if (board.p2 & bit) cells.push("O");
      else cells.push(".");
    }
    lines.push(cells.join(" "));
  }

  lines.push("0 1 2 3 4 5 6");
  return lines.join("\n");
}
