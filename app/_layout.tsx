import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Slot } from "expo-router";
import { View } from "react-native";
import "../global.css";

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <Slot />
      </View>
    </ThemeProvider>

  );
}
