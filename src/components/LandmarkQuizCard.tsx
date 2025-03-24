import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, ActivityIndicator } from "react-native";
import { LandmarkQuiz } from "../types";
import { COLORS } from "../constants/theme";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

const { width } = Dimensions.get("window");

interface LandmarkQuizCardProps {
  quiz: LandmarkQuiz;
  onAnswer: (isCorrect: boolean, answer: string) => void;
  isLast: boolean;
}

const LandmarkQuizCard: React.FC<LandmarkQuizCardProps> = ({ quiz, onAnswer, isLast }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { colors } = useAppTheme();

  useEffect(() => {
    setSelectedAnswer(null);
    setIsLoading(true);
  }, [quiz]);

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === quiz.correctAnswer;

    setTimeout(() => {
      onAnswer(isCorrect, answer);
    }, 1000);
  };

  const getOptionStyle = (option: string) => {
    if (!selectedAnswer) {
      return styles.option;
    }

    if (option === quiz.correctAnswer) {
      return [styles.option, { backgroundColor: COLORS.success }];
    }

    if (option === selectedAnswer && selectedAnswer !== quiz.correctAnswer) {
      return [styles.option, { backgroundColor: COLORS.error }];
    }

    return styles.option;
  };

  const getOptionTextStyle = (option: string) => {
    if (!selectedAnswer) {
      return { color: colors.text };
    }

    if (option === quiz.correctAnswer || (option === selectedAnswer && selectedAnswer === quiz.correctAnswer)) {
      return { color: COLORS.white };
    }

    if (option === selectedAnswer) {
      return { color: COLORS.white };
    }

    return { color: colors.text };
  };

  const getFeedbackText = () => {
    if (!selectedAnswer) return null;

    const isCorrect = selectedAnswer === quiz.correctAnswer;

    return (
      <Text style={[styles.feedbackText, { color: isCorrect ? COLORS.success : COLORS.error }]}>
        {isCorrect ? i18n.t("correct") : i18n.t("wrong")}
        {!isCorrect && (
          <Text style={{ color: colors.text }}>
            {" - "}
            {quiz.correctAnswer}
          </Text>
        )}
      </Text>
    );
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

        <View style={styles.optionsContainer}>
          {quiz.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[getOptionStyle(option), { borderColor: colors.border }]}
              onPress={() => handleSelectAnswer(option)}
              disabled={!!selectedAnswer}
            >
              <Text style={[styles.optionText, getOptionTextStyle(option)]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {getFeedbackText()}

        {isLast && selectedAnswer && (
          <Text style={[styles.lastCard, { color: COLORS.primary }]}>{i18n.t("completed")}</Text>
        )}
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
  optionsContainer: {
    marginVertical: 8,
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
  feedbackText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  lastCard: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "bold",
  },
});

export default LandmarkQuizCard;
