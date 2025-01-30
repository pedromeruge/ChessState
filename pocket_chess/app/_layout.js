import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

// focuses on app-wide configurations

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding // ????
const Layout = () => {

  return (
    <View style={{ flex: 1}}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  )
}

export default Layout;