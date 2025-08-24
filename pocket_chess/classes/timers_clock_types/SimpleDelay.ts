import { PresetTypes} from '../PresetType';
import Stage, {StageJSON} from '../timers_base/Stage';
import Timer, { TimerJSON } from '../timers_base/Timer';
import Time, { TimeJSON } from '../timers_base/Time';
import { TimerWithMoves, TimerWithDelay } from '../types/TimerBuilderTypes';

export interface SimpleDelayStageJSON extends StageJSON {
    delay: TimeJSON;
    moves: number | null;
}

export interface SimpleDelayTimerJSON {
    stages: SimpleDelayStageJSON[];
    playerName: string;
    currentStage: number;
    currentStageTime: number;
    currentStageMoves: number;
    presetTypeId: number;
}

export class SimpleDelayStage extends Stage {
    public delay: Time;
    public moves: number | null;

    constructor(time: Time = new Time(0,0,0), delay: Time = new Time(0,0,0), moves: number | null = null) {
        super(time);
        this.delay = delay;
        this.moves = moves;
    }

    toJSON(): SimpleDelayStageJSON {
        const json = super.toJSON() as any;
        json.delay = this.delay.toJSON();
        json.moves = this.moves;
        return json;
    }

    static fromJSON(data: SimpleDelayStageJSON): SimpleDelayStage {
        return new SimpleDelayStage(
            Time.fromJSON(data.time), 
            Time.fromJSON(data.delay), 
            data.moves
        );
    }

    toString(): string {
        return `${Time.toStringCleanBoth(this.time, this.delay)} - ${this.moves ? this.moves : "∞"} moves`;
    }

    clone(): SimpleDelayStage {
        return new SimpleDelayStage(
            this.time.clone(),
            this.delay.clone(),
            this.moves
        );
    }
}

/**
 * SimpleDelayTimer.
 *
 * @class SimpleDelayTimer
 * @extends {Timer}
 */
export class SimpleDelayTimer extends Timer implements TimerWithMoves, TimerWithDelay {
    public currentStageMoves: number;
    public turnStartTimestamp: number | null = null; // timestamp when current active turn started
    public pausedAt: number | null = null; // timestamp when the timer was paused
    public totalPausedDuration: number = 0; // total time spent paused
    public stageTimeAtTurnStart: number | null = null; // value of stage time at the start of turn

    /**
     * @constructor
     * Details of a timer preset
     * @param stages - array of SimpleDelayStage objects
     * @param playerName - name of the player assigned to this timer
     * @param currentStage - current stage index
     * @param currentStageTime - current stage time in miliseconds, if passed null becomes max stage time
     * @param currentStageMoves - current stage moves, if null is max stage moves
    */
    constructor(
        stages: SimpleDelayStage[], 
        playerName: string | null = null, 
        currentStage: number = 0, 
        currentStageTime: number | null = null, 
        currentStageMoves: number | null = null,
    ) {
        //guarantee stages is a list of SimpleDelayStages objects
        if (!Array.isArray(stages) || stages.length === 0) {
            throw new Error("stages must have at least one stage");
        }

        super(stages, playerName, currentStage, currentStageTime, PresetTypes.SIMPLE_DELAY.id);
        this.currentStageMoves = currentStageMoves ? currentStageMoves : 0; // it increases until reaching max stage moves (if it exists)
    }

    static fromJSON(data: SimpleDelayTimerJSON): SimpleDelayTimer {
        return new SimpleDelayTimer(
            data.stages.map((stage: SimpleDelayStageJSON) => SimpleDelayStage.fromJSON(stage)), 
            data.playerName,
            data.currentStage,
            data.currentStageTime,
            data.currentStageMoves
        );
    }

    toJSON(): SimpleDelayTimerJSON {
        const json = super.toJSON();
        return {
            ...json,
            stages: (this.stages as SimpleDelayStage[]).map((stage: SimpleDelayStage) => stage.toJSON()), // typcast the stages to be of specific type SimpleDelayStageJSON instead of just StageJSON
            currentStageMoves: this.currentStageMoves,
        };
    }

    clone(): SimpleDelayTimer {
        return new SimpleDelayTimer(
            (this.stages as SimpleDelayStage[]).map((stage: SimpleDelayStage) => stage.clone()), // typcast stages as specific type SimpleDelayStage
            this.playerName,
            this.currentStage,
            this.currentStageTime,
            this.currentStageMoves,
        );
    }

