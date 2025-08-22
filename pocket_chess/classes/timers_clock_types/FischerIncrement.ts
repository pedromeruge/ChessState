import { PresetTypes} from '../PresetType';
import Stage, {StageJSON} from '../timers_base/Stage';
import Timer, { TimerJSON } from '../timers_base/Timer';
import Time, { TimeJSON } from '../timers_base/Time';
import { TimerWithMoves } from '../types/TimerBuilderTypes';

export interface FischerIncrementStageJSON extends StageJSON {
    increment: TimeJSON;
    moves: number | null;
}

export interface FischerIncrementTimerJSON {
    stages: FischerIncrementStageJSON[];
    playerName: string;
    currentStage: number;
    currentStageTime: number;
    currentStageMoves: number;
    presetTypeId: number;
}

export class FischerIncrementStage extends Stage {
    public increment: Time;
    public moves: number | null;

    constructor(time: Time = new Time(0,0,0), increment: Time = new Time(0,0,0), moves: number | null = null) {
        super(time);
        this.increment = increment;
        this.moves = moves;
    }

    toJSON(): FischerIncrementStageJSON {
        const json = super.toJSON() as any;
        json.increment = this.increment.toJSON();
        json.moves = this.moves;
        return json;
    }

    static fromJSON(data: FischerIncrementStageJSON): FischerIncrementStage {
        return new FischerIncrementStage(
            Time.fromJSON(data.time), 
            Time.fromJSON(data.increment), 
            data.moves
        );
    }

    toString(): string {
        return `${Time.toStringCleanBoth(this.time, this.increment)} - ${this.moves ? this.moves : "∞"} moves`;
    }

    clone(): FischerIncrementStage {
        return new FischerIncrementStage(
            this.time.clone(),
            this.increment.clone(),
            this.moves
        );
    }
}

/**
 * FischerIncrementTimer.
 *
 * @class FischerIncrementTimer
 * @extends {Timer}
 */
export class FischerIncrementTimer extends Timer implements TimerWithMoves {
    public currentStageMoves: number;

    /**
     * @constructor
     * Details of a timer preset
     * @param stages - array of FischerIncrementStage objects
     * @param playerName - name of the player assigned to this timer
     * @param currentStage - current stage index
     * @param currentStageTime - current stage time in miliseconds, if passed null becomes max stage time
     * @param currentStageMoves - current stage moves, if null is max stage moves
     */
    constructor(
        stages: FischerIncrementStage[], 
        playerName: string | null = null, 
        currentStage: number = 0, 
        currentStageTime: number | null = null, 
        currentStageMoves: number | null = null
    ) {
        //guarantee stages is a list of FischerIncremenStages objects
        if (!Array.isArray(stages) || stages.length === 0) {
            throw new Error("stages must have at least one stage");
        }

        super(stages, playerName, currentStage, currentStageTime, PresetTypes.FISCHER_INCREMENT.id);
        this.currentStageMoves = currentStageMoves ? currentStageMoves : 0; // it increases until reaching max stage moves (if it exists)
    }

    static fromJSON(data: FischerIncrementTimerJSON): FischerIncrementTimer {
        return new FischerIncrementTimer(
            data.stages.map((stage: FischerIncrementStageJSON) => FischerIncrementStage.fromJSON(stage)), 
            data.playerName,
            data.currentStage,
            data.currentStageTime,
            data.currentStageMoves,
        );
    }

    toJSON(): FischerIncrementTimerJSON {
        const json = super.toJSON();
        return {
            ...json,
            stages: (this.stages as FischerIncrementStage[]).map((stage: FischerIncrementStage) => stage.toJSON()), // typcast the stages to be of specific type FischerIncrementStageJSON instead of just StageJSON
            currentStageMoves: this.currentStageMoves
        };
    }

    clone(): FischerIncrementTimer {
        return new FischerIncrementTimer(
            (this.stages as FischerIncrementStage[]).map((stage: FischerIncrementStage) => stage.clone()), // typcast stages as specific type FischerIncrementStage
            this.playerName,
            this.currentStage,
            this.currentStageTime,
            this.currentStageMoves
        );
    }

    #moveToNextStage(): boolean {
        if (this.currentStage < this.stages.length - 1) {
            this.currentStage++;
            this.currentStageTime = (this.stages[this.currentStage] as FischerIncrementStage).time.toMiliseconds(); // set current stage time to the next stage time
            this.currentStageMoves = 0; // reset moves for the new stage
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
            
            // add increment time to current stage time
            const increment = (this.stages[this.currentStage] as FischerIncrementStage).increment;
            if (increment && !increment.isDefault()) {
                this.currentStageTime += increment.toMiliseconds();
                console.log(`Added increment: ${increment.toMiliseconds()}ms, new time: ${this.currentStageTime}ms`);
            }
            
            const currentStageMaxMoves = (this.stages[this.currentStage] as FischerIncrementStage).moves;
            const remainingMoves = currentStageMaxMoves - this.currentStageMoves;
            if (currentStageMaxMoves && remainingMoves <= 0) { // if no more moves in current stage, move to next stage
                let moveToNextStage = this.#moveToNextStage();
                if (!moveToNextStage) { // if no more stages, call onEndMoves
                    onEndMoves();
                }
            }
        }
    }

    //update current stage time
    _updateStageTime(initialTimeMiliseconds: number, timeLeftMiliseconds: number, onEndMoves: () => void): void {
        if (this.currentStageTime !== null) {
            this.currentStageTime = Math.max(0, timeLeftMiliseconds); // always set to 0 or more
            if (timeLeftMiliseconds === 0) {
                let moveToNextStage = this.#moveToNextStage();
                if (!moveToNextStage) { // if no more stages, reset current stage time to 0
                    onEndMoves();
                }
            }
        }
    }

    reset(): void {
        super.reset();
        this.currentStageMoves = 0;
    }

    getCurrentStageMoves(): number {
        return this.currentStageMoves;
    }
}