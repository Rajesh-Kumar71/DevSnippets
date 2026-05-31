import { useEffect, useState } from "react";
import { getTheme, saveTheme, AppTheme } from "../services/preferencesService";

const darkColors = {
  background: "#0f172a",
  surface: "#111827",
  card: "#1e293b",
  cardSoft: "#243449",
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  secondary: "#0f766e",
  text: "#f8fafc",
  mutedText: "#94a3b8",
  border: "#334155",
  input: "#0f172a",
  success: "#22c55e",
  warning: "#eab308",
  danger: "#ef4444",
  white: "#ffffff",
  black: "#000000",
};

const lightColors = {
  background: "#f8fafc",
  surface: "#f1f5f9",
  card: "#ffffff",
  cardSoft: "#e2e8f0",
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  secondary: "#0f766e",
  text: "#0f172a",
  mutedText: "#64748b",
  border: "#cbd5e1",
  input: "#f1f5f9",
  success: "#16a34a",
  warning: "#ca8a04",
  danger: "#dc2626",
  white: "#ffffff",
  black: "#000000",
};

export type ThemeColors = typeof darkColors;

export function useTheme() {
  const [theme, setTheme] = useState<AppTheme>("dark");
  const [colors, setColors] = useState<ThemeColors>(darkColors);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTheme().then((saved) => {
      setTheme(saved);
      setColors(saved === "light" ? lightColors : darkColors);
      setLoading(false);
    });
  }, []);

  async function toggleTheme() {
    const next: AppTheme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setColors(next === "light" ? lightColors : darkColors);
    await saveTheme(next);
  }

  return { theme, colors, toggleTheme, loading };
}