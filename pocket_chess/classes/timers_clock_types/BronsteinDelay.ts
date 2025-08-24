import { PresetTypes} from '../PresetType';
import Stage, {StageJSON} from '../timers_base/Stage';
import Timer, { TimerJSON } from '../timers_base/Timer';
import Time, { TimeJSON } from '../timers_base/Time';
import { TimerWithMoves, TimerWithDelay } from '../types/TimerBuilderTypes';
import { SimpleDelayStage } from './SimpleDelay';

export interface BronsteinDelayStageJSON extends StageJSON {
    delay: TimeJSON;
    moves: number | null;
}

export interface BronsteinDelayTimerJSON {
    stages: BronsteinDelayStageJSON[];
    playerName: string;
    currentStage: number;
    currentStageTime: number;
    currentStageMoves: number;
    presetTypeId: number;
}

export class BronsteinDelayStage extends Stage {
    public delay: Time;
    public moves: number | null;

    constructor(time: Time = new Time(0,0,0), delay: Time = new Time(0,0,0), moves: number | null = null) {
        super(time);
        this.delay = delay;
        this.moves = moves;
    }

    toJSON(): BronsteinDelayStageJSON {
        const json = super.toJSON() as any;
        json.delay = this.delay.toJSON();
        json.moves = this.moves;
        return json;
    }

    static fromJSON(data: BronsteinDelayStageJSON): BronsteinDelayStage {
        return new BronsteinDelayStage(
            Time.fromJSON(data.time), 
            Time.fromJSON(data.delay), 
            data.moves
        );
    }

    toString(): string {
        return `${Time.toStringCleanBoth(this.time, this.delay)} - ${this.moves ? this.moves : "∞"} moves`;
    }

    clone(): BronsteinDelayStage {
        return new BronsteinDelayStage(
            this.time.clone(),
            this.delay.clone(),
            this.moves
        );
    }
}

/**
 * BronsteinDelayTimer.
 *
 * @class BronsteinDelayTimer
 * @extends {Timer}
 */
export class BronsteinDelayTimer extends Timer implements TimerWithMoves, TimerWithDelay {
    public currentStageMoves: number;
    public stageTimeAtTurnStartstamp: number | null = null; // timestamp when current active turn started
    public pausedAt: number | null = null; // timestamp when the timer was paused
    public totalPausedDuration: number = 0; // total time spent paused
    public stageTimeAtTurnStart: number | null = null; // value of stage time at the start of turn

    /**
     * @constructor
     * Details of a timer preset
     * @param stages - array of BronsteinDelayStage objects
     * @param playerName - name of the player assigned to this timer
     * @param currentStage - current stage index
     * @param currentStageTime - current stage time in miliseconds, if passed null becomes max stage time
     * @param currentStageMoves - current stage moves, if null is max stage moves
     */
    constructor(
        stages: BronsteinDelayStage[], 
        playerName: string | null = null, 
        currentStage: number = 0, 
        currentStageTime: number | null = null, 
        currentStageMoves: number | null = null
    ) {
        //guarantee stages is a list of BronsteinDelayStages objects
        if (!Array.isArray(stages) || stages.length === 0) {
            throw new Error("stages must have at least one stage");
        }

        super(stages, playerName, currentStage, currentStageTime, PresetTypes.BRONSTEIN_DELAY.id);
        this.currentStageMoves = currentStageMoves ? currentStageMoves : 0; // it increases until reaching max stage moves (if it exists)
    }

    static fromJSON(data: BronsteinDelayTimerJSON): BronsteinDelayTimer {
        return new BronsteinDelayTimer(
            data.stages.map((stage: BronsteinDelayStageJSON) => BronsteinDelayStage.fromJSON(stage)), 
            data.playerName,
            data.currentStage,
            data.currentStageTime,
            data.currentStageMoves,
        );
    }

    toJSON(): BronsteinDelayTimerJSON {
        const json = super.toJSON();
        return {
            ...json,
            stages: (this.stages as BronsteinDelayStage[]).map((stage: BronsteinDelayStage) => stage.toJSON()), // typcast the stages to be of specific type BronsteinDelayStageJSON instead of just StageJSON
            currentStageMoves: this.currentStageMoves
        };
    }

