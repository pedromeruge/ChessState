import React, { useState, useRef, useCallback} from 'react';
import { View, Text, StyleSheet, TextStyle, TouchableOpacity} from 'react-native'

import * as Constants from '../constants';
import IconComponent from './common/IconComponent.jsx';
import storage from '../classes/Storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Time, Stage, Timer, Preset } from '../classes/Preset.js';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const PlayPreset4Players = (preset) =>{
        
    function onPressPlayer(playerNumber: number) {
      console.log('pressed player', playerNumber);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => onPressPlayer(1)}>
              <Text style={styles.newPresetButtonText}>New Preset</Text>
            </TouchableOpacity>
            <View>
            </View>
            <TouchableOpacity onPress={() => onPressPlayer(2)}>
              <Text style={styles.newPresetButtonText}>New Preset</Text>
            </TouchableOpacity>
            <Text>Presets {preset.title}</Text>
          </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: Constants.COLORS.white,
    zIndex: 1
  },

  newPresetButtonText: {
    color: Constants.COLORS.text_dark_2,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.medium,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    marginHorizontal: 5
  },
})

export default PlayPreset4Players;