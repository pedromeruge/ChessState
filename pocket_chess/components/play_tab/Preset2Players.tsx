import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect} from 'react';
import { View, Text, StyleSheet, TextStyle, TouchableOpacity, SafeAreaView, ViewStyle} from 'react-native'

import * as Constants from '../../constants';
import IconComponent from '../common/IconComponent.jsx';
import ActionIcon from '../common/ActionIcon';
import { router } from 'expo-router';
import { Time, Stage, Timer, Preset } from '../../classes/timers_base/Preset';
import { Animated } from 'react-native';

// screen where a timer is played, with two regions where players can press to trigger their timers

interface PlayerTouchableSectionProps {
  timer: Timer
  onTurnEnd: () => void
  onGameOver: (winningPlayer: number) => void
  playerIndex: number // index of the player (0 or 1)
  isActive?: boolean // player is currently playing
  paused?: boolean // game is paused (after starting)
  firstPlayer?: boolean // first player or not, to include "Press here to start" text on the non-first player
  started?: boolean // game has started
  lostGame?: boolean // player lost the game (out of time or moves)
  moreStyles?: ViewStyle | null
}

const PlayerTouchableSection = ({timer, onTurnEnd, onGameOver, playerIndex, isActive=false, paused=true, firstPlayer=false, started=false, lostGame=false, moreStyles=null}: PlayerTouchableSectionProps) => {
  const [currentTime, setCurrentTime] = useState(timer.currentStageTime)
  const [currentMoves, setCurrentMoves] = useState(timer.currentStageMoves);
  const [currentStage, setCurrentStage] = useState(timer.currentStage);

  const intervalRef = useRef(null); // to store the interval reference

  const onPressSection = () => {
    if (isActive) {

      // discard first interaction as a move, because it is used to start the timer of the opponent player, it's not an actual move from black
      if (started) {
        timer.addMove(handleTimeout); // add move to the timer, if active (this also adds increment)
        
        // update react component state to trigger re-render
        setCurrentMoves(timer.currentStageMoves);
        setCurrentTime(timer.currentStageTime); // Update time in case increment was added
        setCurrentStage(timer.currentStage);
      }

      onTurnEnd();
    }
  }

  // sync timer state with react component state on active state change
  useEffect(() => {
    if (isActive && !paused) {
      clearInterval(intervalRef.current!); // when timer becomes active and not paused, clear any previous intervals that linger

      const startTime = Date.now();
      const initialTime = timer.currentStageTime;

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const timeLeft = Math.max(0, initialTime - elapsed);
        
        timer._updateStageTime(timeLeft, () => {
          clearInterval(intervalRef.current);
          handleTimeout();
        });

        // update react component state to trigger re-render
        setCurrentTime(timeLeft);
        setCurrentMoves(timer.currentStageMoves);
        setCurrentStage(timer.currentStage);

      }, 100); // tracking updates in 100ms intervals, to account for mid-second stops of timer
      
    } else { // if timer paused or inactive
      clearInterval(intervalRef.current); // clear previously set intervals
    }

    return () => clearInterval(intervalRef.current); // on unmount clean up created intervals
  }, [isActive, paused, lostGame])

  // separate react component state sync when game restarts (which changes started) (could be added to the useEffect above, but this way it is more clear)
  useEffect(() => {
    setCurrentTime(timer.currentStageTime);
    setCurrentMoves(timer.currentStageMoves);
    setCurrentStage(timer.currentStage);
  }, [started]);
  
  const handleTimeout = () => {
    console.log('player out of timeout or moves finished');
    if (onGameOver) {
      // The current player (who ran out of time/moves) loses, so the other player wins
      const otherPlayer = playerIndex === 0 ? 1 : 0;

      onGameOver(otherPlayer);
    } else {
      onTurnEnd();
    }
  }

  return (
    <View style={[styles.touchableContainer, moreStyles, isActive && started && styles.activeContainerColor, lostGame && styles.lostContainerColor, paused && started && styles.disabledContainer]}>
      <TouchableOpacity onPress={onPressSection} style={{flex: 1}}>
        <View style={styles.headerContainer}>
          {timer.stages.length > 1 && ( // only show stages elements if there are more than one
            <View style={styles.stagesContainer}>
              {timer.stages.map((stage, i) => {
                const isStagePassed = i <= timer.currentStage;
                return (
                  <View style={[isStagePassed ? styles.passedStageIndicator : styles.unpassedStageIndicator]} key={i}/>
                );
              })}
            </View>
          )}
          {timer.stages[currentStage]?.moves && ( // only show moves if there is a defined limit for the stage
            <View style={styles.movesContainer}>
              <IconComponent source={Constants.icons.pawn_full} width={14} tintColor={Constants.COLORS.white}/>
              <Text style={[styles.normalText, {marginLeft: 5}]}>
                {currentMoves}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.clockContainer}>
          <Text style={[styles.hiddenText, !firstPlayer && !started && styles.normalText]}>Press here to start</Text>
          <Text style={[styles.timeText, isActive && started && styles.textActive]}>
              {Time.fromMiliseconds(currentTime).toStringTimerSimple()} {/*need to use local state for rendering time, or it wont update when timer updates*/}
            </Text>
          <IconComponent source={Constants.icons.clock_full} width={24} tintColor={isActive && started ? Constants.COLORS.contrast_blue_dark : Constants.COLORS.text_dark_2}/>
        </View>
        <View style={styles.footerContainer}> 
          <Text style={styles.namesText}>{timer.playerName}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

interface middleBarContainerProps {
  started: boolean, // if game has started
  paused: boolean, // if game is paused
  ended: boolean // if game is over
  onPressBack: () => void, // function to call when back button is pressed
  onPressRestart: () => void, // function to call when restart button is pressed
  onPressCamera: () => void, // function to call when camera button is pressed
  onPressPause: () => void, // function to call when pause button is pressed
  onPressVolume: () => void, // function to call when volume button is pressed
}

const MiddleBarContainer =({started, paused, ended, onPressBack, onPressRestart, onPressCamera, onPressPause, onPressVolume}: middleBarContainerProps) => {
  
  // state 1: game hasn't started yet
  if (!started) {
    return (
      <View style={styles.middleBarContainer}>
        <ActionIcon 
          source_on={Constants.icons.arrow_left} 
          onPress={onPressBack}
          width={22} tintColor={Constants.COLORS.white}/>
        <ActionIcon 
          source_on={Constants.icons.volume_on} 
          source_off={Constants.icons.volume_off} 
          onPress={onPressVolume}
          startOn={true}
          width={25} tintColor={Constants.COLORS.white}/>
      </View>
    );
  }

  // state 2: Game has ended
  if (ended) {
    return (
      <View style={styles.middleBarContainer}>
        <ActionIcon 
          source_on={Constants.icons.arrow_left} 
          onPress={onPressBack}
          width={22} tintColor={Constants.COLORS.white}/>
        <ActionIcon 
          source_on={Constants.icons.restart} 
          onPress={onPressRestart}
          width={22} tintColor={Constants.COLORS.white}/>
        <ActionIcon 
          source_on={Constants.icons.volume_on} 
          source_off={Constants.icons.volume_off} 
          onPress={onPressVolume}
          startOn={true}
          width={25} tintColor={Constants.COLORS.white}/>
      </View>
    );
  }

  // state 3: game is paused
  if (paused) {
    return (
      <View style={styles.middleBarContainer}>
        <ActionIcon 
          source_on={Constants.icons.arrow_left} 
          onPress={onPressBack}
          width={22} tintColor={Constants.COLORS.white}/>
        <ActionIcon 
          source_on={Constants.icons.restart} 
          onPress={onPressRestart}
          width={22} tintColor={Constants.COLORS.white}/>
        <ActionIcon 
          source_on={Constants.icons.play} 
          onPress={onPressPause}
          width={22} tintColor={Constants.COLORS.white}/>
        <ActionIcon 
          source_on={Constants.icons.box_full} 
          onPress={onPressCamera}
          width={25} tintColor={Constants.COLORS.white}/>
        <ActionIcon 
          source_on={Constants.icons.volume_on} 
          source_off={Constants.icons.volume_off} 
          onPress={onPressVolume}
          startOn={true}
          width={25} tintColor={Constants.COLORS.white}/>
      </View>
    );
  }

  // state 4: Game is running (started and not paused)
  return (
    <View style={styles.middleBarContainer}>
      <ActionIcon 
        source_on={Constants.icons.arrow_left} 
        onPress={onPressBack}
        width={22} tintColor={Constants.COLORS.white}/>
      <ActionIcon 
        source_on={Constants.icons.pause} 
        onPress={onPressPause}
        width={22} tintColor={Constants.COLORS.white}/>
      <ActionIcon 
        source_on={Constants.icons.volume_on} 
        source_off={Constants.icons.volume_off} 
        onPress={onPressVolume}
        startOn={true}
        width={25} tintColor={Constants.COLORS.white}/>
    </View>
  );
}

const PlayPreset2Players = ({preset}) => {

    const [started, setStarted] = useState(false);
    const [paused, setPaused] = useState(true);
    const [currentPlayer, setCurrentPlayer] = useState(1); // player black is first to press timer, so white starts playing
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);

    function onPressPlayer(playerNumber: number) {
      if (gameOver) return; // Don't allow moves if game is over
      
      if (!started) {
        setStarted(true);
        setPaused(false);
      }

      setCurrentPlayer((prev) => {
        return (prev + 1) % preset.timers.length;
      });
      console.log('pressed player', playerNumber, "current player", currentPlayer);
    }

    function handleGameOver(winningPlayer: number) {
      setPaused(true);
      setCurrentPlayer(-1); // -1 means no player is currently active
      setGameOver(true);
      setWinner(winningPlayer);

      console.log(`Game Over! Player ${winningPlayer + 1} (${preset.timers[winningPlayer].playerName}) wins!`);
    }

    function onPressVolume() {
      console.log('pressed volume');
    }

    function onPressPause() {
      if (gameOver) return; // don't allow pause if game is over
      setPaused(!paused);
      console.log('pressed pause');
    }

    function onPressRestart() {
      // Reset all timer states
      preset.timers.forEach(timer => {
        timer.reset();
      });
      
      setStarted(false);
      setPaused(true);
      setCurrentPlayer(1);
      setGameOver(false);
      setWinner(null);
      
      console.log('pressed restart');
    }

    function onPressCamera() {
      console.log('pressed camera');
    }

    function onPressBack() {
      console.log('back button pressed');
      
      if (!preset.isCustom) {
        console.log('navigating to preset timers');
        router.dismissTo('/play/timers_preset');
      } else {
        console.log('navigating to custom timers');
        router.dismissTo('/play/timers_custom');
      }
    }

    return (
      <SafeAreaView style={styles.container}>
        <PlayerTouchableSection 
          timer={preset.timers[0]} 
          onTurnEnd={() => onPressPlayer(0)} 
          onGameOver={handleGameOver}
          playerIndex={0}
          isActive={currentPlayer === 0}
          paused={paused}
          firstPlayer={true}
          started={started}
          lostGame={gameOver && winner !== 0} // if game is over and this player is not the winner, then they lost
          moreStyles={styles.invertedContainer}
        />
        <MiddleBarContainer
          started={started}
          paused={paused}
          ended={gameOver}
          onPressBack={onPressBack}
          onPressRestart={onPressRestart}
          onPressCamera={onPressCamera}
          onPressPause={onPressPause}
          onPressVolume={onPressVolume}
        />
        <PlayerTouchableSection 
          timer={preset.timers[1]} 
          onTurnEnd={() => onPressPlayer(1)}
          onGameOver={handleGameOver}
          playerIndex={1}
          isActive={currentPlayer === 1}
          paused={paused}
          firstPlayer={false}
          started={started}
          lostGame={gameOver && winner !== 1} // if game is over and this player is not the winner, then they lost
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

  lostContainerColor: {
    backgroundColor: Constants.COLORS.contrast_red_light
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
  },

  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  gameOverModal: {
    backgroundColor: Constants.COLORS.white,
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 250,
  },

  gameOverTitle: {
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.xxLarge,
    fontWeight: Constants.FONTS.bold as TextStyle['fontWeight'],
    color: Constants.COLORS.text_dark,
    marginBottom: 10,
  },

  gameOverWinner: {
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    color: Constants.COLORS.text_dark_2,
    marginBottom: 20,
  },

  gameOverButton: {
    backgroundColor: Constants.COLORS.contrast_blue_light,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },

  gameOverButtonText: {
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.medium,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    color: Constants.COLORS.white,
  }
})

export default PlayPreset2Players;