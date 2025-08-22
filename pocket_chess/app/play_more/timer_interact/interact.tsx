import React, { useState, useRef, useCallback} from 'react';
import { View, Text, StyleSheet, TextStyle, TouchableOpacity} from 'react-native'

import * as Constants from '../../../constants';
import storage from '../../../classes/Storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import PlayPreset2Players from '../../../components/play_tab/interact_preset/Preset2Players';

const Play_preset = () => {
  
  const {preset_id} = useLocalSearchParams(); // router params to indicate necessary refresh

  if (!preset_id) {
    console.warn('No preset id provided');
    router.navigate('./play');
    return null;
  }

  const preset = storage.getPreset(preset_id as string);

  if (!preset) {
    console.warn(`Preset with id ${preset_id} not found`);
    router.navigate('./play');
    return null;
  }

  const playerCount = preset.timers.length;

  return (
    <View style={styles.container}>
      <PlayPreset2Players preset={preset}/>
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