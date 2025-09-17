import {useState, useEffect, forwardRef, useImperativeHandle, useRef, useMemo} from 'react';
import { View, Text, TextStyle, ViewStyle } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, NavigationIndependentTree} from '@react-navigation/native';

import * as Constants from '../../constants/index';
import IconComponent from './../common/IconComponent.jsx';
import {tabStyles} from './../common/styles.jsx';
import React from 'react';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const Tab = createMaterialTopTabNavigator();

interface TabNavigatorProps {
    tabs: Record<string, React.ComponentType<any>>;
    icons: Record<string, any>;
    swipeEnabled?: boolean;
    initialTabIndex?: number;
    containerStyle?: ViewStyle;
}

const TabNavigator = ({tabs, icons, swipeEnabled=true, initialTabIndex=0, containerStyle} : TabNavigatorProps) => {

    const routeNames = useMemo(() => Object.keys(tabs), [tabs]); // stable reference to route names, to prevent unnecessary re-renders on parent re-renders
    const initialRouteName = routeNames[initialTabIndex] || routeNames[0];
  
    console.log("initial tab Index:", initialTabIndex)
    return (
        <View style={[{ width: '100%', flex: 1 }, containerStyle]}>
            <NavigationIndependentTree>
                <NavigationContainer>
                <Tab.Navigator
                    initialRouteName={initialRouteName}
                    id={undefined}
                    screenOptions={{
                        swipeEnabled: swipeEnabled,
                        tabBarStyle: tabStyles.tabBarStyle,
                        tabBarItemStyle: tabStyles.tabBarItem,
                        tabBarIndicatorStyle: tabStyles.tabBarIndicatorStyle,
                        tabBarActiveTintColor: Constants.COLORS.contrast_red_light,
                        tabBarInactiveTintColor: Constants.COLORS.text_grey,
                        tabBarPressColor: Constants.COLORS.transparent,
                        lazy: true,
                        sceneStyle: { backgroundColor: 'transparent' }, // to prevent white flash when switching tabs
                    }}
                >
                    {routeNames.map((tabName, index) => {
                        const TabComponent = tabs[tabName];
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
                                {/* this needs to be a function or the component wont render right */}
                                {(props) => <TabComponent {...props}/>} 
                            </Tab.Screen>
                        )
                    })}
                    </Tab.Navigator>
                </NavigationContainer>
            </NavigationIndependentTree>
        </View>
    )
};

const CustomTabLabel = ({ focused, label, icon }) => {

    const textStyle: TextStyle = {
        fontWeight: focused ? 
            (Constants.FONTS.semi_bold as TextStyle['fontWeight']) : 
            (Constants.FONTS.regular as TextStyle['fontWeight']),
        color: focused ? 
            Constants.COLORS.contrast_red_light : 
            Constants.COLORS.text_grey, // Change label color based on focus state
    };

    return (
      <View style={tabStyles.labelContainer}>
        <IconComponent
          source={icon}
          width={15} // {focused ? 15 : 14}
          tintColor={focused ? Constants.COLORS.contrast_red_light : Constants.COLORS.text_grey}
        />
        <Text
          style={[tabStyles.labelText, textStyle]}
        >
        {label}
        </Text>
      </View>
    );
};

export default TabNavigator;