import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect} from 'react';
import { View, Text, StyleSheet, TextStyle, TouchableOpacity, SafeAreaView, ViewStyle} from 'react-native'

import * as Constants from '../../constants';
import IconComponent from '../common/IconComponent.jsx';
import ActionIcon from '../common/ActionIcon';
import Header from '../Header';
import {PresetType, PresetTypes, PresetTypeSections} from '../../classes/PresetTypes.js';
import { ScrollView } from 'react-native';

// screen where all clock types are listed

const ClockTypesList = ({selected_clock_type_id}) => {

    const [expandedClockTypeId, setExpandedClockTypeId] = useState(null);
    const [selectedClockTypeId, setSelectedClockTypeId] = useState(selected_clock_type_id);

    function onPressClockType(clockTypeId) {
        setSelectedClockTypeId(clockTypeId);
    }

    function onExpandClockTypeBox(clockTypeId) {
      setExpandedClockTypeId(clockTypeId);
    }

    function onShrinkClockTypeBox(clockTypeId) {
      setExpandedClockTypeId(null);
    }
    
    const clock_type_sections = {
      "popular": {
        "name": "Popular",
        "icon": Constants.icons.target,
        "color": Constants.COLORS.preset_yellow
      },
      "uncommon": {
        "name": "Uncommon",
        "icon": Constants.icons.diamond,
        "color": Constants.COLORS.contrast_blue_dark
      },
      "experimental": {
        "name": "Experimental",
        "icon": Constants.icons.experimental,
        "color": Constants.COLORS.preset_green
      }
    }

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: Constants.COLORS.white}}>
        <ScrollView 
          style={{flex: 1, backgroundColor: Constants.COLORS.white}}
        >
          <Header leftIcon={Constants.icons.clock_type} leftIconSize={16} text={'Clock types'} rightIcon={Constants.icons.arrow_left} rightIconSize={18} lowBorder={true}
            // onPressRightIcon={onBack}
          />
          <View style={styles.container}>
            {Object.entries(PresetTypeSections).map(([sectionName, sectionPresets]) => (
              <View key={sectionName} style={styles.clockTypeSectionContainer}>
                <View style={styles.clockTypeHeaderContainer}>
                  <IconComponent source={clock_type_sections[sectionName].icon} width={20} height={20} tintColor={clock_type_sections[sectionName].color} />
                  <Text style={styles.clockTypeHeaderText}>{clock_type_sections[sectionName].name}</Text>
                </View>
                {sectionPresets.map((clock_type) => (
                  <TouchableOpacity
                    key={clock_type.id}
                    style={[selected_clock_type_id === clock_type.id ? styles.selectedContainerColor : null]}
                    onPress={() => onPressClockType(clock_type.id)}
                  >
                    {expandedClockTypeId === clock_type.id ? ( // if the clock type is expanded, show complete details
                      <View style={[styles.clockTypeExpandedContentContainer, {backgroundColor: selected_clock_type_id === clock_type.id ? Constants.COLORS.contrast_blue_light : Constants.COLORS.white}]}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                          <Text style={styles.clockTypeNameText}>{clock_type.name}</Text>
                          {/* hitSlop to make the touch area larger for easier interaction */}
                          <TouchableOpacity 
                            onPress={() => onShrinkClockTypeBox(clock_type.id)}
                            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} 
                          >
                            <IconComponent source={Constants.icons.cross} width={12} height={12} tintColor={Constants.COLORS.text_dark_2} />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.clockTypeDetailsText}>{clock_type.long_description}</Text>
                      </View>
                    ) : ( // else show only the summary of the clock type
                      <View style={[styles.clockTypeShrinkedContentContainer, {backgroundColor: selected_clock_type_id === clock_type.id ? Constants.COLORS.contrast_blue_light : Constants.COLORS.white}]}>
                        <View style={{flexDirection: 'column', justifyContent: 'center', flex: 1}}>
                          <Text style={styles.clockTypeNameText}>{clock_type.name}</Text>
                          <Text style={styles.clockTypeDetailsText}>{clock_type.short_description}</Text>
                        </View>
                        {/* hitSlop to make the touch area larger for easier interaction */}
                        <TouchableOpacity 
                          style={{marginLeft: 5}} 
                          onPress={() => onExpandClockTypeBox(clock_type.id)}
                          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                        >
                          <IconComponent source={Constants.icons.help} width={20} height={20} tintColor={Constants.COLORS.text_grey} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.COLORS.white,
    padding: 20,
    gap: 25
  },

  clockTypeSectionContainer: {
    display: 'flex',
    rowGap: 10,
  },

  clockTypeHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  clockTypeHeaderText: {
    color: Constants.COLORS.text_dark_2,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
  },

  clockTypeNameText: {
    color: Constants.COLORS.text_dark_2,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.bold as TextStyle['fontWeight'],
  },

  clockTypeDetailsText: {
    color: Constants.COLORS.text_grey,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.medium,
    fontWeight: Constants.FONTS.regular as TextStyle['fontWeight'],
  },

  clockTypeShrinkedContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Constants.COLORS.line_light_grey,
  },

  clockTypeExpandedContentContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Constants.COLORS.line_light_grey,
  },

  selectedContainerColor: {
    backgroundColor: Constants.COLORS.super_light_grey
  },

  lostContainerColor: {
    backgroundColor: Constants.COLORS.contrast_red_light
  },

  disabledContainer: {
    pointerEvents: 'none',
  },

  textActive: {
    color: Constants.COLORS.white, fontWeight: Constants.FONTS.bold as TextStyle['fontWeight']
  },

  touchableContainer: {
    flex: 1,
    padding: 20,
    paddingVertical: 10,
    width: '100%',
    position: 'relative',
  },

  normalText: {
    color: Constants.COLORS.white,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
  }
})

export default ClockTypesList;