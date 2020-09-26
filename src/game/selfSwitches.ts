import { $gameMap } from '../managers';
import { MZ } from '../MZ';

type SelfSwitchData = [ MZ.MapID, MZ.ID, MZ.SelfSwitchCh ];

//-----------------------------------------------------------------------------
// Game_SelfSwitches
//
// The game object class for self switches.

export class Game_SelfSwitches {
  _data: { [key: string]: boolean } = {}

  constructor() {
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this.clear();
  }

  clear(): void {
    this._data = {};
  }

  value(key: SelfSwitchData): boolean {
    return !!this._data[String(key)];
  }

  setValue(key: SelfSwitchData, value: boolean): void {
    if (value) {
        this._data[String(key)] = true;
    } else {
        delete this._data[String(key)];
    }
    this.onChange();
  }

  onChange(): void {
    $gameMap.requestRefresh();
  }
}