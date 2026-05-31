import AsyncStorage from "@react-native-async-storage/async-storage";

const COMPACT_CARD_MODE_KEY = "devsnippets_compact_card_mode";
const THEME_KEY = "devsnippets_theme";

export type AppTheme = "dark" | "light";

export async function saveCompactCardMode(value: boolean) {
  await AsyncStorage.setItem(COMPACT_CARD_MODE_KEY, JSON.stringify(value));
}

export async function getCompactCardMode(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(COMPACT_CARD_MODE_KEY);
  if (!stored) return false;
  return JSON.parse(stored) as boolean;
}

export async function saveTheme(theme: AppTheme) {
  await AsyncStorage.setItem(THEME_KEY, theme);
}

export async function getTheme(): Promise<AppTheme> {
  const stored = await AsyncStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark"; // default
}