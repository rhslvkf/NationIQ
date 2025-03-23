import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { Difficulty } from "../types";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  selectedDifficulty?: Difficulty;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty, selectedDifficulty }) => {
  const { colors } = useAppTheme();

  // 난이도별 아이콘과 색상 정의
  const difficultyConfig = {
    [Difficulty.EASY]: {
      icon: "sunny-outline",
      color: COLORS.secondary,
      text: i18n.t("easy"),
    },
    [Difficulty.MEDIUM]: {
      icon: "partly-sunny-outline",
      color: COLORS.accent,
      text: i18n.t("medium"),
    },
    [Difficulty.HARD]: {
      icon: "thunderstorm-outline",
      color: COLORS.error,
      text: i18n.t("hard"),
    },
    [Difficulty.VERY_HARD]: {
      icon: "flash-outline",
      color: COLORS.purple,
      text: i18n.t("veryHard"),
    },
  };

  // 난이도 옵션을 두 행으로 분리
  const difficultyLevels = Object.values(Difficulty);
  const firstRow = difficultyLevels.slice(0, 2); // 첫 번째 행 (쉬움, 보통)
  const secondRow = difficultyLevels.slice(2); // 두 번째 행 (어려움, 매우 어려움)

  // 난이도 옵션을 렌더링하는 함수
  const renderDifficultyOption = (difficulty: Difficulty) => {
    const config = difficultyConfig[difficulty];
    const isSelected = selectedDifficulty === difficulty;

    return (
      <TouchableOpacity
        key={difficulty}
        style={[
          styles.difficultyOption,
          {
            borderColor: config.color,
            backgroundColor: isSelected ? config.color : colors.card,
          },
        ]}
        onPress={() => onSelectDifficulty(difficulty)}
      >
        <Ionicons name={config.icon as any} size={28} color={isSelected ? COLORS.white : config.color} />
        <Text style={[styles.difficultyText, { color: isSelected ? COLORS.white : config.color }]} numberOfLines={1}>
          {config.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{i18n.t("selectDifficulty")}</Text>

      <View style={styles.optionsGrid}>
        <View style={styles.optionsRow}>{firstRow.map(renderDifficultyOption)}</View>
        <View style={styles.optionsRow}>{secondRow.map(renderDifficultyOption)}</View>
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
  optionsGrid: {
    marginHorizontal: SIZES.small,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.medium,
  },
  difficultyOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    borderWidth: 2,
    marginHorizontal: SIZES.small / 2,
    ...SHADOWS.small,
    minWidth: 80,
    maxWidth: "48%", // 너비 제한
  },
  difficultyText: {
    marginTop: SIZES.small,
    fontSize: SIZES.bodySmall,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default DifficultySelector;
