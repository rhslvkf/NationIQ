import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { COLORS, FONTS, SIZES } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, rightComponent, style, onBackPress }) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={SIZES.iconMedium} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightContainer}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  leftContainer: {
    width: 40,
    alignItems: "flex-start",
  },
  rightContainer: {
    width: 40,
    alignItems: "flex-end",
  },
  backButton: {
    padding: SIZES.small,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: SIZES.subheader,
    fontWeight: "600",
    color: COLORS.black,
  },
});

export default Header;
