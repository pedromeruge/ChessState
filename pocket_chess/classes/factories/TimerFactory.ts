import { PresetTypes } from '../PresetType';
import Timer, {TimerJSON} from '../timers_base/Timer';
import Stage, {StageJSON} from '../timers_base/Stage';
import { FischerIncrementTimer, FischerIncrementStage, FischerIncrementStageJSON, FischerIncrementTimerJSON } from '../timers_clock_types/FischerIncrement';
import { SimpleDelayTimer, SimpleDelayStage, SimpleDelayStageJSON, SimpleDelayTimerJSON } from '../timers_clock_types/SimpleDelay';
import { BronsteinDelayTimer, BronsteinDelayStage, BronsteinDelayStageJSON, BronsteinDelayTimerJSON } from '../timers_clock_types/BronsteinDelay';
import {FixedMovesTimer, FixedMovesStage, FixedMovesStageJSON, FixedMovesTimerJSON} from '../timers_clock_types/FixedMoves';
import {CumulativeIncrementTimer, CumulativeIncrementStage, CumulativeIncrementStageJSON, CumulativeIncrementTimerJSON} from '../timers_clock_types/CumulativeIncrement';

// Type interfaces for method parameters
interface TimerJSONData extends TimerJSON {
    [key: string]: any; // allow additional properties for specific timer types
}

interface StageJSONData extends StageJSON {
    [key: string]: any; // allow additional properties for specific stage types
}

export default class TimerFactory {
    static createTimerFromJSON(data: TimerJSONData): Timer {
        switch(data.presetTypeId) {
            case PresetTypes.FISCHER_INCREMENT.id:
                return FischerIncrementTimer.fromJSON(data as FischerIncrementTimerJSON);
            case PresetTypes.SIMPLE_DELAY.id:
                return SimpleDelayTimer.fromJSON(data as SimpleDelayTimerJSON);
            case PresetTypes.BRONSTEIN_DELAY.id:
                return BronsteinDelayTimer.fromJSON(data as BronsteinDelayTimerJSON);
            case PresetTypes.CUMULATIVE_INCREMENT.id:
                return CumulativeIncrementTimer.fromJSON(data as CumulativeIncrementTimerJSON);
            case PresetTypes.FIXED_MOVES.id:
                return FixedMovesTimer.fromJSON(data as FixedMovesTimerJSON);
            
            default:
                throw new Error(`Unknown preset type: ${data.presetType.id}`);
        }
    }

    static createStageFromJSON(data: StageJSONData, presetTypeId: number): Stage {
        switch(presetTypeId) {
            case PresetTypes.FISCHER_INCREMENT.id:
                return FischerIncrementStage.fromJSON(data as FischerIncrementStageJSON);
            case PresetTypes.SIMPLE_DELAY.id:
                return SimpleDelayStage.fromJSON(data as SimpleDelayStageJSON);
            case PresetTypes.BRONSTEIN_DELAY.id:
                return BronsteinDelayStage.fromJSON(data as BronsteinDelayStageJSON);
            case PresetTypes.CUMULATIVE_INCREMENT.id:
                return CumulativeIncrementStage.fromJSON(data as CumulativeIncrementStageJSON);
            case PresetTypes.FIXED_MOVES.id:
                return FixedMovesStage.fromJSON(data as FixedMovesStageJSON);
            default:
                throw new Error(`Unknown preset type: ${presetTypeId}`);
        }
    }
}