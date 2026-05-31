import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

type EmptyStateProps = {
  title: string;
  message: string;
};

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{"</>"}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
  },
  icon: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  message: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});