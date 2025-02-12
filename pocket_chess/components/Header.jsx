import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard } from 'react-native'
import * as Constants from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const Header = ({leftIcon, leftIconSize, text, rightIcon, rightIconSize, onPressRightIcon, lowBorder=false, curvyTop=false}) => {
    return (
        <View style={
                [styles.containerHeader, 
                lowBorder ? {borderBottomWidth: 1, borderColor: Constants.COLORS.line_light_grey} : null,
                curvyTop ? {borderTopLeftRadius: 10, borderTopRightRadius: 10} : null
            ]}>
            <View style={styles.containerHeaderLeft}>
                <IconComponent source={leftIcon} width={leftIconSize} tintColor={Constants.COLORS.text_dark}/>
                <Text style={styles.containerHeaderText}>{text}</Text>
            </View>
            <TouchableOpacity style={styles.containerHeaderRight} onPress={onPressRightIcon}>
                <IconComponent source={rightIcon} width={rightIconSize} tintColor={Constants.COLORS.text_dark_2}/>
            </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({

    containerHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        minHeight: 40,
        backgroundColor: Constants.COLORS.white
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
        color: Constants.COLORS.text_dark,
        marginLeft: 8
    },     
    containerHeaderRight: {
    }
});

export default Header;