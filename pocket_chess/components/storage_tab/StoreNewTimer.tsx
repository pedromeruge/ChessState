import React, { useState, useRef, useCallback} from 'react';
import { View, Text, ScrollView, StyleSheet, TextStyle, TouchableOpacity} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Constants from '../../constants';
import IconComponent from '../common/IconComponent.jsx';
import storage from '../../classes/Storage';
import SmallActionButton from '../common/SmallActionButton';
import Preset from '../../classes/timers_base/Preset';


const StoreNewTimer = () => {
  
  //permanent storage of presets
  const [customPresets, setCustomPresets] = useState<any>(storage.getCustomPresets());

  const modalRef = useRef<number>(null);

  function onPressNewPreset() : void {
  }

  return (
    <>
      <View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({

})

export default StoreNewTimer;