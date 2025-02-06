

import React, { useState, forwardRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TimerPicker } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient"; // or `import LinearGradient from "react-native-linear-gradient"`
import { Audio } from "expo-av"; // for audio feedback (click sound as you scroll)
import * as Haptics from "expo-haptics"; // for haptic feedback

import * as Constants from '../constants/index.js';
import { transform } from 'typescript';
import { hide } from 'expo-router/build/utils/splash.js';

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

//based on https://www.npmjs.com/package/react-native-timer-picker
const TimerPickerRoulette = forwardRef(({hideHours=false}, ref) => {
    const [alarmString, setAlarmString] = useState(null);

    const formatTime = ({
        hours,
        minutes,
        seconds,
    }) => {
        const timeParts = [];
    
        if (hours !== undefined) {
            timeParts.push(hours.toString().padStart(2, "0"));
        }
        if (minutes !== undefined) {
            timeParts.push(minutes.toString().padStart(2, "0"));
        }
        if (seconds !== undefined) {
            timeParts.push(seconds.toString().padStart(2, "0"));
        }
    
        return timeParts.join(":");
    };

    return (
        <View style={styles.container}>
            <TimerPicker
                padWithNItems={2}
                hideHours={hideHours}
                hourLabel="h"
                minuteLabel="m"
                secondLabel="s"
                Audio={Audio}
                LinearGradient={LinearGradient}
                Haptics={Haptics}
                aggressivelyGetLatestDuration={true}
                allowFontScaling
                padHoursWithZero
                styles={styles.roulette}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Constants.COLORS.white,
        position: 'relative'
    },

    roulette: {
        theme: "light",
        backgroundColor: Constants.COLORS.white,
        pickerItem: {
            fontSize: Constants.SIZES.xxxLarge,
            color: Constants.COLORS.text_dark_2,
            fontFamily: Constants.FONTS.BASE_FONT_NAME,
            fontWeight: Constants.FONTS.regular,
            borderColor: Constants.COLORS.line_light_grey,
        },
        pickerLabel: {
            fontSize: Constants.SIZES.large,
            color: Constants.COLORS.text_dark_2,
            fontFamily: Constants.FONTS.BASE_FONT_NAME,
            fontWeight: Constants.FONTS.extra_light,
            right: 15,
        },
        pickerContainer: {
            marginRight: 6,
        },
        pickerItemContainer: {
            width: 100,
        },
        pickerLabelContainer: {
            right: -20,
            top: 0,
            bottom: 6,
            width: 40,
            alignItems: "center",
        },
    }
})

export default TimerPickerRoulette;