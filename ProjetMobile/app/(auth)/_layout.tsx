import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack initialRouteName="landing" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="landing" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
