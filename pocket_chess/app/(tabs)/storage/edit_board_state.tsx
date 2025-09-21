import Preset from '../../../classes/timers_base/Preset';
import Time from '../../../classes/timers_base/Time';
import { FischerIncrementStage, FischerIncrementTimer } from '../../../classes/timers_clock_types/FischerIncrement';
import * as Constants from '../../../constants';
import BoardStateEdit from '../../../components/storage_tab/create_match/BoardStateEdit';

export default function NewTimerScreen() {
  return <BoardStateEdit/>;
}