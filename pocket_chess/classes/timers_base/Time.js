
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