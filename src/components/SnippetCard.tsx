import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";
import { Snippet } from "../types/snippet";

type SnippetCardProps = {
  snippet: Snippet;
  onPress: () => void;
  compact?: boolean;
};

export default function SnippetCard({
  snippet,
  onPress,
  compact = false,
}: SnippetCardProps) {
  const tagList = snippet.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.languageBadge}>
          <Text style={styles.languageText}>{snippet.language}</Text>
        </View>

        {snippet.isFavorite === 1 ? (
          <Ionicons name="star" size={18} color={colors.warning} />
        ) : null}
      </View>

      <Text style={styles.title}>{snippet.title}</Text>

      {!compact ? (
        <Text numberOfLines={3} style={styles.codePreview}>
          {snippet.code}
        </Text>
      ) : null}

      {tagList.length > 0 ? (
        <View style={styles.tags}>
          {tagList.slice(0, compact ? 2 : 4).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  languageBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  languageText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  codePreview: {
    color: colors.mutedText,
    backgroundColor: colors.input,
    borderRadius: 12,
    padding: 12,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagText: {
    color: colors.mutedText,
    fontSize: 12,
  },
});