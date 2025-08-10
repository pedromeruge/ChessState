import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextStyle } from 'react-native'
import {router, useLocalSearchParams} from 'expo-router'

import * as Constants from '../../../constants/index.js';
import * as Styles from '../../../styles/index.js';

import IconComponent from '../../common/IconComponent.jsx';
import { PresetTypes, PresetIdToTypes } from '../../../classes/PresetTypes.js';
import { ClockTypeIdToBuilderComponent } from '../../../classes/ComponentRegistry';
import { Timer } from '../../../classes/timers_base/Preset.js';
import { TimerBuilderRef } from '../../../classes/types/TimerBuilderTypes.js';

interface TimerSelectionRef{
    buildTimer: (playerName: string) => Timer;
}

interface TimerSelectionProps {
    onUpdateStages: (stages: any) => void;
    playerName: string;
}

const TimerSelection = forwardRef<TimerSelectionRef, TimerSelectionProps>(
    ({onUpdateStages, playerName}, ref) => { // expose the ref to the parent component

    //route params
    const {clock_type_id} = useLocalSearchParams();
    let clockTypeIdNumber = typeof clock_type_id === 'string' ? parseInt(clock_type_id) : clock_type_id; // convert clock id to int

    //functions for parent
    useImperativeHandle(ref, () => ({
        buildTimer
    }));

    //refs
    const timerBuilderRef = useRef<TimerBuilderRef>(null);

    const [currentClockType, setCurrentClockType] = useState(() => {
        // ensure valid id passed in route
        if (clockTypeIdNumber && PresetIdToTypes[clockTypeIdNumber]) {
            return PresetIdToTypes[clockTypeIdNumber];
        }
        return PresetTypes.FISCHER_INCREMENT;
    });

    //effects
    //update clock type when returning to page with different clock_type_id
    useEffect(() => {
        clockTypeIdNumber = typeof clock_type_id === 'string' ? parseInt(clock_type_id) : clock_type_id; // convert clock id to int

        if (clockTypeIdNumber && PresetIdToTypes[clockTypeIdNumber]) {
            setCurrentClockType(PresetIdToTypes[clockTypeIdNumber]);
        }
    }, [clock_type_id]);


    //other funcs
    const buildTimer = () => {
        return timerBuilderRef.current?.buildTimer(playerName);
    }

    const showClockTypesScreen = () => {
        router.push({
            pathname: '/play/clock_types/clock_types_list',
            params: {clock_type_id: currentClockType.id}
        });
    }

    const TimerBuilderComponent = useMemo(() => {
        return ClockTypeIdToBuilderComponent[currentClockType.id];
    }, [currentClockType.id]);

    // safety check before rendering
    if (!TimerBuilderComponent) {
        console.error(`No builder component found for clock type ID: ${currentClockType.id}`);
        return (
            <View style={styles.container}>
                <Text>Builder component not available for {currentClockType.name}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[Styles.newPreset.sectionContainer, {paddingBottom: 0}]}>
                <TouchableOpacity style={[styles.clockTypeContainer]} onPress={showClockTypesScreen}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <IconComponent source={Constants.icons.clock_type} width={15} tintColor={Constants.COLORS.white} />
                        <Text style={[Styles.newPreset.sectionTitleText, {color: Constants.COLORS.white, marginLeft: 7}]}>Clock type</Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.clockTypeText}>{currentClockType.name}</Text>
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
        height: '100%',
        flex: 1
    },

    clockTypeContainer: {
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

    clockTypeText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.regular as TextStyle['fontWeight'],
        color: Constants.COLORS.white,
        marginRight: 15
    },
});

export default TimerSelection;