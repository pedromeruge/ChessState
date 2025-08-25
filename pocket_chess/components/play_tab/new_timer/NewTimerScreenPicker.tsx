import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, StyleSheet, TouchableOpacity} from 'react-native'
import * as Constants from '../../../constants/index';
import IconComponent from '../../common/IconComponent.jsx';
import TimerPickerRoulette from '../../common/TimerPickerRoulette.jsx';
import Header from '../../common/Header.jsx';
import { Time } from '../../../classes/timers_base/Preset';

interface NewTimerScreenPickerRef {
    showScreen: () => void;
    hideScreen: () => void;
}

interface NewTimerScreenPickerProps {
    width?: number | null;
    height?: number | null;
    hideHours?: boolean;
    onConfirm?: () => void;
    onBack?: () => void;
    time: Time;
    setTime: (time: Time) => void;
    fullScreen?: boolean;
    headerText?: string;
    headerLeftIcon?: any;
    headerRightIcon?: any;
}

const NewTimerScreenPicker = forwardRef<NewTimerScreenPickerRef, NewTimerScreenPickerProps>(
    ({width=null, height=null, hideHours=false, onConfirm, onBack, time, setTime, fullScreen=true, headerText="New preset", headerLeftIcon=Constants.icons.clock_lines, headerRightIcon=Constants.icons.arrow_left}, ref) => { // expose the ref to the parent component

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
            <Header leftIcon={headerLeftIcon} leftIconSize={18} text={headerText} rightIcon={headerRightIcon} rightIconSize={fullScreen ? 18 : 14} onPressRightIcon={onBack} lowBorder={true} curvyTop={true} fullWidth={fullScreen}/>
            <View style={[styles.body, fullScreen && styles.fullScreen]}>
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
        minWidth: '65%'
    },

    body: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        paddingHorizontal: 20,
        paddingVertical: 30,
    },

    fullScreen: {
        flex:1
    },

    roulette: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },

    confirm: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        width: 40,
        borderRadius: 20,
        marginTop: 40,
        backgroundColor: Constants.COLORS.contrast_blue_light,
    }
});

export default NewTimerScreenPicker;
export type { NewTimerScreenPickerRef };