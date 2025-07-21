import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect} from 'react';
import { View, Text, StyleSheet, TextStyle, TouchableOpacity, SafeAreaView, ViewStyle} from 'react-native'

import * as Constants from '../../constants';
import IconComponent from '../common/IconComponent.jsx';
import ActionIcon from '../common/ActionIcon';
import { router } from 'expo-router';
import { Time, Stage, Timer, Preset } from '../../classes/Preset.js';
import { Animated } from 'react-native';

// screen where a timer is played, with two regions where players can press to trigger their timers

interface PlayerTouchableSectionProps {
  timer: Timer
  onTurnEnd: () => void
  isActive?: boolean // player is currently playing
  paused?: boolean // game is paused (after starting)
  firstPlayer?: boolean // first player or not, to include "Press here to start" text on the non-first player
  started?: boolean // game has started
  moreStyles?: ViewStyle | null
}

const PlayerTouchableSection = forwardRef(({timer, onTurnEnd, isActive=false, paused=true, firstPlayer=false, started=false, moreStyles=null}: PlayerTouchableSectionProps, ref) => {
  const [currentTime, setCurrentTime] = useState(timer.currentStageTime.toMiliseconds())
  const intervalRef = useRef(null); // to store the interval reference

  useImperativeHandle(ref, () => ({
    // setActive: setIsActive
  }));

  const onPressSection = () => {
    if (isActive) {
      onTurnEnd();
    }
  }

  useEffect(() => {
    if (isActive && !paused) {
      clearInterval(intervalRef.current!); // when timer becomes active and not paused, clear any previous intervals that linger

      const endTime = Date.now() + currentTime;

      intervalRef.current = setInterval(() => {
        const timeLeft = Math.max(0, endTime - Date.now());
        setCurrentTime(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(intervalRef.current);
          handleTimeout();
        }
      }, 100); // tracking updates in 100ms intervals, to be more precise
      
    } else { // if timer paused or inactive
      clearInterval(intervalRef.current); // clear previously set intervals
    }

    return () => clearInterval(intervalRef.current); // on unmount clean up created intervals
  }, [isActive, paused, currentTime])

  const handleTimeout = () => {
    console.log('player out of timeout');
    onTurnEnd();
  }

  return (
    <View style={[styles.touchableContainer, moreStyles, isActive && started && styles.activeContainerColor, paused && started && styles.disabledContainer]}>
      <TouchableOpacity onPress={onPressSection} style={{flex: 1}}>
        <View style={styles.headerContainer}>
          {timer.stages.length > 1 && ( // only show stages elements if there are more than one
            <View style={styles.stagesContainer}>
              {timer.stages.map((stage, i) => {
                const isStagePassed = i <= timer.currentStage;
                console.log('stage', i, 'passed:', isStagePassed, 'current stage:', timer.currentStage);
                return (
                  <View style={[isStagePassed ? styles.passedStageIndicator : styles.unpassedStageIndicator]} key={i}/>
                );
              })}
            </View>
          )}
          {timer.stages[timer.currentStage].moves && ( // only show moves if there is a defined limit for the stage
            <View style={styles.movesContainer}>
              <IconComponent source={Constants.icons.pawn_full} width={14} tintColor={Constants.COLORS.white}/>
              <Text style={[styles.normalText, {marginLeft: 5}]}>{timer.stages[timer.currentStage].moves}</Text>
            </View>
          )}
        </View>
        <View style={styles.clockContainer}>
          <Text style={[styles.hiddenText, !firstPlayer && !started && styles.normalText]}>Press here to start</Text>
          <Text style={[styles.timeText, isActive && styles.textActive]}>
              {Time.fromMiliseconds(currentTime).toStringTimer()}
            </Text>
          <IconComponent source={Constants.icons.clock_full} width={24} tintColor={isActive && started ? Constants.COLORS.contrast_blue_dark : Constants.COLORS.text_dark_2}/>
        </View>
        <View style={styles.footerContainer}> 
          <Text style={styles.namesText}>Player Black</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
})

const PlayPreset2Players = ({preset}) => {

    const [started, setStarted] = useState(false);
    const [paused, setPaused] = useState(true);
    const [currentPlayer, setCurrentPlayer] = useState(1); // player black is first to press timer, so white starts playing

    function onPressPlayer(playerNumber: number) {
      if (!started) {
        setStarted(true);
        setPaused(false);
      }

      setCurrentPlayer((prev) => {
        return (prev + 1) % preset.timers.length;
      })

      console.log('pressed player', playerNumber, "current player", currentPlayer);
    }

    function onPressVolume() {
      console.log('pressed volume');
    }

    function onPressPause() {
      setPaused(!paused)
      console.log('pressed pause');
    }

    function onPressRestart() {
      setStarted(false)
      setPaused(true)
      setCurrentPlayer(0)
      console.log('pressed restart');
    }

    function onPressCamera() {
      console.log('pressed camera');
    }

    function onPressBack() {
      console.log('pressed back');
      router.back()
      router.setParams({refresh: 'true'}); // indicate to the play screen that it should refresh the presets
    }

    return (
      <SafeAreaView style={styles.container}>
        <PlayerTouchableSection 
          timer={preset.timers[0]} 
          onTurnEnd={() => onPressPlayer(0)} 
          isActive={currentPlayer === 0}
          paused={paused}
          firstPlayer={true}
          started={started}
          moreStyles={styles.invertedContainer}
        />
        <View style={styles.middleBarContainer}>
          <ActionIcon 
            source_on={Constants.icons.arrow_left} 
            onPress={onPressBack}
            width={22} tintColor={Constants.COLORS.white}/>
          { started && (
            <>
              <ActionIcon 
                source_on={Constants.icons.restart} 
                onPress={onPressRestart}
                width={22} tintColor={Constants.COLORS.white}/>
              <ActionIcon 
                source_on={Constants.icons.camera} 
                onPress={onPressCamera}
                addStyle={!paused ? styles.hiddenIcon : null} // hide camera icon until game paused
                width={25} tintColor={Constants.COLORS.white}
              />
              <ActionIcon 
                source_on={Constants.icons.play} 
                source_off={Constants.icons.pause} 
                onPress={onPressPause}
                startOn={false}
                width={22} tintColor={Constants.COLORS.white}/>
            </>
          )}

          <ActionIcon 
            source_on={Constants.icons.volume_on} 
            source_off={Constants.icons.volume_off} 
            onPress={onPressVolume}
            startOn={true}
            width={25} tintColor={Constants.COLORS.white}/>
        </View>
        <PlayerTouchableSection 
          timer={preset.timers[1]} 
          onTurnEnd={() => onPressPlayer(1)}
          isActive={currentPlayer === 1}
          paused={paused}
          firstPlayer={false}
          started={started}
        />
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: Constants.COLORS.text_grey,
    zIndex: 100,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  invertedContainer: {
    transform: [{ rotate: '180deg'}],
  },

  activeContainerColor: {
    backgroundColor: Constants.COLORS.contrast_blue_light
  },

  disabledContainer: {
    pointerEvents: 'none',
  },

  textActive: {
    color: Constants.COLORS.white, fontWeight: Constants.FONTS.bold as TextStyle['fontWeight']
  },

  middleBarContainer: {
    width: '100%',
    minHeight: 55,
    maxHeight: 70,
    height: '6%',
    backgroundColor: Constants.COLORS.text_dark_2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30
  },

  touchableContainer: {
    flex: 1,
    padding: 20,
    paddingVertical: 10,
    width: '100%',
    position: 'relative',
  },

  headerContainer: {
    height: 30,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    flexDirection: 'row',
  },

  stagesContainer: {
    columnGap: 10,
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
  },

  passedStageIndicator: {
    width: 12,
    height: 12,
    backgroundColor: Constants.COLORS.white,
    borderRadius: 6,
  },

  unpassedStageIndicator: {
    width: 12,
    height: 12,
    backgroundColor: Constants.COLORS.transparent,
    borderColor: Constants.COLORS.white,
    borderRadius: 6,
    borderWidth: 2,
  },

  activeStageIndicator: {
    borderRadius: 3,
  },

  movesContainer: {
    position: 'absolute',
    right: 10,
    top: 2, // some additional space to align with the stages icons
    flexDirection: 'row',
    alignItems: 'center',
  },

  clockContainer: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },


  footerContainer: {
    height: 30,
    width: '100%',
  },

  timeText: {
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    color: Constants.COLORS.white,
    fontSize: Constants.SIZES.veryLarge,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    marginTop: -15,
    marginBottom: -5
  },

  normalText: {
    color: Constants.COLORS.white,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
  },

  namesText: {
    color: Constants.COLORS.white,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    textAlign: 'center',
  },

  hiddenIcon: {
    opacity: 0,
    pointerEvents: 'none',
  },

  hiddenText: {
    color: Constants.COLORS.transparent,
  }
})

export default PlayPreset2Players;