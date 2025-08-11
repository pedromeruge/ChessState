import { PresetTypes } from '../PresetType';
import Timer, {TimerJSON} from '../timers_base/Timer';
import Stage, {StageJSON} from '../timers_base/Stage';
import { FischerIncrementTimer, FischerIncrementStage, FischerIncrementStageJSON, FischerIncrementTimerJSON } from '../timers_clock_types/FischerIncrement';
import { SimpleDelayTimer, SimpleDelayStage, SimpleDelayStageJSON, SimpleDelayTimerJSON } from '../timers_clock_types/SimpleDelay';

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
            default:
                throw new Error(`Unknown preset type: ${presetTypeId}`);
        }
    }
}