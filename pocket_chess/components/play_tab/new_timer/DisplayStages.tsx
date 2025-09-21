import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard, TextStyle } from 'react-native'

import * as Constants from '../../../constants/index';
import * as Styles from '../../../styles/index.js';

import IconComponent from '../../common/IconComponent.jsx';
import Stage from '../../../classes/timers_base/Stage';
import Time from '../../../classes/timers_base/Time';

// Define interfaces for TypeScript
interface DisplayStagesRef {
    addStage: (newStage: Stage) => void; // add a new stage
    getStages: () => Stage[]; // get current list of stages
}

interface DisplayStagesProps {
    onUpdateStages?: (stages: Stage[]) => void;
    title: string;
    initialStages?: Stage[]; // optional initial stages to populate
    editMode?: boolean; // if true it will be used in create/edit screens, show remove buttons to remove stages

    // optional props to higlight in previously paused timers
    currentStageIndex?: number; // current stage index
    currentStageTimeLeft?: number; // time left in current stage in miliseconds
}

const DisplayStages = forwardRef<DisplayStagesRef, DisplayStagesProps>(({onUpdateStages=null, title="Stages", initialStages=[], currentStageIndex=null, currentStageTimeLeft=null, editMode=true}, ref) => {

    //functions for parent
    useImperativeHandle(ref, () => ({
        addStage,
        getStages
    }));

    // state
    const [stages, setStages] = useState<Stage[]>(initialStages); // list of stages

    const addStage = (newStage: Stage): void => {

        const newStages = [ // add stage to list
            ...stages, 
            newStage
        ]; 

        setStages(newStages);
        onUpdateStages?.(newStages);

        console.log("Added stage");
    }

    const getStages = (): Stage[] => {
        return stages;
    }

    const onRemoveStage = (index: number): void => {
        const newStages = stages.filter((stage, i) => i !== index); // remove stage from list
        
        setStages(newStages);
        onUpdateStages?.(newStages); // update parent component

        console.log("Removed stage in position: ", index);
    }
    
    /*
        @ - text to display on the right side of each stage item
        @param currentStageIndex - the index of the current active stage of the preset
        @param currentStageTimeLeft - the time left in the current stage of the preset (in miliseconds)
        @param index - the index of the stage being rendered
    */
    const rightDisplayText = (currentStageIndex: number, currentStageTimeLeft: number, index: number) => {
        if (index < currentStageIndex) {
            return "Finished";
        } else if (index === currentStageIndex) {
            return `${Time.fromMiliseconds(currentStageTimeLeft).toStringTimerSimple()} - Paused`;
        }
        return '';
    }

    const rightTextStyle = (currentStageIndex: number, currentStageTimeLeft: number, index: number): TextStyle => {
        if (index < currentStageIndex) {
            return styles.stageItemFinishedText;
        } else if (index === currentStageIndex) {
            return styles.stageItemPausedText;
        }
        return styles.stageItemUpcomingText;
    }

    const rightItemContainerStyle = (currentStageIndex: number, currentStageTimeLeft: number, index: number): TextStyle => {
        if (index < currentStageIndex) {
            return styles.stageItemFinishedContainer;
        } else if (index === currentStageIndex) {
            return styles.stageItemPausedContainer;
        }
        return styles.stageItemUpcomingContainer;
    }

    return (
        <View style={[Styles.newPreset.sectionContainer]}>
            <View style={Styles.newPreset.sectionTitleContainer}>
                <Text style={Styles.newPreset.sectionTitleText}>{title}</Text>
                <Text style={Styles.newPreset.sectionSubtitleText}>{stages.length} items</Text>
            </View>
            <View style={[styles.stagesContent]}>
                {stages.length === 0 ? (
                    <Text style={styles.noStageItemText}>No stages added yet</Text>
                ) : (
                    stages.map((stage: Stage, index: number) => (
                        <View key={index} style={[styles.stageItemContainer, rightItemContainerStyle(currentStageIndex, currentStageTimeLeft, index)]}>
                            <View style={styles.stageItemDescription}>
                                <Text style={[styles.stageItemText, rightTextStyle(currentStageIndex, currentStageTimeLeft, index)]}>{stage.toString()}</Text>
                            </View>
                            {(editMode && currentStageIndex !== null && currentStageTimeLeft !== null)? (
                                <Text style={[styles.stageItemText, rightTextStyle(currentStageIndex, currentStageTimeLeft, index)]}>
                                    {rightDisplayText(currentStageIndex, currentStageTimeLeft, index)}
                                </Text>
                            ) : (
                                <TouchableOpacity onPress={() => {onRemoveStage(index)}}>
                                    <IconComponent source={Constants.icons.cross} width={12} tintColor={Constants.COLORS.text_dark_2}/>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                )}
            </View>
        </View>
    )
});

DisplayStages.displayName = 'DisplayStages';

const styles = StyleSheet.create({
    
    stagesContent: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        rowGap: 7,
        paddingBottom: 30
    },

    noStageItemText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.light as TextStyle['fontWeight'],
        color: Constants.COLORS.line_light_grey,
        paddingLeft: 5,
    },

    stageItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: Constants.COLORS.line_light_grey,
        paddingHorizontal: 15,
        paddingVertical: 5,
        width: '100%',
    },

    stageItemFinishedContainer: {
        backgroundColor: Constants.COLORS.line_light_grey,
        borderWidth: 0,
    },

    stageItemPausedContainer: {
        // can be different, but same for now

    },

    stageItemUpcomingContainer: {
        // can be different, but same for now

    },

    stageItemDescription: {
        flexDirection: 'row',
        flex: 1,
        marginRight: 10
    },

    stageItemText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
        color: Constants.COLORS.text_grey,
    },

    stageItemFinishedText: {
        fontWeight: Constants.FONTS.semi_bold as TextStyle['fontWeight'],
        color: Constants.COLORS.white
    },

    stageItemPausedText: {
        // can be different, but same for now
    },

    stageItemUpcomingText: {
        // can be different, but same for now
    }


});

export default DisplayStages;
export type { DisplayStagesRef };