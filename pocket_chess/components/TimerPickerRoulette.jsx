

import React, { useState, forwardRef, useRef, useImperativeHandle, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TimerPicker } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient"; // or `import LinearGradient from "react-native-linear-gradient"`
import { Audio } from "expo-av"; // for audio feedback (click sound as you scroll)
import * as Haptics from "expo-haptics"; // for haptic feedback

import * as Constants from '../constants/index.js';

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

//based on https://www.npmjs.com/package/react-native-timer-picker
const TimerPickerRoulette = forwardRef(({}, ref) => {
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
            hourLabel=""
            minuteLabel=""
            secondLabel=""
            Audio={Audio}
            LinearGradient={LinearGradient}
            Haptics={Haptics}
            styles={{
                theme: "light",
                backgroundColor: Constants.COLORS.white,
                pickerItem: {
                    fontSize: 34,
                },
                pickerLabel: {
                    fontSize: 32,
                    marginTop: 0,
                },
                pickerContainer: {
                    marginRight: 6,
                },
                pickerItemContainer: {
                    width: 100
                },
                pickerLabelContainer: {
                    right: -20,
                    top: 0,
                    bottom: 6,
                    width: 40,
                    alignItems: "center",
                },
            }}
        />
    </View>
    )
})

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Constants.COLORS.white,
    }
})

export default TimerPickerRoulette;