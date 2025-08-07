import * as Constants from '../constants';
import { PresetTypes, PresetType } from './PresetTypes';

/*
#### BASE CLASSES IMPLEMENTATION
*/

/**
 * One stage in a timer. Normals timers have just one stage, but Fischer timers have multiple stages
 * @param {*} time - total time in miliseconds
 * @param {*} increment - increment per move in miliseconds
 * @param {*} moves - max moves, if null it's infinite
 */

export class Time {
    constructor(hours=0, minutes=0, seconds=0) {
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
    }

    // create a Time object from miliseconds
    static fromMiliseconds(miliseconds) {
        const inSeconds = Math.ceil(miliseconds / 1000);
        const hours = Math.floor(inSeconds / (60 * 60));
        const minutes = Math.floor( (inSeconds % (60 * 60)) / 60);
        const seconds = inSeconds % 60; // for example, when we have 0,67 seconds left -> instead of showing 00:00 to the player, show 00:01, hence the rounding up
        return new Time(hours, minutes, seconds);
    }

    setHours(hours) {
        this.hours = hours;
    }

    setMinutes(minutes) {
        this.minutes = minutes;
    }

    setSeconds(seconds) {
        this.seconds = seconds;
    }

    //update time from miliseconds
    setFromMiliseconds(miliseconds) {
        const inSeconds = Math.ceil(miliseconds / 1000);
        this.hours = Math.floor(inSeconds / (60 * 60));
        this.minutes = Math.floor( (inSeconds % (60 * 60)) / 60);
        this.seconds = inSeconds % 60;
    }

    toStringFieldsPad(incHours, incMinutes, incSeconds, padMinutes, padSeconds) {
        let timeParts = []

        if (incHours) {
            timeParts.push(this.hours.toString())
        }
        if (incMinutes) {
            const minutes = padMinutes ? this.minutes.toString().padStart(2, "0") : this.minutes.toString()
            timeParts.push(minutes)
        }
        
        if (incSeconds) {
            const seconds = padSeconds ? this.seconds.toString().padStart(2, "0") : this.seconds.toString()
            timeParts.push(seconds);
        }

        return timeParts.join(":");
    }

    static toStringCleanBoth(baseTime, increment, joiner="|") {
        
        let hourClause1 = baseTime.hours !== 0
        let hourClause2 = increment.hours !== 0

        let minuteClause1 = baseTime.minutes !== 0
        let minuteClause2 = increment.minutes !== 0

        let secondClause1 = (baseTime.minutes === 0 && baseTime.hours === 0) || baseTime.seconds !== 0
        let secondClause2 = (increment.minutes === 0 && increment.hours === 0) || increment.seconds !== 0

        hourClause1 = hourClause1 || hourClause2
        minuteClause1 = minuteClause1 || minuteClause2
        secondClause1 = secondClause1 || hourClause1

        secondClause2 = secondClause2 || minuteClause2
        
        const padMinute = hourClause1
        const padSecond = secondClause1

        const result = baseTime.toStringFieldsPad(hourClause1, minuteClause1, secondClause1, padMinute, padSecond) 
                + joiner 
                + increment.toStringFieldsPad(hourClause2, minuteClause2, secondClause2, padMinute, padSecond)
        return result
    }

    // IN WORK: separte attempt at simplyfying the string representation of time, by removing padding in minutes when hours are 0
    toStringTimer() {
        let result = ""

        if (this.hours) {
            result += this.hours.toString() + ":"
        }
        if (this.hours || this.minutes || this.seconds) {
            if (this.hours) {
                result += this.minutes.toString().padStart(2, "0")
            }
            else {
                result += this.minutes.toString()
            }

            result += ":"
        }
        
        result += this.seconds.toString().padStart(2, "0")

        return result
    }

    // two 0 padding on each field, but ignore hours if they are 0
    toStringTimerSimple() {
        let result = ""

        if (this.hours) {
            result += this.hours.toString().padStart(2, "0") + ":";
        }
        result += this.minutes.toString().padStart(2, "0") + ":"
        result += this.seconds.toString().padStart(2, "0");
        return result;
    }

    // include all fields, with two 0 padding
    toStringComplete() {
        return `${this.hours.toString().padStart(2, "0")}:` +
                `${this.minutes.toString().padStart(2, "0")}:`+
                `${this.seconds.toString().padStart(2, "0")}`;
    }

    toStringMinSecs() {
        return `${this.minutes.toString().padStart(2, "0")}:`+
                `${this.seconds.toString().padStart(2, "0")}`; 
    }

    toMiliseconds() {
        return (this.hours * 60 * 60 + 
                this.minutes * 60 + 
                this.seconds) * 1000;
    }

    isDefault() {
        return this.hours === 0 && this.minutes === 0 && this.seconds === 0;
    }

    //serialize object to JSON
    toJSON() {
        return {
            hours: this.hours,
            minutes: this.minutes,
            seconds: this.seconds
        }
    }

