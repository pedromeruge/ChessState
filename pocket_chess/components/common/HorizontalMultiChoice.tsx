import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, LayoutChangeEvent, ViewStyle, TextStyle } from 'react-native';

import * as Constants from '../../constants';
import IconComponent from './IconComponent';

// fields for each of the choice options
export interface ChoiceOption {
  icon: Constants.IconType;
  iconSize?: number;
  text: string;
  value: string; // value associated to the option
}

interface HorizontalMultiChoiceProps {
  options: ChoiceOption[];
  onSelect?: (selectedValue: string) => void;
  title?: string;
  style?: ViewStyle;
  occupyFullWidth?: boolean; // make the component occupy full width provided by parent (flex: 1)
}

interface HorizontalMultiChoiceRef {
  getSelectedChoice: () => ChoiceOption; // returns the index of the selected choice
}

// constant for the fixed width for clarity and easy modification
const FIXED_OPTION_WIDTH = 120; 

const HorizontalMultiChoice = forwardRef<HorizontalMultiChoiceRef, HorizontalMultiChoiceProps>(({ options, onSelect, title, style, occupyFullWidth }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [layout, setLayout] = useState({ width: 0, optionWidth: 0 });

  const slideAnim = useRef(new Animated.Value(0)).current; // for animating the sliding background

  useImperativeHandle(ref, () => ({
    getSelectedChoice: () => options[selectedIndex]
  }));

  // animated slide when the selected index or layout changes
  useEffect(() => {
    if (layout.optionWidth > 0) {
      // run all animations simultaneously
      Animated.timing(slideAnim, {
        toValue: selectedIndex * layout.optionWidth,
        duration: 250,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }).start();
    }
  // updated when selected field changes, and also at start when calculating each option's width in the layout
  }, [selectedIndex, layout.optionWidth]); 

  // set layout based on the mode (fixed or full-width)
  useEffect(() => {
    if (!occupyFullWidth) {
      // in fixed mode, calculate width based on the constant
      setLayout({
        width: FIXED_OPTION_WIDTH * options.length,
        optionWidth: FIXED_OPTION_WIDTH,
      });
    }
    // if occupyFullWidth is true, the onContainerLayout function will handle setting the layout.
  }, [occupyFullWidth, options.length]);

  // measure the container width to calculate individual option widths
  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (options.length > 0) {
      setLayout({ width, optionWidth: width / options.length });
    }
  };

  // handle press events on an option
  const handlePress = (option: ChoiceOption, index: number) => {
    setSelectedIndex(index);
    onSelect?.(option.value);
  };

  // use different styles depending on the fullWidth prop
  const containerStyle = occupyFullWidth ? styles.containerFullWidth : styles.containerFixed;
  const optionStyle = occupyFullWidth ? styles.optionFullWidth : styles.optionFixed;

  return (
    <View>
      {title ? (
        <Text style={styles.title}>{title}</Text>
      ) : null}
      <View>
        <View style={[containerStyle, style]} onLayout={onContainerLayout}>
          {/* animated blue background that slides into place */}
          {layout.width > 0 && (
            <Animated.View
            style={[
              styles.animatedBackground,
              {
                width: layout.optionWidth,
                transform: [{ translateX: slideAnim }],
              },
            ]}
            />
          )}

          {/* render each option */}
          {options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const textColor = isSelected ? Constants.COLORS.white : Constants.COLORS.text_dark_2;
            const iconSize = option.iconSize || 45;
            return (
              <TouchableOpacity
              key={option.value}
              style={optionStyle}
              onPress={() => handlePress(option, index)}
              >
                <IconComponent source={option.icon} width={iconSize} />
                <Text style={[styles.optionText, { color: textColor }]}>{option.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  containerFixed: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: Constants.COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Constants.COLORS.line_light_grey,
    overflow: 'hidden', // ensures the animated background doesn't bleed out
    alignSelf: 'center',
  },
  containerFullWidth: {
    flexDirection: 'row',
    width: '100%',
    height: 60,
    backgroundColor: Constants.COLORS.white,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Constants.COLORS.line_light_grey,
    overflow: 'hidden',
  },

  animatedBackground: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Constants.COLORS.preset_blue,
  },

  optionFixed: {
    width: FIXED_OPTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionFullWidth: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionText: {
    marginTop: -1,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.small,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
  },

  title: {
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.medium,
    fontWeight: Constants.FONTS.semi_bold as TextStyle['fontWeight'],
    color: Constants.COLORS.text_dark_2,
    textAlign: 'center',
    marginBottom: 5,
  }
});

export default HorizontalMultiChoice;