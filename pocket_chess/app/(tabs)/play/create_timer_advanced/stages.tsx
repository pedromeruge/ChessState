import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useReducer, useMemo } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TextInput, Image, Text, TextStyle } from 'react-native'
import { router, useLocalSearchParams} from 'expo-router';

import * as Constants from '../../../../constants/index';
import * as Styles from '../../../../styles/index.js';
import Preset, { Stage, Timer } from '../../../../classes/timers_base/Preset';
import Header from '../../../../components/common/Header.jsx';
import ActionButton from '../../../../components/common/ActionButton.jsx';
import storage from '../../../../classes/Storage';
import TabNavigator from '../../../../components/TabNavigator';
import TimerSelection, { TimerSelectionRef } from '../../../../components/play_tab/new_timer/TimerSelection';
import PresetType, { PresetTypes, PresetIdToTypes } from '../../../../classes/PresetType';

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
                setPlayersClockTypes(prev => ({
                    ...prev,
                    [playerNameString]: clockTypeIdNumber
                }));

                console.log(`Updated clock type for ${playerNameString} to:`, PresetIdToTypes[clockTypeIdNumber].name);
            }

            // clear the selecting player after update
            setInitialTabIndex(Constants.PLAYER_NAMES.indexOf(playerNameString));
        }
    }, [clock_type_id, player_name]);

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
    }, []);

    // clock type selection for a specific player
    const onSelectClockTypeForPlayer = (playerName: string, currentClockTypeId: number) => {
        
        router.push({
            pathname: '/play/clock_types/clock_types_list',
            params: {
                clock_type_id: String(currentClockTypeId),
                player_name: playerName
            }
        });
    };

    const allPlayersHaveStages = useCallback(() =>  {
        return Object.values(playersStages)
            .every(playerStages => playerStages?.length > 0
        );
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
            <Header leftIcon={Constants.icons.clock_lines} leftIconSize={16} text={'New preset'} rightIcon={Constants.icons.arrow_left} rightIconSize={18} 
                onPressRightIcon={onBack}
            />
            <View style={styles.scrollContainer}>
                <ScrollView 
                    contentContainerStyle={styles.scrollView}>
                    <View style={styles.bannerWrapper}>
                        <Image source={Constants.images.banner1} style={styles.banner}/>
                    </View>
                    <View style={styles.tabNavigatorWrapper}>
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
                        ), [updateStages, playersClockTypes, onSelectClockTypeForPlayer, initialTabIndex])
                        }
                    </View>
                    {/* <View style={styles.separationLine}></View> */}
                    <View style={Styles.newPreset.sectionContainer}>
                        <View style={Styles.newPreset.sectionTitleContainer}>
                            <Text style={Styles.newPreset.sectionTitleText}>Title</Text>
                        </View>
                        <View style={styles.titleSectionContent}>
                            <Text style={styles.titleSectionText}>Name:</Text>
                            <TextInput 
                                style={Styles.newPreset.titleInput} 
                                placeholder="New preset" 
                                placeholderTextColor={Constants.COLORS.line_light_grey}
                                onChangeText={onChangeTitle}
                                value={title}
                            />
                        </View>
                    </View>
                    <View style={styles.startButtonContainer}>
                        <ActionButton source={Constants.icons.hourglass} text="Start" height={45} iconSize={20} fontSize={Constants.SIZES.xxLarge} componentStyle={styles.startButton}
                            onPress={onStartPreset}
                            disabled={!allPlayersHaveStages() || title === ''}
                            />
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Constants.COLORS.white,
    },

    scrollContainer: {
        flex:1
    },

    scrollView: {
        justifyContent: 'flex-start',
        flexGrow: 1
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
    
    tabNavigatorWrapper: {
        width: '100%',
        flexGrow: 1
    },

    titleSectionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: 10
    },
    
    titleSectionText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
        color: Constants.COLORS.text_grey,
    },

    separationLine: {
        marginVertical: 5,
        width: '45%',
        height: 2,
        alignSelf: 'center',
        backgroundColor: Constants.COLORS.line_light_grey,
        borderRadius: 5,
        
    },

    startButtonContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40
    },

    startButton: {
        marginTop: 30
    },
});

export default Stages;