import { Stack } from "expo-router";
import { useEffect } from "react";
import { initializeDatabase } from "../database/db";
import { colors } from "../constants/colors";

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "700",
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="snippet/create"
        options={{
          title: "Create Snippet",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="snippet/[id]"
        options={{
          title: "Snippet Details",
        }}
      />
      <Stack.Screen
        name="snippet/edit"
        options={{
          title: "Edit Snippet",
        }}
      />
    </Stack>
  );
}