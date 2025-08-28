import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, Pressable, TextInput, Keyboard } from 'react-native'
import * as Constants from '../../constants/index';
import IconComponent from './IconComponent.jsx';
import { router } from 'expo-router';

const Header = ({leftIcon, leftIconSize, text, rightIcon, rightIconSize, onPressRightIcon=()=>{router.back()}, lowBorder=false, curvyTop=false, fullWidth=true}) => {
    return (
        <View style={
                [styles.ModalContainerHeader,
                fullWidth && styles.fullWidthContainerHeader, 
                lowBorder && {borderBottomWidth: 1, borderColor: Constants.COLORS.line_light_grey},
                curvyTop && {borderTopLeftRadius: 10, borderTopRightRadius: 10},
                fullWidth && {width: '100%'}
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

    fullWidthContainerHeader: {
        width: '100%',
    },
    
    ModalContainerHeader: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        minHeight: 40,
        backgroundColor: Constants.COLORS.white,
        alignSelf: 'stretch', // stretch to fit full width of parent container
        zIndex: 5
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