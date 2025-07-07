import React, { useState, useRef, useCallback} from 'react';
import { View, Text, ScrollView, StyleSheet, TextStyle, TouchableOpacity} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Constants from '../../constants';
import IconComponent from '../common/IconComponent.jsx';
import TimerPresetSection from './TimerPresetSection';
import NewTimerModal from '../NewTimerModal';
import storage from '../../classes/Storage';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import SmallActionButton from '../common/SmallActionButton';


const CustomTimersPage = () => {
  
  //permanent storage of presets
  const [customPresets, setCustomPresets] = useState(storage.getCustomPresets());

  const routerParams = useLocalSearchParams(); // router params to indicate necessary refresh
  const modalRef = useRef(null);

  function onPressNewPreset() {
    console.log("showing new preset modal");
    modalRef.current?.showModal();
  }

  function onPressEditPresets() {
    console.log("TODO edit presets");
  }

  function onSubmitNewPreset(newCustomPresets) {
    setCustomPresets({...newCustomPresets});
    modalRef.current?.hideModal();
  }


  // What did i use this for ???
  // when router refresh parameter passed, update custom presets
  // useFocusEffect(
  //   useCallback(() => {
  //     if (routerParams?.refresh) {
  //     }
  //   }, [routerParams?.refresh]) 
  // )

  return (
    <>
      <View style={styles.presetsContainer}>
        <View style={styles.presetsContainerHeader}>
          <SmallActionButton 
            icon={Constants.icons.edit_pencil} 
            text="Edit" 
            onPress={onPressEditPresets}/>
          <SmallActionButton 
            icon={Constants.icons.plus} 
            text="New" 
            onPress={onPressNewPreset} 
            backgroundColor={Constants.COLORS.contrast_red_light} 
            textColor={Constants.COLORS.white}
            borderColor={Constants.COLORS.contrast_red_light}
          />
        </View>
        <ScrollView style={styles.presetsSection}>
          {Object.entries(customPresets).map((
            [titleSection, presetsList]: [string, { icon: string, title: string, presets: any[] }]) => {
              if (!presetsList || !presetsList.icon || !presetsList.title || presetsList.presets.length === 0) {
                console.warn(`Missing fields in presetsList: ${titleSection}`);
                return null;
              }
              return <TimerPresetSection 
                        key={titleSection} 
                        presetsList={presetsList} 
                        singleLine={false} 
                        style={{
                          paddingHorizontal: 30,
                          rowGap: 8 // include additional distance between title and timers, to give space for edit and new buttons
                        }}/>
            }
          )}
        </ScrollView>
      </View>
      <NewTimerModal ref={modalRef} onSubmit={onSubmitNewPreset}/>
    </>
  )
}

const styles = StyleSheet.create({
  
  presetsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: Constants.COLORS.white
  },

  presetsContainerHeader: {
    position: 'absolute',
    top: 18,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    columnGap: 15
  },

  textPresetsContainerHeader: {
    color: Constants.COLORS.text_dark,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.bold as TextStyle['fontWeight'],
  },

  presetsSection: {
    display: 'flex',
    width: '100%'
  }

})

export default CustomTimersPage;