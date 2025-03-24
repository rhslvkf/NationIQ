import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  RootStackParamList,
  Difficulty,
  QuizResult,
  AreaPopulationQuiz,
  AreaPopulationQuizType,
  AreaPopulationDataType,
  QuizProgressMode,
} from "../types";
import { COLORS, SIZES } from "../constants/theme";
import Header from "../components/Header";
import Button from "../components/Button";
import AreaPopulationQuizCard from "../components/AreaPopulationQuizCard";
import DifficultySelector from "../components/DifficultySelector";
import QuestionCountSelector, { QUESTION_COUNTS, QuestionCount } from "../components/QuestionCountSelector";
import AreaPopulationQuizTypeSelector from "../components/AreaPopulationQuizTypeSelector";
import QuizProgressModeSelector from "../components/QuizProgressModeSelector";
import { generateAreaPopulationQuiz } from "../services/countryService";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

type AreaPopulationQuizScreenRouteProp = RouteProp<RootStackParamList, "AreaPopulationQuiz">;
type AreaPopulationQuizScreenNavigationProp = StackNavigationProp<RootStackParamList, "AreaPopulationQuiz">;

const AreaPopulationQuizScreen: React.FC = () => {
  const route = useRoute<AreaPopulationQuizScreenRouteProp>();
  const navigation = useNavigation<AreaPopulationQuizScreenNavigationProp>();
  const { colors } = useAppTheme();

  // 언어 변경을 감지하기 위한 상태
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);

  // 라우트 파라미터에서 초기 난이도 가져오기
  const [difficulty, setDifficulty] = useState<Difficulty>(route.params?.difficulty || Difficulty.EASY);

  // 문제 개수 상태
  const [questionCount, setQuestionCount] = useState<QuestionCount>(QUESTION_COUNTS.MEDIUM);

  // 퀴즈 타입 상태
  const [quizType, setQuizType] = useState<AreaPopulationQuizType>(AreaPopulationQuizType.SINGLE_CHOICE);

  // 퀴즈 진행 모드 상태
  const [progressMode, setProgressMode] = useState<QuizProgressMode>(QuizProgressMode.AUTO);

  // 퀴즈 관련 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<AreaPopulationQuiz[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);

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

  // 문제 변경 시 선택 상태 초기화
  useEffect(() => {
    if (quizStarted) {
      setSelectedOption(null);
      setSelectedOptions([]);
    }
  }, [currentQuestionIndex, quizStarted]);

  // 난이도 선택 핸들러
  const handleSelectDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  };

  // 문제 개수 선택 핸들러
  const handleSelectQuestionCount = (count: QuestionCount) => {
    setQuestionCount(count);
  };

  // 퀴즈 타입 선택 핸들러
  const handleSelectQuizType = (type: AreaPopulationQuizType) => {
    setQuizType(type);
  };

  // 퀴즈 진행 모드 선택 핸들러
  const handleSelectProgressMode = (mode: QuizProgressMode) => {
    setProgressMode(mode);
  };

  // 퀴즈 시작 핸들러
  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      const quizQuestions = await generateAreaPopulationQuiz(difficulty, questionCount, quizType);

      if (!quizQuestions || quizQuestions.length === 0) {
        throw new Error("퀴즈 생성에 실패했습니다.");
      }

      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setSelectedOptions([]);
      setScore(0);
      setCorrectAnswers(0);
      setWrongAnswers(0);
      setQuizStarted(true);
    } catch (error) {
      console.error("퀴즈 생성 오류:", error);

      // 사용자 친화적인 오류 메시지
      let errorMessage = i18n.t("quizLoadError");
      if (error instanceof Error) {
        if (error.message.includes("충분한 국가 데이터가 없어")) {
          errorMessage = i18n.t("insufficientCountryData");
        } else if (error.message.includes("불완전하여")) {
          errorMessage = i18n.t("incompleteCountryData");
        }
      }

      Alert.alert(i18n.t("error"), errorMessage, [{ text: i18n.t("retry"), onPress: handleStartQuiz }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 선택지 선택 핸들러 (단일 선택 모드)
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

    // 진행 모드에 따라 다음 문제로 넘어가는 방식 결정
    if (progressMode === QuizProgressMode.AUTO) {
      // 자동 진행 모드: 짧은 지연 후 다음 질문으로 넘어가거나 결과 화면으로 이동
      setTimeout(() => {
        moveToNextQuestionOrResult(isCorrect);
      }, 1500); // 1.5초 지연
    } else {
      // 수동 진행 모드: 다음 문제 버튼 표시
      setShowNextButton(true);
    }
  };

  // 순서 선택 모드 핸들러
  const handleSelectOrderedOptions = (orderedOptions: string[]) => {
    if (selectedOptions.length || !questions.length) {
      console.log("이미 선택된 옵션이 있거나 문제가 없습니다.");
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      console.log("현재 문제를 찾을 수 없습니다.");
      return;
    }

    if (!Array.isArray(currentQuestion.correctAnswer)) {
      console.log("현재 문제의 정답이 배열 형태가 아닙니다.", currentQuestion);
      return;
    }

    console.log("순서 선택 완료:", orderedOptions);
    console.log("정답:", currentQuestion.correctAnswer);

    setSelectedOptions(orderedOptions);

    // 정답 검증
    const correctAnswers = currentQuestion.correctAnswer;
    let correctCount = 0;

    // 각 위치별로 정답 확인
    for (let i = 0; i < orderedOptions.length; i++) {
      if (orderedOptions[i] === correctAnswers[i]) {
        correctCount++;
      }
    }

    console.log(`맞힌 개수: ${correctCount}/${orderedOptions.length}`);

    // 점수 계산 - 부분 점수 허용 (예: 4개 중 2개 맞췄다면 0.5점)
    const partialScore = correctCount / orderedOptions.length;
    const isFullyCorrect = partialScore === 1;

    setScore((prevScore) => prevScore + partialScore);

    if (isFullyCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    } else if (correctCount > 0) {
      // 일부만 맞춘 경우 (정답과 오답 모두 증가시키지 않음)
      // 부분 점수는 이미 score에 반영됨
    } else {
      setWrongAnswers((prev) => prev + 1);
    }

    // 진행 모드에 따라 다음 문제로 넘어가는 방식 결정
    if (progressMode === QuizProgressMode.AUTO) {
      // 자동 진행 모드: 짧은 지연 후 다음 질문으로 넘어가거나 결과 화면으로 이동
      setTimeout(() => {
        moveToNextQuestionOrResult(isFullyCorrect);
      }, 2000); // 2초 지연 (순서 확인에 시간이 더 필요)
    } else {
      // 수동 진행 모드: 다음 문제 버튼 표시
      setShowNextButton(true);
    }
  };

  // 다음 문제로 이동하거나 결과 화면으로 이동
  const moveToNextQuestionOrResult = (isCorrect: boolean) => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedOption(null);
      setSelectedOptions([]);
      setShowNextButton(false);
    } else {
      // 퀴즈 종료, 결과 화면으로 이동
      const finalCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);
      const finalWrongAnswers = wrongAnswers + (isCorrect ? 0 : 1);

      const result: QuizResult = {
        totalQuestions: questions.length,
        correctAnswers: finalCorrectAnswers,
        wrongAnswers: finalWrongAnswers,
        score: Math.round((score / questions.length) * 100),
        difficulty,
      };

      navigation.navigate("QuizResult", { result });
    }
  };

  // 다음 문제 버튼 핸들러
  const handleNextQuestion = () => {
    // 현재 문제의 정답 여부 확인
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;

    if (quizType === AreaPopulationQuizType.SINGLE_CHOICE && selectedOption && currentQuestion) {
      isCorrect = selectedOption === currentQuestion.correctAnswer;
    } else if (
      quizType === AreaPopulationQuizType.ORDER_SELECTION &&
      selectedOptions.length &&
      currentQuestion &&
      Array.isArray(currentQuestion.correctAnswer)
    ) {
      // 모든 항목이 정확한 위치에 있는지 확인
      isCorrect = selectedOptions.every((option, index) => option === currentQuestion.correctAnswer[index]);
    }

    moveToNextQuestionOrResult(isCorrect);
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
      <Header
        title={i18n.t("areaPopulationQuizTitle")}
        showBackButton
        onBackPress={handleGoBack}
        style={styles.header}
      />

      {quizStarted ? (
        <View style={styles.quizContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : currentQuestion ? (
            <AreaPopulationQuizCard
              question={currentQuestion.question}
              options={currentQuestion.options}
              onSelectOption={handleSelectOption}
              onSelectOrderedOptions={handleSelectOrderedOptions}
              selectedOption={selectedOption || undefined}
              selectedOptions={selectedOptions}
              correctAnswer={currentQuestion.correctAnswer}
              isLoading={isLoading}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              correctAnswers={correctAnswers}
              wrongAnswers={wrongAnswers}
              quizType={currentQuestion.quizType}
              dataType={currentQuestion.dataType}
              optionDetails={currentQuestion.optionDetails}
            />
          ) : null}

          {/* 수동 진행 모드에서 다음 문제 버튼 표시 */}
          {progressMode === QuizProgressMode.MANUAL && showNextButton && (
            <Button
              title={i18n.t("nextQuestion")}
              onPress={handleNextQuestion}
              style={styles.nextButton}
              size="large"
            />
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.setupContainer}
          contentContainerStyle={styles.setupContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.setupTitle, { color: colors.text }]}>{i18n.t("areaPopulationQuizDesc")}</Text>

          <DifficultySelector onSelectDifficulty={handleSelectDifficulty} selectedDifficulty={difficulty} />

          <QuestionCountSelector onSelectCount={handleSelectQuestionCount} selectedCount={questionCount} />

          <AreaPopulationQuizTypeSelector onSelectQuizType={handleSelectQuizType} selectedQuizType={quizType} />

          <QuizProgressModeSelector
            onSelectProgressMode={handleSelectProgressMode}
            selectedProgressMode={progressMode}
          />

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
  nextButton: {
    marginTop: SIZES.medium,
  },
});

export default AreaPopulationQuizScreen;
