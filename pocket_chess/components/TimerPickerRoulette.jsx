

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TimerPicker } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient"; // or `import LinearGradient from "react-native-linear-gradient"`
import { Audio } from "expo-av"; // for audio feedback (click sound as you scroll)
import * as Haptics from "expo-haptics"; // for haptic feedback

import * as Constants from '../constants/index.js';
import { Time } from '../classes/timers_base/Preset.js';

//based on https://www.npmjs.com/package/react-native-time-picker
const TimerPickerRoulette = ({time, setTime, hideHours=false}) => {

    return (
        <View style={styles.container}>
            <TimerPicker
                padWithNItems={2}
                hideHours={hideHours}
                initialValue={{hours: time.hours, minutes: time.minutes, seconds: time.seconds}}
                hourLabel="h"
                minuteLabel="m"
                secondLabel="s"
                Audio={Audio}
                LinearGradient={LinearGradient}
                Haptics={Haptics}
                aggressivelyGetLatestDuration={true}
                allowFontScaling
                padHoursWithZero
                onDurationChange={({hours,minutes,seconds}) => {
                    try {
                        setTime(new Time(hours,minutes,seconds));
                    } catch (error) {
                        console.error("Error setting time: ", error);
                    }
                }}
                styles={styles.roulette}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Constants.COLORS.white,
        position: 'relative',
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