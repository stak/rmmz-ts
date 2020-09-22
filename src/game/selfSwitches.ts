import { $gameMap } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_SelfSwitches
//
// The game object class for self switches.

export class Game_SelfSwitches {
  _data: { [key in MZ.SelfSwitchCh]?: boolean } = {}

  constructor() {
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this.clear();
  }

  clear(): void {
    this._data = {};
  }

  value(key: MZ.SelfSwitchCh): boolean {
    return !!this._data[key];
  }

  setValue(key: MZ.SelfSwitchCh, value: boolean): void {
    if (value) {
        this._data[key] = true;
    } else {
        delete this._data[key];
    }
    this.onChange();
  }

  onChange(): void {
    $gameMap.requestRefresh();
  }
}