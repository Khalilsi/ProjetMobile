import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { GAME_IDS, GameId } from "../../constants/games";
import {
  getLeaderboard,
  getMyScores,
  getMyStats,
  LeaderboardEntry,
  DayHistory,
  MyStatsResponse,
} from "../../services/scoreService";
import { Palette } from "../../constants/palette";

// ─── Constants ────────────────────────────────────────────────────────────────
const GAMES: { id: GameId; label: string; emoji: string }[] = [
  { id: GAME_IDS.POPCORN_TAP, label: "Popcorn Tap", emoji: "🍿" },
  { id: GAME_IDS.CANDY_CATCHER, label: "Candy Catcher", emoji: "🍬" },
];

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) => {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getLast7DaysHistory = (history: DayHistory[]) => {
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  return history.filter((d) => d.date >= cutoff);
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LeaderboardScreen() {
  const { user } = useAuth();

  const [selectedGame, setSelectedGame] = useState<GameId>(
    GAME_IDS.POPCORN_TAP,
  );
  const [activeView, setActiveView] = useState<"global" | "history">("global");

  const [stats, setStats] = useState<MyStatsResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [history, setHistory] = useState<DayHistory[]>([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (gameId: GameId) => {
    setError(null);
    try {
      const [statsData, boardData, historyData] = await Promise.all([
        getMyStats(gameId),
        getLeaderboard(gameId, 10),
        getMyScores(gameId),
      ]);
      setStats(statsData);
      setLeaderboard(boardData.leaderboard);
      setHistory(getLast7DaysHistory(historyData.history));
    } catch (e: any) {
      setError(e.message ?? "Failed to load leaderboard");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData(selectedGame).finally(() => setLoading(false));
  }, [selectedGame]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(selectedGame);
    setRefreshing(false);
  }, [selectedGame]);

  // ─── Render: Stats Card ───────────────────────────────────────────────────
  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsUsername}>👤 {user?.username ?? "—"}</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>📅 Today</Text>
          <Text style={styles.statValue}>{stats?.bestToday ?? "—"}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>📆 This Week</Text>
          <Text style={styles.statValue}>{stats?.bestThisWeek ?? "—"}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>🏆 All Time</Text>
          <Text style={styles.statValue}>{stats?.bestAllTime ?? "—"}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>🌍 Global Rank</Text>
          <Text style={styles.statValue}>
            {stats?.globalRank != null ? `#${stats.globalRank}` : "—"}
          </Text>
        </View>
      </View>
    </View>
  );

  // ─── Render: Global Leaderboard ───────────────────────────────────────────
  const renderGlobal = () => (
    <View style={styles.section}>
      {leaderboard.length === 0 ? (
        <Text style={styles.emptyText}>No scores yet. Be the first! 🎮</Text>
      ) : (
        leaderboard.map((entry: LeaderboardEntry) => {
          const isMe = entry.username === user?.username;
          return (
            <View
              key={entry.userId}
              style={[styles.leaderboardRow, isMe && styles.leaderboardRowMe]}
            >
              <Text style={[styles.rankText, isMe && styles.rankTextMe]}>
                {RANK_MEDALS[entry.rank] ?? `${entry.rank}.`}
              </Text>
              <Text
                style={[styles.usernameText, isMe && styles.usernameTextMe]}
                numberOfLines={1}
              >
                {entry.username}
                {isMe ? " ★" : ""}
              </Text>
              <Text style={[styles.scoreText, isMe && styles.scoreTextMe]}>
                {entry.bestScore}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );

  // ─── Render: My History ───────────────────────────────────────────────────
  const renderHistory = () => (
    <View style={styles.section}>
      {history.length === 0 ? (
        <Text style={styles.emptyText}>
          No games played in the last 7 days.
        </Text>
      ) : (
        history.map((day) => (
          <View key={day.date} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>📅 {formatDate(day.date)}</Text>
              <Text style={styles.dayMeta}>
                Best: <Text style={styles.dayBest}>{day.bestScore}</Text>
                {"  •  "}
                {day.gamesPlayed} game{day.gamesPlayed !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={styles.scoreChips}>
              {day.scores.map((s, i) => (
                <View
                  key={i}
                  style={[
                    styles.chip,
                    s.score === day.bestScore && styles.chipBest,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      s.score === day.bestScore && styles.chipTextBest,
                    ]}
                  >
                    {s.score}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </View>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Palette.primary]}
            tintColor={Palette.primary}
          />
        }
      >
        {/* Game Selector */}
        <View style={styles.gameSelector}>
          {GAMES.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[
                styles.gamePill,
                selectedGame === g.id && styles.gamePillActive,
              ]}
              onPress={() => setSelectedGame(g.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.gamePillText,
                  selectedGame === g.id && styles.gamePillTextActive,
                ]}
              >
                {g.emoji} {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity onPress={() => fetchData(selectedGame)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Palette.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
            {/* Stats Card */}
            {renderStatsCard()}

            {/* View Toggle */}
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  activeView === "global" && styles.toggleBtnActive,
                ]}
                onPress={() => setActiveView("global")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    activeView === "global" && styles.toggleTextActive,
                  ]}
                >
                  🌍 Global
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  activeView === "history" && styles.toggleBtnActive,
                ]}
                onPress={() => setActiveView("history")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    activeView === "history" && styles.toggleTextActive,
                  ]}
                >
                  📅 My History
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            {activeView === "global" ? renderGlobal() : renderHistory()}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  header: {
    backgroundColor: Palette.primary,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Palette.white,
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  gameSelector: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  gamePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.card,
    alignItems: "center",
  },
  gamePillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  gamePillText: {
    fontSize: 14,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  gamePillTextActive: { color: Palette.white },

  errorBox: {
    marginHorizontal: 16,
    backgroundColor: Palette.errorLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.error,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: { color: Palette.error, fontSize: 13, flex: 1 },
  retryText: { color: Palette.primary, fontWeight: "700", marginLeft: 8 },

  statsCard: {
    marginHorizontal: 16,
    backgroundColor: Palette.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Palette.border,
    padding: 16,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statsUsername: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.textPrimary,
    marginBottom: 12,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statItem: {
    width: "47%",
    backgroundColor: Palette.input,
    borderRadius: 10,
    padding: 10,
  },
  statLabel: { fontSize: 11, color: Palette.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "800", color: Palette.primary },

  viewToggle: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: Palette.divider,
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: Palette.card,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: { fontSize: 13, fontWeight: "600", color: Palette.textSecondary },
  toggleTextActive: { color: Palette.primary },

  section: { marginHorizontal: 16, marginTop: 12 },
  emptyText: {
    textAlign: "center",
    color: Palette.textSecondary,
    marginTop: 30,
    fontSize: 14,
  },

  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  leaderboardRowMe: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primaryDark,
  },
  rankText: {
    fontSize: 20,
    width: 36,
    textAlign: "center",
    color: Palette.textSecondary,
  },
  rankTextMe: { color: Palette.white },
  usernameText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Palette.textPrimary,
    marginLeft: 8,
  },
  usernameTextMe: { color: Palette.white },
  scoreText: { fontSize: 18, fontWeight: "800", color: Palette.primary },
  scoreTextMe: { color: Palette.white },

  dayCard: {
    backgroundColor: Palette.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.divider,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dayTitle: { fontSize: 15, fontWeight: "700", color: Palette.textPrimary },
  dayMeta: { fontSize: 12, color: Palette.textSecondary },
  dayBest: { fontWeight: "700", color: Palette.primary },
  scoreChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    backgroundColor: Palette.accentLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipBest: { backgroundColor: Palette.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: Palette.accent },
  chipTextBest: { color: Palette.white },
});
