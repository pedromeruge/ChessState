import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Screen, Image, Pressable, TextInput, Keyboard } from 'react-native'
import * as Constants from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import ActionButton from './common/ActionButton.jsx';
import TimerPickerRoulette from './TimerPickerRoulette.jsx';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const NewTimerScreenPicker = forwardRef(({width, height, onConfirm, onBack}, ref) => { // expose the ref to the parent component

    const [titleText, setTitleText] = useState('');
    
    const showScreen = () => {
    }

    const hideScreen = () => {
    }
    
    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        showScreen,
        hideScreen
    }));

    
    return (
        <SafeAreaView style={[styles(width, height).container, Constants.SHADOWS.medium]}>
            <View style={styles.containerHeader}>
                <View style={styles.containerHeaderLeft}>
                    <IconComponent source={Constants.icons.clock_lines} width={20} tintColor={Constants.COLORS.black}/>
                    <Text style={styles.containerHeaderText}>New timer</Text>
                </View>
                <TouchableOpacity style={styles.containerHeaderRight} onPress={onBack}>
                    <IconComponent source={Constants.icons.arrow_left} width={14} tintColor={Constants.COLORS.black}/>
                </TouchableOpacity>
            </View>
            <View>

            </View>
        </SafeAreaView>
    )
});

const styles = (width,height) => StyleSheet.create({

    container: {
        backgroundColor: Constants.COLORS.white,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: width,
        height: height

    },

    containerHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        minHeight: 40,
    },
    containerHeaderLeft: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    containerHeaderText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.bold,
        fontColor: Constants.COLORS.text_dark,
        marginLeft: 8
    },     
    containerHeaderRight: {
    },

    counter: {
        flexDirection: 'column',
        paddingHorizontal: 25,
        paddingVertical: 20,
        alignItems: 'center',
        width: '100%'
    },

    numberInputs: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        columnGap: '10%'
    },

    time: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderWidth: 1,
        borderColor: Constants.COLORS.line_light_grey,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingTop: 5,
        paddingBottom: 10,
        rowGap: 7
    },

    timeTitle: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    timeTitleText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        fontColor: Constants.COLORS.text_grey,
        marginLeft: 7,
        borderColor: Constants.COLORS.line_light_grey,
    },

    timeInput: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        fontColor: Constants.COLORS.text_grey,
        borderBottomWidth: 1,
        paddingBottom: 0,
        borderColor: Constants.COLORS.line_light_grey,
    },
    startButton: {
        marginTop: 30
    }
});

export default NewTimerScreenPicker;