import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useReducer, useMemo } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TextInput, Image, Text } from 'react-native'
import { router} from 'expo-router';

import * as Constants from '../../../../constants/index.js';
import * as Styles from '../../../../styles/index.js';
import { Time, Stage, Timer, Preset } from '../../../../classes/Preset.js';
import { FischerIncrementStage, FischerIncrementTimer } from '../../../../classes/Preset.js';
import Header from '../../../../components/Header.jsx';
import ActionButton from '../../../../components/common/ActionButton.jsx';
import storage from '../../../../classes/Storage.js';
import TabNavigator from '../../../../components/TabNavigator.jsx';
import StagesSelection from '../../../../components/StagesSelection.jsx';

const Stages = ({}) => { // expose the ref to the parent component

    const [title, setTitle] = useState(''); // title of the preset
    const titleTextRef = useRef(''); // reference to the title input, used in textInput to prevent re-rendering, instead of using state directly

    const [playersStages, setPlayersStages] = useState(
        Object.fromEntries(Constants.PLAYER_NAMES.map(playerName => [playerName, []])) // dictionary where key is player and value is empty array
    );

    const updateStages = useCallback((player: string, stages: Stage[]) => {
        setPlayersStages(prev => ({
            ...prev,
            [player]: stages
          }));
    }, []);

    const allPlayersHaveStages = useCallback(() =>  {
        return Object.values(playersStages)
            .every(stages => 
                stages?.length > 0
        );
    }, [playersStages]);

    const resetParameters = () => {
        setTitle('');
        setPlayersStages(Object.fromEntries(Constants.PLAYER_NAMES.map(playerName => [playerName, []]))); // dictionary where key is player and value is empty array
        titleTextRef.current = '';
    }

    const onStartPreset = () => {

        const title = titleTextRef.current;
        const timers = Object.entries(playersStages).map(([playerName, stages]) => {
            return new FischerIncrementTimer(stages as [FischerIncrementStage], playerName);
        })
        const newPreset = new Preset(timers, title, true);
        const customPresets = storage.getCustomPresets();
        customPresets.custom.presets.push(newPreset);
        storage.setCustomPresets(customPresets);

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

    const onBack = (refreshPrevPage=false) => {

        //reset input parameters
        resetParameters();

        //back to previous component
        router.back() 
        router.setParams({ refresh: refreshPrevPage ? 'true' : 'false' }); // indicate to other component if it should refresh
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
                                        Object.entries(playersStages).map(([playerName, stages]) => 
                                            [playerName, (props) => <StagesSelection {...props} stages={stages} onUpdateStages={(stages: Stage[]) => updateStages(playerName, stages)}/>]
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
                            />
                        ), [updateStages])
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
        fontWeight: Constants.FONTS.medium,
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