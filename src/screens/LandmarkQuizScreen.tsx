import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { generateLandmarkQuiz } from "../services/landmarkService";
import { Difficulty, LandmarkQuiz, QuizResult, RootStackParamList } from "../types";
import DifficultySelector from "../components/DifficultySelector";
import QuestionCountSelector, { QUESTION_COUNTS, QuestionCount } from "../components/QuestionCountSelector";
import Button from "../components/Button";
import LandmarkQuizCard from "../components/LandmarkQuizCard";
import { COLORS, SIZES } from "../constants/theme";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";
import Header from "../components/Header";

type LandmarkQuizScreenProps = StackNavigationProp<RootStackParamList, "LandmarkQuiz">;

const LandmarkQuizScreen: React.FC = () => {
  const navigation = useNavigation<LandmarkQuizScreenProps>();
  const { colors } = useAppTheme();

  // 퀴즈 환경 설정
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [questionCount, setQuestionCount] = useState<QuestionCount>(QUESTION_COUNTS.SMALL);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 퀴즈 데이터와 상태
  const [quizzes, setQuizzes] = useState<LandmarkQuiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 퀴즈 결과 초기화
  useEffect(() => {
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
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

  // 사용자가 답변 선택 시 처리
  const handleAnswer = (isCorrect: boolean, selectedLandmark: string) => {
    if (selectedOption) return; // 이미 선택한 경우 처리하지 않음

    setSelectedOption(selectedLandmark);

    // 정답/오답 카운트 업데이트
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => prev + 1);
    }

    // 1초 후 다음 문제로 이동 또는 결과 화면으로 이동
    setTimeout(() => {
      if (currentQuizIndex < quizzes.length - 1) {
        setCurrentQuizIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        // 모든 퀴즈 완료, 결과 페이지로 이동
        const totalQuestions = quizzes.length;
        const finalCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;
        const finalWrongAnswers = isCorrect ? wrongAnswers : wrongAnswers + 1;

        const result: QuizResult = {
          totalQuestions,
          correctAnswers: finalCorrectAnswers,
          wrongAnswers: finalWrongAnswers,
          score: Math.round((finalCorrectAnswers / totalQuestions) * 100),
          difficulty,
        };

        navigation.navigate("QuizResult", { result });
      }
    }, 1000); // 1초 지연
  };

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    if (quizStarted) {
      // 진행 중인 퀴즈가 있는 경우 확인
      Alert.alert(i18n.t("cancel"), i18n.t("quitQuizConfirmation"), [
        { text: i18n.t("cancel"), style: "cancel" },
        {
          text: i18n.t("quit"),
          onPress: () => {
            setQuizStarted(false);
            navigation.goBack();
          },
          style: "destructive",
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={i18n.t("landmarkQuiz")} showBackButton onBackPress={handleGoBack} style={styles.header} />

      {!quizStarted ? (
        // 퀴즈 설정 화면 - 스크롤 가능
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.setupContainer}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{i18n.t("landmarkQuizDescription")}</Text>

            <DifficultySelector onSelectDifficulty={(diff) => setDifficulty(diff)} selectedDifficulty={difficulty} />

            <QuestionCountSelector onSelectCount={(count) => setQuestionCount(count)} selectedCount={questionCount} />

            <Button
              title={i18n.t("startQuiz")}
              onPress={handleStartQuiz}
              isLoading={isLoading}
              style={styles.startButton}
              size="large"
            />
          </View>
        </ScrollView>
      ) : (
        // 퀴즈 진행 화면 - 전체 스크롤 없음, 고정된 레이아웃
        <View style={styles.quizScreenContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <>
              {quizzes.length > 0 && (
                <View style={styles.quizCardContainer}>
                  <LandmarkQuizCard
                    quiz={quizzes[currentQuizIndex]}
                    onAnswer={handleAnswer}
                    isLast={currentQuizIndex === quizzes.length - 1}
                    questionNumber={currentQuizIndex + 1}
                    totalQuestions={quizzes.length}
                    correctAnswers={correctAnswers}
                    wrongAnswers={wrongAnswers}
                    selectedOption={selectedOption}
                  />
                </View>
              )}
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: SIZES.medium,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  setupContainer: {
    padding: 16,
  },
  quizScreenContainer: {
    flex: 1,
    padding: 16,
  },
  quizCardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    marginTop: 24,
  },
});

export default LandmarkQuizScreen;
