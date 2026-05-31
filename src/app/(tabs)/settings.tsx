import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../../constants/colors";
import { useTheme } from "../../hooks/use-theme";
import {
  getCompactCardMode,
  saveCompactCardMode,
} from "../../services/preferencesService";
import {
  deleteGeminiKey,
  deleteOpenAiKey,
  getGeminiKey,
  getOpenAiKey,
  saveGeminiKey,
  saveOpenAiKey,
} from "../../services/secureStoreService";

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const [compactMode, setCompactMode] = useState(false);

  const [openAiInput, setOpenAiInput] = useState("");
  const [hasOpenAiKey, setHasOpenAiKey] = useState(false);
  const [showOpenAiInput, setShowOpenAiInput] = useState(false);

  const [geminiInput, setGeminiInput] = useState("");
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [showGeminiInput, setShowGeminiInput] = useState(false);

  const loadSettings = useCallback(async () => {
    const [compact, openAiKey, geminiKey] = await Promise.all([
      getCompactCardMode(),
      getOpenAiKey(),
      getGeminiKey(),
    ]);

    setCompactMode(compact);
    setHasOpenAiKey(Boolean(openAiKey));
    setHasGeminiKey(Boolean(geminiKey));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  async function handleCompactModeChange(value: boolean) {
    setCompactMode(value);
    await saveCompactCardMode(value);
  }

  async function handleSaveOpenAiKey() {
    if (!openAiInput.trim()) {
      Alert.alert("Key required", "Please paste your OpenAI API key.");
      return;
    }

    await saveOpenAiKey(openAiInput.trim());
    setOpenAiInput("");
    setHasOpenAiKey(true);
    setShowOpenAiInput(false);
    Alert.alert("Saved", "OpenAI key stored securely.");
  }

  function handleDeleteOpenAiKey() {
    Alert.alert("Remove key", "Remove your saved OpenAI API key?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deleteOpenAiKey();
          setHasOpenAiKey(false);
          Alert.alert("Removed", "OpenAI key has been deleted.");
        },
      },
    ]);
  }

  async function handleSaveGeminiKey() {
    if (!geminiInput.trim()) {
      Alert.alert("Key required", "Please paste your Gemini API key.");
      return;
    }

    await saveGeminiKey(geminiInput.trim());
    setGeminiInput("");
    setHasGeminiKey(true);
    setShowGeminiInput(false);
    Alert.alert("Saved", "Gemini key stored securely.");
  }

  function handleDeleteGeminiKey() {
    Alert.alert("Remove key", "Remove your saved Gemini API key?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deleteGeminiKey();
          setHasGeminiKey(false);
          Alert.alert("Removed", "Gemini key has been deleted.");
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        Manage app preferences and AI provider keys.
      </Text>

      {/* App Preferences */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Preferences</Text>
        <Text style={styles.helperText}>
          Compact mode hides code previews on snippet cards. Preference is
          saved locally using AsyncStorage.
        </Text>

        <View style={styles.switchRow}>
          <View style={styles.switchTextBlock}>
            <Text style={styles.switchLabel}>
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </Text>
            <Text style={styles.switchHint}>Stored via AsyncStorage</Text>
          </View>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            thumbColor={theme === "dark" ? colors.primary : colors.mutedText}
            trackColor={{ false: colors.border, true: colors.primaryDark }}
          />
        </View>
      </View>

      {/* Storage Architecture */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Storage Architecture</Text>

        {[
          { label: "Snippets", value: "SQLite" },
          { label: "Exported files", value: "Expo FileSystem" },
          { label: "API keys", value: "SecureStore" },
          { label: "Preferences", value: "AsyncStorage" },
        ].map((row) => (
          <View key={row.label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* OpenAI Key */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="logo-react" size={18} color={colors.primary} />
          <Text style={styles.cardTitle}>OpenAI API Key</Text>
        </View>

        <Text style={styles.helperText}>
          Used for GPT-4o-mini code explanations. If unavailable, the app
          falls back to Gemini automatically.
        </Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: hasOpenAiKey ? colors.success : colors.border },
            ]}
          />
          <Text style={styles.statusText}>
            {hasOpenAiKey ? "Key saved securely" : "No key saved"}
          </Text>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextBlock}>
            <Text style={styles.switchLabel}>
              {hasOpenAiKey ? "Replace key" : "Add key"}
            </Text>
            <Text style={styles.switchHint}>Stored via SecureStore</Text>
          </View>
          <Switch
            value={showOpenAiInput}
            onValueChange={setShowOpenAiInput}
            thumbColor={showOpenAiInput ? colors.primary : colors.mutedText}
            trackColor={{ false: colors.border, true: colors.primaryDark }}
          />
        </View>

        {showOpenAiInput && (
          <>
            <TextInput
              value={openAiInput}
              onChangeText={setOpenAiInput}
              placeholder="sk-..."
              placeholderTextColor={colors.mutedText}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <Pressable style={styles.saveButton} onPress={handleSaveOpenAiKey}>
              <Text style={styles.saveButtonText}>Save OpenAI Key</Text>
            </Pressable>
          </>
        )}

        {hasOpenAiKey && (
          <Pressable style={styles.removeButton} onPress={handleDeleteOpenAiKey}>
            <Text style={styles.removeButtonText}>Remove OpenAI Key</Text>
          </Pressable>
        )}
      </View>

      {/* Gemini Key */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="sparkles-outline" size={18} color={colors.success} />
          <Text style={styles.cardTitle}>Gemini API Key</Text>
        </View>

        <Text style={styles.helperText}>
          Used as fallback when OpenAI is unavailable. Both keys can be
          saved at the same time.
        </Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: hasGeminiKey ? colors.success : colors.border },
            ]}
          />
          <Text style={styles.statusText}>
            {hasGeminiKey ? "Key saved securely" : "No key saved"}
          </Text>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextBlock}>
            <Text style={styles.switchLabel}>
              {hasGeminiKey ? "Replace key" : "Add key"}
            </Text>
            <Text style={styles.switchHint}>Stored via SecureStore</Text>
          </View>
          <Switch
            value={showGeminiInput}
            onValueChange={setShowGeminiInput}
            thumbColor={showGeminiInput ? colors.primary : colors.mutedText}
            trackColor={{ false: colors.border, true: colors.primaryDark }}
          />
        </View>

        {showGeminiInput && (
          <>
            <TextInput
              value={geminiInput}
              onChangeText={setGeminiInput}
              placeholder="AIza..."
              placeholderTextColor={colors.mutedText}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <Pressable style={styles.saveButton} onPress={handleSaveGeminiKey}>
              <Text style={styles.saveButtonText}>Save Gemini Key</Text>
            </Pressable>
          </>
        )}

        {hasGeminiKey && (
          <Pressable style={styles.removeButton} onPress={handleDeleteGeminiKey}>
            <Text style={styles.removeButtonText}>Remove Gemini Key</Text>
          </Pressable>
        )}
      </View>

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.helperText}>
          DevSnippets AI is an offline-first developer utility. All snippet
          data lives on your device in SQLite. AI explanation is an optional
          online feature — the app works fully without it.
        </Text>
        <Text style={styles.helperText}>
          AI priority: OpenAI → Gemini → Local mock
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 18,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  helperText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  infoLabel: {
    color: colors.mutedText,
    fontSize: 14,
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusText: {
    color: colors.mutedText,
    fontSize: 13,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  switchTextBlock: {
    flex: 1,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  switchHint: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 3,
  },
  input: {
    backgroundColor: colors.input,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 4,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  removeButton: {
    backgroundColor: colors.danger,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  removeButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});