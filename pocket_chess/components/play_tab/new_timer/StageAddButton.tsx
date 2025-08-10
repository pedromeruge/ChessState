import { Text, TouchableOpacity, StyleSheet, TextStyle} from 'react-native'

import * as Constants from '../../../constants/index.js';

import IconComponent from '../../common/IconComponent.jsx';

interface StageAddButtonProps {
    onPress: () => void;
    disabled?: boolean;
    icon?: any;
    text?: string;
    vertical?: boolean;
    iconSize?: number;
}

interface StageAddButtonRef {}

const StageAddButton = ({onPress, disabled=true, icon=Constants.icons.plus_thick, text="Add", vertical=true, iconSize=16} : StageAddButtonProps) => {

    return (
        <TouchableOpacity 
            style={[styles.stageAdd, disabled && styles.disabled]} // if disabled make it less visible
            onPress={onPress}
            disabled={disabled}>
            <IconComponent source={icon} width={iconSize} tintColor={Constants.COLORS.white}/>
            <Text style={styles.stageTitleAdd}>{text}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    disabled: {
        opacity: 0.6
    },

    stageTitleAdd: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.small,
        fontWeight: Constants.FONTS.regular as TextStyle['fontWeight'],
        color: Constants.COLORS.white
    },

    stageAdd: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Constants.COLORS.preset_blue,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        maxWidth: 50,
        rowGap: 7,
        flex: 1
    }
})

export default StageAddButton;
export type {StageAddButtonRef};