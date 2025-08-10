import * as Constants from '../../constants';
import { PresetTypes } from '../PresetTypes';

export class Timer {
    /**
     * @constructor
     * @abstract
     * Details of a timer preset
     * @param {*} stages - array of Stage objects
     * @param {*} currentStage - current stage index
     * @param {*} playerName - name of the player assigned to this timer
     * @param {*} currentStageTime - current stage time in miliseconds, if passed null becomes max stage time
     * @param {*} presetType - type of the preset, default is Fischer Increment
    */
    constructor(stages, playerName=null, currentStage = 0, currentStageTime=null, presetType=PresetTypes.FISCHER_INCREMENT) {
        
        if (Object.getPrototypeOf(this) === Timer.prototype) { // guarantee it must be called from concrete implementation of class, not the abstract class
            throw new Error("Abstract class Timer cannot be instantiated directly.");
        }

        this.stages = stages;
        this.playerName = playerName ? playerName : Constants.PLAYER_NAME_DEFAULT;
        this.currentStage = currentStage;
        this.currentStageTime = currentStageTime ? currentStageTime : this.stages[currentStage].time.toMiliseconds(); // in miliseconds // decreases until reaching 0
        this.presetType = presetType;
    }

    /**
     * @abstract
     */
    clone() {
        if (Object.getPrototypeOf(this) === Timer.prototype) {
            throw new Error("method 'clone()' must be implemented in a concrete subclass of Timer");
        }
    }

    /**
     * @abstract 
     */
    _updateStageTime(timeLeftMiliseconds, onEndMoves) {
        if (Object.getPrototypeOf(this) === Timer.prototype) {
            throw new Error("method 'updateStageTime()' must be implemented in a concrete subclass of Timer");
        }
    }

    /**
     * @abstract
     * Increment current stage moves
     * @param {*} onEndMoves - callback function to call when no more moves are available in all stages
     */

    //increment current stage moves
    // call OnEndMoves when timer reaches 0 moves in all stages
    addMove(onEndMoves) {
        if (Object.getPrototypeOf(this) === Timer.prototype) {
            throw new Error("method 'addMove()' must be implemented in a concrete subclass of Timer");
        }
    }

    // deep copy constructor 
    static TimerWithDifferentPlayerName(timer, playerName) {
        let newTimer = timer.clone();
        newTimer.playerName = playerName ? playerName : Constants.PLAYER_NAME_DEFAULT;
        return newTimer;
    }

    hasStages() {
        return this.stages && this.stages.length > 0;
    }

    removeStage(index) {
        if (index < 0 || index >= this.stages.length) {
            throw new Error("Index out of bounds");
        }
        this.stages.splice(index, 1);
        
        // reset current stage if it was removed
        if (this.currentStage >= this.stages.length) {
            this.currentStage = this.stages.length - 1;
            this.currentStageTime = this.stages[this.currentStage].time.toMiliseconds();
        }
    }
    toJSON() {
        return {
            stages: this.stages.map(stage => stage.toJSON()),
            playerName: this.playerName,
            currentStage: this.currentStage,
            currentStageTime: this.currentStageTime,
            presetType: this.presetType.toJSON()
        }
    }


    reset() {
        this.currentStage = 0;
        this.currentStageTime = this.stages[0].time.toMiliseconds();
    }

    /**
     * Deserialize object from JSON
     * Defined in TimerFactory.js to avoid cyclic depedencies
     */
    // static fromJSON(data, presetTypeId) {}

}