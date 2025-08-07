import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Screen, Image, Pressable, TextInput, Keyboard } from 'react-native'
import * as Constants from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import TimerPickerRoulette from './TimerPickerRoulette.jsx';
import Header from './Header.jsx';

const NewTimerScreenPicker = forwardRef(({width=null, height=null, hideHours=false, onConfirm, onBack, time, setTime}, ref) => { // expose the ref to the parent component
    
    const showScreen = () => {
    }

    const hideScreen = () => {
    }
    
    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        showScreen,
        hideScreen,
    }));

    return (
        <SafeAreaView style={[styles.container, Constants.SHADOWS.medium, width && height ? {width: width, height: height} : null]}>
            <Header leftIcon={Constants.icons.clock_lines} leftIconSize={16} text={'New preset'} rightIcon={Constants.icons.arrow_left} rightIconSize={18} onPressRightIcon={onBack} lowBorder={true} curvyTop={true}/>
            <View style={styles.body}>
                <View style={styles.roulette}>
                    <TimerPickerRoulette time={time} setTime={setTime} hideHours={hideHours}/>
                </View>
                <TouchableOpacity style={[styles.confirm, Constants.SHADOWS.preset]} onPressOut={onConfirm}>
                    <IconComponent source={Constants.icons.check} width={25} tintColor={Constants.COLORS.white}/>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
});

const styles = StyleSheet.create({

    container: {
        backgroundColor: Constants.COLORS.white,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'column',
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
        color: Constants.COLORS.text_dark,
        marginLeft: 8
    },     

    body: {
        flexDirection: 'column',
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
        backgroundColor: Constants.COLORS.contrast_blue_light,
    }
});

export default NewTimerScreenPicker;