    startTurn(startTime: number): void {
        this.turnStartTimestamp = startTime;
        this.pausedAt = null;
        this.totalPausedDuration = 0;
        this.stageTimeAtTurnStart = this.currentStageTime;
    }

    endTurn(): void {
        this.turnStartTimestamp = null;
        this.pausedAt = null;
        this.totalPausedDuration = 0;
        this.stageTimeAtTurnStart = null;
    }

    // pause method
    pauseTurn(): void {
        this.pausedAt = performance.now();
    }

    // resume method
    resumeTurn(): void {
        if (this.pausedAt) {
            const pauseDuration = performance.now() - this.pausedAt;
            this.totalPausedDuration += pauseDuration;
            this.pausedAt = null;
        }
    }

    // check if currently paused
    isPaused(): boolean {
        return this.pausedAt !== null;
    }

    #moveToNextStage(): boolean {
        if (this.currentStage < this.stages.length - 1) {
            this.currentStage++;
            this.currentStageTime = (this.stages[this.currentStage] as SimpleDelayStage).time.toMiliseconds(); // set current stage time to the next stage time
            this.currentStageMoves = 0; // reset moves for the new stage
            this.endTurn(); // start turn for new stage
            return true; // moved to next stage
        }
        return false; // no more stages to move to
    }

    //increment current stage moves
    // call OnEndMoves when timer reaches 0 moves in all stages
    addMove(onEndMoves: () => void): void {
        console.log('adding move to timer');
        if (this.currentStageMoves !== null) {
            this.currentStageMoves++;
            
            const currentStageMaxMoves = (this.stages[this.currentStage] as SimpleDelayStage).moves;
            const remainingMoves = currentStageMaxMoves - this.currentStageMoves;

            if (currentStageMaxMoves && remainingMoves <= 0) { // if no more moves in current stage, move to next stage
                let moveToNextStage = this.#moveToNextStage();
                if (!moveToNextStage) { // if no more stages, call onEndMoves
                    onEndMoves();
                }
            }
        }

        this.endTurn(); // end delay calculations for this turn
    }

    //update current stage time, taking into account delay
    _updateStageTime(timeLeftMiliseconds: number, onEndMoves: () => void): void {

        if (this.currentStageTime !== null && this.turnStartTimestamp !== null && !this.isPaused()) {
            const delayMs = this.getCurrentStageDelay().toMiliseconds();
            const now = performance.now();
            const elapsedTime = (now - this.turnStartTimestamp) - this.totalPausedDuration;

            if (elapsedTime < delayMs) {
                // dont know why, but this helps prevent flickering (because linking changes between state and progress bar?)
                this.currentStageTime = this.stageTimeAtTurnStart;
            } else {
                // after delay, count down from original time
                const timeAfterDelay = elapsedTime - delayMs;
                const newCurrentStageTime = this.stageTimeAtTurnStart - timeAfterDelay;

                if (newCurrentStageTime <= 0) { // if no more time in current stage, move to next stage
                    let movedToNextStage = this.#moveToNextStage();
                    if (movedToNextStage) {
                        this.startTurn(performance.now());
                    } else { // if no more stages, call onEndMoves
                        onEndMoves();
                    }
                } else {
                    this.currentStageTime = newCurrentStageTime;
                }
            }
        }
    }

    reset(): void {
        super.reset();
        this.currentStageMoves = 0;
        this.turnStartTimestamp = null;
        this.pausedAt = null;
        this.totalPausedDuration = 0;
        this.stageTimeAtTurnStart = null;
    }

    getCurrentStageMoves(): number {
        return this.currentStageMoves;
    }

    getCurrentStageDelay(): Time {
        return (this.stages[this.currentStage] as SimpleDelayStage).delay;
    }

    getDelayProgress(): number {
        if (this.turnStartTimestamp === null) return 0;
        
        const delayMs = this.getCurrentStageDelay().toMiliseconds();
        if (delayMs === 0) return 1;

        let currentTime = performance.now();

        if (this.pausedAt) {
            currentTime = this.pausedAt;
        }

        const elapsedTime = (currentTime - this.turnStartTimestamp) - this.totalPausedDuration;
        const progress = Math.min(1, Math.max(0, elapsedTime / delayMs));
        
        return progress;
    }

}