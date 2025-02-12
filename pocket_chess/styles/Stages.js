import { StyleSheet } from "react-native";

import * as Constants from "../constants";

const style = StyleSheet.create({
    stageItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: Constants.COLORS.line_light_grey,
        paddingHorizontal: 15,
        paddingVertical: 5
    },

    stageItemDescription: {
        flexDirection: 'row',
        width: '100%'
    },

    stageItemText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        color: Constants.COLORS.text_grey,
    }
});

export default style;
