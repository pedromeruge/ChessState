import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Screen, Image, Pressable, TextInput, Keyboard } from 'react-native'
import * as Constants from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import TimerPickerRoulette from './TimerPickerRoulette.jsx';
import Header from './Header.jsx';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const NewTimerScreenPicker = forwardRef(({width, height, hideHours=false, onConfirm, onBack, timer, setTimer}, ref) => { // expose the ref to the parent component

    const [titleText, setTitleText] = useState('');
    
    const showScreen = () => {
    }

    const hideScreen = () => {
    }
    
    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        showScreen,
        hideScreen,
    }));

    return (
        <SafeAreaView style={[styles(width, height).container, Constants.SHADOWS.medium]}>
            <Header leftIcon={Constants.icons.clock_lines} leftIconSize={16} text={'New timer'} rightIcon={Constants.icons.arrow_left} rightIconSize={18} onPressRightIcon={onBack}/>
            <View style={styles(width, height).body}>
                <View style={styles(width, height).roulette}>
                    <TimerPickerRoulette timer={timer} setTimer={setTimer} hideHours={hideHours}/>
                </View>
                <TouchableOpacity style={styles(width,height).confirm} onPressOut={onConfirm}>
                    <IconComponent source={Constants.icons.check} width={30} tintColor={Constants.COLORS.text_dark_2}/>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
});

const styles = (width,height) => StyleSheet.create({

    container: {
        backgroundColor: Constants.COLORS.white,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'column',
        width: width,
        height: height,
    },

    containerHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        minHeight: 40,
        borderBottomWidth: 1,
        borderColor: Constants.COLORS.line_light_grey,
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

    body: {
        flexDirection: 'column',
        borderColor: Constants.COLORS.line_light_grey,
        borderWidth: 1,
        flex: 1,
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
        paddingHorizontal: 20,
        paddingVertical: 30,
    },

    roulette: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },

    confirm: {
        position: 'absolute',
        bottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        width: 40,
        borderRadius: 20,
        borderColor: Constants.COLORS.line_light_grey,
        borderWidth: 1,
    }
});

export default NewTimerScreenPicker;