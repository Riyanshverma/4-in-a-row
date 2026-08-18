/** Board width in columns. */
export const COLS = 7;

/** Board height in playable rows. */
export const ROWS = 6;

/**
 * Bits allocated per column: 6 playable rows plus 1 sentinel.
 * The sentinel bit is never set. It prevents win detection from wrapping
 * around the board edge — see the plan's "Why the sentinel row exists".
 */
export const STRIDE = 7;

/**
 * Directional shifts for win detection.
 * 1n vertical, 7n horizontal, 6n and 8n the two diagonals.
 */
export const SHIFTS = [1n, 7n, 6n, 8n] as const;

/**
 * Search order for alpha-beta: centre columns first.
 * Centre moves are usually stronger, so trying them first produces cutoffs
 * earlier and prunes far more of the tree. This ordering is the difference
 * between a fast search and a slow one.
 */
export const MOVE_ORDER = [3, 2, 4, 1, 5, 0, 6] as const;

/** Terminal score magnitude. Ply is subtracted so faster wins rank higher. */
export const WIN_SCORE = 10_000;

/** Search depth per difficulty level. */
export const DIFFICULTY_DEPTH = {
  easy: 2,
  medium: 5,
  hard: 8,
} as const;

export type Difficulty = keyof typeof DIFFICULTY_DEPTH;

/**
 * Depth used when the 30-second move timer plays for an absent player.
 * Fixed regardless of match difficulty — an auto-move is a courtesy,
 * so it should be competent but not superhuman.
 */
export const AUTO_MOVE_DEPTH = 5;
