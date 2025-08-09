class PresetType {
    constructor(id, name, short_description, long_description, builderFunc) {
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
            long_description: this.long_description,
        };
    }

    static fromJSON(json) {
        return new PresetType(
            json.id,
            json.name,
            json.short_description,
            json.long_description,
        );
    }

    clone() {
        return new PresetType(
            this.id,
            this.name,
            this.short_description,
            this.long_description,
        );
    }
}

const PresetTypes = {
    FISCHER_INCREMENT: new PresetType(
        1, 
        "Fischer Increment",
        "Add time after each move",
        "TO BE DEFINED1 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id nunc sodales velit gravida iaculis sagittis sit amet quam. Sed quis rutrum tortor. Curabitur sed suscipit tellus. Duis faucibus laoreet elit, eget ornare justo congue eget. Etiam non blandit magna. Quisque non pellentesque magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    ),

    SIMPLE_DELAY: new PresetType(2, 
        "Simple Delay",
        "Delay at start of each move",
        "TO BE DEFINED2 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id nunc sodales velit gravida iaculis sagittis sit amet quam. Sed quis rutrum tortor. Curabitur sed suscipit tellus. Duis faucibus laoreet elit, eget ornare justo congue eget. Etiam non blandit magna. Quisque non pellentesque magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    ),

    BRONSTEIN_DELAY: new PresetType(3, 
        "Bronstein Delay",
        "Refund time after each move",
        "TO BE DEFINED3 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id nunc sodales velit gravida iaculis sagittis sit amet quam. Sed quis rutrum tortor. Curabitur sed suscipit tellus. Duis faucibus laoreet elit, eget ornare justo congue eget. Etiam non blandit magna. Quisque non pellentesque magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    ),

    CUMULATIVE_INCREMENT: new PresetType(4, 
        "Cumulative Increment",
        "Increase increment with every move",
        "TO BE DEFINED4 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id nunc sodales velit gravida iaculis sagittis sit amet quam. Sed quis rutrum tortor. Curabitur sed suscipit tellus. Duis faucibus laoreet elit, eget ornare justo congue eget. Etiam non blandit magna. Quisque non pellentesque magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    ),

    FIXED_MOVES: new PresetType(5, 
        "Fixed Moves",
        "Fixed seconds per move",
        "TO BE DEFINED5 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id nunc sodales velit gravida iaculis sagittis sit amet quam. Sed quis rutrum tortor. Curabitur sed suscipit tellus. Duis faucibus laoreet elit, eget ornare justo congue eget. Etiam non blandit magna. Quisque non pellentesque magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    ),

    HOURGLASS: new PresetType(6, 
        "Hourglass",
        "Time used is transferred to other player",
        "TO BE DEFINED6 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id nunc sodales velit gravida iaculis sagittis sit amet quam. Sed quis rutrum tortor. Curabitur sed suscipit tellus. Duis faucibus laoreet elit, eget ornare justo congue eget. Etiam non blandit magna. Quisque non pellentesque magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    )
}

// associate id to preset type, for easier finding
const PresetIdToTypes = {
    [PresetTypes.FISCHER_INCREMENT.id]: PresetTypes.FISCHER_INCREMENT,
    [PresetTypes.SIMPLE_DELAY.id]: PresetTypes.SIMPLE_DELAY,
    [PresetTypes.BRONSTEIN_DELAY.id]: PresetTypes.BRONSTEIN_DELAY,
    [PresetTypes.CUMULATIVE_INCREMENT.id]: PresetTypes.CUMULATIVE_INCREMENT,
    [PresetTypes.FIXED_MOVES.id]: PresetTypes.FIXED_MOVES,
    [PresetTypes.HOURGLASS.id]: PresetTypes.HOURGLASS
}

const PresetTypeSections = {
    "popular": [
        PresetTypes.FISCHER_INCREMENT,
        PresetTypes.SIMPLE_DELAY,
        PresetTypes.BRONSTEIN_DELAY,
    ],
    "uncommon": [
        PresetTypes.CUMULATIVE_INCREMENT,
        PresetTypes.FIXED_MOVES,
    ],
    "experimental": [
        PresetTypes.HOURGLASS
    ]
}

export { PresetType, PresetIdToTypes, PresetTypes, PresetTypeSections};