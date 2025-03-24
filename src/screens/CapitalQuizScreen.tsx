import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Difficulty, CapitalQuiz, QuizResult, QuizType } from "../types";
import { COLORS, SIZES } from "../constants/theme";
import Header from "../components/Header";
import Button from "../components/Button";
import CapitalQuizCard from "../components/CapitalQuizCard";
import DifficultySelector from "../components/DifficultySelector";
import QuestionCountSelector, { QUESTION_COUNTS, QuestionCount } from "../components/QuestionCountSelector";
import QuizTypeSelector from "../components/QuizTypeSelector";
import { generateCapitalQuiz } from "../services/countryService";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

type CapitalQuizScreenRouteProp = RouteProp<RootStackParamList, "CapitalQuiz">;
type CapitalQuizScreenNavigationProp = StackNavigationProp<RootStackParamList, "CapitalQuiz">;

const CapitalQuizScreen: React.FC = () => {
  const route = useRoute<CapitalQuizScreenRouteProp>();
  const navigation = useNavigation<CapitalQuizScreenNavigationProp>();
  const { colors } = useAppTheme();

  // 언어 변경을 감지하기 위한 상태
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);

  // 라우트 파라미터에서 초기 난이도 가져오기
  const [difficulty, setDifficulty] = useState<Difficulty>(route.params?.difficulty || Difficulty.EASY);

  // 문제 개수 상태
  const [questionCount, setQuestionCount] = useState<QuestionCount>(QUESTION_COUNTS.MEDIUM);

  // 퀴즈 타입 상태
  const [quizType, setQuizType] = useState<QuizType>(QuizType.COUNTRY_TO_CAPITAL);

  // 퀴즈 관련 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<CapitalQuiz[]>([]);
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

  // 문제 개수 선택 핸들러
  const handleSelectQuestionCount = (count: QuestionCount) => {
    setQuestionCount(count);
  };

  // 퀴즈 타입 선택 핸들러
  const handleSelectQuizType = (type: QuizType) => {
    setQuizType(type);
  };

  // 퀴즈 시작 핸들러
  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      const quizQuestions = await generateCapitalQuiz(difficulty, questionCount, quizType);
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setScore(0);
      setCorrectAnswers(0);
      setWrongAnswers(0);
      setQuizStarted(true);
    } catch (error) {
      Alert.alert(i18n.t("error"), i18n.t("quizLoadError"), [{ text: i18n.t("retry"), onPress: handleStartQuiz }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 선택지 선택 핸들러
  const handleSelectOption = (option: string) => {
    if (selectedOption || !questions.length) return; // 이미 선택했거나 문제가 없는 경우 무시

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return; // 현재 문제가 없는 경우 무시

    setSelectedOption(option);

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
          score: Math.round((finalCorrectAnswers / questions.length) * 100),
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
      <Header title={i18n.t("capitalQuizTitle")} showBackButton onBackPress={handleGoBack} style={styles.header} />

      {quizStarted ? (
        <View style={styles.quizContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : currentQuestion ? (
            <CapitalQuizCard
              question={currentQuestion.question}
              options={currentQuestion.options}
              onSelectOption={handleSelectOption}
              selectedOption={selectedOption || undefined}
              correctAnswer={selectedOption ? currentQuestion.correctAnswer : undefined}
              isLoading={isLoading}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              correctAnswers={correctAnswers}
              wrongAnswers={wrongAnswers}
              quizType={currentQuestion.quizType}
            />
          ) : null}
        </View>
      ) : (
        <ScrollView
          style={styles.setupContainer}
          contentContainerStyle={styles.setupContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.setupTitle, { color: colors.text }]}>{i18n.t("capitalQuizDesc")}</Text>

          <DifficultySelector onSelectDifficulty={handleSelectDifficulty} selectedDifficulty={difficulty} />

          <QuestionCountSelector onSelectCount={handleSelectQuestionCount} selectedCount={questionCount} />

          <QuizTypeSelector onSelectQuizType={handleSelectQuizType} selectedQuizType={quizType} />

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
    marginBottom: SIZES.medium,
  },
  setupContainer: {
    flex: 1,
  },
  setupContent: {
    padding: SIZES.medium,
    paddingBottom: SIZES.xlarge * 2,
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
});

export default CapitalQuizScreen;
