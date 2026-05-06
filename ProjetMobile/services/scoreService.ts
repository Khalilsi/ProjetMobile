import * as SecureStore from "expo-secure-store";
import { GameId } from "../constants/games";
import { BASE_URL } from "../config/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  bestScore: number;
  playedAt: string;
}

export interface LeaderboardResponse {
  gameId: GameId;
  leaderboard: LeaderboardEntry[];
}

export interface DayHistory {
  date: string; // "2026-05-05"
  bestScore: number;
  gamesPlayed: number;
  scores: { score: number; playedAt: string }[];
}

export interface MyScoresResponse {
  gameId: GameId;
  totalGamesPlayed: number;
  bestScore: number;
  history: DayHistory[];
}

export interface MyStatsResponse {
  gameId: GameId;
  bestToday: number;
  bestThisWeek: number;
  bestAllTime: number;
  globalRank: number | null;
  totalGamesPlayed: number;
  weekStartDate: string; // "2026-04-29"
  todayDate: string; // "2026-05-05"
}

export interface MyRankResponse {
  gameId: GameId;
  rank: number | null;
  bestScore: number;
  message?: string;
}

// ─── helper ──────────────────────────────────────────────────────────────────
const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (!token) throw new Error("User not authenticated");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ─── SUBMIT SCORE ─────────────────────────────────────────────────────────────
export const submitScore = async (
  gameId: GameId, // ✅ uses GameId type from constants
  score: number,
): Promise<void> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/leaderboard/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({ gameId, score }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit score");
  }
};

// ─── GET LEADERBOARD ──────────────────────────────────────────────────────────
export const getLeaderboard = async (
  gameId: GameId,
  limit = 50,
): Promise<LeaderboardResponse> => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${BASE_URL}/leaderboard/${gameId}?limit=${limit}`,
    { headers },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch leaderboard");
  }

  return response.json();
};

// ─── GET MY SCORES ────────────────────────────────────────────────────────────
export const getMyScores = async (
  gameId: GameId,
): Promise<MyScoresResponse> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/leaderboard/${gameId}/my-scores`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch your scores");
  }

  return response.json();
};

// ─── GET MY RANK ──────────────────────────────────────────────────────────────
export const getMyRank = async (gameId: GameId): Promise<MyRankResponse> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/leaderboard/${gameId}/my-rank`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch your rank");
  }

  return response.json();
};

// ─── GET MY STATS (best today, best this week, best all-time, rank) ───────────
export const getMyStats = async (gameId: GameId): Promise<MyStatsResponse> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}/leaderboard/${gameId}/my-stats`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch your stats");
  }

  return response.json();
};
