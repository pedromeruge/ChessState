import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import * as Constants from '../constants/index.js';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const TimerPreset = ({preset, onPress}) =>{
    const titleStrings = preset.titleStrings()
    
    if (titleStrings.length > 2) {
        console.warn("Timer title has more than 2 parts, only the first 2 will be shown");
    }

    if (titleStrings.length == 2) { // if preset title has '|', presentation will be different to better transmit the idea of the preset values
        return (
            <TouchableOpacity style={[styles(preset).container, Constants.SHADOWS.preset]} onPress={onPress}>
                <Text style={styles(preset).numericText}>{titleStrings[0]}</Text>
                <View style={styles(preset).rectangle}/>
                <Text style={styles(preset).numericText}>{titleStrings[1]}</Text>
            </TouchableOpacity>
        );
    }
    else {
        return (
            <TouchableOpacity style={[styles(preset).container, Constants.SHADOWS.preset]} onPress={onPress}>
                <Text style={styles(preset).wordText}>{titleStrings[0]}</Text>
            </TouchableOpacity>
        );
    }
}

const styles = (preset) => StyleSheet.create({ 
    container: {
        minWidth: 60,
        minHeight: 60,
        maxWidth: 120,
        maxHeight: 120,
        flexBasis: '20%',
        aspectRatio: 1,
        borderRadius: 5,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: preset.backColor,
        gap: 2,
    },
    numericText: {
        color: preset.textColor,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.bold,
        justifyContent: 'center',
        alignItems: 'center'
    },
    wordText: {
        color: preset.textColor,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.mSmall,
        fontWeight: Constants.FONTS.bold,
        textAlign: 'center'
    },
    rectangle: {
        width: 35,
        height: 2,
        backgroundColor: preset.textColor
    }
});

export default TimerPreset;