import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  // 주요 색상
  primary: "#2C6BED", // 메인 컬러 (밝은 파란색)
  secondary: "#34C759", // 보조 컬러 (녹색)
  accent: "#FF9500", // 액센트 컬러 (주황색)

  // 중립 색상
  white: "#FFFFFF",
  black: "#000000",
  gray100: "#F2F2F7",
  gray200: "#E5E5EA",
  gray300: "#D1D1D6",
  gray400: "#C7C7CC",
  gray500: "#AEAEB2",
  gray600: "#8E8E93",

  // 기능별 색상
  success: "#34C759", // 정답, 성공
  error: "#FF3B30", // 오답, 오류
  warning: "#FFCC00",
  info: "#5AC8FA",

  // 뱃지 등급
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",

  // 다크모드 색상
  darkBackground: "#1C1C1E",
  darkComponent: "#2C2C2E",
  darkText: "#FFFFFF",
  darkTextSecondary: "#EBEBF5",
};

export const SIZES = {
  // 글자 크기
  header: 24,
  subheader: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,

  // 여백 및 간격
  base: 8,
  small: 4,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,

  // 화면 크기
  width,
  height,

  // 버튼 크기
  buttonHeight: 48,
  buttonRadius: 8,

  // 아이콘 크기
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,

  // 카드 크기
  cardRadius: 16,
};

export const FONTS = {
  header: {
    fontSize: SIZES.header,
    fontWeight: "bold",
  },
  subheader: {
    fontSize: SIZES.subheader,
    fontWeight: "600",
  },
  body: {
    fontSize: SIZES.body,
    fontWeight: "normal",
  },
  bodySmall: {
    fontSize: SIZES.bodySmall,
    fontWeight: "normal",
  },
  caption: {
    fontSize: SIZES.caption,
    fontWeight: "normal",
  },
  button: {
    fontSize: SIZES.body,
    fontWeight: "600",
  },
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default { COLORS, SIZES, FONTS, SHADOWS };
