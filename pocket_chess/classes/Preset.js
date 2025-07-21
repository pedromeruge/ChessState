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

    static fromMiliseconds(miliseconds) {
        const inSeconds = Math.floor(miliseconds / 1000);
        const hours = Math.floor(inSeconds / (60 * 60));
        const minutes = Math.floor( (inSeconds % (60 * 60)) / 60);
        const seconds = inSeconds % 60;
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

    clone() {
        return new Stage(
            this.time.clone(),
            this.increment.clone(),
            this.moves
        );
    }
}

export class Timer {
    /**
     * Details of a timer preset
     * @param {*} stages - array of Stage objects
     * @param {*} currentStage- current stage index
     * @param {*} playerName - name of the player assigned to this timer
     * @param {*} currentStageTime - current stage time, if null is max stage time
     * @param {*} currentStageMoves - current stage moves, if null is max stage moves
    */
    constructor(stages, playerName=null, currentStage = 0, currentStageTime=null, currentStageMoves=null) {
        this.stages = stages;
        this.playerName = playerName ? playerName : Constants.PLAYER_NAME_DEFAULT;
        this.currentStage = currentStage;
        this.currentStageTime = currentStageTime ? currentStageTime : this.stages[currentStage].time
        this.currentStageMoves = currentStageMoves ? currentStageMoves : this.stages[currentStage].moves
    }

    // deep copy constructor 
    static TimerWithDifferentPlayerName(timer, playerName) {
        let newTimer = timer.clone();
        newTimer.playerName = playerName ? playerName : Constants.PLAYER_NAME_DEFAULT;
        return newTimer;
    }

    toJSON() {
        return {
            stages: this.stages.map(stage => stage.toJSON()),
            playerName: this.playerName,
            currentStage: this.currentStage,
            currentStageTime: this.currentStageTime ? this.currentStageTime.toJSON() : null,
            currentStageMoves: this.currentStageMoves
        }
    }

    static fromJSON(data) {
        return new Timer(
            data.stages.map(stage => Stage.fromJSON(stage)), 
            data.playerName,
            data.currentStage,
            Time.fromJSON(data.currentStageTime),
            data.currentStageMoves
        )
    }

    clone() {
        return new Timer(
            this.stages.map(stage => stage.clone()),
            this.playerName,
            this.currentStage,
            this.currentStageTime ? this.currentStageTime.clone() : null,
            this.currentStageMoves
        );
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