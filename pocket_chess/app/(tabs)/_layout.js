import { Tabs, router} from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation for navigation control

import BottomNavBar from '../../components/common/navbar/BottomNavBar';

// handles the tab navigation layout
const TabsLayout = () => {
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
            animation: 'shift',
            swipeEnabled: false, // disable horizontal swipe between tabs
            gestureEnabled: false,
            gestureResponseDistance: { horizontal: 0 }, // (iOS) also kill edge gesture width so accidental edge pans do nothing
          }}
        >
          <Tabs.Screen name="play" options={{
            title: 'Play',
            swipeEnabled: false,
          }} />
          <Tabs.Screen name="index" options={{
            title: 'Scan',
            swipeEnabled: false,
          }}/>
          <Tabs.Screen name="storage" options={{
            title: 'Storage',
            swipeEnabled: false,
          }}/>
      </Tabs>
    );
}

export default TabsLayout;