    //deserialize object from JSON
    static fromJSON(data) {
        return new Time(data.hours, data.minutes, data.seconds);
    }

    clone() {
        return new Time(this.hours, this.minutes, this.seconds);
    }
}

export class Stage {
    constructor(time= new Time(0,0,0)) {
        this.time = time;
    }

    /**
     * @abstract
     * Deserialize object from JSON
     * @param {*} data - JSON object with stage data
     * @returns {Timer} - instance of Stage subclass
     */
    static fromJSON(data, presetTypeId) {
        switch(presetTypeId) {
            case PresetTypes.FISCHER_INCREMENT.id:
                return FischerIncrementStage.fromJSON(data);
            case PresetTypes.SIMPLE_DELAY.id:
                // return SimpleDelayStage.fromJSON(data);
            case PresetTypes.BRONSTEIN_DELAY.id:
                // return BronsteinDelayStage.fromJSON(data);
            case PresetTypes.CUMULATIVE_INCREMENT.id:
                // return CumulativeIncrementStage.fromJSON(data);
            case PresetTypes.MOVE_TIMER.id:
                // return MoveTimerStage.fromJSON(data);
            case PresetTypes.HOURGLASS.id:
                // return HourglassStage.fromJSON(data);
            default:
                throw new Error(`Unknown preset type: ${presetTypeId}. Supported types: ${Object.values(PresetTypes).map(pt => pt.id).join(', ')}`);
        }
    }

    /**
     * @abstract
     */
    toString() {
        if (Object.getPrototypeOf(this) === Stage.prototype) {
            throw new Error("method 'toString()' must be implemented in a concrete subclass of Stage");
        }
    }

    clone() {
        if (Object.getPrototypeOf(this) === Stage.prototype) {
            throw new Error("method 'clone()' must be implemented in a concrete subclass of Stage");
        }
    }

    toJSON() {
        return {
            time: this.time.toJSON(),
        }
    }
}

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
     * Deserialize object from JSON
     * @param {*} data - JSON object with timer data
     * @returns {Timer} - instance of Timer subclass
     */
    static fromJSON(data) {
        switch(data.presetType.id) {
            case PresetTypes.FISCHER_INCREMENT.id:
                return FischerIncrementTimer.fromJSON(data);
            case PresetTypes.SIMPLE_DELAY.id:
                // return SimpleDelayTimer.fromJSON(data);
            case PresetTypes.BRONSTEIN_DELAY.id:
                // return BronsteinDelayTimer.fromJSON(data);
            case PresetTypes.CUMULATIVE_INCREMENT.id:
                // return CumulativeIncrementTimer.fromJSON(data);
            case PresetTypes.MOVE_TIMER.id:
                // return MoveTimer.fromJSON(data);
            case PresetTypes.HOURGLASS.id:
                // return HourglassTimer.fromJSON(data);
            default:
                throw new Error(`Unknown preset type: ${data.presetType.id}. Supported types: ${Object.values(PresetTypes).map(pt => pt.id).join(', ')}`);
        }
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

}

export class Preset {
    /**
     * Details of a timer preset
     * @param {*} timers - array of Timer objects
     * @param {*} title - title of the preset
     */
    constructor(
            timers, 
            title, 
            isCustom=false, 
            textColor=Constants.COLORS.text_grey, 
            backColor=Constants.COLORS.white, 
            id=null) {
        this.timers = timers;
        this.title = title;
        this.isCustom = isCustom
        this.textColor = textColor
        this.backColor = backColor
        this.id = id ? id : Math.random().toString(36).slice(2, 9); // random id
    }

    // simplified constructor for a single timer identical in all players
    static samePlayerTimers(
            timer,
            title,
            isCustom=false,
            textColor=Constants.COLORS.text_grey, 
            backColor=Constants.COLORS.white, 
            playerCount=2,
            id=null) {

        const player1Timer = Timer.TimerWithDifferentPlayerName(timer, Constants.PLAYER_NAMES[0]);
        const player2Timer = Timer.TimerWithDifferentPlayerName(timer, Constants.PLAYER_NAMES[1]);

        return new Preset(
            [player1Timer, player2Timer],
            title,
            isCustom,
            textColor,
            backColor,
            id
        )
    }

    /**
     * Split the title into an array of strings, for correct display
     */
    titleStrings() {
        return this.title.split('|').map(item => item.trim())
    }

    toJSON() {
        return {
            timers: this.timers.map(timer => timer.toJSON()),
            title: this.title,
            isCustom: this.isCustom,
            textColor: this.textColor,
            backColor: this.backColor,
            id: this.id
        }
    }

    static fromJSON(data) {
        return new Preset(
            data.timers.map(timer => Timer.fromJSON(timer)), 
            data.title,
            data.isCustom,
            data.textColor, 
            data.backColor, 
            data.id
        )
    }
}

/*
#### CONCRETE CLASSES IMPLEMENTATION
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
     * @param {[FischerIncrementStage]} stages - array of Stage objects
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