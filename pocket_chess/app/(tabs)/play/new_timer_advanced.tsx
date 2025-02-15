import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useReducer, useMemo } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TextInput, Image, Text } from 'react-native'
import { router} from 'expo-router';

import * as Constants from '../../../constants/index.js';
import * as Styles from '../../../styles/index.js';
import { Time, Stage, Timer } from '../../../classes/Timer.js';
import Header from '../../../components/Header.jsx';
import ActionButton from '../../../components/common/ActionButton.jsx';
import storage from '../../../classes/Storage';
import TabNavigator from '../../../components/TabNavigator.jsx';
import StagesSelection from '../../../components/StagesSelection.jsx';
import { all } from 'axios';

const NewTimerAdvanced = ({}) => { // expose the ref to the parent component

    const [title, setTitle] = useState(''); // title of the timer
    const titleTextRef = useRef(''); // reference to the title input, used in textInput to prevent re-rendering, instead of using state directly

    const [playersStages, setPlayersStages] = useState({
        "Player White": [],
        "Player Black": []
    });

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

    const onStartTimer = () => {
        console.log("All players have stages:", allPlayersHaveStages());
        console.log("All child refs:", Object.values(playersStages));

        Object.entries(playersStages).forEach(([player, playerStages]) => {
            console.log(`Stages for ${player}:`, playerStages);
        });
       
        const title = titleTextRef.current;
        console.log("Title:", title);
        // const customTimers = storage.getCustomTimers();
        // customTimers.custom.timers.push(newTimer);
        // storage.setCustomTimers(customTimers);

        //reset input parameters
    }

    const onBack = () => {
        router.back() // go back to the play screen

        //reset input parameters
    }

    const onChangeTitle = (text: string) => {
        titleTextRef.current = text;
        setTitle(text);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header leftIcon={Constants.icons.clock_lines} leftIconSize={16} text={'New timer'} rightIcon={Constants.icons.arrow_left} rightIconSize={18} 
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
                                tabs = {{
                                    "Player White": (props) => <StagesSelection {...props} onUpdateStages={(stages: Stage[]) => updateStages("Player White", stages)}/>,
                                    "Player Black": (props) => <StagesSelection {...props} onUpdateStages={(stages: Stage[]) => updateStages("Player Black", stages)}/>
                                }}
                                icons = {{
                                    "Player White": Constants.icons.pawn,
                                    "Player Black": Constants.icons.pawn_full
                                }}
                                swipeEnabled={false}
                            />
                        ), [updateStages])
                        }
                    </View>
                    {/* <View style={styles.separationLine}></View> */}
                    <View style={Styles.newTimer.sectionContainer}>
                        <View style={Styles.newTimer.sectionTitleContainer}>
                            <Text style={Styles.newTimer.sectionTitleText}>Title</Text>
                        </View>
                        <View style={styles.titleSectionContent}>
                            <Text style={styles.titleSectionText}>Name:</Text>
                            <TextInput 
                                style={Styles.newTimer.titleInput} 
                                placeholder="New timer" 
                                placeholderTextColor={Constants.COLORS.line_light_grey}
                                onChangeText={onChangeTitle}
                                value={title}
                            />
                        </View>
                    </View>
                    <View style={styles.startButtonContainer}>
                        <ActionButton source={Constants.icons.hourglass} text="Start" height={45} iconSize={20} fontSize={Constants.SIZES.xxLarge} componentStyle={styles.startButton}
                            onPress={onStartTimer}
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

export default NewTimerAdvanced;