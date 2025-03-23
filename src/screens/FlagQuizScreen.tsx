import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Difficulty, Question, QuizResult } from "../types";
import { COLORS, SIZES } from "../constants/theme";
import Header from "../components/Header";
import Button from "../components/Button";
import FlagQuizCard from "../components/FlagQuizCard";
import DifficultySelector from "../components/DifficultySelector";
import { generateFlagQuiz } from "../services/countryService";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

type FlagQuizScreenRouteProp = RouteProp<RootStackParamList, "FlagQuiz">;
type FlagQuizScreenNavigationProp = StackNavigationProp<RootStackParamList, "FlagQuiz">;

const QUESTIONS_COUNT = 10;

const FlagQuizScreen: React.FC = () => {
  const route = useRoute<FlagQuizScreenRouteProp>();
  const navigation = useNavigation<FlagQuizScreenNavigationProp>();
  const { colors } = useAppTheme();

  // 언어 변경을 감지하기 위한 상태
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);

  // 라우트 파라미터에서 초기 난이도 가져오기
  const [difficulty, setDifficulty] = useState<Difficulty>(route.params?.difficulty || Difficulty.EASY);

  // 퀴즈 관련 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);

  // 언어 변경 시 컴포넌트 리렌더링 및 퀴즈 다시 로드
  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setCurrentLanguage(i18n.locale);

      // 퀴즈가 이미 시작되었다면 새 언어로 다시 로드
      if (quizStarted) {
        handleStartQuiz();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [quizStarted]);

  // 난이도 선택 핸들러
  const handleSelectDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  };

  // 퀴즈 시작 핸들러
  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      const quizQuestions = await generateFlagQuiz(difficulty, QUESTIONS_COUNT);
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setScore(0);
      setCorrectAnswers(0);
      setWrongAnswers(0);
      setQuizStarted(true);
    } catch (error) {
      Alert.alert(i18n.t("error"), "퀴즈 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.", [
        { text: i18n.t("retry"), onPress: handleStartQuiz },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 선택지 선택 핸들러
  const handleSelectOption = (option: string) => {
    if (selectedOption) return; // 이미 선택한 경우 무시

    setSelectedOption(option);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => prev + 1);
    }

    // 짧은 지연 후 다음 질문으로 넘어가거나 결과 화면으로 이동
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setSelectedOption(null);
      } else {
        // 퀴즈 종료, 결과 화면으로 이동
        const finalCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);
        const finalWrongAnswers = wrongAnswers + (isCorrect ? 0 : 1);

        const result: QuizResult = {
          totalQuestions: questions.length,
          correctAnswers: finalCorrectAnswers,
          wrongAnswers: finalWrongAnswers,
          score: score + (isCorrect ? 1 : 0), // 현재 정답 여부 반영
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

  // 현재 질문 가져오기
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={i18n.t("flagQuizTitle")} showBackButton onBackPress={handleGoBack} style={styles.header} />

      {quizStarted ? (
        <View style={styles.quizContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <FlagQuizCard
                flag={currentQuestion.flag}
                options={currentQuestion.options}
                onSelectOption={handleSelectOption}
                selectedOption={selectedOption || undefined}
                correctAnswer={selectedOption ? currentQuestion.correctAnswer : undefined}
                isLoading={isLoading}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
              />

              {/* 현재 스코어 표시 */}
              <View style={[styles.scoreContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.scoreText, { color: colors.primary }]}>
                  {i18n.t("yourScore")}: {score}/{currentQuestionIndex + (selectedOption ? 1 : 0)}
                </Text>
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.setupContainer}>
          <Text style={[styles.setupTitle, { color: colors.text }]}>{i18n.t("flagQuizDesc")}</Text>

          <DifficultySelector onSelectDifficulty={handleSelectDifficulty} selectedDifficulty={difficulty} />

          <Button
            title={i18n.t("start")}
            onPress={handleStartQuiz}
            isLoading={isLoading}
            style={styles.startButton}
            size="large"
          />
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
  setupContainer: {
    flex: 1,
    padding: SIZES.medium,
  },
  setupTitle: {
    fontSize: SIZES.subheader,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: SIZES.xlarge,
    marginTop: SIZES.large,
  },
  startButton: {
    marginTop: SIZES.xlarge,
  },
  quizContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.medium,
  },
  scoreContainer: {
    marginTop: SIZES.large,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
  },
  scoreText: {
    fontSize: SIZES.body,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default FlagQuizScreen;
