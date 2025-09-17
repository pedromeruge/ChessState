import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing, LayoutChangeEvent, ScrollView, TouchableOpacity } from 'react-native';
import * as Constants from '../../constants';
import IconComponent from './IconComponent';

interface CollapsibleProps {
  collapsedLabel?: string;
  expandedLabel?: string;
  iconCollapsed?: any;
  iconExpanded?: any;
  durationMs?: number;
  autoScroll?: boolean;
  scrollViewRef?: React.RefObject<ScrollView>;
  containerStyle?: any;
  headerStyle?: any;
  contentWrapperStyle?: any;
  hideHeaderWhenExpanded?: boolean;
  initiallyExpanded?: boolean;
  children: React.ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  collapsedLabel = 'Show details',
  expandedLabel = 'Hide details',
  iconCollapsed = Constants.icons.arrow_down,
  iconExpanded = Constants.icons.arrow_up,
  durationMs = 260,
  autoScroll = true,
  scrollViewRef,
  containerStyle,
  headerStyle,
  contentWrapperStyle,
  hideHeaderWhenExpanded = false,
  initiallyExpanded = false,
  children
}) => {

  const [expanded, setExpanded] = useState(initiallyExpanded);

  const animOpacity = useRef(new Animated.Value(initiallyExpanded ? 1 : 0)).current;

  const runAnim = (to: number) => {
    Animated.parallel([
      Animated.timing(animOpacity, {
        toValue: to,
        duration: Math.min(180, durationMs - 40),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start(({ finished }) => {
      if (finished && to === 1 && autoScroll && scrollViewRef?.current) {
        // scroll to end after finishing expanding
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });
      }
    });
  };

  const toggleDropdown = () => {
    setExpanded((prev) => {
      const becomeExpanded = !prev;
      runAnim(becomeExpanded ? 1 : 0);
      return becomeExpanded;
    });
  };


  return (
    <View style={[styles.container, containerStyle, {flexDirection: expanded ? 'column' : 'row'}]}> 
      {/* dont know why parent view only works with conditional flexDirection, but i guess it works?? */}
      {(hideHeaderWhenExpanded && expanded) ? null : (
        <TouchableOpacity onPress={toggleDropdown} style={[styles.header, headerStyle]}>
          <Text style={styles.headerText}>
            {expanded ? expandedLabel : collapsedLabel}
          </Text>
          <IconComponent
            source={expanded ? iconExpanded : iconCollapsed}
            width={16}
            tintColor={Constants.COLORS.text_grey}
          />
        </TouchableOpacity>
      )}
      {expanded ? (
        <Animated.View
          style={[
            styles.animatedWrapper,
            {
              opacity: animOpacity,
            },
            contentWrapperStyle
          ]}
          pointerEvents={expanded ? 'auto' : 'none'}
        >
        <View  style={[styles.innerContent]}>
          {children}
        </View>
        </Animated.View>)
      : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.COLORS.white,
    width: '100%',
  },

  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  headerText: {
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.medium,
    fontWeight: Constants.FONTS.semi_bold as any,
    color: Constants.COLORS.text_grey,
  },

  animatedWrapper: {
    flexDirection: 'row',
  },

  innerContent: {
    width: '100%',
    paddingBottom: 12,
  }
});

export default Collapsible;