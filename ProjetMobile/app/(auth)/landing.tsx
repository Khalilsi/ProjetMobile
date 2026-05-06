import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Palette } from "../../constants/palette";

const { height } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      {/* Top decoration blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobTopLeft} />

      {/* Hero section */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🎮</Text>
        <Text style={styles.appName}>GameZone</Text>
        <Text style={styles.tagline}>Play. Compete. Be the Best.</Text>

        {/* Decorative game icons */}
        <View style={styles.iconsRow}>
          {["🏆", "🎯", "⭐", "🎲"].map((icon, i) => (
            <View key={i} style={styles.iconBubble}>
              <Text style={styles.iconBubbleText}>{icon}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ready to play?</Text>
        <Text style={styles.cardSubtitle}>
          Create an account or log in to save your scores and climb the
          leaderboard!
        </Text>

        {/* Sign Up button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/signup")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>CREATE ACCOUNT 🎉</Text>
        </TouchableOpacity>

        {/* Log In button */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>LOG IN</Text>
        </TouchableOpacity>

      </View>

      
      
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background,
    overflow: "hidden",
  },

  // Decorative blobs
  blobTopRight: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#FF4D6D22",
    top: -60,
    right: -60,
  },
  blobTopLeft: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#00B4D822",
    top: 40,
    left: -50,
  },

  // Hero
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  heroEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  appName: {
    fontSize: 42,
    fontWeight: "900",
    color: Palette.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: Palette.textSecondary,
    marginTop: 8,
    fontWeight: "500",
  },
  iconsRow: {
    flexDirection: "row",
    marginTop: 32,
    gap: 12,
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Palette.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBubbleText: {
    fontSize: 24,
  },

  // Card
  card: {
    backgroundColor: Palette.card,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Palette.textPrimary,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
  },

  // Primary button
  primaryButton: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: Palette.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Secondary button
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 2,
    borderColor: Palette.primary,
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: Palette.primary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Terms
  terms: {
    fontSize: 11,
    color: Palette.placeholder,
    textAlign: "center",
    marginTop: 20,
  },
});
