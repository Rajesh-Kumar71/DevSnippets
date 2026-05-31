import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import EmptyState from "../../components/EmptyState";
import { colors } from "../../constants/colors";
import { shareFile } from "../../services/exportService";
import {
  deleteLocalFile,
  formatFileSize,
  listExportedFiles,
  LocalSnippetFile,
} from "../../services/fileService";

export default function FilesScreen() {
  const [files, setFiles] = useState<LocalSnippetFile[]>([]);

  const loadFiles = useCallback(async () => {
    const data = await listExportedFiles();
    setFiles(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFiles();
    }, [loadFiles])
  );

  async function handleShare(uri: string) {
    try {
      await shareFile(uri);
    } catch {
      Alert.alert("Sharing failed", "Unable to share this file.");
    }
  }

  function handleDelete(file: LocalSnippetFile) {
    Alert.alert(
      "Delete file",
      `Delete ${file.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteLocalFile(file.uri);
            await loadFiles();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>File Manager</Text>
      <Text style={styles.subtitle}>
        Exported snippet files are saved locally on this device.
      </Text>

      <FlatList
        data={files}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <View style={styles.fileCard}>
            <View style={styles.fileIcon}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.fileMeta}>{formatFileSize(item.size)}</Text>
            </View>

            <Pressable
              style={styles.iconButton}
              onPress={() => handleShare(item.uri)}
            >
              <Ionicons name="share-outline" size={20} color={colors.text} />
            </Pressable>

            <Pressable
              style={styles.iconButton}
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No exported files"
            message="Open a snippet and export it as .txt, .js, or .json. Files will appear here."
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
  fileCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  fileMeta: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 4,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
});