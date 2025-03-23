import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import Card from "./Card";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

interface FlagQuizCardProps {
  flag: string;
  options: string[];
  onSelectOption: (option: string) => void;
  selectedOption?: string;
  correctAnswer?: string;
  isLoading: boolean;
  questionNumber: number;
  totalQuestions: number;
}

const { width } = Dimensions.get("window");
const FLAG_WIDTH = width * 0.8;
const FLAG_HEIGHT = (FLAG_WIDTH * 3) / 5; // 일반적인 국기 비율 5:3

const FlagQuizCard: React.FC<FlagQuizCardProps> = ({
  flag,
  options,
  onSelectOption,
  selectedOption,
  correctAnswer,
  isLoading,
  questionNumber,
  totalQuestions,
}) => {
  const { colors } = useAppTheme();

  // 언어 변경을 감지하기 위한 상태
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);

  // 언어 변경 시 컴포넌트 리렌더링
  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setCurrentLanguage(i18n.locale);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 옵션 버튼의 배경색 결정
  const getOptionBackgroundColor = (option: string) => {
    if (!selectedOption) return colors.card;

    if (option === correctAnswer) return COLORS.success;
    if (option === selectedOption && option !== correctAnswer) return COLORS.error;

    return colors.card;
  };

  // 옵션 버튼의 텍스트 색상 결정
  const getOptionTextColor = (option: string) => {
    if (!selectedOption) return colors.text;

    if (option === correctAnswer || (option === selectedOption && option !== correctAnswer)) {
      return COLORS.white;
    }

    return colors.text;
  };

  return (
    <Card style={{ ...styles.container, backgroundColor: colors.background }}>
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: colors.primary }]}>
          {questionNumber}/{totalQuestions}
        </Text>
      </View>

      <Text style={[styles.question, { color: colors.text }]}>{i18n.t("whichCountry")}</Text>

      <View style={styles.flagContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <Image source={{ uri: flag }} style={styles.flagImage} resizeMode="cover" />
        )}
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              {
                backgroundColor: getOptionBackgroundColor(option),
                borderColor: colors.border,
              },
            ]}
            onPress={() => onSelectOption(option)}
            disabled={!!selectedOption}
          >
            <Text style={[styles.optionText, { color: getOptionTextColor(option) }]} numberOfLines={1}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: "hidden",
  },
  progressContainer: {
    padding: SIZES.medium,
    alignItems: "center",
  },
  progressText: {
    fontSize: SIZES.body,
    fontWeight: "600",
  },
  question: {
    fontSize: SIZES.body,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: SIZES.medium,
    paddingHorizontal: SIZES.medium,
  },
  flagContainer: {
    width: FLAG_WIDTH,
    height: FLAG_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: SIZES.large,
    ...SHADOWS.medium,
  },
  flagImage: {
    width: "100%",
    height: "100%",
    borderRadius: SIZES.base,
  },
  optionsContainer: {
    padding: SIZES.medium,
  },
  optionButton: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    borderRadius: SIZES.base,
    marginBottom: SIZES.base,
    borderWidth: 1,
    ...SHADOWS.small,
  },
  optionText: {
    fontSize: SIZES.body,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default FlagQuizCard;
