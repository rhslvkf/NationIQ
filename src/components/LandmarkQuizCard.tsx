import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, ActivityIndicator } from "react-native";
import { LandmarkQuiz } from "../types";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";
import Card from "./Card";

const { width } = Dimensions.get("window");

interface LandmarkQuizCardProps {
  quiz: LandmarkQuiz;
  onAnswer: (isCorrect: boolean, selectedLandmark: string) => void;
  isLast: boolean;
  questionNumber: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  selectedOption?: string | null;
}

const LandmarkQuizCard: React.FC<LandmarkQuizCardProps> = ({
  quiz,
  onAnswer,
  isLast,
  questionNumber,
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  selectedOption,
}) => {
  const { colors } = useAppTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
  }, [quiz]);

  // 진행률 계산
  const progressPercentage = (questionNumber / totalQuestions) * 100;

  // 명소 선택 처리
  const handleSelectLandmark = (landmark: string) => {
    if (selectedOption) return; // 이미 선택한 경우 다시 선택 불가
    const isCorrect = landmark === quiz.correctLandmark;
    onAnswer(isCorrect, landmark);
  };

  // 옵션 배경색 결정
  const getOptionBackgroundColor = (option: string) => {
    if (!selectedOption) return colors.card;

    if (option === quiz.correctLandmark) return COLORS.success;
    if (option === selectedOption && option !== quiz.correctLandmark) return COLORS.error;

    return colors.card;
  };

  // 옵션 텍스트 색상 결정
  const getOptionTextColor = (option: string) => {
    if (!selectedOption) return colors.text;

    if (option === quiz.correctLandmark || (option === selectedOption && option !== quiz.correctLandmark)) {
      return COLORS.white;
    }

    return colors.text;
  };

  return (
    <Card style={{ ...styles.container, backgroundColor: colors.background }}>
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressText, { color: colors.primary }]}>
            {questionNumber}/{totalQuestions}
          </Text>
          <View style={styles.scoreDetails}>
            <Text style={[styles.scoreText, { color: COLORS.success }]}>
              {i18n.t("correct")}: {correctAnswers}
            </Text>
            <Text style={[styles.scoreText, { color: COLORS.error }]}>
              {i18n.t("wrong")}: {wrongAnswers}
            </Text>
          </View>
        </View>

        {/* 진행 바 */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercentage}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={[styles.questionLabel, { color: colors.text }]}>{quiz.question}</Text>
      </View>

      <View style={[styles.imageContainer, { backgroundColor: colors.card }]}>
        {isLoading && <ActivityIndicator size="large" color={colors.primary} />}
        <Image
          source={{ uri: quiz.imageUrl }}
          style={styles.image}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </View>

      <View style={styles.optionsContainer}>
        {quiz.landmarkOptions.map((option, index) => (
          <TouchableOpacity
            key={`landmark_${index}`}
            style={[
              styles.optionButton,
              {
                backgroundColor: getOptionBackgroundColor(option),
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleSelectLandmark(option)}
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
    width: width * 0.9,
    maxWidth: 500,
  },
  progressContainer: {
    padding: SIZES.medium,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.small,
  },
  progressText: {
    fontSize: SIZES.body,
    fontWeight: "600",
  },
  scoreDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreText: {
    fontSize: SIZES.body,
    fontWeight: "600",
    marginLeft: SIZES.small,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: SIZES.small,
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  questionContainer: {
    padding: SIZES.medium,
    alignItems: "center",
  },
  questionLabel: {
    fontSize: SIZES.large,
    fontWeight: "600",
    textAlign: "center",
  },
  imageContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.small,
    overflow: "hidden",
    borderWidth: 0,
    marginHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
    width: "auto",
    ...SHADOWS.medium,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
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

export default LandmarkQuizCard;
