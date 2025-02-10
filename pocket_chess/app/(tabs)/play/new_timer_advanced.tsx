import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, Modal, Pressable, Image, Text } from 'react-native'
import { router} from 'expo-router';

import * as Constants from '../../../constants/index.js';
import { Time, Stage, Timer } from '../../../classes/Timer.js';
import Header from '../../../components/Header.jsx';
import ActionButton from '../../../components/common/ActionButton.jsx';
import storage from '../../../classes/Storage';
import TabNavigator from '../../../components/TabNavigator.jsx';
import StagesSelection from '../../../components/StagesSelection.jsx';

const NewTimerAdvanced = ({}) => { // expose the ref to the parent component

    const [baseTime, setBaseTime] = useState(new Time()); // track base time
    const [incrementTime, setIncrementTime] = useState(new Time()); // track increment time
    const [titleText, setTitleText] = useState('');

    // refs for the time picker roulettes for base time and increment
    const startScreenRef = useRef(null);
    const baseTimePickerRef = useRef(null);
    const incrementPickerRef = useRef(null);
    
    const onStartTimer = () => {
        const newTimer = new Timer([new Stage(baseTime, incrementTime)], titleText);
        const customTimers = storage.getCustomTimers();

        customTimers.custom.timers.push(newTimer);
        storage.setCustomTimers(customTimers);

        //reset input parameters
        setBaseTime(new Time());
        setIncrementTime(new Time());
        setTitleText('');
    }

    const onBack = () => {
        router.back() // go back to the play screen

        //reset input parameters
        setBaseTime(new Time());
        setIncrementTime(new Time());
        setTitleText('');
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header leftIcon={Constants.icons.clock_lines} leftIconSize={16} text={'New timer'} rightIcon={Constants.icons.arrow_left} rightIconSize={18} 
                onPressRightIcon={onBack}
            />
            <ScrollView contentContainerStyle={styles.scrollView}> 
                <View style={styles.bannerWrapper}>
                    <Image source={Constants.images.banner1} style={styles.banner}/>
                </View>
                <View style={styles.tabNavigatorWrapper}>
                    <TabNavigator 
                        tabs = {{
                            "Player White": StagesSelection,
                            "Player Black": StagesSelection
                        }}
                        icons = {{
                            "Player White": Constants.icons.player_white,
                            "Player Black": Constants.icons.player_black
                        }}
                        swipeEnabled={false}
                    />
                </View>
                <Text style={{padding: 20}}>Filler text... asdfkmaskdfaksdfm. ...asd</Text>
                <ActionButton source={Constants.icons.hourglass} text="Start" height={45} iconSize={20} fontSize={Constants.SIZES.xxLarge} componentStyle={styles.startButton}
                    onPress={onStartTimer}
                    disabled={(baseTime.isDefault())|| titleText === ''}
                />
            </ScrollView>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: Constants.COLORS.white,
        flex: 1,
        width: '100%'
    },

    scrollView: {
        justifyContent: 'flex-start',
        flex: 1
    },
    bannerWrapper: {
        width: '100%',
        aspectRatio: 16/9.3,
        overflow: 'hidden'
    },
    banner: {
        width: '100%',
        height: '100%',
        aspectRatio: 16/9.3
    },
    tabNavigatorWrapper: {
        flexGrow: 1,
        width: '100%',
    },

    startButton: {
        marginTop: 30
    },
});

export default NewTimerAdvanced;