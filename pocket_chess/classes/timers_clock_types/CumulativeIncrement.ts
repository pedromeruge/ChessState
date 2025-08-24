import { PresetTypes} from '../PresetType';
import Stage, {StageJSON} from '../timers_base/Stage';
import Timer, { TimerJSON } from '../timers_base/Timer';
import Time, { TimeJSON } from '../timers_base/Time';
import { TimerWithMoves } from '../types/TimerBuilderTypes';

export interface CumulativeIncrementStageJSON extends StageJSON {
    incrementBase: TimeJSON;
    incrementGrowth: TimeJSON;
    movesToGrowIncrement: number;
    totalMoves: number | null;
}

export interface CumulativeIncrementTimerJSON {
    stages: CumulativeIncrementStageJSON[];
    playerName: string;
    currentStage: number;
    currentStageTime: number;
    presetTypeId: number;
}

export class CumulativeIncrementStage extends Stage {
    public incrementBase: Time;
    public incrementGrowth: Time;
    public movesToGrowIncrement: number;
    public totalMoves: number | null;

    constructor(time: Time = new Time(0,0,0), incrementBase: Time = new Time(0,0,1), incrementGrowth: Time = new Time(0,0,1), movesToGrowIncrement: number = 1, totalMoves: number | null = null) {
        super(time);
        this.incrementBase = incrementBase;
        this.incrementGrowth = incrementGrowth;
        this.movesToGrowIncrement = movesToGrowIncrement;
        this.totalMoves = totalMoves;
    }

    toJSON(): CumulativeIncrementStageJSON {
        const json = super.toJSON() as any;
        json.incrementBase = this.incrementBase.toJSON();
        json.incrementGrowth = this.incrementGrowth.toJSON();
        json.movesToGrowIncrement = this.movesToGrowIncrement;
        json.totalMoves = this.totalMoves;
        return json;
    }

    static fromJSON(data: CumulativeIncrementStageJSON): CumulativeIncrementStage {
        return new CumulativeIncrementStage(
            Time.fromJSON(data.time),
            Time.fromJSON(data.incrementBase),
            Time.fromJSON(data.incrementGrowth),
            data.movesToGrowIncrement,
            data.totalMoves,
        );
    }

    toString(): string {
        return `${Time.toStringCleanBoth(this.time, this.incrementBase)} - ${this.incrementGrowth.toStringTimerSimple()} after ${this.movesToGrowIncrement ? this.movesToGrowIncrement : '∞'} moves`;
    }

    clone(): CumulativeIncrementStage {
        return new CumulativeIncrementStage(
            this.time.clone(),
            this.incrementBase.clone(),
            this.incrementGrowth.clone(),
            this.movesToGrowIncrement,
            this.totalMoves
        );
    }
}

/**
 * CumulativeIncrementTimer.
 *
 * @class CumulativeIncrementTimer
 * @extends {Timer}
 */
export class CumulativeIncrementTimer extends Timer implements TimerWithMoves {
    public currentStageIncrement: number | null;
    public currentStageMovesToGrowIncrement: number;
    public currentStageTotalMoves: number;

    /**
     * @constructor
     * Details of a timer preset
     * @param stages - array of CumulativeIncrementStage objects
     * @param playerName - name of the player assigned to this timer
     * @param currentStage - current stage index
     * @param currentStageTime - current stage time in miliseconds, if passed null becomes max stage time
     * @param currentStageIncrement - current stage value of increment (progressively increased by growth rate, after x increment moves). If null is base stage increment time
     * @param currentStageMovesToGrowIncrement - current number of moves since last increment, by default 0
     * @param currentStageTotalMoves - current stage totalMoves, if null is max stage totalMoves
     */
    constructor(
        stages: CumulativeIncrementStage[], 
        playerName: string | null = null, 
        currentStage: number = 0, 
        currentStageTime: number | null = null, 
        currentStageIncrement: number | null = null,
        currentStageMovesToGrowIncrement: number = 0,
        currentStageTotalMoves: number | null = null
    ) {
        //guarantee stages is a list of FischerIncremenStages objects
        if (!Array.isArray(stages) || stages.length === 0) {
            throw new Error("stages must have at least one stage");
        }

        super(stages, playerName, currentStage, currentStageTime, PresetTypes.CUMULATIVE_INCREMENT.id);
        this.currentStageIncrement = currentStageIncrement ? currentStageIncrement : (this.stages[currentStage] as CumulativeIncrementStage).incrementBase.toMiliseconds(); // in miliseconds
        this.currentStageMovesToGrowIncrement = currentStageMovesToGrowIncrement ? currentStageMovesToGrowIncrement : 0; // it increases until reaching max stage movesToGrowIncrement
        this.currentStageTotalMoves = currentStageTotalMoves ? currentStageTotalMoves : 0; // it increases until reaching max stage totalMoves (if it exists)
    }

