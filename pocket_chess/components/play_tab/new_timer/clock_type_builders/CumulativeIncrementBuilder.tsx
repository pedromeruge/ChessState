import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard } from 'react-native'

import * as Constants from '../../../../constants/index';
import * as Styles from '../../../../styles/index.js';

import IconComponent from '../../../common/IconComponent.jsx';
import { Time } from '../../../../classes/timers_base/Preset';
import { CumulativeIncrementStage, CumulativeIncrementTimer} from '../../../../classes/timers_clock_types/CumulativeIncrement';
import StageNumberField, {StageNumberFieldRef} from '../StageNumberField';
import StageTimeField, {StageTimeFieldRef} from '../StageTimeField';
import StageAddButton from '../StageAddButton';
import DisplayStages, {DisplayStagesRef} from '../DisplayStages';
import { TimerBuilderProps, TimerBuilderRef } from '../../../../classes/types/TimerBuilderTypes.js';

// Specific interface for Cumulative Increment Builder
interface CumulativeIncrementBuilderRef extends TimerBuilderRef {
  buildTimer: (playerName: string) => CumulativeIncrementTimer;
}

const CumulativeIncrementBuilder = forwardRef<CumulativeIncrementBuilderRef, TimerBuilderProps>(
    ({onUpdateStages}, ref) => {
    
    // refs
    const displayStagesRef = useRef<DisplayStagesRef>(null); // ref for displaying the stages of this builder
    const baseTimeFieldRef = useRef<StageTimeFieldRef>(null);
    const incrementBaseFieldRef = useRef<StageTimeFieldRef>(null);
    const incrementGrowthFieldRef = useRef<StageTimeFieldRef>(null);
    const incrementPerMovesFieldRef = useRef<StageNumberFieldRef>(null);
    const totalMovesFieldRef = useRef<StageNumberFieldRef>(null);

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
        const newStage = new CumulativeIncrementStage(
            baseTimeFieldRef.current?.getTime(),
            incrementBaseFieldRef.current?.getTime(),
            incrementGrowthFieldRef.current?.getTime(),
            incrementPerMovesFieldRef.current?.getNumber(),
            totalMovesFieldRef.current?.getNumber()
        );
        
        displayStagesRef.current?.addStage(newStage);
        console.log("Added stage");
        
        baseTimeFieldRef.current?.reset();
        incrementBaseFieldRef.current?.reset();
        incrementGrowthFieldRef.current?.reset();
        incrementPerMovesFieldRef.current?.reset();
        totalMovesFieldRef.current?.reset();

        setIsBaseTimeDefault(true); // reset base time default state
    }

    const buildTimer = (playerName: string): CumulativeIncrementTimer => {
        const stages = (displayStagesRef.current?.getStages() as CumulativeIncrementStage[]) || [];
        if (stages.length === 0) {
            throw new Error("No stages available to build CumulativeIncrementTimer");
        }
        return new CumulativeIncrementTimer(stages, playerName);
    }

    return (
        <>
            <View style={Styles.newPreset.sectionContainer}>
                <View style={Styles.newPreset.sectionTitleContainer}>
                    <Text style={Styles.newPreset.sectionTitleText}>Add stage</Text>
                </View>
                <View style={styles.addStageContainer}>
                    <View style={[styles.fieldsRow, {columnGap: '3%'}]}>
                        <StageTimeField
                            ref={baseTimeFieldRef}
                            icon={Constants.icons.clock_full}
                            title="Base Time"
                            onChange={checkBaseTimeDefault}
                        />
                        <StageNumberField
                            ref={incrementPerMovesFieldRef}
                            icon={Constants.icons.pawn_full}
                            title="Total Moves"
                        />
                    </View>
                    <View style={[styles.fieldsRow, styles.incrementContainer]}>
                        <View style={[styles.incrementTitle]}>
                            <IconComponent source={Constants.icons.plus_thick} width={12} tintColor={Constants.COLORS.contrast_blue_light}/>
                            <Text style={Styles.newPreset.timeTitleText}>{"Increment"}</Text>
                        </View>
                        <View style={styles.separationBar}/>
                        <StageTimeField
                            ref={incrementBaseFieldRef}
                            icon={null}
                            title="Base"
                            hideHours={true}
                            hideBorders={true}
                        />
                        <View style={styles.separationBar}/>
                        <StageTimeField
                            ref={incrementGrowthFieldRef}
                            icon={null}
                            title="Growth"
                            hideHours={true}
                            hideBorders={true}
                        />
                        <View style={styles.separationBar}/>
                        <StageNumberField
                            ref={incrementPerMovesFieldRef}
                            icon={null}
                            title="Moves"
                            hideBorders={true}
                            startValue={1}

                        />
                     </View>
                    <StageAddButton onPress={addStage} disabled={isBaseTimeDefault} iconSize={12} vertical={false}/>
                </View>
            </View>
            <DisplayStages ref={displayStagesRef} onUpdateStages={onUpdateStages}/>
        </>
    )
});

const styles = StyleSheet.create({
    fieldsRow: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',

    },

    addStageContainer: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        rowGap: '3%',
    },

    incrementContainer: {
        borderWidth: 1,
        borderColor: Constants.COLORS.line_light_grey,
        borderRadius: 10,
    },

    incrementTitle: {
        paddingHorizontal: '2%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
        minHeight: 70,
        flex: 1
    },
    separationBar: {
        width: 1,
        height: '70%',
        backgroundColor: Constants.COLORS.line_light_grey,
    }
});

export default CumulativeIncrementBuilder;
export type { CumulativeIncrementBuilderRef };