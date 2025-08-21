import { PresetTypes } from './PresetType';
import FischerIncrementBuilder from '../components/play_tab/new_timer/clock_type_builders/FischerIncrementBuilder';
import SimpleDelayBuilder from '../components/play_tab/new_timer/clock_type_builders/SimpleDelayBuilder';
import BronsteinDelayBuilder from '../components/play_tab/new_timer/clock_type_builders/BronsteinDelayBuilder';
import FixedMovesBuilder from '../components/play_tab/new_timer/clock_type_builders/FixedMovesBuilder';
import CumulativeIncrementBuilder from '../components/play_tab/new_timer/clock_type_builders/CumulativeIncrementBuilder';


// map preset type ids to their react components
export const ClockTypeIdToBuilderComponent : Record<number, React.FC<any>> = {
    [PresetTypes.FISCHER_INCREMENT.id]: FischerIncrementBuilder,
    [PresetTypes.SIMPLE_DELAY.id]: SimpleDelayBuilder,
    [PresetTypes.BRONSTEIN_DELAY.id]: BronsteinDelayBuilder,
    [PresetTypes.CUMULATIVE_INCREMENT.id]: CumulativeIncrementBuilder,
    [PresetTypes.FIXED_MOVES.id]: FixedMovesBuilder,
    // [PresetTypes.HOURGLASS.id]: HourglassBuilder,
};
