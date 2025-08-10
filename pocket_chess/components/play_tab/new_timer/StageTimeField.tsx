import { View, Text, TouchableOpacity} from 'react-native'
import { useState, useRef, forwardRef, useImperativeHandle } from 'react';

import * as Constants from '../../../constants/index';
import * as Styles from '../../../styles/index.js';

import IconComponent from '../../common/IconComponent.jsx';
import { Time} from '../../../classes/timers_base/Preset';
import ModalTimerPicker from '../../ModalTimerPicker';

interface StageTimeFieldRef {
  getTime: () => Time;
  reset: () => void;
}

interface StageTimeFieldProps {
  icon: Constants.IconType;
  title: string;
  onChange?: (time: any) => void;
  hideHours?: boolean;
  iconSize?: number;
}

const StageTimeField = forwardRef<StageTimeFieldRef,StageTimeFieldProps>(
    ({icon,  title, onChange=null, hideHours=false, iconSize=15}, ref) => {

    //functions for parent
    useImperativeHandle(ref, () => ({
        reset,
        getTime: () => time
    }));

    // state
    const [time, setTime] = useState(new Time()); // track time

    // refs
    const timePickerRef = useRef(null);

    // other funcs
    const showTimePicker = () => {
        timePickerRef.current?.showModal();
    }

    const reset = () => {
        setTime(new Time());
    }

    const changeTime = (time) => {
        setTime(time);
        onChange?.(time);
    }

    return (
        <TouchableOpacity style={[Styles.newPreset.timeContainer]} onPress={showTimePicker}>
            <View style={Styles.newPreset.timeTitle}>
                <IconComponent source={icon} width={iconSize} />
                <Text style={Styles.newPreset.timeTitleText}>{title}</Text>
            </View>
            <Text style={[Styles.newPreset.timeInput, {color: time.isDefault() ? Constants.COLORS.line_light_grey : Constants.COLORS.text_dark_2}]}>{time.toStringComplete()}</Text>
            <ModalTimerPicker ref={timePickerRef} time={time} setTime={changeTime} hideHours={hideHours} fullScreen={false} headerText={title} headerLeftIcon={icon} headerRightIcon={Constants.icons.cross}/>
        </TouchableOpacity>
    )
});

export default StageTimeField;
export type { StageTimeFieldRef };
