import { View, Text, TouchableOpacity, TextInput} from 'react-native'
import { useState, useRef, forwardRef, useImperativeHandle } from 'react';

import * as Constants from '../../../constants/index';
import * as Styles from '../../../styles/index.js';

import IconComponent from '../../common/IconComponent.jsx';

interface StageNumberFieldRef {
  getNumber: () => number;
  reset: () => void;
}

interface StageNumberFieldProps {
  icon: Constants.IconType;
  title: string;
  onChange?: (time: any) => void;
  startValue?: number; // initial value of the field
  maxLength?: number; // max size of number input
  iconSize?: number;
  hideBorders?: boolean; // hide the grey outlines of the field squarish shape
}

const StageNumberField = forwardRef<StageNumberFieldRef, StageNumberFieldProps>(
    ({ title, icon=null, onChange=null, startValue=null, maxLength=4, iconSize=12, hideBorders=false}, ref) => {

    //functions for parent
    useImperativeHandle(ref, () => ({
        reset,
        getNumber: () => number
    }));

    // state
    const [number, setNumber] = useState(startValue); // track number

    // refs
    const numberInputRef = useRef(null);

    // other funcs
    const onChangeNumber = (text) => {
        setNumber(text.replace(/[^0-9]/g, ''));
        onChange?.(text.replace(/[^0-9]/g, ''));
    };

    // Focus on the moves textinput when bigger moves square is pressed
    const handlePressField = () => {
        numberInputRef.current?.focus();
    }

    const reset = () => {
        setNumber(null);
    }

    return (
        <TouchableOpacity style={[Styles.newPreset.timeContainer, hideBorders && { borderWidth: 0 }]} onPress={handlePressField}>
            <View style={[Styles.newPreset.timeTitle]}>
                { icon != null && (
                    <IconComponent source={icon} width={iconSize} tintColor={Constants.COLORS.contrast_blue_light}/>
                )}
                <Text style={[Styles.newPreset.timeTitleText, hideBorders && {marginLeft: 0}]}>{title}</Text>
            </View>
            <TextInput 
                ref={numberInputRef}
                style={Styles.newPreset.timeInput}
                placeholder="∞"
                placeholderTextColor={Constants.COLORS.line_light_grey}
                keyboardType='numeric'
                onChangeText={(text) => onChangeNumber(text)}
                value={number ? String(number) : ''}
                maxLength={maxLength}
                />
        </TouchableOpacity>
    )
});

export default StageNumberField;

export type { StageNumberFieldRef };