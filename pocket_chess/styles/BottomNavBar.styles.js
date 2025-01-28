import { StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/index.js';

const styles = StyleSheet.create({ 
    tabBarStyle: {
        height: 70,
        borderWidth: 1,
        borderRadius: 0,
        borderColor: COLORS.line_light_grey,
        borderTopColor: COLORS.line_light_grey,
        backgroundColor: COLORS.white,
        paddingBottom: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    tabBarLabelStyle: {
        fontSize: SIZES.xSmall,
        fontWeight: FONTS.medium,
        fontFamily: FONTS.BASE_FONT_NAME
    }
});

export default styles;