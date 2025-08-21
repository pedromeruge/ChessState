import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard, TextStyle } from 'react-native'

import * as Constants from '../../../constants/index';
import * as Styles from '../../../styles/index.js';

import IconComponent from '../../common/IconComponent.jsx';
import Stage from '../../../classes/timers_base/Stage';

// Define interfaces for TypeScript
interface DisplayStagesRef {
    addStage: (newStage: Stage) => void;
    getStages: () => Stage[];
}

interface DisplayStagesProps {
    onUpdateStages: (stages: Stage[]) => void;
}

const DisplayStages = forwardRef<DisplayStagesRef, DisplayStagesProps>(
    ({onUpdateStages}, ref) => {

    //functions for parent
    useImperativeHandle(ref, () => ({
        addStage,
        getStages
    }));

    // state
    const [stages, setStages] = useState<Stage[]>([]); 

    const addStage = (newStage: Stage): void => {

        const newStages = [ // add stage to list
            ...stages, 
            newStage
        ]; 

        setStages(newStages);
        onUpdateStages(newStages);

        console.log("Added stage");
    }

    const getStages = (): Stage[] => {
        return stages;
    }

    const onRemoveStage = (index: number): void => {
        const newStages = stages.filter((stage, i) => i !== index); // remove stage from list
        
        setStages(newStages);
        onUpdateStages(newStages); // update parent component

        console.log("Removed stage in position: ", index);
    }
    
    return (
        <View style={[Styles.newPreset.sectionContainer]}>
            <View style={Styles.newPreset.sectionTitleContainer}>
                <Text style={Styles.newPreset.sectionTitleText}>Stages</Text>
                <Text style={Styles.newPreset.sectionSubtitleText}>{stages.length} items</Text>
            </View>
            <View style={[styles.stagesContent]}>
                {stages.length === 0 ? (
                    <Text style={styles.noStageItemText}>No stages added yet</Text>
                ) : (
                    stages.map((stage: Stage, index: number) => (
                        <View key={index} style={styles.stageItemContainer}>
                            <View style={styles.stageItemDescription}>
                                <Text style={styles.stageItemText}>{stage.toString()}</Text>
                            </View>
                            <TouchableOpacity onPress={() => {onRemoveStage(index)}}>
                                <IconComponent source={Constants.icons.cross} width={12} tintColor={Constants.COLORS.text_dark_2}/>
                            </TouchableOpacity>
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
        width: '100%'
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
    }
});

export default DisplayStages;
export type { DisplayStagesRef };