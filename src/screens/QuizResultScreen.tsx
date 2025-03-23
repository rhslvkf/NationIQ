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

type QuizResultScreenRouteProp = RouteProp<RootStackParamList, "QuizResult">;
type QuizResultScreenNavigationProp = StackNavigationProp<RootStackParamList, "QuizResult">;

const QuizResultScreen: React.FC = () => {
  const route = useRoute<QuizResultScreenRouteProp>();
  const navigation = useNavigation<QuizResultScreenNavigationProp>();

  const { result } = route.params;
  const { totalQuestions, correctAnswers, wrongAnswers, score, difficulty } = result;

  // 점수 비율 계산
  const scorePercentage = Math.round((score / totalQuestions) * 100);

  // 결과 아이콘 및 메시지 결정
  const getResultIcon = () => {
    if (scorePercentage >= 80) return "trophy-outline";
    if (scorePercentage >= 50) return "thumbs-up-outline";
    return "school-outline";
  };

  const getResultMessage = () => {
    if (scorePercentage >= 80) return "훌륭합니다! 국기 전문가!";
    if (scorePercentage >= 50) return "잘했습니다! 계속 연습하세요!";
    return "좀 더 연습이 필요합니다. 다시 도전해보세요!";
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
    <SafeAreaView style={styles.container}>
      <Header title={i18n.t("quizResult")} style={styles.header} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultContainer}>
          <View style={styles.resultIconContainer}>
            <Ionicons name={getResultIcon()} size={80} color={COLORS.primary} />
          </View>

          <Text style={styles.congratsText}>{i18n.t("congratulations")}</Text>
          <Text style={styles.resultMessage}>{getResultMessage()}</Text>

          <View style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>{i18n.t("yourScore")}</Text>
              <Text style={styles.scoreValue}>
                {score}/{totalQuestions}
              </Text>
            </View>

            <View style={styles.scorePercentContainer}>
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
                <Text style={styles.statValue}>{correctAnswers}</Text>
                <Text style={styles.statLabel}>정답</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
                <Text style={styles.statValue}>{wrongAnswers}</Text>
                <Text style={styles.statLabel}>오답</Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons name="speedometer" size={24} color={getDifficultyColor()} />
                <Text style={[styles.statValue, { color: getDifficultyColor() }]}>{getDifficultyText()}</Text>
                <Text style={styles.statLabel}>난이도</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <Button title={i18n.t("tryAgain")} onPress={handlePlayAgain} style={styles.button} />
        <Button title={i18n.t("backToHome")} onPress={handleGoHome} variant="outline" style={styles.button} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.large,
    ...SHADOWS.medium,
  },
  congratsText: {
    fontSize: SIZES.header,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SIZES.small,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: SIZES.body,
    color: COLORS.gray600,
    textAlign: "center",
    marginBottom: SIZES.xlarge,
  },
  scoreCard: {
    width: "100%",
    backgroundColor: COLORS.white,
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
    color: COLORS.black,
  },
  scoreValue: {
    fontSize: SIZES.subheader,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  scorePercentContainer: {
    height: 8,
    backgroundColor: COLORS.gray200,
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
    color: COLORS.gray600,
  },
  buttonsContainer: {
    padding: SIZES.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  button: {
    marginBottom: SIZES.base,
  },
});

export default QuizResultScreen;
