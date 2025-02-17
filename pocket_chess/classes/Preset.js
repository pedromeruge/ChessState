import * as Constants from '../constants';

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

    setHours(hours) {
        this.hours = hours;
    }

    setMinutes(minutes) {
        this.minutes = minutes;
    }

    setSeconds(seconds) {
        this.seconds = seconds;
    }

    //to auto-suggest on new timers
    toStringClean() {
        let timeParts = []

        if (this.hours !== 0) {
            timeParts.push(this.hours.toString())
        }
        if (this.minutes !== 0) {
            timeParts.push(this.minutes.toString())
        }
        
        if ((this.minutes === 0 && this.hours === 0) || this.seconds !== 0) {
            timeParts.push(this.seconds.toString());
        }
        return timeParts.join(":");
    }

    toStringFieldsPad(incHours, incMinutes, incSeconds, padMinutes, padSeconds) {
        let timeParts = []

        if (incHours) {
            timeParts.push(this.hours.toString().padStart(2, "0"))
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

    toStringComplete() {
        return `${this.hours.toString().padStart(2, "0")}:` +
                `${this.minutes.toString().padStart(2, "0")}:`+
                `${this.seconds.toString().padStart(2, "0")}`;
    }

    toStringMinSecs() {
        return `${this.minutes.toString().padStart(2, "0")}:`+
                `${this.seconds.toString().padStart(2, "0")}`; 
    }

    toMilliseconds() {
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
}

export class Stage {
    constructor(time = new Time(0,0,0), increment= new Time(0,0,0), moves=null) {
        this.time = time;
        this.increment = increment;
        this.moves = moves;
    }

    toJSON() {
        return {
            time: this.time.toJSON(),
            increment: this.increment.toJSON(),
            moves: this.moves
        }
    }

    static fromJSON(data) {
        return new Stage(
            Time.fromJSON(data.time), 
            Time.fromJSON(data.increment), 
            data.moves);
    }

    toString() {
        return `${Time.toStringCleanBoth(this.time, this.increment)} - ${this.moves ? this.moves : "∞"} moves`;
    }
}

export class Timer {
    /**
     * Details of a timer preset
     * @param {*} stages - array of Stage objects
     * @param {*} title - title of the timer
     */
    constructor(stages, currentStage=0, currentStageTime=null, currentStageMoves=null) {
        this.stages = stages;
        this.currentStage = currentStage;
        this.currentStageTime = currentStageTime ? currentStageTime : this.stages[currentStage].time
        this.currentStageMoves = currentStageMoves ? currentStageMoves : this.stages[currentStage].moves
    }

    toJSON() {
        return {
            stages: this.stages.map(stage => stage.toJSON()),
            currentStage: this.currentStage,
            currentStageTime: this.currentStageTime ? this.currentStageTime.toJSON() : null,
            currentStageMoves: this.currentStageMoves
        }
    }

    static fromJSON(data) {
        return new Timer(
            data.stages.map(stage => Stage.fromJSON(stage)), 
            data.currentStage,
            Time.fromJSON(data.currentStageTime),
            data.currentStageMoves
        )
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
            textColor=Constants.COLORS.text_grey, 
            backColor=Constants.COLORS.white, 
            isCustom=false, 
            playerNames=null, 
            id=null) {
        this.timers = timers;
        this.title = title;
        this.textColor = textColor
        this.backColor = backColor
        this.isCustom = isCustom
        this.playerNames = playerNames ? playerNames : Array.from({ length: timers.length }, (_, i) => `Player ${i+1}`) // creates array with size, filled with custom function
        this.id = id ? id : Math.random().toString(36).slice(2, 9); // random id
    }

    // simplified constructor for a single timer identical in all players
    static samePlayerTimers(
        timer,
        title,
        textColor=Constants.COLORS.text_grey, 
        backColor=Constants.COLORS.white, 
        playerCount=2,
        isCustom=false,
        playerNames=null,
        id=null) {
        return new Preset(
            Array(playerCount).fill(timer),
            title,
            textColor,
            backColor,
            isCustom,
            playerNames,
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
            textColor: this.textColor,
            backColor: this.backColor,
            isCustom: this.isCustom,
            playerNames: this.playerNames, // array of strings
            id: this.id
        }
    }

    static fromJSON(data) {
        return new Preset(
            data.timers.map(timer => Timer.fromJSON(timer)), 
            data.title,
            data.textColor, 
            data.backColor, 
            data.isCustom,
            data.playerNames,
            data.id
        )
    }
}