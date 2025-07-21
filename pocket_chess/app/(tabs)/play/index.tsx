import React, { useState, useRef, useCallback} from 'react';
import { View, Text, ScrollView, StyleSheet, TextStyle, TouchableOpacity} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Constants from '../../../constants';
import IconComponent from '../../../components/common/IconComponent.jsx';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import TabNavigator from '../../../components/TabNavigator';
import PresetTimersPage from '../../../components/play_tab/PresetTimersPage';
import CustomTimersPage from '../../../components/play_tab/CustomTimersPage';


const Play = () => {

  const routerParams = useLocalSearchParams(); // router params to indicate necessary refresh

  function openHelpBox() {
    console.log('help box'); 
  }

  function openSettings() {
    console.log('settings');
  }

  // useFocusEffect(
  //   useCallback(() => {
  //     if (routerParams?.refresh) {
  //       setPresets({...storage.getCustomPresets(), ...defaultPresets});
  //     }
  //   }, [routerParams?.refresh]) // when router refresh parameter passed, update custom presets
  // )

  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.iconRowTop}>
          <TouchableOpacity onPress={openHelpBox}>
            <IconComponent source={Constants.icons.help} width={30} tintColor={Constants.COLORS.text_dark}/>
          </TouchableOpacity>
          <Text style={styles.textRowTop}>Play</Text>
          <TouchableOpacity onPress={openSettings}>
            <IconComponent source={Constants.icons.settings} width={30} tintColor={Constants.COLORS.text_dark}/>
          </TouchableOpacity>
        </View>
        <TabNavigator 
            tabs = {{
                "Preset timers": (props) => <PresetTimersPage {...props}/>,
                "Custom timers": (props) => <CustomTimersPage {...props}/>
            }}
            icons = {{
                "Preset timers": Constants.icons.hourglass,
                "Custom timers": Constants.icons.hourglass
            }}
            swipeEnabled={false}
        />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.COLORS.white
  },

  iconRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 30,
    paddingBottom: 20
  },

  textRowTop: {
    color: Constants.COLORS.text_dark,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.xxLarge,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight']
  },

  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Constants.COLORS.contrast_red_light,
    borderBottomWidth: 2,
    paddingBottom: 2,
    marginBottom: 10
  },

  textTimerHeader: {
    color: Constants.COLORS.contrast_red_light,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    paddingLeft: 5,
  },

  presetsContainer: {
    justifyContent: 'center',
    paddingHorizontal: 30
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

export default Play