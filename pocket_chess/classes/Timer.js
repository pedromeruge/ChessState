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

    toStringClean() {
        let timeParts = []

        if (this.hours !== 0) {
            timeParts.push(this.hours.toString().padStart(2, "0"));
        }
        if (this.minutes !== 0) {
            timeParts.push(this.minutes.toString().padStart(2, "0"));
        }

        timeParts.push(this.seconds.toString().padStart(2, "0"));
        
        return timeParts.join(":");
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
}

export class Stage {
    constructor(time = new Time(0,0,0), increment= new Time(0,0,0), moves=null) {
        this.time = time;
        this.increment = increment;
        this.moves = moves;
    }
}

export class Timer {
    /**
     * Details of a timer preset
     * @param {*} stages - array of Stage objects
     * @param {*} title - title of the timer
     */
    constructor(stages, title, textColor=Constants.COLORS.text_grey, backColor=Constants.COLORS.white, isCustom=false) {
        this.stages = stages;
        this.title = title;
        this.textColor = textColor
        this.backColor = backColor
        this.isCustom = isCustom
        this.currentStage = 0;
        this.currentStageTime = this.stages[0].time
        this.currentStageMoves = this.stages[0].moves
        this.id = Math.random().toString(36).slice(2, 9); // random id
    }

    /**
     * Split the title into an array of strings, for correct display
     */
    titleStrings() {
        return this.title.split('|').map(item => item.trim())
    }
}