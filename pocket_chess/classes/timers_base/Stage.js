export class Stage {
    constructor(time= new Time(0,0,0)) {
        this.time = time;
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

    /**
     * Deserialize object from JSON
     * Defined in TimerFactory.js to avoid cyclic depedencies
     */
    // static fromJSON(data, presetTypeId) {}
}
