import * as Constants from '../../constants';
import TimerFactory from '../factories/TimerFactory';

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
            data.timers.map(timer => TimerFactory.createTimerFromJSON(timer)), 
            data.title,
            data.isCustom,
            data.textColor, 
            data.backColor, 
            data.id
        )
    }
}

//for convenience acess all of these base classes from Preset.js
export { Time } from './Time.js';
export { Stage } from './Stage.js';
export { Timer } from './Timer.js';