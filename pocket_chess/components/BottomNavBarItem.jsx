import { Text, StyleSheet } from 'react-native';
import * as Constants from '../constants/index.js';
import { PlatformPressable } from '@react-navigation/elements';
import { useSharedValue, withSpring } from "react-native-reanimated"; // for animations
import { useEffect } from 'react';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

export function BottomNavBarItem({onPress, onLongPress, isFocused, itemIcon, color, label}) {
    
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(isFocused ? 1 : 0, {duration: 350})
    }, [scale, isFocused]

    )

    return (
        <PlatformPressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItem}
            android_ripple={null}  // disable ripple effect on Android
            pressOpacity={1}       // disable opacity change on iOS
            pressColor="transparent"  // backup if previous 2 fail
        >
            {itemIcon && itemIcon ({
                tintColor: color
            })}
            <Text style={[styles.tabBarItemText, { color: color}]}>{label}</Text>
        </PlatformPressable>
    )
}

const styles = StyleSheet.create({ 
    tabBarItem: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 1
    },

    tabBarItemText: {
        fontSize: Constants.SIZES.xSmall,
        fontWeight: Constants.FONTS.medium,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
    },

    tabBarIndicatorStyle: {
        position: 'absolute',
        bottom: 0,
        height: 4,
        width: '100%',
        backgroundColor: Constants.COLORS.contrast_red_light,
        zIndex: 10
      },
});
