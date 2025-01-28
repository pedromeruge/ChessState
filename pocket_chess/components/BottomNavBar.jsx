import { Tabs } from 'expo-router';
import { COLORS, FONTS, SIZES, icons } from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import styles from '../styles/BottomNavBar.styles.js';

const BottomNavBar = () => {
  return (
      <Tabs
          screenOptions={{
            tabBarActiveTintColor: COLORS.contrast_red_light,
            tabBarStyle: styles.tabBarStyle,
            tabBarLabelStyle: styles.tabBarLabelStyle,
          }}
      >
          <Tabs.Screen 
              name="play"
              options={{
                  title: "Play",
                  tabBarIcon: ({ focused }) => (
                      <IconComponent
                        source={icons.play}
                        width={15}
                        height={24}
                        tintColor={focused ? COLORS.contrast_red_light : COLORS.text_grey}
                      />
                  ),
              }}
          />
          <Tabs.Screen 
              name="index"
              options={{
                  title: "Scan",
                  tabBarIcon: ({ focused }) => (
                      <IconComponent
                        source={icons.scan}
                        width={24}
                        height={24}
                        tintColor={focused ? COLORS.contrast_red_light : COLORS.text_grey}
                      />
                  ),
              }}
          />
          <Tabs.Screen 
              name="storage"
              options={{
                  title: "Storage",
                  tabBarIcon: ({ focused }) => (
                      <IconComponent
                        source={icons.storage}
                        width={24}
                        height={24}
                        tintColor={focused ? COLORS.contrast_red_light : COLORS.text_grey}
                      />
                  )
              }}
          />
      </Tabs>
  );
}

export default BottomNavBar;