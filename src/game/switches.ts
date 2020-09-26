import { $gameMap } from '../managers';
import { $dataSystem } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Switches
//
// The game object class for switches.

export class Game_Switches {
  _data: boolean[] = []

  constructor()
  constructor(thisClass: Constructable<Game_Switches>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_Switches) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this.clear();
  }

  clear(): void {
    this._data = [];
  }

  value(switchId: MZ.SwitchID): boolean {
    return !!this._data[switchId];
  }

  setValue(switchId: MZ.SwitchID, value: boolean): void {
    if (switchId > 0 && switchId < $dataSystem.switches.length) {
        this._data[switchId] = value;
        this.onChange();
    }
  }

  onChange(): void {
    $gameMap.requestRefresh();
  }
}
