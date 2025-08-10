import { Timer } from '../timers_base/Preset';

// props that all builders must receive
export interface TimerBuilderProps {
  onUpdateStages: (stages: any[]) => void;
}

// methods that all builders must expose to parents
export interface TimerBuilderRef {
  buildTimer: (playerName: string) => Timer;
}

// Optional: Generic builder interface for type safety
export interface ClockTypeBuilder<T extends Timer = Timer> {
  buildTimer: (playerName: string) => T;
}