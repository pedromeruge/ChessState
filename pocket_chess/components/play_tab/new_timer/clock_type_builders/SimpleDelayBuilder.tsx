import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard } from 'react-native'

import * as Constants from '../../../../constants/index';
import * as Styles from '../../../../styles/index.js';

import IconComponent from '../../../common/IconComponent.jsx';
import { Time } from '../../../../classes/timers_base/Preset';
import { SimpleDelayStage, SimpleDelayTimer} from '../../../../classes/timers_clock_types/SimpleDelay';
import StageNumberField, {StageNumberFieldRef} from '../StageNumberField';
import StageTimeField, {StageTimeFieldRef} from '../StageTimeField';
import StageAddButton from '../StageAddButton';
import DisplayStages, {DisplayStagesRef} from '../DisplayStages';
import { TimerBuilderProps, TimerBuilderRef } from '../../../../classes/types/TimerBuilderTypes.js';

// Specific interface for Simple Delay Builder
interface SimpleDelayBuilderRef extends TimerBuilderRef {
  buildTimer: (playerName: string) => SimpleDelayTimer;
}

const SimpleDelayBuilder = forwardRef<SimpleDelayBuilderRef, TimerBuilderProps>(
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
        const newStage = new SimpleDelayStage(
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

    const buildTimer = (playerName: string): SimpleDelayTimer => {
        const stages = (displayStagesRef.current?.getStages() as SimpleDelayStage[]) || [];
        if (stages.length === 0) {
            throw new Error("No stages available to build SimpleDelayTimer");
        }
        return new SimpleDelayTimer(stages, playerName);
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

export default SimpleDelayBuilder;
export type { SimpleDelayBuilderRef };