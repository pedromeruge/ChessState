import * as Constants from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import { StyleSheet, View, Text } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, NavigationIndependentTree} from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const TabNavigator = ({tabs, icons, swipeEnabled=true}) => {
    const Tab = createMaterialTopTabNavigator();

    function MyTabs() {
        return (
            <NavigationIndependentTree>
                <NavigationContainer>
                <Tab.Navigator
                    screenOptions={{
                        swipeEnabled: swipeEnabled,
                        tabBarStyle: styles.tabBarStyle,
                        tabBarItemStyle: styles.tabBarItem,
                        tabBarIndicatorStyle: styles.tabBarIndicatorStyle,
                        tabBarActiveTintColor: Constants.COLORS.contrast_red_light,
                        tabBarInactiveTintColor: Constants.COLORS.text_grey,
                        tabBarPressColor: Constants.COLORS.transparent,
                        lazy: true,
                        
                    }}
                    
                >
                    {Object.entries(tabs).map(([tabName,tabComponent], index) => {
                        return (
                            <Tab.Screen 
                            key={index} 
                            name={tabName} 
                            component={tabComponent} 
                            options={{
                                tabBarLabel: ({ focused }) => (
                                  <CustomTabLabel
                                    focused={focused}
                                    label={tabName}
                                    icon={icons[tabName]}
                                  />
                                ),
                            }}
                        />)
                    })}
                    </Tab.Navigator>
                </NavigationContainer>
            </NavigationIndependentTree>
        )
    }

    return (
        <MyTabs />
    )
};

const CustomTabLabel = ({ focused, label, icon }) => {
    return (
      <View style={styles.labelContainer}>
        <IconComponent
          source={icon}
          width={15} // {focused ? 15 : 14}
          tintColor={focused ? Constants.COLORS.contrast_red_light : Constants.COLORS.text_grey}
        />
        <Text
          style={[styles.labelText,
            { fontWeight: focused ? Constants.FONTS.semi_bold : Constants.FONTS.regular,
              color: focused ? Constants.COLORS.contrast_red_light : Constants.COLORS.text_grey, // Change label color based on focus state
            },
          ]}
        >
        {label}
        </Text>
      </View>
    );
};

const styles = StyleSheet.create({
    tabBarStyle: {
        backgroundColor: Constants.COLORS.white,
        elevation: 0,  // Remove shadow on android
        shadowOpacity: 0,  // Remove shadow on ios
        borderBottomWidth: 1,
        borderBottomColor: Constants.COLORS.line_light_grey,
    },

    tabBarItem: {
        alignItems: 'center',
    },

    tabBarIndicatorStyle: {
        height: 4,
        backgroundColor: Constants.COLORS.contrast_red_light,
    },

    labelContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    labelIcon: {
    },

    labelText: {
        marginLeft: 5,
        fontSize: Constants.SIZES.medium,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
    }
});

export default TabNavigator;