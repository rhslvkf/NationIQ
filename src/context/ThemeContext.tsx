import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 테마 타입 정의
type ThemeType = "light" | "dark";

// 테마 컨텍스트 타입 정의
interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeDirectly: (theme: ThemeType) => void;
}

// 기본값으로 테마 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  isDarkMode: false,
  toggleTheme: () => {},
  setThemeDirectly: () => {},
});

// AsyncStorage에 저장할 키
const THEME_STORAGE_KEY = "NATIONIQ_THEME_SETTING";

// 테마 프로바이더 컴포넌트
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 시스템 설정 테마 가져오기
  const systemColorScheme = useColorScheme();

  // 현재 테마 상태
  const [theme, setTheme] = useState<ThemeType>("light");

  // 앱 시작시 저장된 테마 설정 불러오기
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setTheme(savedTheme as ThemeType);
        } else if (systemColorScheme) {
          // 저장된 설정이 없으면 시스템 설정을 따름
          setTheme(systemColorScheme);
        }
      } catch (error) {
        console.error("테마 설정을 불러오는 중 오류 발생:", error);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  // 테마 토글 함수
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("테마 설정을 저장하는 중 오류 발생:", error);
    }
  };

  // 직접 테마 설정 함수
  const setThemeDirectly = async (newTheme: ThemeType) => {
    setTheme(newTheme);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("테마 설정을 저장하는 중 오류 발생:", error);
    }
  };

  // 컨텍스트 값
  const contextValue: ThemeContextType = {
    theme,
    isDarkMode: theme === "dark",
    toggleTheme,
    setThemeDirectly,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

// 테마 사용을 위한 커스텀 훅
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
