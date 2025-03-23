import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Difficulty } from "../types";
import Card from "../components/Card";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../i18n";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
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

  const handleGoToSettings = () => {
    navigation.navigate("Settings");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t("appName")}</Text>
        <TouchableOpacity onPress={handleGoToSettings}>
          <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{i18n.t("welcome")}</Text>
          <Text style={styles.subtitleText}>{i18n.t("chooseQuiz")}</Text>
        </View>

        <View style={styles.quizSection}>
          <Card style={styles.quizCard} onPress={handleGoToFlagQuiz}>
            <View style={styles.quizCardContent}>
              <View style={styles.quizIconContainer}>
                <Ionicons name="flag" size={32} color={COLORS.white} />
              </View>
              <View style={styles.quizCardTextContainer}>
                <Text style={styles.quizTitle}>{i18n.t("flagQuiz")}</Text>
                <Text style={styles.quizDescription}>{i18n.t("flagQuizDesc")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.gray600} />
            </View>
          </Card>

          {/* 여기에 추가 퀴즈 종류를 추가할 수 있음 */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  title: {
    fontSize: SIZES.header,
    fontWeight: "bold",
    color: COLORS.primary,
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
    color: COLORS.black,
    marginBottom: SIZES.small,
  },
  subtitleText: {
    fontSize: SIZES.body,
    color: COLORS.gray600,
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
    backgroundColor: COLORS.primary,
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
    color: COLORS.gray600,
  },
});

export default HomeScreen;
