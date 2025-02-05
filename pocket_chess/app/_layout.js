import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator, StyleSheet} from 'react-native';
import { useEffect, useState} from 'react';

// focuses on app-wide configurations

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding // ????

const Layout = () => {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        //data fetching, asset loading, ....
      } catch (error) {
        console.warn(error);
      } finally {
        setIsAppReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepareApp();
  }, []);

  if (!isAppReady) {
    // Show a loading indicator if the app isn't ready
    return (
      <View style={styles.appNotReady}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
};

const styles = StyleSheet.create({
  appNotReady: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  }
})

export default Layout;