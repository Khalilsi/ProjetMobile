import { router } from "expo-router";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Palette } from "../../constants/palette";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* ─── Title ───────────────────────────────────────────────── */}
        <Text style={styles.title}>Our Games</Text>

        {/* ─── Game cards row ──────────────────────────────────────── */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/games/popcorn")}
            activeOpacity={0.85}
          >
            <Image
              source={require("../../assets/images/11.png")}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <Text style={styles.cardName}>Popcorn Tap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/games/candy")}
            activeOpacity={0.85}
          >
            <Image
              source={require("../../assets/images/1.png")}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <Text style={styles.cardName}>Candy Catcher</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Coming soon ─────────────────────────────────────────── */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>More Games to come Soon</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CARD_SIZE = 150;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 32,
    gap: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Palette.primary,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  card: {
    width: CARD_SIZE,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImage: {
    width: CARD_SIZE,
    height: CARD_SIZE,
  },
  cardName: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.primary,
    textAlign: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  comingSoon: {
    borderWidth: 1.5,
    borderColor: Palette.placeholder,
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: "600",
    color: Palette.textPrimary,
    lineHeight: 26,
  },
});