    static fromJSON(data: CumulativeIncrementTimerJSON): CumulativeIncrementTimer {
        return new CumulativeIncrementTimer(
            data.stages.map((stage: CumulativeIncrementStageJSON) => CumulativeIncrementStage.fromJSON(stage)), 
            data.playerName,
            data.currentStage,
            data.currentStageTime
        );
    }

    toJSON(): CumulativeIncrementTimerJSON {
        const json = super.toJSON();
        return {
            ...json,
            stages: (this.stages as CumulativeIncrementStage[]).map((stage: CumulativeIncrementStage) => stage.toJSON()), // typcast the stages to be of specific type CumulativeIncrementStageJSON instead of just StageJSON
        };
    }

    clone(): CumulativeIncrementTimer {
        return new CumulativeIncrementTimer(
            (this.stages as CumulativeIncrementStage[]).map((stage: CumulativeIncrementStage) => stage.clone()), // typcast stages as specific type CumulativeIncrementStage
            this.playerName,
            this.currentStage,
            this.currentStageTime
        );
    }

    #moveToNextStage(): boolean {
        if (this.currentStage < this.stages.length - 1) {
            this.currentStage++;
            this.currentStageTime = (this.stages[this.currentStage] as CumulativeIncrementStage).time.toMiliseconds(); // set current stage time to the next stage time
            this.currentStageTotalMoves = 0; // reset totalMoves for the new stage
            this.currentStageMovesToGrowIncrement = 0;
            this.currentStageIncrement = (this.stages[this.currentStage] as CumulativeIncrementStage).incrementBase.toMiliseconds(); // reset increment to base increment
            return true; // moved to next stage
        }
        return false; // no more stages to move to
    }

    //increment current stage totalMoves
    // call OnEndMoves when timer reaches 0 totalMoves in all stages
    addMove(onEndMoves: () => void): void {
        console.log('adding move to timer');
        if (this.currentStageTotalMoves !== null) {

            // add increment time to current stage time
            const increment = this.currentStageIncrement;
            if (increment) {
                this.currentStageTime += increment;
            }

            this.currentStageTotalMoves++;
            this.currentStageMovesToGrowIncrement++;
            const currentStageIncrementMaxMoves = (this.stages[this.currentStage] as CumulativeIncrementStage).movesToGrowIncrement;
            
            // if reached max moves to raise increment
            if (this.currentStageMovesToGrowIncrement === currentStageIncrementMaxMoves) { 
                this.currentStageMovesToGrowIncrement = 0; // reset increment moves
                const currentStageIncrementGrowth = (this.stages[this.currentStage] as CumulativeIncrementStage).incrementGrowth.toMiliseconds();
                this.currentStageIncrement += currentStageIncrementGrowth; // increase increment by growth rate
            }
            
            const currentStageMaxMoves = (this.stages[this.currentStage] as CumulativeIncrementStage).totalMoves;
            const remainingMoves = currentStageMaxMoves - this.currentStageTotalMoves;

            // console.log("baseIncrement:", (this.stages[this.currentStage] as CumulativeIncrementStage).incrementBase.toMiliseconds(),
            //             "growth:", (this.stages[this.currentStage] as CumulativeIncrementStage).incrementGrowth.toMiliseconds(),
            //             "currentIncrement:", this.currentStageIncrement, 
            //             "currentMovesToIncrement:", this.currentStageMovesToGrowIncrement, "/", (this.stages[this.currentStage] as CumulativeIncrementStage).movesToGrowIncrement,
            //             "currentStageTotalMoves:", this.currentStageTotalMoves, "/", currentStageMaxMoves);
            
            // if no more totalMoves in current stage, move to next stage
            if (currentStageMaxMoves && remainingMoves <= 0) { 
                let moveToNextStage = this.#moveToNextStage();
                if (!moveToNextStage) { // if no more stages, call onEndMoves
                    onEndMoves();
                }
            }
        }
    }

    //update current stage time
    _updateStageTime(timeLeftMiliseconds: number, onEndMoves: () => void): boolean {
        if (this.currentStageTime !== null) {
            this.currentStageTime = Math.max(0, timeLeftMiliseconds); // always set to 0 or more
            if (timeLeftMiliseconds === 0) {
                let moveToNextStage = this.#moveToNextStage();
                if (!moveToNextStage) { // if no more stages, reset current stage time to 0
                    onEndMoves();
                }
            }
        }
        return false;
    }

    reset(): void {
        super.reset();
        this.currentStageIncrement = (this.stages[this.currentStage] as CumulativeIncrementStage).incrementBase.toMiliseconds(); // reset increment to base increment
        this.currentStageMovesToGrowIncrement = 0;
        this.currentStageTotalMoves = 0;
    }

    getCurrentStageMoves(): number {
        return this.currentStageTotalMoves;
    }
}