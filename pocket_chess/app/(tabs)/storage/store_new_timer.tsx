import Preset from '../../../classes/timers_base/Preset';
import Time from '../../../classes/timers_base/Time';
import { FischerIncrementStage, FischerIncrementTimer } from '../../../classes/timers_clock_types/FischerIncrement';
import StoreNewTimer from '../../../components/storage_tab/StoreNewTimer';
import * as Constants from '../../../constants';

export default function NewTimerScreen() {
  return <StoreNewTimer 
    preset={Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 1, 0))]),"1|0", false, Constants.COLORS.white, Constants.COLORS.preset_blue)}
  />;
}