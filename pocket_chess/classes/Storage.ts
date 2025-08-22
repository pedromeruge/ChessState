import * as Constants from '../constants';

import { MMKV } from 'react-native-mmkv';
import Preset, { PresetJSON } from './timers_base/Preset';
import Time from './timers_base/Time';
import { FischerIncrementStage, FischerIncrementTimer } from './timers_clock_types/FischerIncrement';
import { SimpleDelayTimer, SimpleDelayStage } from './timers_clock_types/SimpleDelay';
import { BronsteinDelayStage, BronsteinDelayTimer } from './timers_clock_types/BronsteinDelay';
import { CumulativeIncrementStage, CumulativeIncrementTimer } from './timers_clock_types/CumulativeIncrement';
import { FixedMovesStage, FixedMovesTimer } from './timers_clock_types/FixedMoves';

// types for preset data structure
interface PresetGroup {
    icon: Constants.IconType;
    iconColor: string;
    title: string;
    presets: Preset[];
}

interface PresetData {
    [key: string]: PresetGroup;
}

// JSON representation of preset groups for storage
interface PresetGroupJSON {
    icon: Constants.IconType;
    iconColor: string;
    title: string;
    presets: PresetJSON[];
}

interface PresetDataJSON {
    [key: string]: PresetGroupJSON;
}

// initialize MMKV storage
class Storage {
    private storage: MMKV;
    private customTimers: PresetData;

    constructor() {
        this.storage = new MMKV();
        this.customTimers = {
            "custom": {
                "icon": Constants.icons.preset_custom,
                "iconColor": Constants.COLORS.text_dark,
                "title": "Custom",
                "presets": []
            }
        };
        this.#setup();
    }

