import { COLORS, SIZES, FONTS, SHADOWS } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

// 앱 테마 훅
export const useAppTheme = () => {
  const { isDarkMode } = useTheme();

  // 다크모드 여부에 따라 적절한 색상 반환
  const getColors = () => {
    if (isDarkMode) {
      return {
        ...COLORS,
        // 다크모드 배경 및 텍스트 색상 오버라이드
        background: COLORS.darkBackground,
        card: COLORS.darkComponent,
        text: COLORS.darkText,
        textSecondary: COLORS.darkTextSecondary,
        border: COLORS.darkComponent,
      };
    }

    return {
      ...COLORS,
      // 라이트모드 배경 및 텍스트 색상
      background: COLORS.white,
      card: COLORS.white,
      text: COLORS.black,
      textSecondary: COLORS.gray600,
      border: COLORS.gray200,
    };
  };

  // 현재 테마 기반 스타일 제공
  return {
    colors: getColors(),
    isDarkMode,
    sizes: SIZES,
    fonts: FONTS,
    shadows: SHADOWS,
  };
};

export default useAppTheme;
