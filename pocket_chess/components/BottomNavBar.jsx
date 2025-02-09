import { useEffect, useState } from 'react';
import { StyleSheet,View, } from 'react-native';

import * as Constants from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import { BottomNavBarItem } from './BottomNavBarItem.jsx';
import Animated, { useAnimatedStyle, withSpring, withDecay, withTiming, useSharedValue } from 'react-native-reanimated';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

function BottomNavBar({ state, descriptors, navigation }) {

    const [dimensions, setDimensions] = useState({width: 0}) // filler init values
    const buttonWidth = dimensions.width / state.routes.length;

    const tabPositionX = useSharedValue(0)

    const onTabbarLayout = (e) => {
        setDimensions({
            width: e.nativeEvent.layout.width // screen width
        })
        // Update position when dimensions are set
        tabPositionX.value = buttonWidth * state.index
    }

    const selectionTabSize = 70

    // handle initial position of selection rectangle
    useEffect(() => {
        if (dimensions.width > 0) {  // only update when we have valid dimensions
            tabPositionX.value = (dimensions.width / state.routes.length) * state.index
        }
    }, [dimensions.width])
    
    // handle normal button presses
    useEffect(() => {
        tabPositionX.value = withTiming(buttonWidth * state.index, { duration: 200 });
    }, [state.index]);

    const animatedStyle = useAnimatedStyle(() => {
        const leftOffset = tabPositionX.value + buttonWidth / 2 - selectionTabSize / 2;
        return {
            width: selectionTabSize,
            transform: [{ translateX: leftOffset }],
        };
        console.log("Current state index5", state.index)
    });

    const navBarIcons = {
        play: (props) => (<IconComponent source={Constants.icons.play} width={22} {...props} />),
        index: (props) => (<IconComponent source={Constants.icons.scan} width={24} {...props} />),
        storage: (props) => (<IconComponent source={Constants.icons.storage} width={24} {...props} />)
    }

    return (
        <View onLayout ={onTabbarLayout} style={[styles.tabBar, Constants.SHADOWS.navbar]}>
            <Animated.View style ={[animatedStyle, styles.indicator]}/>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                    ? options.title
                    : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    tabPositionX.value = withTiming(buttonWidth * index, { duration: 200 })
                    
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                <BottomNavBarItem
                    key={route.name}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    isFocused={isFocused}
                    itemIcon={navBarIcons[route.name]}
                    color={isFocused ? Constants.COLORS.contrast_red_light : Constants.COLORS.text_grey}
                    label= {label}
                />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({ 
    tabBar: {
        display: 'flex',
        flexDirection: 'row',
        height: 55,
        borderRadius: 0,
        backgroundColor: Constants.COLORS.white,
        alignItems: "center",
        justifyContent: "space-evenly",
        zIndex: 10
    },

    indicator: {
        position: 'absolute',
        bottom: 0,
        height: 3,
        backgroundColor: Constants.COLORS.contrast_red_light,
      },
});

export default BottomNavBar;