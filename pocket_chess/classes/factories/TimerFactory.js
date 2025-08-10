import { PresetTypes } from '../PresetTypes.js';
import { FischerIncrementTimer, FischerIncrementStage } from '../timers_clock_types/FischerIncrement.js';

export default class TimerFactory {
    static createTimerFromJSON(data) {
        switch(data.presetType.id) {
            case PresetTypes.FISCHER_INCREMENT.id:
                return FischerIncrementTimer.fromJSON(data);
            // case PresetTypes.SIMPLE_DELAY.id:
                // return SimpleDelayTimer.fromJSON(data);
            default:
                throw new Error(`Unknown preset type: ${data.presetType.id}`);
        }
    }

    static createStageFromJSON(data, presetTypeId) {
        switch(presetTypeId) {
            case PresetTypes.FISCHER_INCREMENT.id:
                return FischerIncrementStage.fromJSON(data);
            // case PresetTypes.SIMPLE_DELAY.id:
                // return SimpleDelayStage.fromJSON(data);
            default:
                throw new Error(`Unknown preset type: ${presetTypeId}`);
        }
    }
}