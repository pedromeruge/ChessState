import React, { useState }  from 'react';
import { TouchableOpacity } from 'react-native';
import IconComponent from './IconComponent';
import * as Styles from '../../styles/index';

// Icon with on and off state, that triggers an onPress function

// NOTE: addStyle -> applies to the iconComponent
//       style    -> applies to the TouchableOpacity

const ActionIcon = ({ source_on, source_off=null, onPress, startOn=true, width=null, tintColor=null, disabled=false, opacity=1.0, addStyle=null, ...props}) => {
  
  if (!source_on) {
    console.warn("Icon source is missing!");
    return null;
  }

  const [isOn, setIsOn] = useState(startOn);

  function onPressIcon() {
    if (disabled) return;

    if (source_off !== null) { // if we want toggle behaviour, source_off must have been provided
      setIsOn(!isOn);
    }
    onPress();
  }

  return (
    <TouchableOpacity 
      onPress={onPressIcon}
      {...props}
    >
      <IconComponent 
        source={isOn ? source_on : source_off} 
        width={width} tintColor={tintColor} opacity={opacity} 
        addStyle={[addStyle, disabled ? Styles.common.disabled : null]} {...props} />
    </TouchableOpacity>
  )
};
export default ActionIcon;