import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard } from 'react-native'
import * as Constants from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import ActionButton from './common/ActionButton.jsx';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const NewTimerScreen1 = forwardRef(({onClose, onShowBaseTimePicker, onShowIncrementPicker, onLayout}, ref) => { // expose the ref to the parent component

    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // state to alter container layout when keyboard is visible

    const [titleText, setTitleText] = useState('');
    
    const showScreen = () => {
        setIsKeyboardVisible(false);
    }

    const hideScreen = () => {
        Keyboard.dismiss();
        setIsKeyboardVisible(false);
    }
    
    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        showScreen,
        hideScreen,
        // titleText,
        // width,
        // height
    }));

    const handleLayout = (event) => {
        const { width, height } = event.nativeEvent.layout;
        onLayout({ width, height });
        console.log("Modal size: ", width, height);
    };

    const onStartTimer = () => {
        console.log("Timer started");
    }

    const onAdvancedOptions = () => {
        console.log("More options");
    }

    return (
        <SafeAreaView style={[styles.container, Constants.SHADOWS.medium]} onLayout={handleLayout}>
            <View style={styles.containerHeader}>
                <View style={styles.containerHeaderLeft}>
                    <IconComponent source={Constants.icons.clock_lines} width={20} tintColor={Constants.COLORS.black}/>
                    <Text style={styles.containerHeaderText}>New timer</Text>
                </View>
                <TouchableOpacity style={styles.containerHeaderRight} onPress={onClose}>
                    <IconComponent source={Constants.icons.cross} width={14} tintColor={Constants.COLORS.black}/>
                </TouchableOpacity>
            </View>
            <View>
                {!isKeyboardVisible && (
                    <View style={styles.bannerWrapper}>
                        <Image source={Constants.images.banner1} style={styles.banner}/>
                    </View>
                )}
                <View style={styles.counter}>
                    <View style={styles.numberInputs}>
                        <TouchableOpacity style={styles.time} onPress={onShowBaseTimePicker}>
                            <View style={styles.timeTitle}>
                                <IconComponent source={Constants.icons.clock_full} width={15} />
                                <Text style={styles.timeTitleText}>Base time</Text>
                            </View>
                            <TouchableOpacity >
                                <TextInput placeholder="00:00:00" editable={false} selectTextOnFocus={false} placeholderTextColor={Constants.COLORS.line_light_grey} style={styles.timeInput}/>
                            </TouchableOpacity>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.time} onPress={onShowIncrementPicker}>
                            <View style={styles.timeTitle}>
                                <IconComponent source={Constants.icons.plus_thick} width={12} tintColor={Constants.COLORS.contrast_blue_light}/>
                                <Text style={styles.timeTitleText}>Increment</Text>
                            </View>
                            <TouchableOpacity >
                                <TextInput placeholder="00:00" editable={false} selectTextOnFocus={false} placeholderTextColor={Constants.COLORS.line_light_grey} style={styles.timeInput}/>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.title}>
                        <Text style={styles.titleText}>Title:</Text>
                        <TextInput style={styles.titleInput} placeholder="New timer" placeholderTextColor={Constants.COLORS.line_light_grey}
                            onFocus={() => setIsKeyboardVisible(true)}
                            onBlur={() => setIsKeyboardVisible(false)}
                        />
                    </View>
                    <ActionButton source={Constants.icons.hourglass} text="Start" height={45} iconSize={20} fontSize={Constants.SIZES.xxLarge} componentStyle={styles.startButton}
                        onPress={() => onStartTimer()}
                    />
                    <TouchableOpacity style={styles.moreOptionsButton} onPress={() => onAdvancedOptions()}>
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

    containerHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        minHeight: 40,
    },
    containerHeaderLeft: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    containerHeaderText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.bold,
        fontColor: Constants.COLORS.text_dark,
        marginLeft: 8
    },     
    containerHeaderRight: {
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

    time: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderWidth: 1,
        borderColor: Constants.COLORS.line_light_grey,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingTop: 5,
        paddingBottom: 10,
        rowGap: 7
    },

    timeTitle: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    timeTitleText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        fontColor: Constants.COLORS.text_grey,
        marginLeft: 7,
        borderColor: Constants.COLORS.line_light_grey,
    },

    timeInput: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        fontColor: Constants.COLORS.text_grey,
        borderBottomWidth: 1,
        paddingBottom: 0,
        borderColor: Constants.COLORS.line_light_grey,
    },

    title: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    titleText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        fontColor: Constants.COLORS.text_grey,
    },
    titleInput: {
        flex: 1,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        fontColor: Constants.COLORS.line_light_grey,
        marginLeft: 10,
        borderBottomWidth: 1,
        paddingBottom: 0,
        paddingTop: 0,
        borderColor: Constants.COLORS.line_light_grey,
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

export default NewTimerScreen1;