import { StyleSheet } from "react-native";

import * as Constants from "../constants";

const style = StyleSheet.create({
    sectionContainer: {
        flexDirection: 'column',
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
    },

    sectionTitleContainer: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        paddingBottom: 15,
        alignItems: 'center',
    },

    sectionTitleText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.semi_bold,
        color: Constants.COLORS.text_dark_2
    },

    sectionSubtitleText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.small,
        fontWeight: Constants.FONTS.regular,
        color: Constants.COLORS.text_dark_2,
        marginLeft: 20,
        paddingTop: 5
    },
    
    timeContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderWidth: 1,
        borderColor: Constants.COLORS.line_light_grey,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingTop: 5,
        paddingBottom: 10,
        minWidth: 100,
        minHeight: 70,
        rowGap: 7,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
    },

    timeTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    timeTitleText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.medium,
        color: Constants.COLORS.text_dark_2,
        marginLeft: 7,
    },

    timeInput: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        borderBottomWidth: 1,
        paddingBottom: 0,
        borderColor: Constants.COLORS.line_light_grey,
    },

    title: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },

    sectionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: 10
    },

    titleText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        color: Constants.COLORS.text_grey,
    },

    titleInput: {
        flex: 1,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        color: Constants.COLORS.text_dark_2,
        marginLeft: 10,
        borderBottomWidth: 1,
        paddingBottom: 0,
        paddingTop: 0,
        borderColor: Constants.COLORS.line_light_grey,
    },

    addStageContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        columnGap: '2%'
    }
});

export default style;
