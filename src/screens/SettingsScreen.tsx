import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants/theme";
import Header from "../components/Header";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../i18n";
import { useTheme } from "../context/ThemeContext";
import { useAppTheme } from "../hooks/useAppTheme";

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { toggleTheme, isDarkMode } = useTheme();
  const { colors } = useAppTheme();

  // 언어 설정 상태
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.locale);

  // 다크 모드 토글 핸들러
  const handleDarkModeToggle = () => {
    toggleTheme();
  };

  // 언어 변경 핸들러
  const handleLanguageChange = () => {
    const newLanguage = currentLanguage === "en" ? "ko" : "en";
    setCurrentLanguage(newLanguage);
    i18n.locale = newLanguage;
    // 이 부분에서 언어 설정을 영구적으로 저장할 수 있음
  };

  // 앱 정보 표시
  const showAppInfo = () => {
    Alert.alert("NationIQ", "버전: 1.0.0\n© 2023 NationIQ", [{ text: "확인", style: "cancel" }]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={i18n.t("settings")} showBackButton style={styles.header} />

      <View style={styles.settingsContainer}>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="language-outline" size={24} color={colors.primary} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>{i18n.t("language")}</Text>
          </View>

          <TouchableOpacity style={styles.languageSelector} onPress={handleLanguageChange}>
            <Text style={[styles.languageText, { color: colors.textSecondary }]}>
              {currentLanguage === "en" ? "English" : "한국어"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name={isDarkMode ? "moon" : "moon-outline"} size={24} color={colors.primary} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>{i18n.t("darkMode")}</Text>
          </View>

          <Switch
            trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
            thumbColor={isDarkMode ? COLORS.white : COLORS.white}
            ios_backgroundColor={COLORS.gray300}
            onValueChange={handleDarkModeToggle}
            value={isDarkMode}
          />
        </View>

        <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={showAppInfo}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>{i18n.t("about")}</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
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
  settingsContainer: {
    padding: SIZES.medium,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.medium,
    borderBottomWidth: 1,
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: SIZES.body,
    marginLeft: SIZES.medium,
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageText: {
    fontSize: SIZES.body,
    marginRight: SIZES.small,
  },
});

export default SettingsScreen;
