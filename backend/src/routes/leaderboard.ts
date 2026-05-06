import { Router } from "express";
import {
  submitScore,
  getLeaderboard,
  getMyScores,
  getMyRank,
  getMyStats,
} from "../controllers/leaderboardController";
import { protect } from "../middleware/auth";

const router = Router();

// All leaderboard routes require authentication
router.use(protect);

// Submit a new score after a game
router.post("/submit", submitScore);

// Global top leaderboard for a specific game
// e.g. GET /api/leaderboard/popcorn-tap
router.get("/:gameId", getLeaderboard);

// Current player's score history for a game
// e.g. GET /api/leaderboard/popcorn-tap/my-scores
router.get("/:gameId/my-scores", getMyScores);

// Current player's global rank in a game
// e.g. GET /api/leaderboard/popcorn-tap/my-rank
router.get("/:gameId/my-rank", getMyRank);

// Current player's stats: best today, best this week, best all-time, rank
// e.g. GET /api/leaderboard/popcorn-tap/my-stats
router.get("/:gameId/my-stats", getMyStats);

export default router;
