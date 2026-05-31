import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { colors } from "../../constants/colors";
import {
  getSnippetById,
  updateSnippet,
} from "../../database/snippetRepository";

export default function EditSnippetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const snippetId = Number(id);

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [tags, setTags] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!snippetId || Number.isNaN(snippetId)) {
      return;
    }

    const snippet = getSnippetById(snippetId);

    if (!snippet) {
      Alert.alert("Not found", "Snippet could not be loaded.");
      router.back();
      return;
    }

    setTitle(snippet.title);
    setLanguage(snippet.language);
    setTags(snippet.tags);
    setCode(snippet.code);
  }, [snippetId]);

  function handleUpdate() {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a snippet title.");
      return;
    }

    if (!code.trim()) {
      Alert.alert("Code required", "Please enter code content.");
      return;
    }

    updateSnippet({
      id: snippetId,
      title: title.trim(),
      language: language.trim() || "Plain Text",
      tags: tags.trim(),
      code: code.trim(),
    });

    Alert.alert("Updated", "Snippet updated successfully.");
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Snippet title"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
        />

        <Text style={styles.label}>Programming Language</Text>
        <TextInput
          value={language}
          onChangeText={setLanguage}
          placeholder="JavaScript, TypeScript, Python..."
          placeholderTextColor={colors.mutedText}
          style={styles.input}
        />

        <Text style={styles.label}>Tags</Text>
        <TextInput
          value={tags}
          onChangeText={setTags}
          placeholder="react-native, ui, list"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
        />

        <Text style={styles.label}>Code</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Paste or type your code here..."
          placeholderTextColor={colors.mutedText}
          style={[styles.input, styles.codeInput]}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable style={styles.saveButton} onPress={handleUpdate}>
          <Text style={styles.saveButtonText}>Update Snippet</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  codeInput: {
    minHeight: 220,
    fontFamily: "monospace",
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 22,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
});