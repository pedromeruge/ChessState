import React, { useState, useRef, useCallback} from 'react';
import { View, Text, ScrollView, StyleSheet, TextStyle, TouchableOpacity} from 'react-native'

import * as Constants from '../../constants';
import TimerPresetSection from './TimerPresetSection';
import storage from '../../classes/Storage';

// presets tab, displayed in the start of the play section

const PresetTimersPage = () => {
  
  //permanent storage of presets
  const [defaultPresets, _] = useState(storage.getDefaultPresets());
  
  return (

        <View style={styles.presetsContainer}>
          <ScrollView style={styles.presetsSection}>
            {Object.entries(defaultPresets).map((
                [titleSection, presetsList]: [string, { icon: string, title: string, presets: any[] }]) => {
                  if (!presetsList || !presetsList.icon || !presetsList.title || presetsList.presets.length === 0) {
                    console.warn(`Missing fields in presetsList: ${titleSection}`);
                    return null;
                  }
                  return <TimerPresetSection key={titleSection} presetsList={presetsList} singleLine={true}/>
            })}
          </ScrollView>
        </View>
  )
}

const styles = StyleSheet.create({
  
  presetsContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: Constants.COLORS.white
  },

  presetsContainerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 15,
  },

  textPresetsContainerHeader: {
    color: Constants.COLORS.text_dark,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.bold as TextStyle['fontWeight'],
  },

  newPresetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Constants.COLORS.line_light_grey,
  },

  newPresetButtonText: {
    color: Constants.COLORS.text_dark_2,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.medium,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    marginHorizontal: 5
  },

  presetsSection: {
    display: 'flex',
    width: '100%'
  }

})

export default PresetTimersPage;