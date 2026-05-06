// ✅ Keep in sync with backend/src/models/Score.ts VALID_GAME_IDS
export const GAME_IDS = {
  POPCORN_TAP: "popcorn-tap",
  CANDY_CATCHER: "candy-catcher",
  // TETRIS: "tetris",
} as const;

export type GameId = typeof GAME_IDS[keyof typeof GAME_IDS];