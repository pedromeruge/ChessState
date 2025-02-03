import * as Constants from '../constants';

/**
 * One stage in a timer. Normals timers have just one stage, but Fischer timers have multiple stages
 * @param {*} time - total time in miliseconds
 * @param {*} increment - increment per move in miliseconds
 * @param {*} moves - max moves, if null it's infinite
 */
export class Stage {
    constructor(time, increment, moves=null) {
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