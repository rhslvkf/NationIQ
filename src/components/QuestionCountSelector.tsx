import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

export const QUESTION_COUNTS = {
  SMALL: 5,
  MEDIUM: 10,
  LARGE: 20,
} as const;

export type QuestionCount = (typeof QUESTION_COUNTS)[keyof typeof QUESTION_COUNTS];

interface QuestionCountSelectorProps {
  onSelectCount: (count: QuestionCount) => void;
  selectedCount: QuestionCount;
}

const QuestionCountSelector: React.FC<QuestionCountSelectorProps> = ({ onSelectCount, selectedCount }) => {
  const { colors } = useAppTheme();

  // 문제 개수별 아이콘과 색상 정의
  const countConfig = {
    [QUESTION_COUNTS.SMALL]: {
      icon: "timer-outline",
      color: COLORS.secondary,
      label: `5 ${i18n.t("questions")}`,
      description: i18n.t("quickQuiz"),
    },
    [QUESTION_COUNTS.MEDIUM]: {
      icon: "time-outline",
      color: COLORS.accent,
      label: `10 ${i18n.t("questions")}`,
      description: i18n.t("standardQuiz"),
    },
    [QUESTION_COUNTS.LARGE]: {
      icon: "hourglass-outline",
      color: COLORS.purple,
      label: `20 ${i18n.t("questions")}`,
      description: i18n.t("extendedQuiz"),
    },
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{i18n.t("selectQuestionCount")}</Text>

      <View style={styles.optionsContainer}>
        {Object.values(QUESTION_COUNTS).map((count) => {
          const config = countConfig[count];
          const isSelected = selectedCount === count;

          return (
            <TouchableOpacity
              key={count}
              style={[
                styles.countOption,
                {
                  borderColor: config.color,
                  backgroundColor: isSelected ? config.color : colors.card,
                },
              ]}
              onPress={() => onSelectCount(count)}
            >
              <Ionicons name={config.icon as any} size={28} color={isSelected ? COLORS.white : config.color} />
              <Text style={[styles.countLabel, { color: isSelected ? COLORS.white : config.color }]}>
                {config.label}
              </Text>
              <Text
                style={[styles.countDescription, { color: isSelected ? COLORS.white : colors.textSecondary }]}
                numberOfLines={1}
              >
                {config.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  title: {
    fontSize: SIZES.subheader,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: SIZES.large,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  countOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.small,
    borderRadius: SIZES.base,
    borderWidth: 2,
    marginHorizontal: SIZES.small / 2,
    ...SHADOWS.small,
    height: 120,
  },
  countLabel: {
    marginTop: SIZES.small,
    fontSize: SIZES.caption,
    fontWeight: "bold",
    textAlign: "center",
  },
  countDescription: {
    fontSize: SIZES.caption,
    textAlign: "center",
    marginTop: SIZES.small / 2,
  },
});

export default QuestionCountSelector;
