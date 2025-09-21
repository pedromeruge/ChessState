import React, { useState, useRef, useCallback} from 'react';
import { View, Text, StyleSheet, TextStyle, TouchableOpacity} from 'react-native'

import { useLocalSearchParams } from 'expo-router';
import ClockTypesList from '../../../../components/play_tab/new_timer/ClockTypesList';

const Clock_types_list = () => {
  
  return (
    <View style={styles.container}>
      <ClockTypesList/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },

})

export default Clock_types_list