import { StyleSheet } from "react-native";

import * as Constants from "../constants";

const style = StyleSheet.create({

    subSectionContainerPadding: {
        paddingHorizontal: 25,
        paddingVertical: 12
    },

    disabled:{
        opacity: 0.5,
        pointerEvents: 'none'
    },

    pageBottomPadding: {
        paddingBottom: 50
    },

    pageTopPadding: {
        paddingTop: 15
    },
    // how big the chessboard piece icons should be relative to their tile
    chessboardPieceIconSize: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain',
    },

    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Constants.COLORS.black,
        opacity: 0.4
    },
});

export default style;
