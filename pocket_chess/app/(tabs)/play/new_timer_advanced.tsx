import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, Modal, Pressable, Image, Text } from 'react-native'
import { router } from 'expo-router';

import * as Constants from '../../../constants/index.js';
import { Time, Stage, Timer } from '../../../classes/Timer.js';
import Header from '../../../components/Header.jsx';
import ActionButton from '../../../components/common/ActionButton.jsx';
import storage from '../../../classes/Storage';

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
            <ScrollView>
                <Header leftIcon={Constants.icons.clock_lines} leftIconSize={16} text={'New timer'} rightIcon={Constants.icons.arrow_left} rightIconSize={18} 
                    onPressRightIcon={onBack}
                />
                <View style={styles.bannerWrapper}>
                    <Image source={Constants.images.banner1} style={styles.banner}/>
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
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
    startButton: {
        marginTop: 30
    },
});

export default NewTimerAdvanced;