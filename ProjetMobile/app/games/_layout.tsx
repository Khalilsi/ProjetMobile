import { Stack } from "expo-router";

// No navbar, no header — fullscreen game experience
export default function GamesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
