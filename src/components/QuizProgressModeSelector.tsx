import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { QuizProgressMode } from "../types";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

interface QuizProgressModeSelectorProps {
  onSelectProgressMode: (progressMode: QuizProgressMode) => void;
  selectedProgressMode: QuizProgressMode;
}

interface ProgressModeConfig {
  icon: string;
  color: string;
  text: string;
  description: string;
}

const QuizProgressModeSelector: React.FC<QuizProgressModeSelectorProps> = ({
  onSelectProgressMode,
  selectedProgressMode,
}) => {
  const { colors } = useAppTheme();

  // 진행 모드별 아이콘과 색상 정의
  const progressModeConfig: Record<QuizProgressMode, ProgressModeConfig> = {
    [QuizProgressMode.AUTO]: {
      icon: "flash-outline",
      color: COLORS.secondary,
      text: i18n.t("autoProgress"),
      description: i18n.t("autoProgressDesc"),
    },
    [QuizProgressMode.MANUAL]: {
      icon: "hand-left-outline",
      color: COLORS.accent,
      text: i18n.t("manualProgress"),
      description: i18n.t("manualProgressDesc"),
    },
  };

  // 진행 모드 옵션 렌더링 함수
  const renderProgressModeOption = (progressMode: QuizProgressMode) => {
    const config = progressModeConfig[progressMode];
    const isSelected = selectedProgressMode === progressMode;

    return (
      <TouchableOpacity
        key={progressMode}
        style={[
          styles.progressModeOption,
          {
            borderColor: config.color,
            backgroundColor: isSelected ? config.color : colors.card,
          },
        ]}
        onPress={() => onSelectProgressMode(progressMode)}
      >
        <View style={styles.optionHeader}>
          <Ionicons name={config.icon as any} size={24} color={isSelected ? COLORS.white : config.color} />
          <Text style={[styles.progressModeText, { color: isSelected ? COLORS.white : config.color }]}>
            {config.text}
          </Text>
        </View>
        <Text style={[styles.progressModeDescription, { color: isSelected ? COLORS.white : colors.text }]}>
          {config.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{i18n.t("selectProgressMode")}</Text>

      <View style={styles.optionsContainer}>
        {Object.values(QuizProgressMode).map((mode) => renderProgressModeOption(mode))}
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
  progressModeOption: {
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    borderWidth: 2,
    ...SHADOWS.small,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  progressModeText: {
    marginLeft: SIZES.medium,
    fontSize: SIZES.body,
    fontWeight: "600",
  },
  progressModeDescription: {
    fontSize: SIZES.caption,
    opacity: 0.9,
    marginLeft: 38, // 아이콘 + 마진 크기만큼 들여쓰기
  },
});

export default QuizProgressModeSelector;
