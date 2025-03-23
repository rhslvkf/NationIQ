import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { Difficulty } from "../types";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../i18n";

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  selectedDifficulty?: Difficulty;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty, selectedDifficulty }) => {
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
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t("selectDifficulty")}</Text>

      <View style={styles.optionsContainer}>
        {Object.values(Difficulty).map((difficulty) => {
          const config = difficultyConfig[difficulty];
          const isSelected = selectedDifficulty === difficulty;

          return (
            <TouchableOpacity
              key={difficulty}
              style={[
                styles.difficultyOption,
                {
                  borderColor: config.color,
                  backgroundColor: isSelected ? config.color : "transparent",
                },
              ]}
              onPress={() => onSelectDifficulty(difficulty)}
            >
              <Ionicons name={config.icon as any} size={32} color={isSelected ? COLORS.white : config.color} />
              <Text
                style={[styles.difficultyText, { color: isSelected ? COLORS.white : config.color }]}
                numberOfLines={1}
              >
                {config.text}
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
  difficultyOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    borderWidth: 2,
    marginHorizontal: SIZES.small / 2, // 좌우 마진 약간 줄임
    ...SHADOWS.small,
    minWidth: 80, // 최소 너비 지정
  },
  difficultyText: {
    marginTop: SIZES.small,
    fontSize: SIZES.bodySmall, // 글꼴 크기 줄임
    fontWeight: "600",
    textAlign: "center", // 텍스트 중앙 정렬
  },
});

export default DifficultySelector;
