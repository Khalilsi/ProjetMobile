import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PopcornGame from "../../components/ui/PopcornTap";
import CandyGame from "../../components/CandyCatsher";
import { Palette } from "../../constants/palette";

type ActiveScreen = "hub" | "popcorn" | "candy";

export default function HomeScreen() {
  const [active, setActive] = useState<ActiveScreen>("hub");

  if (active === "popcorn") {
    return (
      <PopcornGame key="popcorn" onBackToWelcome={() => setActive("hub")} />
    );
  }

  if (active === "candy") {
    return <CandyGame key="candy" onBackToWelcome={() => setActive("hub")} />;
  }

  // Temporary hub — will be replaced with the full Games Hub screen
  return (
    <View style={styles.hub}>
      <Text style={styles.title}>🎮 Pick a Game</Text>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: "#FF6B6B" }]}
        onPress={() => setActive("popcorn")}
        activeOpacity={0.85}
      >
        <Text style={styles.cardEmoji}>🍿</Text>
        <Text style={styles.cardTitle}>Popcorn Tap</Text>
        <Text style={styles.cardDesc}>
          Pop as many popcorns as you can in 30s!
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: "#A855F7" }]}
        onPress={() => setActive("candy")}
        activeOpacity={0.85}
      >
        <Text style={styles.cardEmoji}>🍬</Text>
        <Text style={styles.cardTitle}>Candy Catcher</Text>
        <Text style={styles.cardDesc}>
          Catch falling candies with your basket!
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hub: {
    flex: 1,
    backgroundColor: Palette.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: Palette.textPrimary,
    marginBottom: 12,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
});
