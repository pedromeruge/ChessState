import React, { useRef} from 'react';
import { View, Text, StyleSheet, TextStyle, TouchableOpacity} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Constants from '../../constants';
import IconComponent from '../../components/common/IconComponent.jsx';
import TimerPresetSection from '../../components/TimerPresetSection';
import NewTimerModal from '../../components/NewTimerModal';
import storage from '../../classes/Storage';

const Play = () => {

  function openHelpBox() {
    console.log('help box'); 
  }

  function openSettings() {
    console.log('settings');
  }

  function onPressNewTimer() {
    modalRef.current?.showModal();
  }

  //permanent storage of timers
  const customTimers = storage.getObject(Constants.storage_names.TIMERS.CUSTOM);
  const defaultTimers = storage.getObject(Constants.storage_names.TIMERS.DEFAULT);
  const timers = defaultTimers.concat(customTimers);

  const modalRef = useRef(null);

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
        <View style={styles.timerHeader}>
          <IconComponent source={Constants.icons.hourglass} width={12} tintColor={Constants.COLORS.contrast_red_light}/>
          <Text style={styles.textTimerHeader}>Set timer</Text>
        </View>
        <View style={styles.presetsContainer}>
          <View style={styles.presetsContainerHeader}>
            <Text style={styles.textPresetsContainerHeader}>Presets</Text>
            <TouchableOpacity onPress={onPressNewTimer} style={styles.newTimerButton}>
              <IconComponent source={Constants.icons.plus} width={12} tintColor={Constants.COLORS.text_dark_2} />
              <Text style={styles.newTimerButtonText}>New timer</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.presetsSection}>
            {Object.entries(timers).map(([titleSection, timersList]: [string, { icon: string, title: string, timers: any[] }]) => {
                if (!timersList || !timersList.icon || !timersList.title || !timersList.timers) {
                  console.warn(`Missing fields in timersList: ${titleSection}`);
                  return null;
                }
                return <TimerPresetSection key={titleSection} icon={timersList.icon} title={timersList.title} timers={timersList.timers}/>
            })}
          </View>
        </View>
        <NewTimerModal ref={modalRef}/>
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

  newTimerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Constants.COLORS.line_light_grey,
  },

  newTimerButtonText: {
    color: Constants.COLORS.text_dark_2,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.medium,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    marginLeft: 5
  },

  presetsSection: {
    display: 'flex',
    width: '100%'
  }

})

// time in milliseconds
const SECOND = 1000
const MINUTE = 60
const HOUR = 60

export default Play