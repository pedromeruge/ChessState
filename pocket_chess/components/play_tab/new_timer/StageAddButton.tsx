import { Text, TouchableOpacity, StyleSheet, TextStyle} from 'react-native'

import * as Constants from '../../../constants/index';

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
            style={[vertical ? styles.stageAddVertical : styles.stageAddHorizontal, disabled && styles.disabled]} // if disabled make it less visible
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
        color: Constants.COLORS.white,
    },

    stageAddVertical: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Constants.COLORS.preset_blue,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        maxWidth: 60,
        minWidth: 40,
        rowGap: 7,
        flex: 1
    },

    stageAddHorizontal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Constants.COLORS.preset_blue,
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 5,
        width: '100%',
        maxHeight: 50,
        columnGap: '3%'
    }
})

export default StageAddButton;
export type {StageAddButtonRef};