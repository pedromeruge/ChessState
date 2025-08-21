import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard } from 'react-native'

import * as Constants from '../../../../constants/index';
import * as Styles from '../../../../styles/index.js';

import IconComponent from '../../../common/IconComponent.jsx';
import { Time } from '../../../../classes/timers_base/Preset';
import { FixedMovesStage, FixedMovesTimer} from '../../../../classes/timers_clock_types/FixedMoves';
import StageNumberField, {StageNumberFieldRef} from '../StageNumberField';
import StageTimeField, {StageTimeFieldRef} from '../StageTimeField';
import StageAddButton from '../StageAddButton';
import DisplayStages, {DisplayStagesRef} from '../DisplayStages';
import { TimerBuilderProps, TimerBuilderRef } from '../../../../classes/types/TimerBuilderTypes.js';

// Specific interface for Simple lives Builder
interface FixedMovesBuilderRef extends TimerBuilderRef {
  buildTimer: (playerName: string) => FixedMovesTimer;
}

const FixedMovesBuilder = forwardRef<FixedMovesBuilderRef, TimerBuilderProps>(
    ({onUpdateStages}, ref) => {
    
    // refs
    const displayStagesRef = useRef<DisplayStagesRef>(null); // ref for displaying the stages of this builder
    const baseTimeFieldRef = useRef<StageTimeFieldRef>(null);
    const livesFieldRef = useRef<StageNumberFieldRef>(null);
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
        const newStage = new FixedMovesStage(
            baseTimeFieldRef.current?.getTime(),
            livesFieldRef.current?.getNumber(),
            movesFieldRef.current?.getNumber()
        );
        
        displayStagesRef.current?.addStage(newStage);
        console.log("Added stage");
        
        baseTimeFieldRef.current?.reset();
        livesFieldRef.current?.reset();
        movesFieldRef.current?.reset();

        setIsBaseTimeDefault(true); // reset base time default state
    }

    const buildTimer = (playerName: string): FixedMovesTimer => {
        const stages = (displayStagesRef.current?.getStages() as FixedMovesStage[]) || [];
        if (stages.length === 0) {
            throw new Error("No stages available to build FixedMovesTimer");
        }
        return new FixedMovesTimer(stages, playerName);
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
                        title="Move Time"
                        onChange={checkBaseTimeDefault}
                    />
                    <StageNumberField
                        ref={livesFieldRef}
                        icon={Constants.icons.heart_full}
                        startValue={1}
                        title="Lives"
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

export default FixedMovesBuilder;
export type { FixedMovesBuilderRef };