import { Stack } from 'expo-router';
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding // ????
const Layout = () => {

  // Load fonts using useFonts hook
  const [fontsLoaded] = useFonts({
    Inter: require('../assets/fonts/Inter-Variable_opsz,wght.ttf'),
  });

  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;


  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  )
}

export default Layout;