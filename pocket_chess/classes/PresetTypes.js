import * as Constants from '../constants';

class PresetType {
    constructor(id, name, short_description, long_description) {
        this.id = id;
        this.name = name;
        this.short_description = short_description;
        this.long_description = long_description;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            short_description: this.short_description,
            long_description: this.long_description
        };
    }

    static fromJSON(json) {
        return new PresetType(
            json.id,
            json.name,
            json.short_description,
            json.long_description
        );
    }

    clone() {
        return new PresetType(
            this.id,
            this.name,
            this.short_description,
            this.long_description
        );
    }
}

const PresetTypes = {
    FISCHER_INCREMENT: new PresetType(
        1, 
        "Fischer Increment",
        "Add time after each move",
        "TO BE DEFINED1"
    ),
    SIMPLE_DELAY: new PresetType(2, 
        "Simple Delay",
        "Delay at start of each move",
        "TO BE DEFINED2"
    ),
    BRONSTEIN_DELAY: new PresetType(3, 
        "Bronstein Delay",
        "Refund time after each move",
        "TO BE DEFINED3"
    ),
    CUMULATIVE_INCREMENT: new PresetType(4, 
        "Cumulative Increment",
        "Increase increment with every move",
        "TO BE DEFINED4"
    ),
    MOVE_TIMER: new PresetType(5, 
        "Move Timer",
        "Fixed seconds per move",
        "TO BE DEFINED5"
    ),
    HOURGLASS: new PresetType(6, 
        "Hourglass",
        "Time used by one player is added to the other player’s clock",
        "TO BE DEFINED6"
    )
}

const popularPresetTypes = [
    PresetTypes.FISCHER_INCREMENT,
    PresetTypes.SIMPLE_DELAY,
    PresetTypes.BRONSTEIN_DELAY,
]

const uncommonPresetTypes = [
    PresetTypes.CUMULATIVE_INCREMENT,
    PresetTypes.MOVE_TIMER,
    PresetTypes.HOURGLASS,
]

export { PresetType, PresetTypes, popularPresetTypes, uncommonPresetTypes };