import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useReducer, useMemo } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TextInput, Image, Text, TextStyle } from 'react-native'
import { router, useLocalSearchParams} from 'expo-router';

import * as Constants from '../../../constants/index';
import * as Styles from '../../../styles/index.js';
import Preset, { Stage, Timer } from '../../../classes/timers_base/Preset';
import storage from '../../../classes/Storage';
import TabNavigator from '../../common/TabNavigator';

import DisplayStages from '../../play_tab/new_timer/DisplayStages';

interface PresetDetailsProps {
    preset: Preset; // preset to display
    editMode?: boolean; // if true, it is being used in create/edit screen, thus include remove buttons to remove stages
}

const PresetDetails = ({preset, editMode = true}: PresetDetailsProps) => { // expose the ref to the parent component

    if (!preset) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', color: Constants.COLORS.red, marginTop: 5}}>
                    Error: No preset found
                </Text>
            </View>
        )
    }

    //route params
    const {player_name} = useLocalSearchParams();

    // track which player is currently selecting a clock type
    const [initialTabIndex] = useState<number>(player_name ? Constants.PLAYER_NAMES.indexOf(player_name as string) : 0);

    return (
        <View style={styles.tabContainer}>
            <TabNavigator 
                tabs = {
                    Object.fromEntries(
                        preset.timers.map((timer, idx) => 
                            [timer.playerName, (props: any) => (
                                <DisplayStages
                                    {...props}
                                    title={"Timer"}
                                    initialStages={timer.stages}
                                    currentStageIndex={timer.currentStage}
                                    currentStageTimeLeft={timer.currentStageTime}
                                    editMode={editMode}
                                />
                            )
                        ])
                    )
                }
                icons = {
                    Object.fromEntries(
                        preset.timers.map((timer, idx) =>
                            [timer.playerName, idx === 0 ? Constants.icons.pawn : Constants.icons.pawn_full] // assign pawn_full icon to all players except the first one
                        )
                    )
                }
                swipeEnabled={false}
                initialTabIndex={initialTabIndex}
                containerStyle={{height: 300}}
            />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Constants.COLORS.white,
    },
    
    tabContainer: {
        elevation: 5, 
        zIndex: 5 // ensure the tab navigator is above the scroll view content
    },

});

export default PresetDetails;