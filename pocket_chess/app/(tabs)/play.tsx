import React, { useRef} from 'react';
import { View, Text, StyleSheet, TextStyle, TouchableOpacity} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Constants from '../../constants';
import IconComponent from '../../components/common/IconComponent.jsx';
import {Stage, Timer, Time} from '../../classes/Timer';
import TimerPresetSection from '../../components/TimerPresetSection';
import NewTimerModal from '../../components/NewTimerModal';

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

  const defaultTimers = {
    "bullet": {
      "icon": Constants.icons.preset_bullet,
      "title": "Bullet",
      "timers":
      [
        new Timer([new Stage(new Time(0, 1, 0))],"1|0", Constants.COLORS.white, Constants.COLORS.preset_blue),
        new Timer([new Stage(new Time(0, 1, 0), new Time(0, 0, 1))],"1|1"),
        new Timer([new Stage(new Time(0, 2, 0), new Time(0, 0, 1))],"2|1"),
        new Timer([new Stage(new Time(0, 2, 0), new Time(0, 0, 5))],"2|5"),
        new Timer([new Stage(new Time(0, 2, 0), new Time(0, 0, 5))],"2|5"),
        new Timer([new Stage(new Time(0, 2, 0), new Time(0, 0, 5))],"2|5")
      ]
    },

    "blitz": {
      "icon": Constants.icons.flash_on,
      "title": "Blitz",
      "timers":
      [
        new Timer([new Stage(new Time(0, 3, 0))],"3|0", Constants.COLORS.white, Constants.COLORS.preset_yellow),
        new Timer([new Stage(new Time(0, 3, 0), new Time(0, 0, 2))],"3|2"),
        new Timer([new Stage(new Time(0, 5, 0))],"5|0"),
        new Timer([new Stage(new Time(0, 5, 0), new Time(0, 0, 3))],"5|3"),
      ]
    },
    "rapid": {
      "icon": Constants.icons.preset_rapid,
      "title": "Rapid",
      "timers":
      [
        new Timer([new Stage(new Time(0, 10, 0))],"10|0", Constants.COLORS.white, Constants.COLORS.preset_green),
        new Timer([new Stage(new Time(0, 10, 0), new Time(0, 0, 5))],"10|5"),
        new Timer([new Stage(new Time(0, 15, 0), new Time(0, 0, 10))],"15|10"),
        new Timer([new Stage(new Time(0, 25, 0), new Time(0, 0, 10))],"25|10"),
      ]
    },
    "standard": {
      "icon": Constants.icons.preset_standard,
      "title": "Standard",
      "timers":
      [ 
        new Timer(
              [new Stage(new Time(0, 90, 0), new Time(0, 0, 0), 40), 
                new Stage(new Time(0, 30, 0))],
              "90+30|30", Constants.COLORS.white, Constants.COLORS.preset_red
            ),
        new Timer(
          [new Stage(new Time(0, 90, 0), new Time(0, 0, 30))]
          ,"90|30"),
      ]
    }
  }

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
            {Object.entries(defaultTimers).map(([titleSection, timersList]) => {
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