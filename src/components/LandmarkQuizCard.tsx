import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, ActivityIndicator } from "react-native";
import { LandmarkQuiz } from "../types";
import { COLORS } from "../constants/theme";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

const { width } = Dimensions.get("window");

interface LandmarkQuizCardProps {
  quiz: LandmarkQuiz;
  onAnswer: (isCorrectCountry: boolean, isCorrectLandmark: boolean) => void;
  isLast: boolean;
}

const LandmarkQuizCard: React.FC<LandmarkQuizCardProps> = ({ quiz, onAnswer, isLast }) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [answered, setAnswered] = useState<boolean>(false);
  const { colors } = useAppTheme();

  useEffect(() => {
    setSelectedCountry(null);
    setSelectedLandmark(null);
    setAnswered(false);
    setIsLoading(true);
  }, [quiz]);

  // 선택한 답변들이 모두 정답인지 확인
  const checkAnswers = () => {
    if (!selectedCountry || !selectedLandmark) return;

    const isCorrectCountry = selectedCountry === quiz.correctCountry;
    const isCorrectLandmark = selectedLandmark === quiz.correctLandmark;

    setAnswered(true);

    setTimeout(() => {
      onAnswer(isCorrectCountry, isCorrectLandmark);
    }, 1500);
  };

  // 국가 선택 처리
  const handleSelectCountry = (country: string) => {
    if (answered) return;
    setSelectedCountry(country);

    // 명소도 선택되어 있으면 답변 체크
    if (selectedLandmark) {
      checkAnswers();
    }
  };

  // 명소 선택 처리
  const handleSelectLandmark = (landmark: string) => {
    if (answered) return;
    setSelectedLandmark(landmark);

    // 국가도 선택되어 있으면 답변 체크
    if (selectedCountry) {
      checkAnswers();
    }
  };

  // 국가 선택지 스타일
  const getCountryOptionStyle = (option: string) => {
    if (!answered) {
      return [
        styles.option,
        {
          borderColor: colors.border,
          backgroundColor: selectedCountry === option ? colors.primary + "20" : colors.card,
        },
      ];
    }

    if (option === quiz.correctCountry) {
      return [styles.option, { backgroundColor: COLORS.success }];
    }

    if (option === selectedCountry && selectedCountry !== quiz.correctCountry) {
      return [styles.option, { backgroundColor: COLORS.error }];
    }

    return [styles.option, { borderColor: colors.border, backgroundColor: colors.card }];
  };

  // 명소 선택지 스타일
  const getLandmarkOptionStyle = (option: string) => {
    if (!answered) {
      return [
        styles.option,
        {
          borderColor: colors.border,
          backgroundColor: selectedLandmark === option ? colors.primary + "20" : colors.card,
        },
      ];
    }

    if (option === quiz.correctLandmark) {
      return [styles.option, { backgroundColor: COLORS.success }];
    }

    if (option === selectedLandmark && selectedLandmark !== quiz.correctLandmark) {
      return [styles.option, { backgroundColor: COLORS.error }];
    }

    return [styles.option, { borderColor: colors.border, backgroundColor: colors.card }];
  };

  // 선택지 텍스트 스타일
  const getOptionTextStyle = (option: string, isCountry: boolean) => {
    if (!answered) {
      return { color: (isCountry ? selectedCountry : selectedLandmark) === option ? COLORS.primary : colors.text };
    }

    const correctOption = isCountry ? quiz.correctCountry : quiz.correctLandmark;
    const selectedOption = isCountry ? selectedCountry : selectedLandmark;

    if (option === correctOption || (option === selectedOption && selectedOption === correctOption)) {
      return { color: COLORS.white };
    }

    if (option === selectedOption) {
      return { color: COLORS.white };
    }

    return { color: colors.text };
  };

  // 결과 피드백 텍스트
  const getFeedbackText = () => {
    if (!answered) return null;

    const isCorrectCountry = selectedCountry === quiz.correctCountry;
    const isCorrectLandmark = selectedLandmark === quiz.correctLandmark;

    // 둘 다 맞췄을 때
    if (isCorrectCountry && isCorrectLandmark) {
      return <Text style={[styles.feedbackText, { color: COLORS.success }]}>{i18n.t("correct")}</Text>;
    }

    // 하나만 맞췄을 때
    if (isCorrectCountry || isCorrectLandmark) {
      return <Text style={[styles.feedbackText, { color: COLORS.warning }]}>{i18n.t("partiallyCorrect")}</Text>;
    }

    // 둘 다 틀렸을 때
    return <Text style={[styles.feedbackText, { color: COLORS.error }]}>{i18n.t("wrong")}</Text>;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.imageContainer}>
        {isLoading && <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />}
        <Image
          source={{ uri: quiz.imageUrl }}
          style={styles.image}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.question, { color: colors.text }]}>{quiz.question}</Text>

        <View style={styles.optionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{i18n.t("selectCountry")}</Text>
          <View style={styles.optionsContainer}>
            {quiz.countryOptions.map((option, index) => (
              <TouchableOpacity
                key={`country_${index}`}
                style={getCountryOptionStyle(option)}
                onPress={() => handleSelectCountry(option)}
                disabled={answered}
              >
                <Text style={[styles.optionText, getOptionTextStyle(option, true)]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 16 }]}>
            {i18n.t("selectLandmark")}
          </Text>
          <View style={styles.optionsContainer}>
            {quiz.landmarkOptions.map((option, index) => (
              <TouchableOpacity
                key={`landmark_${index}`}
                style={getLandmarkOptionStyle(option)}
                onPress={() => handleSelectLandmark(option)}
                disabled={answered}
              >
                <Text style={[styles.optionText, getOptionTextStyle(option, false)]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {answered && (
          <View style={styles.feedbackContainer}>
            {getFeedbackText()}

            {(selectedCountry !== quiz.correctCountry || selectedLandmark !== quiz.correctLandmark) && (
              <Text style={[styles.correctAnswerText, { color: colors.text }]}>
                {i18n.t("correctAnswerIs", {
                  landmark: quiz.correctLandmark,
                  country: quiz.correctCountry,
                })}
              </Text>
            )}
          </View>
        )}

        {isLast && answered && <Text style={[styles.lastCard, { color: COLORS.primary }]}>{i18n.t("completed")}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  imageContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  loader: {
    position: "absolute",
    zIndex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  optionsSection: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionsContainer: {
    marginVertical: 4,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
  feedbackContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  feedbackText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  correctAnswerText: {
    textAlign: "center",
    fontSize: 14,
  },
  lastCard: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "bold",
  },
});

export default LandmarkQuizCard;
