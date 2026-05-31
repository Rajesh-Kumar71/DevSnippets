import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import EmptyState from "../../components/EmptyState";
import SnippetCard from "../../components/SnippetCard";
import { colors } from "../../constants/colors";
import { getAllSnippets, searchSnippets } from "../../database/snippetRepository";
import { getCompactCardMode } from "../../services/preferencesService";
import { Snippet } from "../../types/snippet";

export default function HomeScreen() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchText, setSearchText] = useState("");
  const [compactMode, setCompactMode] = useState(false);

  const loadSnippets = useCallback(async () => {
    const compact = await getCompactCardMode();
    setCompactMode(compact);

    const data = searchText.trim()
      ? searchSnippets(searchText.trim())
      : getAllSnippets();

    setSnippets(data);
  }, [searchText]);

  useFocusEffect(
    useCallback(() => {
      loadSnippets();
    }, [loadSnippets])
  );

  function handleSearch(text: string) {
    setSearchText(text);

    const data = text.trim() ? searchSnippets(text.trim()) : getAllSnippets();

    setSnippets(data);
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>DevSnippets AI</Text>
        <Text style={styles.subtitle}>
          Save, search, export, and explain useful code snippets offline.
        </Text>
      </View>

      <TextInput
        value={searchText}
        onChangeText={handleSearch}
        placeholder="Search snippets, languages, tags..."
        placeholderTextColor={colors.mutedText}
        style={styles.searchInput}
      />

      <View style={styles.row}>
        <View>
          <Text style={styles.sectionTitle}>Saved Snippets</Text>
          <Text style={styles.preferenceText}>
            {compactMode ? "Compact card mode enabled" : "Standard card mode"}
          </Text>
        </View>

        <Link href="/snippet/create" asChild>
          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </Link>
      </View>

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
            title="No snippets yet"
            message="Create your first snippet and it will be saved locally using SQLite."
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
  hero: {
    marginTop: 8,
    marginBottom: 18,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
  searchInput: {
    backgroundColor: colors.card,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  preferenceText: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: 24,
  },
});