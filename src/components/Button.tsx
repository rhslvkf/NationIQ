import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from "react-native";
import { COLORS, SIZES } from "../constants/theme";
import { useAppTheme } from "../hooks/useAppTheme";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  ...rest
}) => {
  const { colors } = useAppTheme();

  // 버튼 스타일 결정
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      opacity: disabled ? 0.5 : 1,
    };

    // 크기에 따른 스타일
    switch (size) {
      case "small":
        baseStyle.paddingVertical = SIZES.small;
        baseStyle.paddingHorizontal = SIZES.medium;
        break;
      case "large":
        baseStyle.paddingVertical = SIZES.medium;
        baseStyle.paddingHorizontal = SIZES.xlarge;
        break;
      default:
        baseStyle.paddingVertical = SIZES.base;
        baseStyle.paddingHorizontal = SIZES.large;
    }

    // 변형에 따른 스타일
    switch (variant) {
      case "secondary":
        baseStyle.backgroundColor = COLORS.secondary;
        break;
      case "outline":
        baseStyle.backgroundColor = "transparent";
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.primary;
        break;
      default:
        baseStyle.backgroundColor = colors.primary;
    }

    return baseStyle;
  };

  // 텍스트 스타일 결정
  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      ...styles.text,
    };

    // 크기에 따른 텍스트 스타일
    switch (size) {
      case "small":
        baseStyle.fontSize = SIZES.bodySmall;
        break;
      case "large":
        baseStyle.fontSize = SIZES.subheader;
        break;
      default:
        baseStyle.fontSize = SIZES.body;
    }

    // 변형에 따른 텍스트 스타일
    if (variant === "outline") {
      baseStyle.color = colors.primary;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "outline" ? colors.primary : COLORS.white} size="small" />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.buttonRadius,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: SIZES.body,
  },
});

export default Button;
