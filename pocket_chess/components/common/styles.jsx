import * as Constants from '../../constants/index';
import {StyleSheet} from 'react-native'

const tabStyles = StyleSheet.create({
    tabBarStyle: {
        flexDirection: 'row',
        backgroundColor: Constants.COLORS.white,
        elevation: 0,  // Remove shadow on android
        shadowOpacity: 0,  // Remove shadow on ios
        borderBottomWidth: 1,
        borderBottomColor: Constants.COLORS.line_light_grey,
    },

    tabBarItem: {
        alignItems: 'center',
    },

    tabBarIndicatorStyle: {
        height: 4,
        backgroundColor: Constants.COLORS.contrast_red_light,
    },

    labelContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },

    labelIcon: {
    },

    labelText: {
        marginLeft: 5,
        fontSize: Constants.SIZES.medium,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
    }
});

export {tabStyles};