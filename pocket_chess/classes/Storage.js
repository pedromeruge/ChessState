import * as Constants from '../constants';

import {MMKV} from 'react-native-mmkv';
import { Preset, Time} from './Preset.js';
import { FischerIncrementStage, FischerIncrementTimer } from './Preset.js';
//initialize MMKV storage
class Storage {
    
    constructor() {
        this.storage = new MMKV();
        this.#setup()
    }

    #setup() {
        if (!this.storage.getBoolean('firstTime')) {
            this.#initialSetup()
            this.storage.set('firstTime', true);
        }
    }

    #initialSetup() {
        this.#initialSetupTimers()
    }

    #initialSetupTimers() {
      const defaultPresets = {
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

    #getObject(key) {
        const value = this.storage.getString(key)
        return value ? JSON.parse(value) : null;
    }

    //serialize a group of presets that belong to a section: standard, rapid, etc.
    #serializePresetGroupFunc(key, value) {
      if (Array.isArray(value)) {
        return value.map((item) => item instanceof Preset ? item.toJSON() : item);
      }
      return value;
    };

    //get object with presets and layout data, for default or custom presets
    #getPresets(key) {
      const data = this.#getObject(key)

      if (data) {
        Object.keys(data).forEach((category) => {
            data[category].presets = data[category].presets.map((preset) => Preset.fromJSON(preset))
        })
      }

      return data
    }

    //get default presets
    getDefaultPresets() {
      return this.#getPresets(Constants.storageNames.PRESETS.DEFAULT)
    }

    //get custom presets
    getCustomPresets() {
      return this.#getPresets(Constants.storageNames.PRESETS.CUSTOM)
    }

    //update custom presets in storage
    setCustomPresets(newPresets) {
      this.storage.set(Constants.storageNames.PRESETS.CUSTOM, JSON.stringify(newPresets, this.#serializePresetGroupFunc));
    }

    getPreset(preset_id) {
      const customPresets = this.getCustomPresets();
      const defaultPresets = this.getDefaultPresets();

      const preset = customPresets.custom.presets.find((preset) => preset.id === preset_id);
      if (preset) {
          return preset;
      }

      const preset2 = Object.values(defaultPresets)
                        .flatMap((presetGroup) => presetGroup.presets)
                        .find((preset) => preset.id === preset_id);

      console.log("All default preset ids: ", Object.values(defaultPresets).flatMap((presetGroup) => presetGroup.presets.map(p => p.id)));
      console.log("All custom preset ids: ", customPresets.custom.presets.map(p => p.id));

      if (preset2) {
          return preset2;
      }

      return null;
    }
}

 export default storage = new Storage();