    clone(): BronsteinDelayTimer {
        return new BronsteinDelayTimer(
            (this.stages as BronsteinDelayStage[]).map((stage: BronsteinDelayStage) => stage.clone()), // typcast stages as specific type BronsteinDelayStage
            this.playerName,
            this.currentStage,
            this.currentStageTime,
            this.currentStageMoves
        );
    }

    startTurn(startTime: number): void {
        this.stageTimeAtTurnStartstamp = startTime;
        this.pausedAt = null;
        this.totalPausedDuration = 0;
        this.stageTimeAtTurnStart = this.currentStageTime;
    }

    endTurn(): void {
        this.stageTimeAtTurnStartstamp = null;
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
        console.log("current stage:", this.currentStage, "stages length:", this.stages.length - 1);
        if (this.currentStage < this.stages.length - 1) {
            this.currentStage++;
            this.currentStageTime = (this.stages[this.currentStage] as BronsteinDelayStage).time.toMiliseconds(); // set current stage time to the next stage time
            this.currentStageMoves = 0; // reset moves for the new stage
            this.endTurn();
            return true; // moved to next stage
        }
        return false; // no more stages to move to
    }

    //increment current stage moves, when ending turn
    // call OnEndMoves when timer reaches 0 moves in all stages
    addMove(onEndMoves: () => void): void {
        console.log('adding move to timer');
        if (this.currentStageMoves !== null) {
            this.currentStageMoves++;
            
            // add delay time to current stage time, with time only being able to stay the same or decrease
            const stageDelay = (this.stages[this.currentStage] as BronsteinDelayStage).delay;

            if (stageDelay && !stageDelay.isDefault()) {
                this.currentStageTime = Math.min(this.stageTimeAtTurnStart, this.currentStageTime + stageDelay.toMiliseconds());
                console.log(`prev time: ${this.stageTimeAtTurnStart}ms, Added delay: ${stageDelay.toMiliseconds()}ms, new time: ${this.currentStageTime}ms`);
            }
            
            const currentStageMaxMoves = (this.stages[this.currentStage] as BronsteinDelayStage).moves;
            const remainingMoves = currentStageMaxMoves - this.currentStageMoves;
            
            if (currentStageMaxMoves && remainingMoves <= 0) { // if no more moves in current stage, move to next stage
                console.log("calling moveToNextStage in addMove");
                let movedToNextStage = this.#moveToNextStage();
                if (!movedToNextStage) { // if no more stages, call onEndMoves
                    onEndMoves();
                }
            }
        }

        this.endTurn(); // end delay calculations for this turn
    }

    //update current stage time
    _updateStageTime(timeLeftMiliseconds: number, onEndMoves: () => void): void {
        if (this.currentStageTime !== null) {
            console.log("time left miliseconds:", timeLeftMiliseconds);
            this.currentStageTime = timeLeftMiliseconds;
            if (timeLeftMiliseconds <= 0) { // if no more time in current stage, move to next stage
                console.log("calling moveToNextStage in _updateStageTime");
                let movedToNextStage = this.#moveToNextStage();
                if (movedToNextStage) {
                    this.startTurn(performance.now());
                } else { // if no more stages, call onEndMoves
                    onEndMoves();
                }
            }
        }
    }

    reset(): void {
        super.reset();
        this.currentStageMoves = 0;
        this.stageTimeAtTurnStartstamp = null;
        this.pausedAt = null;
        this.totalPausedDuration = 0;
        this.stageTimeAtTurnStart = null;
    }

    getCurrentStageMoves(): number {
        return this.currentStageMoves;
    }

    getCurrentStageDelay(): Time {
        return (this.stages[this.currentStage] as BronsteinDelayStage).delay;
    }

    getDelayProgress(): number {
        if (this.stageTimeAtTurnStartstamp === null) return 0;
        
        const delayMs = this.getCurrentStageDelay().toMiliseconds();
        if (delayMs === 0) return 1;

        let currentTime = performance.now();

        if (this.pausedAt) {
            currentTime = this.pausedAt;
        }

        const elapsedTime = (currentTime - this.stageTimeAtTurnStartstamp) - this.totalPausedDuration;
        const progress = Math.min(1, Math.max(0, elapsedTime / delayMs));
        
        return progress;
    }

}