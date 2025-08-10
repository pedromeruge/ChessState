import * as Constants from '../../constants';
import PresetType, { PresetTypes, PresetTypeJSON } from '../PresetType';
import Stage, { StageJSON } from './Stage';

export interface TimerJSON {
    stages: StageJSON[];
    playerName: string;
    currentStage: number;
    currentStageTime: number;
    presetTypeId: number;
}

export default abstract class Timer {
    public stages: Stage[];
    public playerName: string;
    public currentStage: number;
    public currentStageTime: number;
    public presetType: PresetType;

    /**
     * @constructor
     * @abstract
     * Details of a timer preset
     * @param stages - array of Stage objects
     * @param playerName - name of the player assigned to this timer
     * @param currentStage - current stage index
     * @param currentStageTime - current stage time in miliseconds, if passed null becomes max stage time
     * @param presetType - type of the preset, default is Fischer Increment
    */
    constructor(
        stages: Stage[], 
        playerName: string | null = null, 
        currentStage: number = 0, 
        currentStageTime: number | null = null, 
        presetType: PresetType = PresetTypes.FISCHER_INCREMENT
    ) {
        this.stages = stages;
        this.playerName = playerName ? playerName : Constants.PLAYER_NAME_DEFAULT;
        this.currentStage = currentStage;
        this.currentStageTime = currentStageTime ? currentStageTime : this.stages[currentStage].time.toMiliseconds(); // in miliseconds // decreases until reaching 0
        this.presetType = presetType;
    }

    /**
     * @abstract
     */
    abstract clone(): Timer;

    /**
     * @abstract 
     */
    abstract _updateStageTime(timeLeftMiliseconds: number, onEndMoves: () => void): void;

    /**
     * @abstract
     * Increment current stage moves
     * @param onEndMoves - callback function to call when no more moves are available in all stages
     */
    abstract addMove(onEndMoves: () => void): void;

    // deep copy constructor 
    static TimerWithDifferentPlayerName(timer: Timer, playerName: string | null): Timer {
        let newTimer = timer.clone();
        newTimer.playerName = playerName ? playerName : Constants.PLAYER_NAME_DEFAULT;
        return newTimer;
    }

    hasStages(): boolean {
        return this.stages && this.stages.length > 0;
    }

    removeStage(index: number): void {
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

    toJSON(): TimerJSON {
        return {
            stages: this.stages.map(stage => stage.toJSON()),
            playerName: this.playerName,
            currentStage: this.currentStage,
            currentStageTime: this.currentStageTime,
            presetTypeId: this.presetType.id
        }
    }

    reset(): void {
        this.currentStage = 0;
        this.currentStageTime = this.stages[0].time.toMiliseconds();
    }

    /**
     * Deserialize object from JSON
     * Defined in TimerFactory.js to avoid cyclic depedencies
     */
    // static fromJSON(data, presetTypeId) {}

}