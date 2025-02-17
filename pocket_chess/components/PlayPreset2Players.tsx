import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect} from 'react';
import { View, Text, StyleSheet, TextStyle, TouchableOpacity, SafeAreaView, ViewStyle} from 'react-native'

import * as Constants from '../constants';
import IconComponent from './common/IconComponent.jsx';
import ActionIcon from './common/ActionIcon';
import storage from '../classes/Storage';
import { router } from 'expo-router';
import { Time, Stage, Timer, Preset } from '../classes/Preset.js';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

interface PlayerTouchableSectionProps {
  timer: Timer
  onTurnEnd: () => void
  isActive?: boolean
  paused?: boolean
  startText?: boolean
  moreStyles?: ViewStyle | null
}

const PlayerTouchableSection = forwardRef(({timer, onTurnEnd, isActive=false, paused=true, startText=false, moreStyles=null}: PlayerTouchableSectionProps, ref) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(timer.currentStage);
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
    <TouchableOpacity onPress={onPressSection} style={[styles.touchableContainer, moreStyles, isActive && styles.activeContainer]}>
      {timer.stages[currentStageIndex].moves && (
        <SafeAreaView style={styles.movesContainer}>
          <IconComponent source={Constants.icons.pawn_full} width={14} tintColor={isActive ? Constants.COLORS.white : Constants.COLORS.text_dark_2}/>
          <Text style={[styles.movesText, isActive && styles.textActive]}>Moves: {timer.stages[currentStageIndex].moves}</Text>
        </SafeAreaView>
      )}
      <SafeAreaView style={styles.clockContainer}>
        {startText && (
          <Text style={styles.startText}>Press here to start</Text>
        )}
        <Text style={[styles.timeText, isActive && styles.textActive]}>
            {Time.fromMiliseconds(currentTime).toStringTimer()}
          </Text>
        <IconComponent source={Constants.icons.clock_full} width={20} tintColor={isActive ? Constants.COLORS.contrast_blue_dark : Constants.COLORS.text_dark_2}/>
      </SafeAreaView>
    </TouchableOpacity>
  )
})

const PlayPreset2Players = ({preset}) => {

    const [started, setStarted] = useState(false);
    const [paused, setPaused] = useState(true);
    const [currentPlayer, setCurrentPlayer] = useState(0);

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
    }

    return (
      <View style={styles.container}>
        <PlayerTouchableSection 
          timer={preset.timers[0]} 
          onTurnEnd={() => onPressPlayer(0)} 
          isActive={currentPlayer === 0}
          paused={paused}
          startText={started}
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

              { paused && (
                <ActionIcon 
                source_on={Constants.icons.camera} 
                onPress={onPressCamera}
                width={25} tintColor={Constants.COLORS.white}/>
              )}

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
        />
      </View>
    )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: Constants.COLORS.white,
    zIndex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  invertedContainer: {
    transform: [{ rotate: '180deg'}],
  },

  activeContainer: {
    backgroundColor: Constants.COLORS.contrast_blue_light
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
    paddingHorizontal: 30,
  },

  touchableContainer: {
    flex: 1,
    padding: 20,
    width: '100%',
    position: 'relative',
  },

  movesContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  clockContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  startText: {
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    color: Constants.COLORS.text_dark_2,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
  },

  timeText: {
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    color: Constants.COLORS.text_dark_2,
    fontSize: Constants.SIZES.veryLarge,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    marginTop: -15,
    marginBottom: -5
  },

  movesText: {
    color: Constants.COLORS.text_dark_2,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.medium,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    marginLeft: 7
  },
})

export default PlayPreset2Players;