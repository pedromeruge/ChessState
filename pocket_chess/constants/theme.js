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
  light: "100",
  regular: "300",
  medium: "400",
  semi_bold: "500",
  bold: "600",
  extra_bold: "700",
  black: "800"
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

const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
};

export { COLORS, FONTS, SIZES, SHADOWS };
