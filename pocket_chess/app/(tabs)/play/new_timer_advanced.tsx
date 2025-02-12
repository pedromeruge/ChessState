import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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

    const tabNavigatorRef = useRef<{ getRefs: () => { [key: string]: { current: { stages: any } } } } | null>(null)
    const [titleText, setTitleText] = useState('asd');
    const [playerTimers, setPlayerTimers] = useState({});
    const [isStartButtonEnabled, setIsStartButtonEnabled] = useState(false);
    
    const allPlayersHaveStages = () => {
        const allRefs = tabNavigatorRef.current?.getRefs();
        if (!allRefs) return false;
        
        return Object.values(allRefs)
            .every(playerRef => 
                playerRef.current?.stages?.length > 0
        );
    }

    const onStartTimer = () => {
        console.log("All players have stages:", allPlayersHaveStages());
        const allRefs = tabNavigatorRef.current?.getRefs();
        console.log("All child refs:", allRefs);

        Object.entries(allRefs).forEach(([player, playerRef]) => {
            console.log(`Stages for ${player}:`, playerRef.current?.stages);
        });
       
        // const customTimers = storage.getCustomTimers();
        // customTimers.custom.timers.push(newTimer);
        // storage.setCustomTimers(customTimers);

        //reset input parameters
    }

    const onBack = () => {
        router.back() // go back to the play screen

        //reset input parameters
    }

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
                        <TabNavigator 
                            ref = {tabNavigatorRef}
                            tabs = {{
                                "Player White": StagesSelection,
                                "Player Black": StagesSelection
                            }}
                            icons = {{
                                "Player White": Constants.icons.pawn,
                                "Player Black": Constants.icons.pawn_full
                            }}
                            swipeEnabled={false}
                        />
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
                                onChangeText={setTitleText}
                                value={titleText}
                            />
                        </View>
                    </View>
                    <View style={styles.startButtonContainer}>
                        <ActionButton source={Constants.icons.hourglass} text="Start" height={45} iconSize={20} fontSize={Constants.SIZES.xxLarge} componentStyle={styles.startButton}
                            onPress={onStartTimer}
                            disabled={!allPlayersHaveStages() || titleText === ''}
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