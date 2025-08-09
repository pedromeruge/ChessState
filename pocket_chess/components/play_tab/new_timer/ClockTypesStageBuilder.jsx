import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard } from 'react-native'

import * as Constants from '../../../constants/index.js';
import * as Styles from '../../../styles/index.js';

import IconComponent from '../../common/IconComponent.jsx';
import { Time, Stage, Timer, Preset, FischerIncrementStage, FischerIncrementTimer } from '../../../classes/Preset.js';
import StageNumberField from './StageNumberField.jsx';
import StageTimerField from './StageTimerField.jsx';
import StageAddButton from './StageAddButton.jsx';
import DisplayStages from './DisplayStages.jsx';

const FischerIncrementBuilder = forwardRef(({onUpdateStages}, ref) => {
    
    // refs
    const displayStagesRef = useRef(null); // ref for displaying the stages of this builder
    const baseTimeFieldRef = useRef(null);
    const incrementFieldRef = useRef(null);
    const movesFieldRef = useRef(null);

    // funcs for parent
    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        buildTimer
    }));

    // state
    const [isBaseTimeDefault, setIsBaseTimeDefault] = useState(true);

    const checkBaseTimeDefault = (time) => {
        setIsBaseTimeDefault(time.isDefault());
    }

    //other funcs
    const addStage = () => {
        const newStage = new FischerIncrementStage(
            baseTimeFieldRef.current?.getTime(),
            incrementFieldRef.current?.getTime(),
            movesFieldRef.current?.getNumber()
        );
        
        displayStagesRef.current?.addStage(newStage);
        console.log("Added stage");
        
        baseTimeFieldRef.current?.reset();
        incrementFieldRef.current?.reset();
        movesFieldRef.current?.reset();

        setIsBaseTimeDefault(true); // reset base time default state
    }
    
    const buildTimer = (playerName) => {
        return new FischerIncrementTimer(displayStagesRef.current?.getStages(), playerName);
    }

    return (
        <>
            <View style={Styles.newPreset.sectionContainer}>
                <View style={Styles.newPreset.sectionTitleContainer}>
                    <Text style={Styles.newPreset.sectionTitleText}>Add stage</Text>
                </View>
                <View style={styles.addStageContainer}>
                    <StageTimerField
                        ref={baseTimeFieldRef}
                        icon={Constants.icons.clock_full}
                        title="Base Time"
                        onChange={checkBaseTimeDefault}
                    />
                    <StageTimerField
                        ref={incrementFieldRef}
                        icon={Constants.icons.plus_thick}
                        title="Increment"
                        hideHours={true}
                    />
                    <StageNumberField
                        ref={movesFieldRef}
                        icon={Constants.icons.pawn_full}
                        title="Moves"
                    />
                    <StageAddButton onPress={addStage} disabled={isBaseTimeDefault} />
                </View>
            </View>
            <DisplayStages ref={displayStagesRef} onUpdateStages={onUpdateStages}/>
        </>
    )
});

const styles = StyleSheet.create({

    addStageContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        columnGap: '2%'
    },
});

export {FischerIncrementBuilder}