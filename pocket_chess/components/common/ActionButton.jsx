import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import IconComponent from './IconComponent.jsx';
import * as Constants from '../../constants';

//default button to be used throughout the app 

const ActionButton = ({ source, text, onPress,  height=45, width=null, iconSize=null, fontSize=Constants.SIZES.medium, textColor=Constants.COLORS.white, backColor=Constants.COLORS.contrast_red_light, componentStyle=null, textStyle=null}) => {
  if (!source) {
    console.warn("Icon source is missing!");
    return null;
  }

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      height: height,
      width: width? width : 3*height,
      backgroundColor: backColor,
      textColor: textColor,
      paddingVertical: 0.05 * height,
      paddingHorizontal: 0.4 * height,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10

    },
    icon: {
      width: iconSize? iconSize : 0.5 * height,
      height: iconSize? iconSize : 0.5 * height,
      tintColor: textColor
    },
    text: {
      marginLeft: 0.3 * height,
      color: textColor,
      fontSize: fontSize,
      fontWeight: Constants.FONTS.medium,
      fontFamily: Constants.FONTS.BASE_FONT_NAME,
      textAlign: 'center',
      paddingBottom: 2 // text seemed too low in the button, with just center
    }
  });

return (
  <TouchableOpacity onPress={onPress} style={[styles.button, {backgroundColor: backColor}, componentStyle, Constants.SHADOWS.medium]}>
    <IconComponent style={styles.icon} source={source} tintColor={textColor}/>
    <Text style={[styles.text, textStyle]}>{text}</Text>
  </TouchableOpacity>
);

};
export default ActionButton ;