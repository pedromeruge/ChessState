import { Time, Timer } from '../timers_base/Preset';

// props that all builders must receive
export interface TimerBuilderProps {
  onUpdateStages: (stages: any[]) => void;
}

// methods that all builders must expose to parents
export interface TimerBuilderRef {
  buildTimer: (playerName: string) => Timer;
}

// functions that all timers with moves must have
export interface TimerWithMoves {
    getCurrentStageMoves: () => number;
}

// functions that all timers with lives must have
export interface TimerWithLives {
    getCurrentStageLives: () => number;
}

// functions that all timers with delay must have
export interface TimerWithDelay {
    getCurrentStageDelay: () => Time;
    startTurn: (startTime: number) => void;
    endTurn: () => void;
    pauseTurn: () => void;
    resumeTurn: () => void;
    isPaused: () => boolean; 
    getDelayProgress: () => number;
}

// TS doesnt have instancing for interfaces, so using this method
export const isTimerWithMoves = (timer: any): timer is TimerWithMoves => {
    return timer.getCurrentStageMoves !== undefined; // include a mandatory field of
}

export const isTimerWithLives = (timer: any): timer is TimerWithLives => {
    return timer.getCurrentStageLives !== undefined;
}

export const isTimerWithDelay = (timer: any): timer is TimerWithDelay => {
    return timer.getCurrentStageDelay !== undefined;
}
