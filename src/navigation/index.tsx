import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { SafeAreaProvider } from "react-native-safe-area-context";

// 화면 가져오기 (아직 만들지 않음)
import HomeScreen from "../screens/HomeScreen";
import FlagQuizScreen from "../screens/FlagQuizScreen";
import CapitalQuizScreen from "../screens/CapitalQuizScreen";
import LandmarkQuizScreen from "../screens/LandmarkQuizScreen";
import AreaPopulationQuizScreen from "../screens/AreaPopulationQuizScreen";
import QuizResultScreen from "../screens/QuizResultScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigation: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: "white" },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="FlagQuiz" component={FlagQuizScreen} />
          <Stack.Screen name="CapitalQuiz" component={CapitalQuizScreen} />
          <Stack.Screen name="LandmarkQuiz" component={LandmarkQuizScreen} />
          <Stack.Screen name="AreaPopulationQuiz" component={AreaPopulationQuizScreen} />
          <Stack.Screen name="QuizResult" component={QuizResultScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigation;
