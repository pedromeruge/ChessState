import { Stack } from 'expo-router';
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding // ????
const Layout = () => {

  // Load fonts using useFonts hook
  const [fontsLoaded] = useFonts({
    Inter: require('../assets/fonts/Inter-Variable_opsz,wght.ttf'),
  });

  // Hide the splash screen when the fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // If the fonts haven't loaded yet, return null so the splash screen remains visible
    return null;
  }

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    )
}

export default Layout;