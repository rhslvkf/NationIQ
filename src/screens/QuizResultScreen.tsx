import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Difficulty } from "../types";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import Header from "../components/Header";
import Button from "../components/Button";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";

type QuizResultScreenRouteProp = RouteProp<RootStackParamList, "QuizResult">;
type QuizResultScreenNavigationProp = StackNavigationProp<RootStackParamList, "QuizResult">;

const QuizResultScreen: React.FC = () => {
  const route = useRoute<QuizResultScreenRouteProp>();
  const navigation = useNavigation<QuizResultScreenNavigationProp>();
  const { colors } = useAppTheme();

  const { result } = route.params;
  const { totalQuestions, correctAnswers, wrongAnswers, score, difficulty } = result;

  // 점수 비율 계산 (올바른 계산: 정답 수 / 총 문제 수)
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  // 애니메이션 값 초기화
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  // 컴포넌트 마운트 시 애니메이션 실행
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 결과 아이콘 및 메시지 결정
  const getResultIcon = () => {
    if (scorePercentage >= 90) return "trophy";
    if (scorePercentage >= 80) return "medal";
    if (scorePercentage >= 70) return "star";
    if (scorePercentage >= 50) return "thumbs-up";
    if (scorePercentage >= 30) return "book";
    return "seedling";
  };

  // 결과 메시지를 더 다양하게 구성
  const getResultMessage = () => {
    if (scorePercentage === 100) return i18n.t("perfect"); // 100% 정답
    if (scorePercentage >= 90) return i18n.t("excellent"); // 90% 이상
    if (scorePercentage >= 80) return i18n.t("veryGood"); // 80% 이상
    if (scorePercentage >= 70) return i18n.t("goodJob"); // 70% 이상
    if (scorePercentage >= 50) return i18n.t("keepGoing"); // 50% 이상
    if (scorePercentage >= 30) return i18n.t("needPractice"); // 30% 이상
    return i18n.t("tryHarder"); // 30% 미만
  };

  // 결과 아이콘 색상 그라데이션 설정
  const getResultGradient = () => {
    if (scorePercentage >= 90) return [COLORS.gold, "#FFB347"]; // 금색 그라데이션
    if (scorePercentage >= 80) return [COLORS.purple, "#7D3C98"]; // 보라색 그라데이션
    if (scorePercentage >= 70) return [COLORS.accent, "#FF7700"]; // 주황색 그라데이션
    if (scorePercentage >= 50) return [COLORS.info, "#2E86C1"]; // 파란색 그라데이션
    if (scorePercentage >= 30) return [COLORS.secondary, "#218c74"]; // 녹색 그라데이션
    return [COLORS.gray500, COLORS.gray600]; // 회색 그라데이션
  };

  // 난이도에 따른 색상
  const getDifficultyColor = () => {
    switch (difficulty) {
      case Difficulty.EASY:
        return COLORS.secondary;
      case Difficulty.MEDIUM:
        return COLORS.accent;
      case Difficulty.HARD:
        return COLORS.error;
      case Difficulty.VERY_HARD:
        return COLORS.purple;
      default:
        return COLORS.primary;
    }
  };

  // 난이도 텍스트
  const getDifficultyText = () => {
    switch (difficulty) {
      case Difficulty.EASY:
        return i18n.t("easy");
      case Difficulty.MEDIUM:
        return i18n.t("medium");
      case Difficulty.HARD:
        return i18n.t("hard");
      case Difficulty.VERY_HARD:
        return i18n.t("veryHard");
      default:
        return "";
    }
  };

  // 홈으로 돌아가기
  const handleGoHome = () => {
    navigation.navigate("Home");
  };

  // 같은 난이도로 다시 시작
  const handlePlayAgain = () => {
    // 현재 화면으로 돌아온 경로 확인
    const previousScreen = navigation
      .getState()
      .routes.find((route) => route.name === "FlagQuiz" || route.name === "CapitalQuiz");

    if (previousScreen && previousScreen.name === "CapitalQuiz") {
      navigation.navigate("CapitalQuiz", { difficulty });
    } else {
      // 기본값 또는 FlagQuiz에서 온 경우
      navigation.navigate("FlagQuiz", { difficulty });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={i18n.t("quizResult")} showBackButton onBackPress={handleGoHome} style={styles.header} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultContainer}>
          <Animated.View
            style={[
              styles.resultIconWrapper,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <LinearGradient
              colors={getResultGradient() as [string, string, ...string[]]}
              style={styles.resultIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome5 name={getResultIcon()} size={60} color={COLORS.white} />
            </LinearGradient>
          </Animated.View>

          <Animated.View style={{ opacity: opacityAnim }}>
            <Text style={[styles.resultMessage, { color: colors.text }]}>{getResultMessage()}</Text>
          </Animated.View>

          <View style={[styles.scoreCard, { backgroundColor: colors.card }]}>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, { color: colors.text }]}>{i18n.t("yourScore")}</Text>
              <Text style={[styles.scoreValue, { color: colors.primary }]}>
                {correctAnswers}/{totalQuestions}
              </Text>
            </View>

            <View style={[styles.scorePercentContainer, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.scorePercentBar,
                  { width: `${scorePercentage}%` },
                  { backgroundColor: getDifficultyColor() },
                ]}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <Text style={[styles.statValue, { color: colors.text }]}>{correctAnswers}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{i18n.t("correctAnswers")}</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
                <Text style={[styles.statValue, { color: colors.text }]}>{wrongAnswers}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{i18n.t("wrongAnswers")}</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="speedometer" size={24} color={getDifficultyColor()} />
                <Text style={[styles.statValue, { color: getDifficultyColor() }]}>{getDifficultyText()}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{i18n.t("difficulty")}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.buttonsContainer, { borderTopColor: colors.border }]}>
        <Button title={i18n.t("tryAgain")} onPress={handlePlayAgain} style={styles.button} />
        <Button title={i18n.t("backToHome")} onPress={handleGoHome} variant="outline" style={styles.button} />
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.medium,
  },
  resultContainer: {
    alignItems: "center",
    marginBottom: SIZES.xlarge,
  },
  resultIconWrapper: {
    marginBottom: SIZES.large,
  },
  resultIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.medium,
  },
  scorePercentText: {
    fontSize: SIZES.header * 1.5,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: SIZES.small,
  },
  resultMessage: {
    fontSize: SIZES.subheader,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: SIZES.xlarge,
    paddingHorizontal: SIZES.large,
  },
  scoreCard: {
    width: "100%",
    borderRadius: SIZES.cardRadius,
    padding: SIZES.large,
    ...SHADOWS.medium,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.medium,
  },
  scoreLabel: {
    fontSize: SIZES.body,
    fontWeight: "600",
  },
  scoreValue: {
    fontSize: SIZES.subheader,
    fontWeight: "bold",
  },
  scorePercentContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: SIZES.large,
    overflow: "hidden",
  },
  scorePercentBar: {
    height: "100%",
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: SIZES.medium,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: SIZES.body,
    fontWeight: "bold",
    marginVertical: SIZES.small,
  },
  statLabel: {
    fontSize: SIZES.bodySmall,
  },
  buttonsContainer: {
    padding: SIZES.medium,
    borderTopWidth: 1,
  },
  button: {
    marginBottom: SIZES.base,
  },
});

export default QuizResultScreen;
