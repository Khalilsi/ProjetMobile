import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Palette } from "@/constants/palette";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.placeholder,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="trophy.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="options"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Palette.white,
    borderTopWidth: 1,
    borderTopColor: Palette.divider,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
});
