import React, { useState }  from 'react';
import { TouchableOpacity, Text, StyleSheet, TextStyle } from 'react-native';
import IconComponent from './IconComponent';
import * as Constants from '../../constants';

// Icon with on and off state, that triggers an onPress function
const SmallActionButton = ({onPress, text, icon, width=12, backgroundColor=Constants.COLORS.white, textColor=Constants.COLORS.text_dark_2, borderColor=Constants.COLORS.line_light_grey}) => {

  return (
    <TouchableOpacity 
        onPress={onPress} 
        style={[
          styles.button,
          {backgroundColor: backgroundColor},
          {borderColor: borderColor}
        ]}>
      <IconComponent source={icon} width={width} tintColor={textColor} />
      <Text style={[
          styles.buttonText,
          {color: textColor}
        ]}>
        {text}
      </Text>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    zIndex: 10
  },

  buttonText: {
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    marginHorizontal: 5
  },
})

export default SmallActionButton;