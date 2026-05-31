import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import {
  attachFileToSnippet,
  getFilesForSnippet,
  removeFileFromSnippet,
} from "../../database/fileRepository";
import { SnippetFile } from "../../types/snippet";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CodeBox from "../../components/CodeBox";
import { colors } from "../../constants/colors";
import {
  deleteSnippet,
  getSnippetById,
  toggleFavorite,
} from "../../database/snippetRepository";
import {
  AiExplanation,
  generateSnippetExplanation,
} from "../../services/aiService";
import {
  exportSnippet,
  ExportFormat,
  shareFile,
} from "../../services/exportService";
import { Snippet } from "../../types/snippet";

const ATTACHMENTS_FOLDER =
  (FileSystem.documentDirectory ?? "") + "devsnippets-exports/attachments/";

  async function ensureAttachmentsFolder() {
    try {
      await FileSystem.makeDirectoryAsync(ATTACHMENTS_FOLDER, {
        intermediates: true,
      });
    } catch {
      // folder already exists — that's fine
    }
  }

export default function SnippetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AiExplanation | null>(null);
  const [attachments, setAttachments] = useState<SnippetFile[]>([]);

  const snippetId = Number(id);

  const loadSnippet = useCallback(() => {
    if (!snippetId || Number.isNaN(snippetId)) {
      return;
    }

    const data = getSnippetById(snippetId);
    setSnippet(data);

    const files = getFilesForSnippet(snippetId);
    setAttachments(files);
  }, [snippetId]);

  useFocusEffect(
    useCallback(() => {
      loadSnippet();
    }, [loadSnippet])
  );

  function handleFavorite() {
    if (!snippet) return;
    toggleFavorite(snippet.id, snippet.isFavorite);
    loadSnippet();
  }

  async function handleGenerateExplanation() {
    if (!snippet || isGenerating) return;

    try {
      setIsGenerating(true);
      const result = await generateSnippetExplanation(snippet);
      setAiResult(result);
    } catch {
      Alert.alert("AI failed", "Unable to generate explanation right now.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleExport(format: ExportFormat) {
    if (!snippet || isExporting) return;

    try {
      setIsExporting(true);

      const exported = await exportSnippet(snippet, format);

      Alert.alert(
        "Export completed",
        `${exported.fileName} was saved locally.`,
        [
          { text: "OK", style: "cancel" },
          {
            text: "Share",
            onPress: async () => {
              try {
                await shareFile(exported.fileUri);
              } catch {
                Alert.alert("Sharing failed", "Unable to share this file.");
              }
            },
          },
        ]
      );
    } catch (e) {
      console.log("Export error:", e);
      Alert.alert("Export failed", String(e));
    } finally {
      setIsExporting(false);
    }
  }

  function handleDelete() {
    if (!snippet) return;

    Alert.alert(
      "Delete snippet",
      "Are you sure you want to delete this snippet? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSnippet(snippet.id);
            router.back();
          },
        },
      ]
    );
  }

  async function handleAttachImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow access to your photo library to attach screenshots."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) return;

    try {
      await ensureAttachmentsFolder();

      const picked = result.assets[0];
      const ext = picked.uri.split(".").pop() ?? "jpg";
      const fileName = `attachment-${Date.now()}.${ext}`;
      const destUri = ATTACHMENTS_FOLDER + fileName;

      await FileSystem.copyAsync({
        from: picked.uri,
        to: destUri,
      });

      attachFileToSnippet(snippetId, fileName, destUri, `image/${ext}`);
      setAttachments(getFilesForSnippet(snippetId));
    } catch (e) {
      console.log("Attach error:", e);
      Alert.alert("Failed", String(e));
    }
  }

  function handleRemoveAttachment(file: SnippetFile) {
    Alert.alert("Remove attachment", `Remove ${file.fileName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await FileSystem.deleteAsync(file.fileUri, { idempotent: true });
          } catch {
            // file already gone, no problem
          }
          removeFileFromSnippet(file.id);
          setAttachments(getFilesForSnippet(snippetId));
        },
      },
    ]);
  }

  if (!snippet) {
    // still loading on first render — avoid flashing "not found"
    if (snippetId && !Number.isNaN(snippetId)) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Snippet not found</Text>
        <Text style={styles.emptyText}>
          This snippet may have been deleted or the ID is invalid.
        </Text>
      </View>
    );
  }

  const tagList = snippet.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <View style={styles.languageBadge}>
          <Text style={styles.languageText}>{snippet.language}</Text>
        </View>

        <Pressable style={styles.favoriteButton} onPress={handleFavorite}>
          <Ionicons
            name={snippet.isFavorite === 1 ? "star" : "star-outline"}
            size={22}
            color={snippet.isFavorite === 1 ? colors.warning : colors.text}
          />
        </Pressable>
      </View>

      <Text style={styles.title}>{snippet.title}</Text>

      {tagList.length > 0 ? (
        <View style={styles.tags}>
          {tagList.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Code</Text>
      <CodeBox code={snippet.code} />

      {/* Attachments */}
      <Text style={styles.sectionTitle}>Attachments</Text>

      <View style={styles.attachmentsCard}>
        {attachments.length > 0 ? (
          <View style={styles.attachmentGrid}>
            {attachments.map((file) => (
              <Pressable
                key={file.id}
                style={styles.attachmentThumb}
                onLongPress={() => handleRemoveAttachment(file)}
              >
                <Image
                  source={{ uri: file.fileUri }}
                  style={styles.attachmentImage}
                  contentFit="cover"
                />
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.attachmentEmptyText}>
            No attachments yet. Add a screenshot below.
          </Text>
        )}

        <Pressable style={styles.attachButton} onPress={handleAttachImage}>
          <Ionicons name="image-outline" size={18} color={colors.white} />
          <Text style={styles.attachButtonText}>Attach Screenshot</Text>
        </Pressable>

        <Text style={styles.attachHint}>Long press an image to remove it</Text>
      </View>

      {/* AI Explanation */}
      <Text style={styles.sectionTitle}>AI Code Explanation</Text>

      <View style={styles.aiCard}>
        <Text style={styles.aiHelpText}>
          Generate a readable summary, explanation, and improvement suggestions
          for this snippet.
        </Text>

        <Pressable
          style={styles.aiButton}
          onPress={handleGenerateExplanation}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="sparkles-outline" size={18} color={colors.white} />
              <Text style={styles.aiButtonText}>Generate Explanation</Text>
            </>
          )}
        </Pressable>

        {aiResult ? (
          <View style={styles.aiResult}>
            <View style={styles.mockBadge}>
              <Text style={styles.mockBadgeText}>
                {aiResult.isMock
                  ? "Mock explanation: no API key required"
                  : `Powered by ${aiResult.provider}`}
              </Text>
            </View>

            <Text style={styles.aiHeading}>Summary</Text>
            <Text style={styles.aiText}>{aiResult.summary}</Text>

            <Text style={styles.aiHeading}>Explanation</Text>
            {aiResult.explanation.map((item) => (
              <Text key={item} style={styles.aiText}>
                • {item}
              </Text>
            ))}

            <Text style={styles.aiHeading}>Suggestions</Text>
            {aiResult.suggestions.map((item) => (
              <Text key={item} style={styles.aiText}>
                • {item}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      {/* Export */}
      <Text style={styles.sectionTitle}>Export Snippet</Text>

      <View style={styles.exportGrid}>
        <Pressable
          style={styles.exportButton}
          onPress={() => handleExport("txt")}
        >
          <Ionicons name="document-text-outline" size={18} color={colors.text} />
          <Text style={styles.exportText}>.txt</Text>
        </Pressable>

        <Pressable
          style={styles.exportButton}
          onPress={() => handleExport("js")}
        >
          <Ionicons name="logo-javascript" size={18} color={colors.text} />
          <Text style={styles.exportText}>.js</Text>
        </Pressable>

        <Pressable
          style={styles.exportButton}
          onPress={() => handleExport("json")}
        >
          <Ionicons name="code-outline" size={18} color={colors.text} />
          <Text style={styles.exportText}>.json</Text>
        </Pressable>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Created: {formatDate(snippet.createdAt)}</Text>
        <Text style={styles.infoText}>Updated: {formatDate(snippet.updatedAt)}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={() =>
            router.push({
              pathname: "/snippet/edit",
              params: { id: String(snippet.id) },
            })
          }
        >
          <Ionicons name="create-outline" size={18} color={colors.white} />
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color={colors.white} />
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  languageBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  languageText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },
  favoriteButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    width: 44,
    height: 44,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 14,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    color: colors.mutedText,
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 22,
    marginBottom: 10,
  },
  attachmentsCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  attachmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  attachmentThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachmentImage: {
    width: "100%",
    height: "100%",
  },
  attachmentEmptyText: {
    color: colors.mutedText,
    fontSize: 14,
    marginBottom: 14,
    lineHeight: 20,
  },
  attachButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  attachButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  attachHint: {
    color: colors.mutedText,
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
  aiCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  aiHelpText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  aiButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  aiButtonText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
  },
  aiResult: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  mockBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  mockBadgeText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  aiHeading: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 6,
  },
  aiText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 4,
  },
  exportGrid: {
    flexDirection: "row",
    gap: 10,
  },
  exportButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  exportText: {
    color: colors.text,
    fontWeight: "800",
  },
  infoBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    gap: 6,
  },
  infoText: {
    color: colors.mutedText,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  actionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
  },
});