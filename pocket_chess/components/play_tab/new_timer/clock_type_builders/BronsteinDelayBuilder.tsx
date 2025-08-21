import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard } from 'react-native'

import * as Constants from '../../../../constants/index';
import * as Styles from '../../../../styles/index.js';

import IconComponent from '../../../common/IconComponent.jsx';
import { Time } from '../../../../classes/timers_base/Preset';
import { BronsteinDelayStage, BronsteinDelayTimer} from '../../../../classes/timers_clock_types/BronsteinDelay';
import StageNumberField, {StageNumberFieldRef} from '../StageNumberField';
import StageTimeField, {StageTimeFieldRef} from '../StageTimeField';
import StageAddButton from '../StageAddButton';
import DisplayStages, {DisplayStagesRef} from '../DisplayStages';
import { TimerBuilderProps, TimerBuilderRef } from '../../../../classes/types/TimerBuilderTypes.js';

// Specific interface for Simple Delay Builder
interface BronsteinDelayBuilderRef extends TimerBuilderRef {
  buildTimer: (playerName: string) => BronsteinDelayTimer;
}

const BronsteinDelayBuilder = forwardRef<BronsteinDelayBuilderRef, TimerBuilderProps>(
    ({onUpdateStages}, ref) => {
    
    // refs
    const displayStagesRef = useRef<DisplayStagesRef>(null); // ref for displaying the stages of this builder
    const baseTimeFieldRef = useRef<StageTimeFieldRef>(null);
    const delayFieldRef = useRef<StageTimeFieldRef>(null);
    const movesFieldRef = useRef<StageNumberFieldRef>(null);

    // funcs for parent
    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        buildTimer
    }));

    // state
    const [isBaseTimeDefault, setIsBaseTimeDefault] = useState<boolean>(true);

    const checkBaseTimeDefault = (time: Time): void => {
        setIsBaseTimeDefault(time.isDefault());
    }

    //other funcs
    const addStage = (): void => {
        const newStage = new BronsteinDelayStage(
            baseTimeFieldRef.current?.getTime(),
            delayFieldRef.current?.getTime(),
            movesFieldRef.current?.getNumber()
        );
        
        displayStagesRef.current?.addStage(newStage);
        console.log("Added stage");
        
        baseTimeFieldRef.current?.reset();
        delayFieldRef.current?.reset();
        movesFieldRef.current?.reset();

        setIsBaseTimeDefault(true); // reset base time default state
    }

    const buildTimer = (playerName: string): BronsteinDelayTimer => {
        const stages = (displayStagesRef.current?.getStages() as BronsteinDelayStage[]) || [];
        if (stages.length === 0) {
            throw new Error("No stages available to build BronsteinDelayTimer");
        }
        return new BronsteinDelayTimer(stages, playerName);
    }

    return (
        <>
            <View style={Styles.newPreset.sectionContainer}>
                <View style={Styles.newPreset.sectionTitleContainer}>
                    <Text style={Styles.newPreset.sectionTitleText}>Add stage</Text>
                </View>
                <View style={Styles.newPreset.addStageContainer}>
                    <StageTimeField
                        ref={baseTimeFieldRef}
                        icon={Constants.icons.clock_full}
                        title="Base Time"
                        onChange={checkBaseTimeDefault}
                    />
                    <StageTimeField
                        ref={delayFieldRef}
                        icon={Constants.icons.hidden}
                        title="Delay"
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

export default BronsteinDelayBuilder;
export type { BronsteinDelayBuilderRef };