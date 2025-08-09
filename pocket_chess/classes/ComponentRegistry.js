import { PresetTypes } from './PresetTypes.js';
import { FischerIncrementBuilder } from '../components/play_tab/new_timer/ClockTypesStageBuilder.jsx';
// import { SimpleDelayBuilder, BronsteinDelayBuilder, CumulativeIncrementBuilder, FixedMovesBuilder, HourglassBuilder } from '../components/play_tab/new_timer/ClockTypesStageBuilder.jsx';

// File for mapping different ids to react components

// map preset type ids to their builder components
export const ClockTypeIdToBuilderComponent = {
    [PresetTypes.FISCHER_INCREMENT.id]: FischerIncrementBuilder,
    // Uncomment as you create these components:
    // [PresetTypes.SIMPLE_DELAY.id]: SimpleDelayBuilder,
    // [PresetTypes.BRONSTEIN_DELAY.id]: BronsteinDelayBuilder,
    // [PresetTypes.CUMULATIVE_INCREMENT.id]: CumulativeIncrementBuilder,
    // [PresetTypes.FIXED_MOVES.id]: FixedMovesBuilder,
    // [PresetTypes.HOURGLASS.id]: HourglassBuilder,
};