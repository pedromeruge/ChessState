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
        "Time used is transferred to other player",
        "TO BE DEFINED6"
    ),
    HOURGLASS_2: new PresetType(7, 
        "Hourglass_2",
        "Time used is transferred to other player",
        "TO BE DEFINED6"
    ),
    HOURGLASS_3: new PresetType(8, 
        "Hourglass_3",
        "Time used is transferred to other player",
        "TO BE DEFINED6"
    ),
    HOURGLASS_4: new PresetType(9, 
        "Hourglass_4",
        "Time used is transferred to other player",
        "TO BE DEFINED6"
    ),
    HOURGLASS_5: new PresetType(10, 
        "Hourglass_5",
        "Time used is transferred to other player",
        "TO BE DEFINED6"
    ),
    HOURGLASS_6: new PresetType(11, 
        "Hourglass_6",
        "Time used is transferred to other player",
        "TO BE DEFINED6"
    ),
}

const PresetTypeSections = {
    "popular": [
        PresetTypes.FISCHER_INCREMENT,
        PresetTypes.SIMPLE_DELAY,
        PresetTypes.BRONSTEIN_DELAY,
    ],
    "uncommon": [
        PresetTypes.CUMULATIVE_INCREMENT,
        PresetTypes.MOVE_TIMER,
    ],
    "experimental": [
        PresetTypes.HOURGLASS,
        PresetTypes.HOURGLASS_2,
        PresetTypes.HOURGLASS_3,
        PresetTypes.HOURGLASS_4,
        PresetTypes.HOURGLASS_5,
        PresetTypes.HOURGLASS_6
    ]
}


export { PresetType, PresetTypes, PresetTypeSections };