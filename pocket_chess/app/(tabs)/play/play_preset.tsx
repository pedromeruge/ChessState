import React, { useState, useRef, useCallback} from 'react';
import { View, Text, StyleSheet, TextStyle, TouchableOpacity} from 'react-native'

import * as Constants from '../../../constants';
import storage from '../../../classes/Storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Time, Stage, Timer, Preset } from '../../../classes/Preset.js';
import PlayPreset1Player from '../../../components/PlayPreset1Player';
import PlayPreset2Players from '../../../components/PlayPreset2Players';
import PlayPreset4Players from '../../../components/PlayPreset4Players';

const Play_preset = () => {
  
  const {preset_id} = useLocalSearchParams(); // router params to indicate necessary refresh

  if (!preset_id) {
    console.warn('No preset id provided');
    router.navigate('./play');
    return null;
  }

  const preset = storage.getPreset(preset_id);

  if (!preset) {
    console.warn(`Preset with id ${preset_id} not found`);
    router.navigate('./play');
    return null;
  }

  const playerCount = preset.timers.length;

  return (
    <View style={styles.container}>
      {playerCount === 1 && (<PlayPreset1Player preset={preset}/>)}
      {playerCount === 2 && (<PlayPreset2Players preset={preset}/>)}
      {playerCount === 4 && (<PlayPreset4Players preset={preset}/>)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: Constants.COLORS.white,
  },

})

export default Play_preset