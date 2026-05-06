import { Response } from "express";
import { Score, VALID_GAME_IDS } from "../models/Score";
import { AuthRequest } from "../middleware/auth";

// ─── SUBMIT SCORE ─────────────────────────────────────────────────────────────
// POST /api/leaderboard/submit
export const submitScore = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { score, gameId } = req.body;

  if (!gameId || typeof gameId !== "string") {
    res
      .status(400)
      .json({
        message: `gameId is required (e.g. ${VALID_GAME_IDS.join(" or ")})`,
      });
    return;
  }

  if (!(VALID_GAME_IDS as readonly string[]).includes(gameId)) {
    res.status(400).json({
      message: `gameId must be one of: ${VALID_GAME_IDS.join(", ")}`,
    });
    return;
  }

  if (score === undefined || score === null) {
    res.status(400).json({ message: "score is required" });
    return;
  }

  if (typeof score !== "number" || score < 0) {
    res.status(400).json({ message: "score must be a non-negative number" });
    return;
  }

  try {
    const newScore = await Score.create({
      userId: req.userId,
      username: req.username,
      gameId,
      score,
    });

    res.status(201).json({
      message: "Score submitted successfully",
      score: newScore,
    });
  } catch (error) {
    console.error("Submit score error:", error);
    res.status(500).json({ message: "Server error while submitting score" });
  }
};

// ─── GLOBAL LEADERBOARD ───────────────────────────────────────────────────────
// GET /api/leaderboard/:gameId
// Returns top 50 best scores (one per player) for a given game
export const getLeaderboard = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { gameId } = req.params;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

  try {
    // Aggregate: keep only the best score per user for this game
    const leaderboard = await Score.aggregate([
      { $match: { gameId } },
      { $sort: { score: -1, playedAt: 1 } },
      {
        $group: {
          _id: "$userId",
          username: { $first: "$username" },
          bestScore: { $max: "$score" },
          playedAt: { $first: "$playedAt" },
        },
      },
      { $sort: { bestScore: -1, playedAt: 1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username: 1,
          bestScore: 1,
          playedAt: 1,
        },
      },
    ]);

    // Add rank numbers
    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    res.status(200).json({ gameId, leaderboard: ranked });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching leaderboard" });
  }
};

// ─── MY SCORES (personal history grouped by day) ─────────────────────────────
// GET /api/leaderboard/:gameId/my-scores
// Returns scores grouped by calendar day, newest first
export const getMyScores = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { gameId } = req.params;

  try {
    const scores = await Score.find({ userId: req.userId, gameId })
      .sort({ playedAt: -1 })
      .select("score playedAt -_id");

    const best =
      scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0;

    // Group scores by calendar day (YYYY-MM-DD)
    const grouped: Record<string, { score: number; playedAt: Date }[]> = {};
    for (const s of scores) {
      const day = new Date(s.playedAt).toISOString().slice(0, 10); // "2026-05-05"
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push({ score: s.score, playedAt: s.playedAt });
    }

    // Build sorted array of days with best score per day
    const history = Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a)) // newest day first
      .map(([date, entries]) => ({
        date,
        bestScore: Math.max(...entries.map((e) => e.score)),
        gamesPlayed: entries.length,
        scores: entries,
      }));

    res.status(200).json({
      gameId,
      totalGamesPlayed: scores.length,
      bestScore: best,
      history,
    });
  } catch (error) {
    console.error("My scores fetch error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching your scores" });
  }
};

// ─── MY STATS (best today, best this week, best all-time, rank, total) ────────
// GET /api/leaderboard/:gameId/my-stats
export const getMyStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { gameId } = req.params;

  try {
    const now = new Date();

    // Start of today (midnight)
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Start of this week (Monday midnight)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay(); // 0=Sun, 1=Mon...
    const diffToMonday = day === 0 ? -6 : 1 - day; // go back to Monday
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const [allScores, todayScores, weekScores] = await Promise.all([
      // All-time best
      Score.findOne({ userId: req.userId, gameId })
        .sort({ score: -1 })
        .select("score"),
      // Today best
      Score.findOne({
        userId: req.userId,
        gameId,
        playedAt: { $gte: startOfToday },
      })
        .sort({ score: -1 })
        .select("score"),
      // This week best
      Score.findOne({
        userId: req.userId,
        gameId,
        playedAt: { $gte: startOfWeek },
      })
        .sort({ score: -1 })
        .select("score"),
    ]);

    // Total games played
    const totalGamesPlayed = await Score.countDocuments({
      userId: req.userId,
      gameId,
    });

    // Global rank based on best all-time score
    let rank: number | null = null;
    if (allScores) {
      const higherPlayers = await Score.aggregate([
        { $match: { gameId } },
        { $group: { _id: "$userId", bestScore: { $max: "$score" } } },
        { $match: { bestScore: { $gt: allScores.score } } },
        { $count: "count" },
      ]);
      rank = (higherPlayers[0]?.count ?? 0) + 1;
    }

    res.status(200).json({
      gameId,
      bestToday: todayScores?.score ?? 0,
      bestThisWeek: weekScores?.score ?? 0,
      bestAllTime: allScores?.score ?? 0,
      globalRank: rank,
      totalGamesPlayed,
      weekStartDate: startOfWeek.toISOString().slice(0, 10),
      todayDate: startOfToday.toISOString().slice(0, 10),
    });
  } catch (error) {
    console.error("My stats fetch error:", error);
    res.status(500).json({ message: "Server error while fetching your stats" });
  }
};

// ─── MY RANK ─────────────────────────────────────────────────────────────────
// GET /api/leaderboard/:gameId/my-rank
// Returns the current player's global rank for a game
export const getMyRank = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { gameId } = req.params;

  try {
    // Get the player's best score
    const myBest = await Score.findOne({ userId: req.userId, gameId })
      .sort({ score: -1 })
      .select("score");

    if (!myBest) {
      res
        .status(200)
        .json({ gameId, rank: null, bestScore: 0, message: "No scores yet" });
      return;
    }

    // Count how many distinct players have a higher best score
    const higherPlayers = await Score.aggregate([
      { $match: { gameId } },
      { $group: { _id: "$userId", bestScore: { $max: "$score" } } },
      { $match: { bestScore: { $gt: myBest.score } } },
      { $count: "count" },
    ]);

    const rank = (higherPlayers[0]?.count ?? 0) + 1;

    res.status(200).json({
      gameId,
      rank,
      bestScore: myBest.score,
    });
  } catch (error) {
    console.error("My rank fetch error:", error);
    res.status(500).json({ message: "Server error while fetching your rank" });
  }
};
