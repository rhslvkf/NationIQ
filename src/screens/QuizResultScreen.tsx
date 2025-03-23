import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Difficulty } from "../types";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import Header from "../components/Header";
import Button from "../components/Button";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

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

  // 결과 아이콘 및 메시지 결정
  const getResultIcon = () => {
    if (scorePercentage >= 80) return "trophy-outline";
    if (scorePercentage >= 50) return "thumbs-up-outline";
    return "school-outline";
  };

  const getResultMessage = () => {
    if (scorePercentage >= 80) return i18n.t("excellent");
    if (scorePercentage >= 50) return i18n.t("goodJob");
    return i18n.t("needPractice");
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
    navigation.navigate("FlagQuiz", { difficulty });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={i18n.t("quizResult")} style={styles.header} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultContainer}>
          <View style={[styles.resultIconContainer, { backgroundColor: colors.card }]}>
            <Ionicons name={getResultIcon()} size={80} color={colors.primary} />
          </View>

          <Text style={[styles.resultMessage, { color: colors.textSecondary }]}>{getResultMessage()}</Text>

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
  resultIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.large,
    ...SHADOWS.medium,
  },
  congratsText: {
    fontSize: SIZES.header,
    fontWeight: "bold",
    marginBottom: SIZES.small,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: SIZES.body,
    textAlign: "center",
    marginBottom: SIZES.xlarge,
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
