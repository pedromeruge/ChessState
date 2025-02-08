import * as Constants from '../constants';

import {MMKV} from 'react-native-mmkv';
import { Timer, Stage, Time} from '../classes/Timer.js';

//initialize MMKV storage
class Storage {
    
    constructor() {
        this.storage = new MMKV();
        this.setup()
    }

    setup() {
        if (!this.storage.getBoolean('firstTime')) {
            this.initialSetup()
            this.storage.set('firstTime', true);
        }
    }

    initialSetup() {
        this.initialSetupTimers()
    }

    initialSetupTimers() {

        const defaultTimers = {
            "bullet": {
              "icon": Constants.icons.preset_bullet,
              "title": "Bullet",
              "timers":
              [
                new Timer([new Stage(new Time(0, 1, 0))],"1|0", Constants.COLORS.white, Constants.COLORS.preset_blue),
                new Timer([new Stage(new Time(0, 1, 0), new Time(0, 0, 1))],"1|1"),
                new Timer([new Stage(new Time(0, 2, 0), new Time(0, 0, 1))],"2|1"),
                new Timer([new Stage(new Time(0, 2, 0), new Time(0, 0, 5))],"2|5"),
                new Timer([new Stage(new Time(0, 2, 0), new Time(0, 0, 5))],"2|5"),
                new Timer([new Stage(new Time(0, 2, 0), new Time(0, 0, 5))],"2|5")
              ]
            },
        
            "blitz": {
              "icon": Constants.icons.flash_on,
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
        
        this.storage.set(Constants.storage_names.TIMERS.DEFAULT, JSON.stringify(defaultTimers));

        const customTimers = {
            "custom": {
                "icon": Constants.icons.preset_custom,
                "title": "Custom",
                "timers": []
            }
        }

        this.storage.set(Constants.storage_names.TIMERS.CUSTOM, JSON.stringify(customTimers));
    }

    getObject(key) {
        const value = this.storage.getString(key)
        return value ? JSON.parse(value) : null;
    }
}

 export default storage = new Storage();

