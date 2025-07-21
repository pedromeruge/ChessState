import {useState, useEffect, forwardRef, useImperativeHandle, useRef} from 'react';
import { tabStylesheet, View, Text } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, NavigationIndependentTree} from '@react-navigation/native';

import * as Constants from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import {tabStyles} from './common/styles.jsx';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const TabNavigator = forwardRef(({tabs, icons, swipeEnabled=true, callbacks=[]}, ref) => {
    const Tab = createMaterialTopTabNavigator();

    function MyTabs() {
        return (
            <NavigationIndependentTree>
                <NavigationContainer>
                <Tab.Navigator
                    screenOptions={{
                        swipeEnabled: swipeEnabled,
                        tabBarStyle: tabStyles.tabBarStyle,
                        tabBarItemStyle: tabStyles.tabBarItem,
                        tabBarIndicatorStyle: tabStyles.tabBarIndicatorStyle,
                        tabBarActiveTintColor: Constants.COLORS.contrast_red_light,
                        tabBarInactiveTintColor: Constants.COLORS.text_grey,
                        tabBarPressColor: Constants.COLORS.transparent,
                        lazy: true,
                    }}
                    
                >
                    {Object.entries(tabs).map(([tabName,TabComponent], index) => {
                        return (
                            <Tab.Screen 
                                key={index} 
                                name={tabName} 
                                options={{
                                    tabBarLabel: ({ focused }) => (
                                    <CustomTabLabel
                                        focused={focused}
                                        label={tabName}
                                        icon={icons[tabName]}
                                    />
                                    ),
                                }}
                            >
                            {() => { // this needs to be a function or the component wont render right
                                    return <TabComponent/>
                                }
                            }
                            </Tab.Screen>
                        )
                    })}
                    </Tab.Navigator>
                </NavigationContainer>
            </NavigationIndependentTree>
        )
    }

    return (
        <MyTabs />
    )
});

const CustomTabLabel = ({ focused, label, icon }) => {
    return (
      <View style={tabStyles.labelContainer}>
        <IconComponent
          source={icon}
          width={15} // {focused ? 15 : 14}
          tintColor={focused ? Constants.COLORS.contrast_red_light : Constants.COLORS.text_grey}
        />
        <Text
          style={[tabStyles.labelText,
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

export default TabNavigator;