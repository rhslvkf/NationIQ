import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { generateLandmarkQuiz } from "../services/landmarkService";
import { Difficulty, LandmarkQuiz, QuizResult, RootStackParamList } from "../types";
import DifficultySelector from "../components/DifficultySelector";
import QuestionCountSelector from "../components/QuestionCountSelector";
import PrimaryButton from "../components/PrimaryButton";
import LandmarkQuizCard from "../components/LandmarkQuizCard";
import { COLORS } from "../constants/theme";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

type LandmarkQuizScreenProps = StackNavigationProp<RootStackParamList, "LandmarkQuiz">;

const LandmarkQuizScreen: React.FC = () => {
  const navigation = useNavigation<LandmarkQuizScreenProps>();
  const { colors } = useAppTheme();

  // 퀴즈 환경 설정
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 퀴즈 데이터와 상태
  const [quizzes, setQuizzes] = useState<LandmarkQuiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  // 퀴즈 결과 초기화
  useEffect(() => {
    setQuizResults([]);
    setCurrentQuizIndex(0);
  }, [quizzes]);

  // 퀴즈 시작 처리
  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      const generatedQuizzes = await generateLandmarkQuiz(difficulty, questionCount);
      setQuizzes(generatedQuizzes);
      setQuizStarted(true);
    } catch (error) {
      console.error("Error starting landmark quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자가 답변 선택 시 처리 (국가와 명소 모두 확인)
  const handleAnswer = (isCorrectCountry: boolean, isCorrectLandmark: boolean) => {
    // 현재 퀴즈 가져오기
    const currentQuiz = quizzes[currentQuizIndex];

    // 답변 결과 저장 (둘 다 맞추어야 정답으로 인정)
    const isCorrect = isCorrectCountry && isCorrectLandmark;

    // 퀴즈 결과에 추가
    setQuizResults((prev) => [
      ...prev,
      {
        question: currentQuiz.question,
        userAnswer: `${isCorrectCountry ? currentQuiz.correctCountry : "오답"} / ${
          isCorrectLandmark ? currentQuiz.correctLandmark : "오답"
        }`,
        correctAnswer: `${currentQuiz.correctCountry} / ${currentQuiz.correctLandmark}`,
        isCorrect: isCorrect,
        imageUrl: currentQuiz.imageUrl,
        quizType: "landmark",
      },
    ]);

    // 다음 퀴즈로 이동 또는 결과 화면으로 이동
    if (currentQuizIndex < quizzes.length - 1) {
      setTimeout(() => {
        setCurrentQuizIndex((prev) => prev + 1);
      }, 1000);
    } else {
      // 모든 퀴즈 완료, 결과 페이지로 이동
      setTimeout(() => {
        navigation.navigate("QuizResult", {
          results: quizResults.concat({
            question: currentQuiz.question,
            userAnswer: `${isCorrectCountry ? currentQuiz.correctCountry : "오답"} / ${
              isCorrectLandmark ? currentQuiz.correctLandmark : "오답"
            }`,
            correctAnswer: `${currentQuiz.correctCountry} / ${currentQuiz.correctLandmark}`,
            isCorrect: isCorrect,
            imageUrl: currentQuiz.imageUrl,
            quizType: "landmark",
          }),
          difficulty,
        });
      }, 1500);
    }
  };

  // 퀴즈 재시작 처리
  const handleRestartQuiz = () => {
    setQuizStarted(false);
    setQuizzes([]);
    setCurrentQuizIndex(0);
    setQuizResults([]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{i18n.t("landmarkQuiz")}</Text>

        {!quizStarted ? (
          // 퀴즈 설정 화면
          <View style={styles.setupContainer}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{i18n.t("landmarkQuizDescription")}</Text>

            <DifficultySelector selectedDifficulty={difficulty} onSelect={setDifficulty} />

            <QuestionCountSelector count={questionCount} onChange={setQuestionCount} />

            <PrimaryButton
              title={i18n.t("startQuiz")}
              onPress={handleStartQuiz}
              isLoading={isLoading}
              style={styles.startButton}
            />
          </View>
        ) : (
          // 퀴즈 진행 화면
          <View style={styles.quizContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <>
                <View style={styles.progressContainer}>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    {i18n.t("questionProgress", {
                      current: currentQuizIndex + 1,
                      total: quizzes.length,
                    })}
                  </Text>
                </View>

                {quizzes.length > 0 && (
                  <LandmarkQuizCard
                    quiz={quizzes[currentQuizIndex]}
                    onAnswer={handleAnswer}
                    isLast={currentQuizIndex === quizzes.length - 1}
                  />
                )}

                <PrimaryButton title={i18n.t("restartQuiz")} onPress={handleRestartQuiz} style={styles.restartButton} />
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  setupContainer: {
    padding: 16,
  },
  quizContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 16,
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "500",
  },
  startButton: {
    marginTop: 24,
  },
  restartButton: {
    marginTop: 24,
  },
});

export default LandmarkQuizScreen;
