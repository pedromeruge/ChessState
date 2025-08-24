import { PresetTypes} from '../PresetType';
import Stage, {StageJSON} from '../timers_base/Stage';
import Timer, { TimerJSON } from '../timers_base/Timer';
import Time, { TimeJSON } from '../timers_base/Time';
import { TimerWithMoves, TimerWithLives } from '../types/TimerBuilderTypes';

export interface FixedMovesStageJSON extends StageJSON {
    lives: number;
    moves: number | null;
}

export interface FixedMovesTimerJSON {
    stages: FixedMovesStageJSON[];
    playerName: string;
    currentStage: number;
    currentStageTime: number;
    currentStageLives: number;
    currentStageMoves: number;
    presetTypeId: number;
}

export class FixedMovesStage extends Stage {
    public lives: number;
    public moves: number | null;

    constructor(time: Time = new Time(0,0,0), lives: number = 1, moves: number | null = null) {
        super(time);
        this.lives = lives;
        this.moves = moves;
    }

    toJSON(): FixedMovesStageJSON {
        const json = super.toJSON() as any;
        json.lives = this.lives;
        json.moves = this.moves;
        return json;
    }

    static fromJSON(data: FixedMovesStageJSON): FixedMovesStage {
        return new FixedMovesStage(
            Time.fromJSON(data.time), 
            data.lives, 
            data.moves
        );
    }

    toString(): string {
        return `${this.time.toStringTimerSimple()} - ${this.lives} lives - ${this.moves ? this.moves : "∞"} moves`;
    }

    clone(): FixedMovesStage {
        return new FixedMovesStage(
            this.time.clone(),
            this.lives,
            this.moves
        );
    }
}

/**
 * FixedMovesTimer.
 *
 * @class FixedMovesTimer
 * @extends {Timer}
 */
export class FixedMovesTimer extends Timer implements TimerWithMoves, TimerWithLives {
    public currentStageMoves: number;
    public currentStageLives: number;

    /**
     * @constructor
     * Details of a timer preset
     * @param stages - array of FixedMovesStage objects
     * @param playerName - name of the player assigned to this timer
     * @param currentStage - current stage index
     * @param currentStageTime - current stage time in miliseconds, if passed null becomes max stage time
     * @param currentStageLives - current stage remaining lives, if null is max stage lives
     * @param currentStageMoves - current stage moves, if null is 0
     */
    constructor(
        stages: FixedMovesStage[], 
        playerName: string | null = null, 
        currentStage: number = 0, 
        currentStageTime: number | null = null, 
        currentStageLives: number | null = null,
        currentStageMoves: number | null = null
    ) {
        //guarantee stages is a list of FixedMovesStages objects
        if (!Array.isArray(stages) || stages.length === 0) {
            throw new Error("stages must have at least one stage");
        }

        super(stages, playerName, currentStage, currentStageTime, PresetTypes.FIXED_MOVES.id);
        this.currentStageLives = currentStageLives ? currentStageLives : (this.stages[this.currentStage] as FixedMovesStage).lives; // it decreases from max stage lives to 0
        this.currentStageMoves = currentStageMoves ? currentStageMoves : 0; // it increases until reaching max stage moves (if it exists)
    }

    static fromJSON(data: FixedMovesTimerJSON): FixedMovesTimer {
        return new FixedMovesTimer(
            data.stages.map((stage: FixedMovesStageJSON) => FixedMovesStage.fromJSON(stage)), 
            data.playerName,
            data.currentStage,
            data.currentStageTime,
            data.currentStageLives,
            data.currentStageMoves
        );
    }

    toJSON(): FixedMovesTimerJSON {
        const json = super.toJSON();
        return {
            ...json,
            stages: (this.stages as FixedMovesStage[]).map((stage: FixedMovesStage) => stage.toJSON()), // typcast the stages to be of specific type FixedMovesStageJSON instead of just StageJSON
            currentStageLives: this.currentStageLives,
            currentStageMoves: this.currentStageMoves
        };
    }

    clone(): FixedMovesTimer {
        return new FixedMovesTimer(
            (this.stages as FixedMovesStage[]).map((stage: FixedMovesStage) => stage.clone()), // typcast stages as specific type FixedMovesStage
            this.playerName,
            this.currentStage,
            this.currentStageTime,
            this.currentStageLives,
            this.currentStageMoves
        );
    }

    // move to next stage of player (if possible)
    #moveToNextStage(): boolean {
        if (this.currentStage < this.stages.length - 1) {
            this.currentStage++;
            this.currentStageTime = (this.stages[this.currentStage] as FixedMovesStage).time.toMiliseconds(); // set current stage time to the next stage time
            this.currentStageLives = (this.stages[this.currentStage] as FixedMovesStage).lives; // reset max lives for the new stage
            this.currentStageMoves = 0; // reset moves for the new stage
            return true; // moved to next stage
        }
        return false; // no more stages to move to
    }

    // reduce lives in current stage for player (if possible)
    #consumeLife(): boolean {
        this.currentStageLives--;
        if (this.currentStageLives === 0) {
            return true; // no more lives to consume in current stage
        }

        this.currentStageTime = (this.stages[this.currentStage] as FixedMovesStage).time.toMiliseconds(); // set current stage time to the next stage time
        return false;
    }

    //increment current stage moves
    // call OnEndMoves when timer reaches 0 moves in all stages
    addMove(onEndMoves: () => void): void {
        console.log('adding move to timer');
        if (this.currentStageMoves !== null) {
            this.currentStageMoves++;
            
            const currentStageMaxMoves = (this.stages[this.currentStage] as FixedMovesStage).moves;
            const remainingMoves = currentStageMaxMoves - this.currentStageMoves;
            if (currentStageMaxMoves && remainingMoves <= 0) { // if no more moves in current stage, move to next stage
                let moveToNextStage = this.#moveToNextStage();
                if (!moveToNextStage) { // if no more stages, call onEndMoves
                    onEndMoves();
                }
            }
            else {
                this.currentStageTime = (this.stages[this.currentStage] as FixedMovesStage).time.toMiliseconds(); // reset current stage time to the start stage time
            }
        }
    }

    //update current stage time
    _updateStageTime(timeLeftMiliseconds: number, onEndMoves: () => void): boolean {
        if (this.currentStageTime !== null) {
            this.currentStageTime = timeLeftMiliseconds;
            if (timeLeftMiliseconds <= 0) {
                console.log("before lives:", this.currentStageLives, "/", (this.stages[this.currentStage] as FixedMovesStage).lives);
                const reducedLives : boolean = this.#consumeLife();
                console.log("after lives:", this.currentStageLives, "/", (this.stages[this.currentStage] as FixedMovesStage).lives);
                console.log("current stage time:", this.currentStageTime);
                if (reducedLives) {
                    const moveToNextStage : boolean = this.#moveToNextStage();
                    if (!moveToNextStage) { // if no more stages, end timer
                        onEndMoves();
                    }
                }
                return true;
            }
        }
        return false;
    }

    reset(): void {
        super.reset();
        this.currentStageMoves = 0;
        this.currentStageLives = (this.stages[this.currentStage] as FixedMovesStage).lives;
    }

    getCurrentStageLives(): number {
        return this.currentStageLives;
    }

    getCurrentStageMoves(): number {
        return this.currentStageMoves;
    }
}