import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import * as Constants from '../constants/index.js';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const TimerPreset = ({timer, onPress}) =>{
    const titleStrings = timer.titleStrings()
    
    if (titleStrings.length > 2) {
        console.warn("Timer title has more than 2 parts, only the first 2 will be shown");
    }

    if (titleStrings.length == 2) { // if timer title has '|', presentation will be different to better transmit the idea of the timer values
        return (
            <TouchableOpacity style={[styles(timer).container, Constants.SHADOWS.timer]} onPress={onPress}>
                <Text style={styles(timer).numericText}>{titleStrings[0]}</Text>
                <View style={styles(timer).rectangle}/>
                <Text style={styles(timer).numericText}>{titleStrings[1]}</Text>
            </TouchableOpacity>
        );
    }
    else {
        return (
            <TouchableOpacity style={[styles(timer).container, Constants.SHADOWS.timer]} onPress={onPress}>
                <Text style={styles(timer).wordText}>{titleStrings[0]}</Text>
            </TouchableOpacity>
        );
    }
}

const styles = (timer) => StyleSheet.create({ 
    container: {
        minWidth: 70,
        minHeight: 70,
        borderRadius: 5,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: timer.backColor,
        gap: 2,
    },
    numericText: {
        color: timer.textColor,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.bold,
        justifyContent: 'center',
        alignItems: 'center'
    },
    wordText: {
        color: timer.textColor,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.mSmall,
        fontWeight: Constants.FONTS.bold,
        textAlign: 'center'
    },
    rectangle: {
        width: 35,
        height: 2,
        backgroundColor: timer.textColor
    }
});

export default TimerPreset;