import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import Card from "./Card";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";
import { AreaPopulationQuizType, AreaPopulationDataType } from "../types";

interface AreaPopulationQuizCardProps {
  question: string;
  options: string[];
  onSelectOption: (option: string) => void;
  onSelectOrderedOptions?: (options: string[]) => void;
  selectedOption?: string;
  selectedOptions?: string[];
  correctAnswer?: string | string[];
  isLoading: boolean;
  questionNumber: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  quizType: AreaPopulationQuizType;
  dataType: AreaPopulationDataType;
  optionDetails?: {
    [countryName: string]: {
      area?: number;
      population?: number;
    };
  };
}

const { width } = Dimensions.get("window");

const AreaPopulationQuizCard: React.FC<AreaPopulationQuizCardProps> = ({
  question,
  options,
  onSelectOption,
  onSelectOrderedOptions,
  selectedOption,
  selectedOptions = [],
  correctAnswer,
  isLoading,
  questionNumber,
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  quizType,
  dataType,
  optionDetails,
}) => {
  const { colors } = useAppTheme();

  // 언어 변경을 감지하기 위한 상태
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);
  // 순서 선택 모드에서 선택된 국가들을 관리
  const [orderedSelections, setOrderedSelections] = useState<string[]>([]);

  // 언어 변경 시 컴포넌트 리렌더링
  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setCurrentLanguage(i18n.locale);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 문제 변경 시 orderedSelections 초기화
  useEffect(() => {
    setOrderedSelections([]);
  }, [question, options, questionNumber]);

  // 선택하면 순서대로 선택된 항목에 추가
  const handleOrderSelection = (option: string) => {
    // 이미 선택된 옵션이면 선택 취소
    if (orderedSelections.includes(option)) {
      const newSelections = orderedSelections.filter((item) => item !== option);
      setOrderedSelections(newSelections);
      return;
    }

    const newSelections = [...orderedSelections, option];
    setOrderedSelections(newSelections);

    // 모든 옵션을 선택했으면 결과 확인
    if (newSelections.length === options.length && onSelectOrderedOptions) {
      onSelectOrderedOptions(newSelections);
    }
  };

  // 옵션 버튼의 배경색 결정 (단일 선택 모드)
  const getOptionBackgroundColor = (option: string) => {
    if (!selectedOption) return colors.card;

    if (
      (typeof correctAnswer === "string" && option === correctAnswer) ||
      (Array.isArray(correctAnswer) && correctAnswer.includes(option))
    )
      return COLORS.success;
    if (option === selectedOption && option !== correctAnswer) return COLORS.error;

    return colors.card;
  };

  // 옵션 버튼의 텍스트 색상 결정 (단일 선택 모드)
  const getOptionTextColor = (option: string) => {
    if (!selectedOption) return colors.text;

    if (
      (typeof correctAnswer === "string" && option === correctAnswer) ||
      (Array.isArray(correctAnswer) && correctAnswer.includes(option)) ||
      (option === selectedOption && option !== correctAnswer)
    ) {
      return COLORS.white;
    }

    return colors.text;
  };

  // 순서 선택 모드에서 옵션 버튼의 배경색 결정
  const getOrderSelectionBackgroundColor = (option: string) => {
    // 아직 선택 검증이 완료되지 않았을 때
    if (selectedOptions.length === 0) {
      // 이미 선택된 옵션이면 회색 배경
      if (orderedSelections.includes(option)) {
        // 선택 순서에 따라 색상 진하게
        const index = orderedSelections.indexOf(option);
        const opacity = 0.5 + (index / orderedSelections.length) * 0.5;
        return `rgba(100, 100, 100, ${opacity})`;
      }
      return colors.card;
    }

    // 선택 검증이 완료된 후 (정답 확인)
    if (Array.isArray(correctAnswer)) {
      const correctIndex = correctAnswer.indexOf(option);
      const selectedIndex = selectedOptions.indexOf(option);

      // 올바른 위치에 선택됨
      if (correctIndex === selectedIndex && correctIndex !== -1) {
        return COLORS.success;
      }
      // 잘못된 위치에 선택됨
      else if (selectedIndex !== -1) {
        return COLORS.error;
      }
    }

    return colors.card;
  };

  // 순서 선택 모드에서 옵션 텍스트 색상 결정
  const getOrderSelectionTextColor = (option: string) => {
    if (selectedOptions.length === 0) {
      if (orderedSelections.includes(option)) {
        return COLORS.white;
      }
      return colors.text;
    }

    // 선택 검증이 완료된 후
    if (Array.isArray(correctAnswer)) {
      const correctIndex = correctAnswer.indexOf(option);
      const selectedIndex = selectedOptions.indexOf(option);

      if ((correctIndex === selectedIndex && correctIndex !== -1) || selectedIndex !== -1) {
        return COLORS.white;
      }
    }

    return colors.text;
  };

  // 선택된 순서 표시 (1, 2, 3, 4)
  const getOrderNumber = (option: string) => {
    const index = orderedSelections.indexOf(option);
    return index !== -1 ? index + 1 : "";
  };

  // 정답 순서 표시 (배열에서의 위치 + 1 반환)
  const getCorrectOrderNumber = (option: string) => {
    if (!Array.isArray(correctAnswer)) return "";
    const index = correctAnswer.indexOf(option);
    return index !== -1 ? index + 1 : "";
  };

  // 옵션 상세 정보 표시 (면적 또는 인구)
  const renderOptionDetails = (option: string) => {
    // 항상 null을 반환하여 상세 정보를 표시하지 않음
    return null;
  };

  // 진행률 계산
  const progressPercentage = (questionNumber / totalQuestions) * 100;

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

        {/* 진행 바 추가 */}
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
        <Text style={[styles.question, { color: colors.primary }]}>{question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                {
                  backgroundColor:
                    quizType === AreaPopulationQuizType.SINGLE_CHOICE
                      ? getOptionBackgroundColor(option)
                      : getOrderSelectionBackgroundColor(option),
                  borderColor: colors.border,
                },
              ]}
              onPress={() =>
                quizType === AreaPopulationQuizType.SINGLE_CHOICE
                  ? onSelectOption(option)
                  : handleOrderSelection(option)
              }
              disabled={
                !!selectedOption || (quizType === AreaPopulationQuizType.ORDER_SELECTION && selectedOptions.length > 0)
              }
            >
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        quizType === AreaPopulationQuizType.SINGLE_CHOICE
                          ? getOptionTextColor(option)
                          : getOrderSelectionTextColor(option),
                    },
                  ]}
                  numberOfLines={1}
                >
                  {option}
                </Text>
                {renderOptionDetails(option)}
              </View>
              {quizType === AreaPopulationQuizType.ORDER_SELECTION && (
                <View style={styles.orderNumberContainer}>
                  {selectedOptions.length > 0 && Array.isArray(correctAnswer) && (
                    <Text
                      style={[
                        styles.orderNumber,
                        {
                          backgroundColor: COLORS.success,
                          color: COLORS.white,
                          marginRight: 4,
                          textShadowColor: "rgba(0, 0, 0, 0.5)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 1,
                          borderWidth: 2,
                          borderColor: COLORS.white,
                        },
                      ]}
                    >
                      {getCorrectOrderNumber(option)}
                    </Text>
                  )}
                  {(orderedSelections.includes(option) || selectedOptions.includes(option)) && (
                    <Text
                      style={[
                        styles.orderNumber,
                        {
                          backgroundColor:
                            selectedOptions.length > 0
                              ? selectedOptions.indexOf(option) === correctAnswer?.indexOf(option)
                                ? COLORS.success
                                : COLORS.error
                              : COLORS.primary,
                          color: COLORS.white,
                          textShadowColor: "rgba(0, 0, 0, 0.5)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 1,
                          borderWidth: 2,
                          borderColor: COLORS.white,
                        },
                      ]}
                    >
                      {getOrderNumber(option) || selectedOptions.indexOf(option) + 1}
                    </Text>
                  )}
                  {!orderedSelections.includes(option) && !selectedOptions.includes(option) && (
                    <View style={styles.emptyOrderNumber} />
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
  question: {
    fontSize: SIZES.large,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SIZES.medium,
  },
  optionsContainer: {
    padding: SIZES.medium,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    borderRadius: SIZES.base,
    marginBottom: SIZES.base,
    borderWidth: 1,
    minHeight: 60,
    ...SHADOWS.small,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: SIZES.body,
    fontWeight: "500",
  },
  optionDetail: {
    fontSize: SIZES.small,
    marginTop: SIZES.small / 2,
    opacity: 0.8,
  },
  orderNumberContainer: {
    marginLeft: SIZES.medium,
    flexDirection: "row",
    alignItems: "center",
  },
  orderNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 20,
    fontSize: SIZES.medium,
    fontWeight: "bold",
  },
  emptyOrderNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default AreaPopulationQuizCard;
