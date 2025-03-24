import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { AreaPopulationQuizType } from "../types";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

interface AreaPopulationQuizTypeSelectorProps {
  onSelectQuizType: (quizType: AreaPopulationQuizType) => void;
  selectedQuizType: AreaPopulationQuizType;
}

interface QuizTypeConfig {
  icon: string;
  color: string;
  text: string;
}

const AreaPopulationQuizTypeSelector: React.FC<AreaPopulationQuizTypeSelectorProps> = ({
  onSelectQuizType,
  selectedQuizType,
}) => {
  const { colors } = useAppTheme();

  // 퀴즈 유형별 아이콘과 색상 정의
  const quizTypeConfig: Record<AreaPopulationQuizType, QuizTypeConfig> = {
    [AreaPopulationQuizType.SINGLE_CHOICE]: {
      icon: "radio-button-on-outline",
      color: COLORS.secondary,
      text: i18n.t("singleChoice"),
    },
    [AreaPopulationQuizType.ORDER_SELECTION]: {
      icon: "list-outline",
      color: COLORS.accent,
      text: i18n.t("orderSelection"),
    },
  };

  // 퀴즈 유형 옵션 렌더링 함수
  const renderQuizTypeOption = (quizType: AreaPopulationQuizType) => {
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

      <View style={styles.optionsContainer}>
        {Object.values(AreaPopulationQuizType).map((type) => renderQuizTypeOption(type))}
      </View>
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

export default AreaPopulationQuizTypeSelector;
