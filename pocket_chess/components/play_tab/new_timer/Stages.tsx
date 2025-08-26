import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useReducer, useMemo } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TextInput, Image, Text, TextStyle } from 'react-native'
import { router, useLocalSearchParams} from 'expo-router';

import * as Constants from '../../../constants/index';
import * as Styles from '../../../styles/index.js';
import Preset, { Stage, Timer } from '../../../classes/timers_base/Preset';
import Header from '../../common/Header.jsx';
import ActionButton from '../../common/ActionButton.jsx';
import storage from '../../../classes/Storage';
import TabNavigator from '../../common/TabNavigator';
import TimerSelection, { TimerSelectionRef } from './TimerSelection';
import PresetType, { PresetTypes, PresetIdToTypes } from '../../../classes/PresetType';

const Stages = ({}) => { // expose the ref to the parent component

    //route params
    const {clock_type_id, player_name} = useLocalSearchParams();

    //state
    const [title, setTitle] = useState(''); // title of the preset
    
    const [playersStages, setPlayersStages] = useState<{[key: string]: Stage[]}>(
        Object.fromEntries(Constants.PLAYER_NAMES.map(playerName => [playerName, []])) // dictionary where key is player and value is timers array
    );

    // state to track clock type for each player separately
    const [playersClockTypes, setPlayersClockTypes] = useState<{[key: string]: number}>(() => {
        
        // by default pass Fischer Increment clock to players
        return Object.fromEntries(
            Constants.PLAYER_NAMES.map(playerName => [playerName, PresetTypes.FISCHER_INCREMENT.id])
        );
    });

    // track which player is currently selecting a clock type
    const [initialTabIndex, setInitialTabIndex] = useState<number>(0);
    
    //effects
    // Handle clock type updates from the ClockTypesList screen
    useEffect(() => {
        
        if (clock_type_id && player_name) {
            const clockTypeIdNumber = typeof clock_type_id === 'string' ? parseInt(clock_type_id, 10) :
                typeof clock_type_id === 'number' ? clock_type_id : null;
            const playerNameString = player_name as string;

            if (clockTypeIdNumber && PresetIdToTypes[clockTypeIdNumber]) {
                const currentClockType = playersClockTypes[playerNameString];
                
                //only re-render tab if clock type changed
                if (currentClockType !== clockTypeIdNumber) {

                    setPlayersStages(prev => ({
                        ...prev,
                        [playerNameString]: []
                    }));
                    
                    setPlayersClockTypes(prev => ({
                        ...prev,
                        [playerNameString]: clockTypeIdNumber
                    }));

                    console.log(`Updated clock type for ${playerNameString} to:`, PresetIdToTypes[clockTypeIdNumber].name);
            
                }
            
                // clear the selecting player after update
                setInitialTabIndex(Constants.PLAYER_NAMES.indexOf(playerNameString));
            }
        }
    }, [clock_type_id, player_name, playersClockTypes]);

    //refs
    // create refs for each player tab
    const playerRefsArray = Constants.PLAYER_NAMES.map(() => useRef<TimerSelectionRef>(null));
    const playerRefs = useMemo(() => 
        Object.fromEntries(
            Constants.PLAYER_NAMES.map((playerName, index) => [playerName, playerRefsArray[index]])
        ), []
    );

    const titleTextRef = useRef(''); // reference to the title input, used in textInput to prevent re-rendering, instead of using state directly
    
    //callbacks
    // handle change in stages for a specific player
    const updateStages = useCallback((player: string, stages: Stage[]) => {
        setPlayersStages(prev => ({
            ...prev,
            [player]: stages
        }));
        console.log(`Updated stages for ${player}:`, stages);
    }, []);

    // clock type selection for a specific player
    // use useCallback to always keep the same function reference
    const onSelectClockTypeForPlayer = useCallback((playerName: string, currentClockTypeId: number) => {
        router.push({
            pathname: '/play/clock_types/clock_types_list',
            params: {
                clock_type_id: String(currentClockTypeId),
                player_name: playerName
            }
        });
    }, []);

    const allPlayersHaveStages = useCallback(() =>  {
        const res = Object.values(playersStages)
            .every(playerStages => playerStages?.length > 0
        );
        console.log("All players have stages:", res);
        return res;
    }, [playersStages]);

    const resetParameters = () => {
        setTitle('');
        setPlayersStages(Object.fromEntries(Constants.PLAYER_NAMES.map(playerName => [playerName, []]))); // dictionary where key is player and value is empty array
        setPlayersClockTypes(Object.fromEntries(Constants.PLAYER_NAMES.map(playerName => [playerName, PresetTypes.FISCHER_INCREMENT.id]))); // reset clock types
        titleTextRef.current = '';
    }

    const onStartPreset = () => {

        const title = titleTextRef.current;

        const playerTimers: Timer[] = Object.entries(playerRefs).map(([playerName, ref]: [string, React.RefObject<TimerSelectionRef>]) => {
            const timer = (ref.current?.buildTimer(playerName)); // build timer for each player using the TimerSelection component
            return timer;
        });

        const newPreset = new Preset(playerTimers, title, true);
        storage.addCustomPreset(newPreset);

        // reset input parameters
        resetParameters(); 
        
        // navigate back to timers_custom first, then push to timer screen
        // This ensures proper navigation stack: timers_custom -> timer_interact
        router.dismissTo('/play/timers_custom');
        router.push({ // should be placed inside some timeout to ensure it runs after dismissing??
            pathname: '/play_more/timer_interact/interact', 
            params: {preset_id: newPreset.id}
        });
    }

    const onBack = () => {

        //reset input parameters
        resetParameters();

        //back to previous component
        router.back() 
    }

    const onChangeTitle = (text: string) => {
        titleTextRef.current = text;
        setTitle(text);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header 
                leftIcon={Constants.icons.clock_lines} 
                leftIconSize={16} 
                text={'New preset'} 
                rightIcon={Constants.icons.arrow_left} 
                rightIconSize={18} 
                onPressRightIcon={onBack}
            />
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                stickyHeaderIndices={[1]} // make the tabNavigator sticky (second child of scrollView)
                showsVerticalScrollIndicator={false}
            >
                {/* Banner */}
                <View style={styles.bannerWrapper}>
                    <Image source={Constants.images.banner1} style={styles.banner}/>
                </View>
                {/* Tabs */}
                <View style={styles.stickyTabContainer}>
                    {useMemo(() => (
                        <TabNavigator 
                            tabs = {
                                Object.fromEntries(
                                    Object.keys(playersStages).map((playerName) => 
                                        [playerName, (props) => (
                                            <TimerSelection 
                                                {...props} 
                                                ref={playerRefs[playerName]} 
                                                playerName={playerName} 
                                                onUpdateStages={(stages: Stage[]) => updateStages(playerName, stages)}
                                                clockTypeId={playersClockTypes[playerName]}
                                                onSelectClockTypeId={(clockTypeId: number) => onSelectClockTypeForPlayer(playerName, clockTypeId)}
                                            />
                                        )]
                                    ))
                            }
                            icons = {
                                Object.fromEntries(
                                    Object.keys(playersStages).map((playerName, idx) =>
                                        [playerName, idx === 0 ? Constants.icons.pawn : Constants.icons.pawn_full] // assign pawn_full icon to all players except the first one
                                    )
                                )
                            }
                            swipeEnabled={false}
                            initialTabIndex={initialTabIndex}
                        />
                        ), [playersClockTypes])
                    }
                </View>
            </ScrollView>
            {/* Fixed Bottom Section */}
            <View style={styles.bottomFixedContainer}>
                <View style={[Styles.newPreset.sectionContainer]}>
                    <View style={[Styles.newPreset.sectionTitleContainer]}>
                        <Text style={Styles.newPreset.sectionTitleText}>Title</Text>
                    </View>
                    <View style={Styles.newPreset.sectionContent}>
                        <Text style={Styles.newPreset.titleText}>Name:</Text>
                        <TextInput 
                            style={[Styles.newPreset.titleInput]} 
                            placeholder="New preset" 
                            placeholderTextColor={Constants.COLORS.line_light_grey}
                            onChangeText={onChangeTitle}
                            value={title}
                        />
                    </View>
                </View>
                <View style={styles.startButtonContainer}>
                    <ActionButton 
                        source={Constants.icons.hourglass} 
                        text="Start" 
                        height={45} 
                        iconSize={20} 
                        fontSize={Constants.SIZES.xxLarge} 
                        componentStyle={styles.startButton}
                        onPress={onStartPreset}
                        disabled={!allPlayersHaveStages() || title === ''}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Constants.COLORS.white,
    },

    contentContainer: {
        flex: 1
    },

    scrollView: {
        // borderWidth: 5,
        // borderColor: Constants.COLORS.preset_yellow,
    },

    scrollContent: {
        flex: 1,
        minHeight: 900,
    },

    bannerWrapper: {
        aspectRatio: 16/9.3,
        overflow: 'hidden'
    },

    banner: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    
    stickyTabContainer: {
        elevation: 5, 
        zIndex: 5, // ensure the tab navigator is above the scroll view content
        flexGrow: 1,
        // borderWidth: 3,
        // borderColor: Constants.COLORS.preset_green
    },

    bottomFixedContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // backgroundColor: Constants.COLORS.white,
        // borderTopWidth: 5,
        // borderTopColor: Constants.COLORS.line_light_grey,
        marginTop: 10
    },
    
    startButtonContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },

    startButton: {
        marginTop: 30
    },
});

export default Stages;