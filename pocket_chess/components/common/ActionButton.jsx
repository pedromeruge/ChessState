import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import IconComponent from './IconComponent.jsx';
import * as Constants from '../../constants';

//default button to be used throughout the app 

const ActionButton = ({ source, text, onPress, size=36, textColor=Constants.COLORS.white, backColor=Constants.COLORS.contrast_red_dark}) => {
  if (!source) {
    console.warn("Icon source is missing!");
    return null;
  }

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      height: size,
      backgroundColor: backColor,
      textColor: textColor,
      paddingVertical: 0.05 * size,
      paddingHorizontal: 0.4 * size,
      alignItems: 'center',
      borderRadius: 10

    },
    icon: {
      flex: 1,
    },
    text: {
      marginLeft: 0.4 * size,
      color: textColor,
      fontSize: Constants.SIZES.xLarge,
      fontWeight: Constants.FONTS.medium,
      textAlign: 'center',
      paddingBottom: 2 // text seemed too low in the button, with just center
    }
  });

return (
  <TouchableOpacity onPress={onPress} style={[styles.button, {backgroundColor: backColor}]}>
    <IconComponent style={styles.icon} source={source} width={size * 0.6} height={size/2} tintColor={textColor}/>
    <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>
);

};
export default ActionButton;