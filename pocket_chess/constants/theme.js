
import {StyleSheet } from 'react-native';

const COLORS = {
  text_dark: "#1E1E1E",
  text_dark_2: "#434343",
  text_grey: "#787878",
  line_light_grey: "#C1C1C1",
  white: "#FFFFFF",
  contrast_red_light: "#BB8588",
  contrast_red_dark: "#B7555B",
  contrast_blue_light: "#6BC7CB",
  contrast_blue_dark: "#4C526F"
};

const FONTS = {
  BASE_FONT_NAME: "Inter 18pt",
  light: "300",
  regular: "400",
  medium: "500",
  semi_bold: "600",
  bold: "700",
  extra_bold: "800",
  black: "900"
};

const SIZES = {
  xxSmall: 8,
  xSmall: 10,
  small: 12,
  medium: 14,
  large: 16,
  xLarge: 20,
  xxLarge: 25,
  xxxLarge: 60
};

const SHADOWS = StyleSheet.create({
  small: {
    boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.2), 0px 5px 30px rgba(0, 0, 0, 0.19)',
  },

  medium: {
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -2},
    shadowRadius: 5.84,
    shadowOpacity: 0.25
  }
})

export { COLORS, FONTS, SIZES, SHADOWS };
