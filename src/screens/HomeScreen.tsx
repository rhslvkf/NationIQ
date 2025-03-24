import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Difficulty } from "../types";
import Card from "../components/Card";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import i18n from "../i18n";
import { useAppTheme } from "../hooks/useAppTheme";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useAppTheme();
  // 언어 변경을 감지하기 위한 상태
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);

  // 언어 변경 시 컴포넌트 리렌더링
  useEffect(() => {
    const unsubscribe = i18n.onChange(() => {
      setCurrentLanguage(i18n.locale);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleGoToFlagQuiz = () => {
    navigation.navigate("FlagQuiz", { difficulty: Difficulty.EASY });
  };

  const handleGoToCapitalQuiz = () => {
    navigation.navigate("CapitalQuiz", { difficulty: Difficulty.EASY });
  };

  const handleGoToLandmarkQuiz = () => {
    navigation.navigate("LandmarkQuiz", { difficulty: Difficulty.EASY });
  };

  const handleGoToSettings = () => {
    navigation.navigate("Settings");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.primary }]}>{i18n.t("appName")}</Text>
        <TouchableOpacity onPress={handleGoToSettings}>
          <Ionicons name="settings-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>{i18n.t("welcome")}</Text>
          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>{i18n.t("chooseQuiz")}</Text>
        </View>

        <View style={styles.quizSection}>
          <Card style={styles.quizCard} onPress={handleGoToFlagQuiz}>
            <View style={styles.quizCardContent}>
              <View style={[styles.quizIconContainer, { backgroundColor: colors.primary }]}>
                <Ionicons name="flag" size={32} color={COLORS.white} />
              </View>
              <View style={styles.quizCardTextContainer}>
                <Text style={[styles.quizTitle, { color: colors.text }]}>{i18n.t("flagQuiz")}</Text>
                <Text style={[styles.quizDescription, { color: colors.textSecondary }]}>{i18n.t("flagQuizDesc")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </View>
          </Card>

          {/* 수도 퀴즈 카드 추가 */}
          <Card style={styles.quizCard} onPress={handleGoToCapitalQuiz}>
            <View style={styles.quizCardContent}>
              <View style={[styles.quizIconContainer, { backgroundColor: COLORS.accent }]}>
                <Ionicons name="location" size={32} color={COLORS.white} />
              </View>
              <View style={styles.quizCardTextContainer}>
                <Text style={[styles.quizTitle, { color: colors.text }]}>{i18n.t("capitalQuiz")}</Text>
                <Text style={[styles.quizDescription, { color: colors.textSecondary }]}>
                  {i18n.t("capitalQuizDesc")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </View>
          </Card>

          {/* 명소 퀴즈 카드 추가 */}
          <Card style={styles.quizCard} onPress={handleGoToLandmarkQuiz}>
            <View style={styles.quizCardContent}>
              <View style={[styles.quizIconContainer, { backgroundColor: COLORS.secondary }]}>
                <FontAwesome5 name="landmark" size={28} color={COLORS.white} />
              </View>
              <View style={styles.quizCardTextContainer}>
                <Text style={[styles.quizTitle, { color: colors.text }]}>{i18n.t("landmarkQuiz")}</Text>
                <Text style={[styles.quizDescription, { color: colors.textSecondary }]}>
                  {i18n.t("landmarkQuizDesc")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: SIZES.header,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.medium,
  },
  welcomeSection: {
    marginVertical: SIZES.large,
  },
  welcomeText: {
    fontSize: SIZES.subheader,
    fontWeight: "bold",
    marginBottom: SIZES.small,
  },
  subtitleText: {
    fontSize: SIZES.body,
  },
  quizSection: {
    marginTop: SIZES.medium,
  },
  quizCard: {
    marginBottom: SIZES.medium,
  },
  quizCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  quizIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.medium,
  },
  quizCardTextContainer: {
    flex: 1,
  },
  quizTitle: {
    fontSize: SIZES.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: SIZES.bodySmall,
  },
});

export default HomeScreen;
