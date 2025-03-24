import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Difficulty, QuizType, LandmarkQuiz, QuizResult } from "../types";
import { COLORS, SIZES } from "../constants/theme";
import Header from "../components/Header";
import Button from "../components/Button";
import LandmarkQuizCard from "../components/LandmarkQuizCard";
import DifficultySelector from "../components/DifficultySelector";
import QuestionCountSelector, { QUESTION_COUNTS, QuestionCount } from "../components/QuestionCountSelector";
import { generateLandmarkQuiz } from "../services/landmarkService";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

// RootStackParamList에 LandmarkQuiz가 없으므로 any 타입으로 임시 정의
type LandmarkQuizScreenNavigationProp = StackNavigationProp<any, "LandmarkQuiz">;

// 명소 퀴즈 타입 선택 컴포넌트
const LandmarkQuizTypeSelector: React.FC<{
  onSelectQuizType: (quizType: QuizType) => void;
  selectedQuizType: QuizType;
}> = ({ onSelectQuizType, selectedQuizType }) => {
  const { colors } = useAppTheme();

  const quizTypes = [
    { type: QuizType.LANDMARK_TO_COUNTRY, label: i18n.t("landmarkToCountry") },
    { type: QuizType.LANDMARK_TO_NAME, label: i18n.t("landmarkToName") },
    { type: QuizType.LANDMARK_MIXED, label: i18n.t("landmarkMixed") },
  ];

  return (
    <View style={styles.quizTypeContainer}>
      <Text style={[styles.quizTypeTitle, { color: colors.text }]}>{i18n.t("selectQuizType")}</Text>
      <View style={styles.quizTypeButtons}>
        {quizTypes.map((item) => (
          <Button
            key={item.type}
            title={item.label}
            onPress={() => onSelectQuizType(item.type)}
            style={[
              styles.quizTypeButton,
              { backgroundColor: selectedQuizType === item.type ? colors.primary : colors.card },
            ]}
            textStyle={{
              color: selectedQuizType === item.type ? COLORS.white : colors.text,
              fontSize: SIZES.bodySmall,
            }}
            size="small"
          />
        ))}
      </View>
    </View>
  );
};

const LandmarkQuizScreen: React.FC = () => {
  const navigation = useNavigation<LandmarkQuizScreenNavigationProp>();
  const { colors } = useAppTheme();

  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<LandmarkQuiz[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);
  const [quizType, setQuizType] = useState<QuizType>(QuizType.LANDMARK_MIXED);

  const handleGoBack = () => {
    if (quizStarted) {
      setQuizStarted(false);
      setCurrentQuestionIndex(0);
      setCorrectAnswers(0);
      setWrongAnswers(0);
      setSelectedOption(null);
    } else {
      navigation.goBack();
    }
  };

  const handleSelectDifficulty = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
  };

  const handleSelectQuestionCount = (count: QuestionCount) => {
    setQuestionCount(count);
  };

  const handleSelectQuizType = (selectedQuizType: QuizType) => {
    setQuizType(selectedQuizType);
  };

  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      const quizData = await generateLandmarkQuiz(difficulty, questionCount, quizType);
      setQuestions(quizData);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setCorrectAnswers(0);
      setWrongAnswers(0);
      setSelectedOption(null);
    } catch (error) {
      console.error("명소 퀴즈 로드 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean, answer: string) => {
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => prev + 1);
    }

    setSelectedOption(answer);

    // 다음 질문으로 이동하거나 결과 페이지로 이동
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        // 퀴즈 종료, 결과 페이지로 이동
        const result: QuizResult = {
          correctAnswers,
          wrongAnswers: wrongAnswers + (isCorrect ? 0 : 1),
          totalQuestions: questions.length,
          difficulty,
          score: 0, // 필요한 경우 계산 로직 추가
        };

        navigation.navigate("QuizResult", { result });
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={i18n.t("landmarkQuizTitle")} showBackButton onBackPress={handleGoBack} style={styles.header} />

      {quizStarted ? (
        <View style={styles.quizContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <LandmarkQuizCard
              quiz={questions[currentQuestionIndex]}
              onAnswer={handleAnswer}
              isLast={currentQuestionIndex === questions.length - 1}
            />
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.setupContainer}
          contentContainerStyle={styles.setupContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.setupTitle, { color: colors.text }]}>{i18n.t("landmarkQuizDesc")}</Text>

          <DifficultySelector onSelectDifficulty={handleSelectDifficulty} selectedDifficulty={difficulty} />

          <QuestionCountSelector onSelectCount={handleSelectQuestionCount} selectedCount={questionCount} />

          <LandmarkQuizTypeSelector onSelectQuizType={handleSelectQuizType} selectedQuizType={quizType} />

          <Button
            title={i18n.t("start")}
            onPress={handleStartQuiz}
            isLoading={isLoading}
            style={styles.startButton}
            size="large"
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  quizContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  setupContainer: {
    flex: 1,
    padding: 16,
  },
  setupContent: {
    paddingBottom: 32,
  },
  setupTitle: {
    fontSize: SIZES.subheader,
    textAlign: "center",
    marginBottom: 24,
  },
  startButton: {
    marginTop: 32,
  },
  quizTypeContainer: {
    marginVertical: 16,
  },
  quizTypeTitle: {
    fontSize: SIZES.body,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  quizTypeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quizTypeButton: {
    marginBottom: 8,
    width: "100%",
  },
});

export default LandmarkQuizScreen;
