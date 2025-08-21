import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextStyle } from 'react-native'

import * as Constants from '../../../constants/index';
import * as Styles from '../../../styles/index.js';

import IconComponent from '../../common/IconComponent.jsx';
import { PresetTypes, PresetIdToTypes } from '../../../classes/PresetType';
import { ClockTypeIdToBuilderComponent } from '../../../classes/ComponentRegistry';
import { Timer } from '../../../classes/timers_base/Preset';
import { TimerBuilderRef } from '../../../classes/types/TimerBuilderTypes.js';

interface TimerSelectionRef{
    buildTimer: (playerName: string) => Timer;
}

interface TimerSelectionProps {
    onUpdateStages: (stages: any) => void;
    playerName: string;
    clockTypeId: number; // The clock type for this specific timer selection
    onSelectClockTypeId: (clockTypeId: number) => void; // Callback when user wants to change clock type
}

const TimerSelection = forwardRef<TimerSelectionRef, TimerSelectionProps>(
    ({onUpdateStages, playerName, clockTypeId, onSelectClockTypeId}, ref) => { // expose the ref to the parent component

    //functions for parent
    useImperativeHandle(ref, () => ({
        buildTimer
    }));

    //refs
    const timerBuilderRef = useRef<TimerBuilderRef>(null);

    const clockType = PresetIdToTypes[clockTypeId];

    console.log("Timer selection got clock type:", clockType.name);
    
    //other funcs
    const buildTimer = () => {
        return timerBuilderRef.current?.buildTimer(playerName);
    }

    const showClockTypeIdsScreen = () => {
        onSelectClockTypeId(clockTypeId);
    }

    const TimerBuilderComponent = useMemo(() => {
        return ClockTypeIdToBuilderComponent[clockTypeId];
    }, [clockTypeId]);

    // safety check before rendering
    if (!TimerBuilderComponent) {
        console.error(`No builder component found for clock type ID: ${clockTypeId}`);
        return (
            <View style={styles.container}>
                <Text>Builder component not available for {clockType.name}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* clock type selection */}
            <View style={[Styles.newPreset.sectionContainer, {paddingBottom: 0}]}>
                <TouchableOpacity style={[styles.clockTypeIdContainer]} onPress={showClockTypeIdsScreen}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <IconComponent source={Constants.icons.clock_type} width={15} tintColor={Constants.COLORS.white} />
                        <Text style={[Styles.newPreset.sectionTitleText, {color: Constants.COLORS.white, marginLeft: 7}]}>Clock type</Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.clockTypeIdText}>{clockType.name}</Text>
                        <IconComponent source={Constants.icons.arrow_right} width={15} tintColor={Constants.COLORS.white} />
                    </View>
                </TouchableOpacity>
            </View>
            {/* dynamically render different stage builders depending on preset type*/}
            <TimerBuilderComponent ref={timerBuilderRef} onUpdateStages={onUpdateStages}/> 
        </View>
    )
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: Constants.COLORS.white,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'column',
        flexGrow: 1,
        // borderWidth: 5,
        // borderColor: Constants.COLORS.preset_red,
    },

    clockTypeIdContainer: {
        width: '100%',
        flexDirection: 'row',
        minHeight: 40,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Constants.COLORS.preset_blue,
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
    },

    clockTypeIdText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.regular as TextStyle['fontWeight'],
        color: Constants.COLORS.white,
        marginRight: 15
    },
});

export default TimerSelection;
export type { TimerSelectionRef };