import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard } from 'react-native'
import { useRouter } from 'expo-router';

import * as Constants from '../constants/index.js';
import * as Styles from '../styles/index.js';
import IconComponent from './common/IconComponent.jsx';
import ActionButton from './common/ActionButton.jsx';
import Header from './Header.jsx';

const NewTimerScreenBase = forwardRef(({
        onStart,
        onClose, 
        onShowBaseTimePicker, 
        onShowIncrementPicker, 
        baseTime, 
        increment, 
        titleText, 
        setTitleText, 
        onLayout}
        , ref) => { // expose the ref to the parent component
    
    const router = useRouter();

    //state
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // state to alter container layout when keyboard is visible
    const [userHasInputTitle, setUserHasInputTitle] = useState(false); // track if user has input a title, to manage auto-suggestions

    const showScreen = () => {
        setIsKeyboardVisible(false);
    }

    const hideScreen = () => {
        Keyboard.dismiss();
        setIsKeyboardVisible(false);
    }
    
    const handleKeyboardInputEnd = () => {
        setIsKeyboardVisible(false);
        if (titleText !== '') { // if the user has stopped typing, and there is text, then the user has input a title
            setUserHasInputTitle(true);
            console.log("User has input a title");
        }
        console.log("Keyboard input ended");
    }

    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        showScreen,
        hideScreen,
        titleText,
        userHasInputTitle
        // width,
        // height
    }));

    const handleLayout = (event) => {
        const { width, height } = event.nativeEvent.layout;
        onLayout({ width, height });
    };

    const onStartTimer = () => {
        onStart();
    }

    const onAdvancedOptions = () => {
        onClose();
        router.replace('/play/create_timer_advanced/stages');
    }

    return (
        <SafeAreaView style={[styles.container, Constants.SHADOWS.medium]} onLayout={handleLayout}>
            <Header leftIcon={Constants.icons.clock_lines} leftIconSize={20} text="New timer" rightIcon={Constants.icons.cross} rightIconSize={14} onPressRightIcon={onClose}/>
            <View>
                {!isKeyboardVisible && (
                    <View style={styles.bannerWrapper}>
                        <Image source={Constants.images.banner1} style={styles.banner}/>
                    </View>
                )}
                <View style={styles.counter}>
                    <View style={styles.numberInputs}>
                        <TouchableOpacity style={Styles.newPreset.timeContainer} onPress={onShowBaseTimePicker}>
                            <View style={Styles.newPreset.timeTitle}>
                                <IconComponent source={Constants.icons.clock_full} width={15} />
                                <Text style={Styles.newPreset.timeTitleText}>Base time</Text>
                            </View>
                            <Text style={[Styles.newPreset.timeInput, {color: baseTime.isDefault() ? Constants.COLORS.line_light_grey : Constants.COLORS.text_dark_2}]}>{baseTime.toStringComplete()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.newPreset.timeContainer} onPress={onShowIncrementPicker}>
                            <View style={Styles.newPreset.timeTitle}>
                                <IconComponent source={Constants.icons.plus_thick} width={12} tintColor={Constants.COLORS.contrast_blue_light}/>
                                <Text style={Styles.newPreset.timeTitleText}>Increment</Text>
                            </View>
                            <Text style={[Styles.newPreset.timeInput, {color: increment.isDefault() ? Constants.COLORS.line_light_grey : Constants.COLORS.text_dark_2}]}>{increment.toStringMinSecs()}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={Styles.newPreset.title}>
                        <Text style={Styles.newPreset.titleText}>Title:</Text>
                        <TextInput style={[Styles.newPreset.titleInput, {color: titleText ? Constants.COLORS.text_dark_2 : Constants.COLORS.line_light_grey}]} placeholder="New timer" placeholderTextColor={Constants.COLORS.line_light_grey}
                            onFocus={() => setIsKeyboardVisible(true)}
                            onBlur={() => handleKeyboardInputEnd()}
                            onChangeText={setTitleText}
                            value={titleText}
                        />
                    </View>
                    <ActionButton source={Constants.icons.hourglass} text="Start" height={45} iconSize={20} fontSize={Constants.SIZES.xxLarge} componentStyle={styles.startButton}
                        onPress={onStartTimer}
                        disabled={(baseTime.isDefault())|| titleText === ''}
                    />
                    <TouchableOpacity style={styles.moreOptionsButton} onPress={onAdvancedOptions}>
                        <Text style={styles.moreOptionsButtonText}>Advanced options</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
});

const styles = StyleSheet.create({

    container: {
        backgroundColor: Constants.COLORS.white,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '80%',
        maxWidth: 400,
        maxHeight: '90%',
        overflow: 'hidden'

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

    counter: {
        flexDirection: 'column',
        paddingHorizontal: 25,
        paddingVertical: 20,
        alignItems: 'center',
        width: '100%'
    },

    numberInputs: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        columnGap: '10%'
    },

    startButton: {
        marginTop: 30
    },

    moreOptionsButton: {
        marginTop: 12
    },

    moreOptionsButtonText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.regular,
        color: Constants.COLORS.contrast_blue_light,
    }
});

export default NewTimerScreenBase;