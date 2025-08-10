import Time, { TimeJSON } from './Time';

export interface StageJSON {
    time: TimeJSON;
}

export default abstract class Stage {
    public time: Time;

    constructor(time: Time = new Time(0, 0, 0)) {
        this.time = time;
    }

    /**
     * @abstract
     */
    abstract toString(): string;

    abstract clone(): Stage;

    toJSON(): StageJSON {
        return {
            time: this.time.toJSON(),
        }
    }

    /**
     * Deserialize object from JSON
     * Defined in TimerFactory.js to avoid cyclic depedencies
     */
    // static fromJSON(data, presetTypeId) {}
}
