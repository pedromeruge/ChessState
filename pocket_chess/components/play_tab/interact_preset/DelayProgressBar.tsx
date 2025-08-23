import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, ViewStyle, Easing } from 'react-native';
import * as Constants from '../../../constants/index';
import { SimpleDelayTimer } from '../../../classes/timers_clock_types/SimpleDelay';
import { BronsteinDelayTimer } from '../../../classes/timers_clock_types/BronsteinDelay';
import { isTimerWithDelay, TimerWithDelay } from '../../../classes/types/TimerBuilderTypes';

interface DelayProgressBarProps {
  timer: TimerWithDelay;
  isActive: boolean;
  started: boolean;
  paused: boolean;
  style?: ViewStyle;
}

const DelayProgressBar: React.FC<DelayProgressBarProps> = ({ timer, isActive, started, paused, style }) => {
  const progressAnim = useRef(new Animated.Value(0)).current; // start at 0 scale
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  useEffect(() => {
    animationRef.current?.stop(); // stop any ongoing animation

    if (isActive && started && !paused) {

      const delayMs = timer.getCurrentStageDelay().toMiliseconds();

      if (delayMs > 0) {

        // start from current progress (in case of resuming from pause)
        const currentProgress = timer.getDelayProgress();
        progressAnim.setValue(currentProgress);

        // calculate remaining duration
        const remainingProgress = 1 - currentProgress;
        const remainingDuration = remainingProgress * delayMs;

        if (remainingDuration > 0) {
          // animate to full progress over the delay duration
          animationRef.current = 
            Animated.timing(progressAnim, {
              toValue: 1, // scale 1 is the final goal
              duration: remainingDuration,
              easing: Easing.linear,
              useNativeDriver: true,
            });
            animationRef.current.start();
        }
      }
    } else if (paused) {
      animationRef.current?.stop();

      // update progress to current value (frozen at pause point)
      const currentProgress = timer.getDelayProgress();
      progressAnim.setValue(currentProgress);

    } else {
      // Reset if not active or not started
      progressAnim.setValue(0);
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [isActive, started, paused]);

  // hide progress bar if no delay attributes or null delay
  if (!isTimerWithDelay(timer) || 
      timer.getCurrentStageDelay().toMiliseconds() === 0 || 
      timer.getDelayProgress() >= 1) {
    return null;
  }

  return (
    <View style={[styles.progressContainer, style]}>
      <View style={styles.progressBarBackground}>
        <Animated.View 
          style={[
            styles.progressBarFill,
            {
              transform: [{
                scaleX: progressAnim
              }],
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    width: '50%',
    alignItems: 'center',
    height: 8
  },

  progressBarBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: Constants.COLORS.contrast_blue_dark,
    overflow: 'hidden'
  },

  progressBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: Constants.COLORS.white,
    transformOrigin: 'left' // scale from left side
  },
});

export default DelayProgressBar;