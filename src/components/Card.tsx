import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../constants/theme";

interface CardProps extends TouchableOpacityProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  shadow?: "none" | "small" | "medium" | "large";
}

const Card: React.FC<CardProps> = ({ children, style, onPress, disabled = false, shadow = "medium", ...rest }) => {
  // 그림자 스타일 가져오기
  const getShadowStyle = () => {
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

  // 터치 가능한 카드
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, getShadowStyle(), style]}
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
  return <View style={[styles.container, getShadowStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.cardRadius,
    padding: SIZES.medium,
    marginVertical: SIZES.base,
  },
});

export default Card;
