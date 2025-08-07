import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard } from 'react-native'

import * as Constants from '../constants/index.js';
import * as Styles from '../styles/index.js';

import IconComponent from './common/IconComponent.jsx';
import { Time, Stage, Timer, Preset, FischerIncrementStage } from '../classes/Preset.js';
import ModalTimerPicker from './ModalTimerPicker.jsx';
import { PresetTypes } from '../classes/PresetTypes.js';
import {router} from 'expo-router'

const TimerSelection = forwardRef(({onUpdateTimer}, ref) => { // expose the ref to the parent component

    // state
    const [stages, setStages] = useState([]); 
    const [baseTime, setBaseTime] = useState(new Time()); // track base time
    const [increment, setIncrement] = useState(new Time()); // track increment
    const [moves, setMoves] = useState(null); // track moves
    const [currentClockType, setCurrentClockType] = useState(PresetTypes.FISCHER_INCREMENT); // track current clock type

    // refs for the time picker roulettes for base time and increment
    const baseTimePickerRef = useRef(null);
    const incrementPickerRef = useRef(null);
    const movesInputRef = useState(null);

    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        stages
    }));

    // Focus on the moves textinput when bigger moves square is pressed
    const handlePressMoves = () => {
        movesInputRef.current?.focus(); 
    }

    const onAddStage = () => {
        const newStages = [ // add stage to list
            ...stages, 
            new FischerIncrementStage(baseTime, increment, moves)
        ]; 
        setStages(newStages);
        onUpdateTimer(newStages); // update parent component

        console.log("Added stage");

        setBaseTime(new Time()); // reset base time
        setIncrement(new Time()); // reset increment
        setMoves(null); // reset moves

    }

    const onRemoveStage = (index) => {
        const newStages = stages.filter((stage, i) => i !== index); // remove stage from list
        
        setStages(newStages);
        onUpdateTimer(newStages); // update parent component

        console.log("Removed stage in position: ", index);

    }

    const showBaseTimePicker = () => {
        baseTimePickerRef.current?.showModal();
    }

    const showIncrementPicker = () => {
        incrementPickerRef.current?.showModal();
    }

    const showClockTypesScreen = () => {
        router.push({
            pathname: '/play_more/clock_types/clock_types_list',
            params: {current_type: currentClockType}
        });
    }

    const onChangeTitle = (text) => {
        setMoves(text.replace(/[^0-9]/g, ''))
    };
    
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
            <View style={Styles.newPreset.sectionContainer}>
                <View style={Styles.newPreset.sectionTitleContainer}>
                    <Text style={Styles.newPreset.sectionTitleText}>Add stage</Text>
                </View>
                <View style={styles.addStageContainer}>
                    <TouchableOpacity style={[Styles.newPreset.timeContainer, styles.stageInput]} onPress={showBaseTimePicker}>
                        <View style={Styles.newPreset.timeTitle}>
                            <IconComponent source={Constants.icons.clock_full} width={15} />
                            <Text style={Styles.newPreset.timeTitleText}>Base time</Text>
                        </View>
                        <Text style={[Styles.newPreset.timeInput, {color: baseTime.isDefault() ? Constants.COLORS.line_light_grey : Constants.COLORS.text_dark_2}]}>{baseTime.toStringComplete()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[Styles.newPreset.timeContainer, styles.stageInput]} onPress={showIncrementPicker}>
                        <View style={Styles.newPreset.timeTitle}>
                            <IconComponent source={Constants.icons.plus_thick} width={12} tintColor={Constants.COLORS.contrast_blue_light}/>
                            <Text style={Styles.newPreset.timeTitleText}>Increment</Text>
                        </View>
                        <Text style={[Styles.newPreset.timeInput, {color: increment.isDefault() ? Constants.COLORS.line_light_grey : Constants.COLORS.text_dark_2}]}>{increment.toStringMinSecs()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[Styles.newPreset.timeContainer, styles.stageInput]} onPress={handlePressMoves}>
                        <View style={Styles.newPreset.timeTitle}>
                            <IconComponent source={Constants.icons.pawn_full} width={12} tintColor={Constants.COLORS.contrast_blue_light}/>
                            <Text style={Styles.newPreset.timeTitleText}>Moves</Text>
                        </View>
                        <TextInput 
                            ref={movesInputRef}
                            style={Styles.newPreset.timeInput}
                            placeholder="∞"
                            placeholderTextColor={Constants.COLORS.line_light_grey}
                            keyboardType='numeric'
                            onChangeText={(text) => onChangeTitle(text)}
                            value={moves}
                            maxLength={4}
                            />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.stageAdd, baseTime.isDefault() ? styles.disabled : null]} // if disabled make it less visible
                        onPress={onAddStage}
                        disabled={baseTime.isDefault()}>
                        <IconComponent source={Constants.icons.plus_thick} width={16} tintColor={Constants.COLORS.white}/>
                        <Text style={styles.stageTitleAdd}>Add</Text>
                    </TouchableOpacity>
                    <ModalTimerPicker ref={baseTimePickerRef} time={baseTime} setTime={setBaseTime} hideHours={false}/>
                    <ModalTimerPicker ref={incrementPickerRef} time={increment} setTime={setIncrement} hideHours={true}/>
                </View>
            </View>
            <View style={Styles.newPreset.sectionContainer}>
                <View style={Styles.newPreset.sectionTitleContainer}>
                    <Text style={Styles.newPreset.sectionTitleText}>Stages</Text>
                    <Text style={Styles.newPreset.sectionSubtitleText}>{stages.length} items</Text>
                </View>
                <View style={styles.stagesContent}>
                    {stages.length == 0 ? (
                        <Text style={styles.noStageItemText}>No stages added yet</Text>
                        ) : (
                            stages.map((stage, index) => (
                                <View key={index} style={Styles.stages.stageItemContainer}>
                                    <View style={Styles.stages.stageItemDescription}>
                                        <Text style={Styles.stages.stageItemText}>{stage.toString()}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => {onRemoveStage(index)}}>
                                        <IconComponent source={Constants.icons.cross} width={12} tintColor={Constants.COLORS.text_dark_2}/>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )
                    }
                </View>
            </View>
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
        fontWeight: Constants.FONTS.regular,
        color: Constants.COLORS.white,
        marginRight: 15
    },

    addStageContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        columnGap: '2%'
    },

    stageInput: {
        flex:2
    },

    stageTitleAdd: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.small,
        fontWeight: Constants.FONTS.regular,
        color: Constants.COLORS.white
    },

    stageAdd: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Constants.COLORS.preset_blue,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        maxWidth: 50,
        rowGap: 7,
        flex: 1
    },
    
    stagesContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flex: 1
    },

    stagesContent: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        rowGap: 7
    },
    
    noStageItemText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.light,
        color: Constants.COLORS.line_light_grey,
        paddingLeft: 5,
    },
    
    startButton: {
        marginTop: 30
    },

    disabled: {
        opacity: 0.6
    }
});

export default TimerSelection;