import mongoose, { Document, Schema } from "mongoose";

// ✅ Add new games here only when you create a new game
export const VALID_GAME_IDS = [
  "popcorn-tap",
  "candy-catcher",
  // "tetris",
  
] as const;

export type GameId = typeof VALID_GAME_IDS[number];

export interface IScore extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  gameId: GameId;
  score: number;
  playedAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    gameId: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) =>
          (VALID_GAME_IDS as readonly string[]).includes(value),
        message: (props: { value: string }) =>
          `'${props.value}' is not a valid gameId. Valid games: ${VALID_GAME_IDS.join(", ")}`,
      },
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Index for fast leaderboard queries per game
ScoreSchema.index({ gameId: 1, score: -1 });
// Index for fetching a player's history
ScoreSchema.index({ userId: 1, gameId: 1, playedAt: -1 });

export const Score = mongoose.model<IScore>("Score", ScoreSchema);