/**
 * @workspace/engine — pure Connect Four logic.
 *
 * No dependencies, no I/O. Three consumers:
 *   1. The bot           — bestMove()
 *   2. Auto-pilot        — bestMove() at AUTO_MOVE_DEPTH when a move timer expires
 *   3. The AI assistant  — analyze(), which produces the facts the LLM narrates
 */

export {
  applyMove,
  bitFor,
  createBoard,
  discsOf,
  isLegal,
  legalMoves,
  opponentOf,
  type Board,
  type Player,
} from "./lib/board";

export {
  AUTO_MOVE_DEPTH,
  COLS,
  DIFFICULTY_DEPTH,
  MOVE_ORDER,
  ROWS,
  SHIFTS,
  STRIDE,
  WIN_SCORE,
  type Difficulty,
} from "./lib/constants";

export { checkWin, isDraw, isFull } from "./lib/win";

export { evaluate, popcount } from "./lib/evaluate";

export { bestMove, scoreMove, search } from "./lib/search";

export { deserializeBoard, serializeBoard, type SerializedBoard } from "./lib/serialize";

export {
  analyze,
  findWinningColumn,
  renderBoard,
  type Analysis,
  type Threat,
  type ThreatDirection,
} from "./lib/analyze";
