import * as Constants from '../constants';

import {MMKV} from 'react-native-mmkv';
import { Timer, Stage, Time} from '../classes/Timer.js';

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
      const defaultTimers = {
          "bullet": {
            "icon": Constants.icons.preset_bullet,
            "iconColor": Constants.COLORS.preset_blue,
            "title": "Bullet",
            "timers":
            [
              new Timer([new Stage(new Time(0, 1, 0))],"1|0", Constants.COLORS.white, Constants.COLORS.preset_blue),
              new Timer([new Stage(new Time(0, 1, 0), new Time(0, 0, 1))],"1|1"),
              new Timer([new Stage(new Time(0, 2, 0), new Time(0, 0, 1))],"2|1"),
              new Timer([new Stage(new Time(0, 2, 0), new Time(0, 0, 5))],"2|5")
            ]
          },
      
          "blitz": {
            "icon": Constants.icons.flash_on,
            "iconColor": Constants.COLORS.preset_yellow,
            "title": "Blitz",
            "timers":
            [
              new Timer([new Stage(new Time(0, 3, 0))],"3|0", Constants.COLORS.white, Constants.COLORS.preset_yellow),
              new Timer([new Stage(new Time(0, 3, 0), new Time(0, 0, 2))],"3|2"),
              new Timer([new Stage(new Time(0, 5, 0))],"5|0"),
              new Timer([new Stage(new Time(0, 5, 0), new Time(0, 0, 3))],"5|3"),
            ]
          },
          "rapid": {
            "icon": Constants.icons.preset_rapid,
            "iconColor": Constants.COLORS.preset_green,
            "title": "Rapid",
            "timers":
            [
              new Timer([new Stage(new Time(0, 10, 0))],"10|0", Constants.COLORS.white, Constants.COLORS.preset_green),
              new Timer([new Stage(new Time(0, 10, 0), new Time(0, 0, 5))],"10|5"),
              new Timer([new Stage(new Time(0, 15, 0), new Time(0, 0, 10))],"15|10"),
              new Timer([new Stage(new Time(0, 25, 0), new Time(0, 0, 10))],"25|10"),
            ]
          },
          "standard": {
            "icon": Constants.icons.preset_standard,
            "iconColor": Constants.COLORS.preset_red,
            "title": "Standard",
            "timers":
            [ 
              new Timer(
                    [new Stage(new Time(0, 90, 0), new Time(0, 0, 0), 40), 
                      new Stage(new Time(0, 30, 0))],
                    "90+30|30", Constants.COLORS.white, Constants.COLORS.preset_red
                  ),
              new Timer(
                [new Stage(new Time(0, 90, 0), new Time(0, 0, 30))]
                ,"90|30"),
            ]
          }
        }
      
      //store default timers
      this.storage.set(Constants.storageNames.TIMERS.DEFAULT, JSON.stringify(defaultTimers, this.#serializeTimerGroupFunc));

      this.customTimers = {
          "custom": {
              "icon": Constants.icons.preset_custom,
              "iconColor": Constants.COLORS.text_dark,
              "title": "Custom",
              "timers": []
          }
      }

      //store custom timers
      this.storage.set(Constants.storageNames.TIMERS.CUSTOM, JSON.stringify(this.customTimers, this.#serializeTimerGroupFunc));
    }

    #getObject(key) {
        const value = this.storage.getString(key)
        return value ? JSON.parse(value) : null;
    }

    //serialize a group of timers that belong to a section: standard, rapid, etc.
    #serializeTimerGroupFunc(key, value) {
      if (Array.isArray(value)) {
        return value.map((item) => item instanceof Timer ? item.toJSON() : item);
      }
      return value;
    };

    //get object with timers and layout data, for default or custom timers
    #getTimers(key) {
      const data = this.#getObject(key)

      if (data) {
        Object.keys(data).forEach((category) => {
            data[category].timers = data[category].timers.map((timer) => Timer.fromJSON(timer))
        })
      }

      return data
    }

    //get default timers
    getDefaultTimers() {
      return this.#getTimers(Constants.storageNames.TIMERS.DEFAULT)
    }

    //get custom timers
    getCustomTimers() {
      return this.#getTimers(Constants.storageNames.TIMERS.CUSTOM)
    }

    //update custom timers in storage
    setCustomTimers(newTimers) {
      this.storage.set(Constants.storageNames.TIMERS.CUSTOM, JSON.stringify(newTimers, this.#serializeTimerGroupFunc));
    }
}

 export default storage = new Storage();

