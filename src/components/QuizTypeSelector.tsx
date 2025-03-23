import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { QuizType } from "../types";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

interface QuizTypeSelectorProps {
  onSelectQuizType: (quizType: QuizType) => void;
  selectedQuizType: QuizType;
}

const QuizTypeSelector: React.FC<QuizTypeSelectorProps> = ({ onSelectQuizType, selectedQuizType }) => {
  const { colors } = useAppTheme();

  // 퀴즈 유형별 아이콘과 색상 정의
  const quizTypeConfig = {
    [QuizType.COUNTRY_TO_CAPITAL]: {
      icon: "flag-outline",
      color: COLORS.secondary,
      text: i18n.t("countryToCapital"),
    },
    [QuizType.CAPITAL_TO_COUNTRY]: {
      icon: "location-outline",
      color: COLORS.accent,
      text: i18n.t("capitalToCountry"),
    },
    [QuizType.MIXED]: {
      icon: "shuffle-outline",
      color: COLORS.purple,
      text: i18n.t("mixedQuiz"),
    },
  };

  // 퀴즈 유형 옵션 렌더링 함수
  const renderQuizTypeOption = (quizType: QuizType) => {
    const config = quizTypeConfig[quizType];
    const isSelected = selectedQuizType === quizType;

    return (
      <TouchableOpacity
        key={quizType}
        style={[
          styles.quizTypeOption,
          {
            borderColor: config.color,
            backgroundColor: isSelected ? config.color : colors.card,
          },
        ]}
        onPress={() => onSelectQuizType(quizType)}
      >
        <Ionicons name={config.icon as any} size={28} color={isSelected ? COLORS.white : config.color} />
        <Text style={[styles.quizTypeText, { color: isSelected ? COLORS.white : config.color }]} numberOfLines={1}>
          {config.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{i18n.t("selectQuizType")}</Text>

      <View style={styles.optionsContainer}>{Object.values(QuizType).map(renderQuizTypeOption)}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.medium,
  },
  title: {
    fontSize: SIZES.subheader,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: SIZES.large,
  },
  optionsContainer: {
    flexDirection: "column",
    marginHorizontal: SIZES.small,
    gap: SIZES.medium,
  },
  quizTypeOption: {
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    borderWidth: 2,
    flexDirection: "row",
    ...SHADOWS.small,
  },
  quizTypeText: {
    marginLeft: SIZES.medium,
    fontSize: SIZES.body,
    fontWeight: "600",
  },
});

export default QuizTypeSelector;
