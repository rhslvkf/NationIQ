import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";
import { useAppTheme } from "../hooks/useAppTheme";

interface CardProps extends TouchableOpacityProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  shadow?: "none" | "small" | "medium" | "large";
}

const Card: React.FC<CardProps> = ({ children, style, onPress, disabled = false, shadow = "medium", ...rest }) => {
  const { colors, isDarkMode } = useAppTheme();

  // 그림자 스타일 가져오기
  const getShadowStyle = () => {
    // 다크모드에서는 그림자 효과 줄이기
    if (isDarkMode && shadow !== "none") {
      return {
        shadowOpacity: 0.1,
        elevation: 1,
      };
    }

    switch (shadow) {
      case "small":
        return SHADOWS.small;
      case "large":
        return SHADOWS.large;
      case "none":
        return {};
      default:
        return SHADOWS.medium;
    }
  };

  // 기본 스타일
  const cardStyle = {
    ...styles.container,
    backgroundColor: colors.card,
  };

  // 터치 가능한 카드
  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, getShadowStyle(), style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.9}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // 일반 카드
  return <View style={[cardStyle, getShadowStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.cardRadius,
    padding: SIZES.medium,
    marginVertical: SIZES.base,
  },
});

export default Card;