    #setup(): void {
        if (!this.storage.getBoolean('firstTime')) {
            this.#initialSetup();
            this.storage.set('firstTime', true);
        }
    }

    #initialSetup(): void {
        this.#initialSetupTimers();
    }

    #initialSetupTimers(): void {
      const defaultPresets: PresetData = {
          "bullet": {
            "icon": Constants.icons.preset_bullet,
            "iconColor": Constants.COLORS.preset_blue,
            "title": "Bullet",
            "presets":
            [
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 1, 0))]),"1|0", false, Constants.COLORS.white, Constants.COLORS.preset_blue),
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 1, 0), new Time(0, 0, 1))]),"1|1"),
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 2, 0), new Time(0, 0, 1))]),"2|1"),
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 2, 0), new Time(0, 0, 5))]),"2|5")
            ]
          },
      
          "blitz": {
            "icon": Constants.icons.flash_on,
            "iconColor": Constants.COLORS.preset_yellow,
            "title": "Blitz",
            "presets":
            [
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 3, 0))]), "3|0", false, Constants.COLORS.white, Constants.COLORS.preset_yellow),
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 3, 0), new Time(0, 0, 2))]), "3|2"),
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 5, 0))]), "5|0"),
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 5, 0), new Time(0, 0, 3))]), "5|3"),
            ]
          },
          "rapid": {
            "icon": Constants.icons.preset_rapid,
            "iconColor": Constants.COLORS.preset_green,
            "title": "Rapid",
            "presets":
            [
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 10, 0))]), "10|0", false, Constants.COLORS.white, Constants.COLORS.preset_green),
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 10, 0), new Time(0, 0, 5))]), "10|5"),
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 15, 0), new Time(0, 0, 10))]), "15|10"),
              Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 25, 0), new Time(0, 0, 10))]), "25|10"),
            ]
          },
          "standard": {
            "icon": Constants.icons.preset_standard,
            "iconColor": Constants.COLORS.preset_red,
            "title": "Standard",
            "presets":
            [ 
              Preset.samePlayerTimers(
                new FischerIncrementTimer(
                    [new FischerIncrementStage(new Time(1, 30, 0), new Time(0, 0, 0), 40), 
                      new FischerIncrementStage(new Time(0, 30, 0))]),
                "90+30|30", 
                false,
                Constants.COLORS.white, 
                Constants.COLORS.preset_red
              ),
              Preset.samePlayerTimers(
                new FischerIncrementTimer(
                  [new FischerIncrementStage(new Time(1, 30, 0), new Time(0, 0, 30))])
                ,"90|30"),
            ]
          },
          "testing": {
            "icon": Constants.icons.experimental,
            "iconColor": Constants.COLORS.preset_green,
            "title": "Testing",
            "presets": [
              Preset.samePlayerTimers(
                new SimpleDelayTimer(
                  [new SimpleDelayStage(new Time(1,0,0), new Time(0,0,3), 10),
                   new SimpleDelayStage(new Time(0,30,0), new Time(0,0,1))
                  ]),
                "Simple Delay"
              ),
              Preset.samePlayerTimers(
                new BronsteinDelayTimer(
                  [new BronsteinDelayStage(new Time(1,0,0), new Time(0,0,3), 10),
                    new BronsteinDelayStage(new Time(0,30,0), new Time(0,0,1), 5)
                  ]),
                "Brons delay"
              ),
              Preset.samePlayerTimers(
                new CumulativeIncrementTimer(
                  [new CumulativeIncrementStage(new Time(1,0,0), new Time(0,0,5), new Time(0,0,5), 2, 10),
                   new CumulativeIncrementStage(new Time(0,30,0), new Time(0,0,3), new Time(0,0,3), 1)
                  ]),
                "Cumul Increm"
              ),
              Preset.samePlayerTimers(
                new FixedMovesTimer(
                  [new FixedMovesStage(new Time(0,0,10), 3, 10),
                   new FixedMovesStage(new Time(0,0,5), 2)
                  ]),
                "Fixed Moves"
              )
            ]
          }
        }
      
      //store default presets
      this.storage.set(Constants.storageNames.PRESETS.DEFAULT, JSON.stringify(defaultPresets, this.#serializePresetGroupFunc));

      this.customTimers = {
          "custom": {
              "icon": Constants.icons.preset_custom,
              "iconColor": Constants.COLORS.text_dark,
              "title": "Custom",
              "presets": []
          }
      }

      //store custom presets
      this.storage.set(Constants.storageNames.PRESETS.CUSTOM, JSON.stringify(this.customTimers, this.#serializePresetGroupFunc));
    }

    #getObject(key: string): PresetDataJSON | null {
        const value = this.storage.getString(key);
        return value ? JSON.parse(value) : null;
    }

    //serialize a group of presets that belong to a section: standard, rapid, etc.
    #serializePresetGroupFunc(key: string, value: unknown): unknown {
      if (Array.isArray(value)) {
        return value.map((item) => {
            // Check if item has toJSON method (is a Preset instance)
            if (item && typeof item === 'object' && 'toJSON' in item && typeof item.toJSON === 'function') {
                return item.toJSON();
            }
            return item;
        });
      }
      return value;
    }

    //get object with presets and layout data, for default or custom presets
    #getPresets(key: string): PresetData | null {
      const data: PresetDataJSON | null = this.#getObject(key);

      if (data) {
        const result: PresetData = {};
        Object.keys(data).forEach((category) => {
          result[category] = {
            icon: data[category].icon,
            iconColor: data[category].iconColor,
            title: data[category].title,
            presets: data[category].presets.map((preset) => Preset.fromJSON(preset))
          };
        });
        return result;
      }
      return null;
    }

    //get default presets
    getDefaultPresets(): PresetData | null {
      return this.#getPresets(Constants.storageNames.PRESETS.DEFAULT);
    }

    //get custom presets
    getCustomPresets(): PresetData | null {
      return this.#getPresets(Constants.storageNames.PRESETS.CUSTOM);
    }

    //update custom presets in storage
    setCustomPresets(newPresets: PresetData): void {
      this.storage.set(Constants.storageNames.PRESETS.CUSTOM, JSON.stringify(newPresets, this.#serializePresetGroupFunc));
    }

    getPreset(preset_id: string): Preset | null {
      const customPresets = this.getCustomPresets();
      const defaultPresets = this.getDefaultPresets();

      if (customPresets) {
        const preset = customPresets.custom.presets.find((preset) => preset.id === preset_id);
        if (preset) {
            return preset;
        }
      }

      if (defaultPresets) {
        const preset2 = Object.values(defaultPresets)
                          .flatMap((presetGroup: PresetGroup) => presetGroup.presets)
                          .find((preset) => preset.id === preset_id);

        // console.log("All default preset ids: ", Object.values(defaultPresets).flatMap((presetGroup: PresetGroup) => presetGroup.presets.map(p => p.id)));
        
        // if (customPresets) {
        //   console.log("All custom preset ids: ", customPresets.custom.presets.map(p => p.id));
        // }

        if (preset2) {
            return preset2;
        }
      }

      return null;
    }

    addCustomPreset(preset: Preset): void {
        this.customTimers.custom.presets.push(preset);
        this.setCustomPresets(this.customTimers);
    }
}

const storage = new Storage();
export default storage;

