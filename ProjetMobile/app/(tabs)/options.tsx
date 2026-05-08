import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Palette } from "@/constants/palette";

export default function OptionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Options</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Palette.textSecondary,
  },
});
