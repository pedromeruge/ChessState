import { PresetTypes} from '../PresetTypes';
import { Stage } from '../timers_base/Stage.js';
import { Timer } from '../timers_base/Timer.js';
import { Time } from '../timers_base/Time.js';

/*
#### CONCRETE CLASSES IMPLEMENTATION based on Preset.js
*/

export class FischerIncrementStage extends Stage {
    constructor(time= new Time(0,0,0), increment= new Time(0,0,0), moves=null) {
        super(time)
        this.increment = increment;
        this.moves = moves;
    }

    toJSON() {
        let json = super.toJSON();
        json.increment = this.increment.toJSON();
        json.moves = this.moves;
        return json;
    }

    static fromJSON(data) {
        return new FischerIncrementStage(
            Time.fromJSON(data.time), 
            Time.fromJSON(data.increment), 
            data.moves);
    }

    toString() {
        return `${Time.toStringCleanBoth(this.time, this.increment)} - ${this.moves ? this.moves : "∞"} moves`;
    }

    clone() {
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
export class FischerIncrementTimer extends Timer {
    /**
     * @constructor
     * Details of a timer preset
     * @param {FischerIncrementStage[]} stages - array of Stage objects
     * @param {*} currentStage - current stage index
     * @param {*} playerName - name of the player assigned to this timer
     * @param {*} currentStageTime - current stage time in miliseconds, if passed null becomes max stage time
     * @param {*} currentStageMoves - current stage moves, if null is max stage moves
     * @param {*} presetType - type of the preset, default is Fischer Increment
    */
    constructor(stages, playerName=null, currentStage = 0, currentStageTime=null, currentStageMoves=null) {
        
        //guarantee stages is a list of FischerIncremenStages objects
        if (!Array.isArray(stages) || stages.length === 0 || !stages.every(stage => stage instanceof FischerIncrementStage)) {
            throw new Error("stages must be an array of FischerIncrementStage objects");
        }

        super(stages, playerName, currentStage, currentStageTime, PresetTypes.FISCHER_INCREMENT);
        this.currentStageMoves = currentStageMoves ? currentStageMoves : 0; // it increases until reaching max stage moves (if it exists)
    }

    static fromJSON(data) {
        return new FischerIncrementTimer(
            data.stages.map(stage => FischerIncrementStage.fromJSON(stage)), 
            data.playerName,
            data.currentStage,
            data.currentStageTime,
            data.currentStageMoves,
        )
    }

    toJSON() {
        let json = super.toJSON();
        json.currentStageMoves = this.currentStageMoves;
        return json;
    }

    clone() {
        return new FischerIncrementTimer(
            this.stages.map(stage => stage.clone()),
            this.playerName,
            this.currentStage,
            this.currentStageTime,
            this.currentStageMoves,
            this.presetType.clone()
        );
    }

    #moveToNextStage() {
        if (this.currentStage < this.stages.length - 1) {
            this.currentStage++;
            this.currentStageTime = this.stages[this.currentStage].time.toMiliseconds(); // set current stage time to the next stage time
            this.currentStageMoves = 0; // reset moves for the new stage
            return true; // moved to next stage
        }
        return false; // no more stages to move to
    }

    //increment current stage moves
    // call OnEndMoves when timer reaches 0 moves in all stages
    addMove(onEndMoves) {
        console.log('adding move to timer');
        if (this.currentStageMoves !== null) {
            this.currentStageMoves++;
            
            // add increment time to current stage time
            const increment = this.stages[this.currentStage].increment;
            if (increment && !increment.isDefault()) {
                this.currentStageTime += increment.toMiliseconds();
                console.log(`Added increment: ${increment.toMiliseconds()}ms, new time: ${this.currentStageTime}ms`);
            }
            
            const currentStageMaxMoves = this.stages[this.currentStage].moves;
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
    _updateStageTime(timeLeftMiliseconds, onEndMoves) {
        if (this.currentStageTime !== null) {
            this.currentStageTime = Math.max(0,timeLeftMiliseconds); // always set to 0 or more
            if (timeLeftMiliseconds == 0) {
                let moveToNextStage = this.#moveToNextStage();
                if (!moveToNextStage) { // if no more stages, reset current stage time to 0
                    onEndMoves();
                }
            
            }
        }
    }

    reset() {
        super.reset();
        this.currentStageMoves = 0;
    }
}