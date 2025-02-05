import { Tabs, router} from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation for navigation control

import BottomNavBar from '../../components/BottomNavBar';

// handles the tab navigation layout
const TabLayout = () => {
    const navigation = useNavigation();

    useEffect(() => {
        //handle back button press from any tab, go to main screen
        const backAction = () => {
            router.replace('/');
            // BackHandler.exitApp();
            return true; // stop default back action
        }

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove(); // cleanup on unmount
    }, []);

    return (
        <Tabs 
          tabBar={props => <BottomNavBar {...props}/>}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Tabs.Screen name="play" options={{ title: "Play"}} />
          <Tabs.Screen name="index" options={{ title: "Scan"}} />
          <Tabs.Screen name="storage" options={{ title: "Storage"}}/>
      </Tabs>
    );
}

export default TabLayout;