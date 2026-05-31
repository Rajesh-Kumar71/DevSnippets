import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

type CodeBoxProps = {
  code: string;
};

export default function CodeBox({ code }: CodeBoxProps) {
  return (
    <View style={styles.container}>
      <Text selectable style={styles.code}>
        {code}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  code: {
    color: colors.text,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 21,
  },
});