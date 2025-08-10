import * as Constants from '../../constants/index';
import TimerFactory from '../factories/TimerFactory';
import Timer, { TimerJSON } from './Timer';

// TypeScript interfaces
export interface PresetJSON {
    timers: TimerJSON[];
    title: string;
    isCustom: boolean;
    textColor: string;
    backColor: string;
    id: string;
}

export default class Preset {
    public timers: Timer[];
    public title: string;
    public isCustom: boolean;
    public textColor: string;
    public backColor: string;
    public id: string;

    /**
     * Details of a timer preset
     * @param timers - array of Timer objects
     * @param title - title of the preset
     * @param isCustom - whether this is a custom preset
     * @param textColor - text color for the preset
     * @param backColor - background color for the preset
     * @param id - unique identifier for the preset
     */
    constructor(
        timers: Timer[], 
        title: string, 
        isCustom: boolean = false, 
        textColor: string = Constants.COLORS.text_grey, 
        backColor: string = Constants.COLORS.white, 
        id: string | null = null
    ) {
        this.timers = timers;
        this.title = title;
        this.isCustom = isCustom;
        this.textColor = textColor;
        this.backColor = backColor;
        this.id = id ? id : Math.random().toString(36).slice(2, 9); // random id
    }

    // simplified constructor for a single timer identical in all players
    static samePlayerTimers(
        timer: Timer,
        title: string,
        isCustom: boolean = false,
        textColor: string = Constants.COLORS.text_grey, 
        backColor: string = Constants.COLORS.white, 
        playerCount: number = 2,
        id: string | null = null
    ): Preset {
        const player1Timer = Timer.TimerWithDifferentPlayerName(timer, Constants.PLAYER_NAMES[0]);
        const player2Timer = Timer.TimerWithDifferentPlayerName(timer, Constants.PLAYER_NAMES[1]);

        return new Preset(
            [player1Timer, player2Timer],
            title,
            isCustom,
            textColor,
            backColor,
            id
        );
    }

    /**
     * Split the title into an array of strings, for correct display
     */
    titleStrings(): string[] {
        return this.title.split('|').map(item => item.trim());
    }

    toJSON(): PresetJSON {
        return {
            timers: this.timers.map(timer => timer.toJSON()),
            title: this.title,
            isCustom: this.isCustom,
            textColor: this.textColor,
            backColor: this.backColor,
            id: this.id
        };
    }

    static fromJSON(data: PresetJSON): Preset {
        return new Preset(
            data.timers.map(timer => TimerFactory.createTimerFromJSON(timer)), 
            data.title,
            data.isCustom,
            data.textColor, 
            data.backColor, 
            data.id
        );
    }
}

//for convenience access all of these base classes from Preset.tsx
export { default as Time } from './Time';
export { default as Stage } from './Stage';
export { default as Timer } from './Timer';