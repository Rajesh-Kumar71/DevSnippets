import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import EmptyState from "../../components/EmptyState";
import SnippetCard from "../../components/SnippetCard";
import { colors } from "../../constants/colors";
import { getFavoriteSnippets } from "../../database/snippetRepository";
import { getCompactCardMode } from "../../services/preferencesService";
import { Snippet } from "../../types/snippet";

export default function FavoritesScreen() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [compactMode, setCompactMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        const compact = await getCompactCardMode();
        setCompactMode(compact);
        setSnippets(getFavoriteSnippets());
      }

      loadData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Snippets</Text>
      <Text style={styles.subtitle}>
        Quickly access your most useful code snippets.
      </Text>

      <FlatList
        data={snippets}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <SnippetCard
            snippet={item}
            compact={compactMode}
            onPress={() => router.push(`/snippet/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No favorites yet"
            message="Open a snippet and tap the star icon to mark it as favorite."
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
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
  listContent: {
    paddingBottom: 24,
  },
});