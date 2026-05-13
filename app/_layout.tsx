import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from '@clerk/expo/token-cache';
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Slot } from "expo-router";
import { View } from "react-native";
import "../global.css";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined");
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider value={DefaultTheme}>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <Slot />
        </View>
      </ThemeProvider>
    </ClerkProvider>

  );
}
