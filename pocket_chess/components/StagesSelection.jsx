import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard } from 'react-native'

import * as Constants from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import { Time, Stage, Timer } from '../classes/Timer.js';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const StagesSelection = forwardRef(({}, ref) => { // expose the ref to the parent component

    const [baseTime, setBaseTime] = useState(new Time()); // track base time
    const [increment, setIncrement] = useState(new Time()); // track increment time
    const [stages, setStages] = useState([]); // track stages 

    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        stages
        // width,
        // height
    }));

    return (
        <View style={styles.container}>
            <View>
                <Text>Add stage</Text>
            </View>
            <View style={styles.counter}>
                <View style={styles.numberInputs}>
                    <TouchableOpacity style={styles.time} onPress={() => {}}>
                        <View style={styles.timeTitle}>
                            <IconComponent source={Constants.icons.clock_full} width={15} />
                            <Text style={styles.timeTitleText}>Base time</Text>
                        </View>
                        <Text style={[styles.timeInput, {color: baseTime.isDefault() ? Constants.COLORS.line_light_grey : Constants.COLORS.text_dark_2}]}>{baseTime.toStringComplete()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.time} onPress={() => {}}>
                        <View style={styles.timeTitle}>
                            <IconComponent source={Constants.icons.plus_thick} width={12} tintColor={Constants.COLORS.contrast_blue_light}/>
                            <Text style={styles.timeTitleText}>Increment</Text>
                        </View>
                        <Text style={[styles.timeInput, {color: increment.isDefault() ? Constants.COLORS.line_light_grey : Constants.COLORS.text_dark_2}]}>{increment.toStringMinSecs()}</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <Text>Stages</Text>
                    <Text>Stages</Text>      
                    <Text>Stages</Text>    
                    <Text>Stages</Text>    
                    <Text>Stages</Text>    
                            
                </View>
            </View>
        </View>
    )
});

const styles = StyleSheet.create({

    container: {
        backgroundColor: Constants.COLORS.white,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%'
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
        marginLeft: 7,
        borderColor: Constants.COLORS.line_light_grey,
    },

    timeInput: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
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

export default StagesSelection;