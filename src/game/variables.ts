import { $gameMap } from '../managers';
import { $dataSystem } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Variables
//
// The game object class for variables.

export class Game_Variables {
  _data: number[] = []

  constructor()
  constructor(thisClass: Constructable<Game_Variables>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_Variables) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this.clear();
  };

  clear(): void {
    this._data = [];
  };

  value(variableId: MZ.ID): number {
    return this._data[variableId] || 0;
  };

  setValue(variableId: MZ.ID, value: number): void {
    if (variableId > 0 && variableId < $dataSystem.variables.length) {
        if (typeof value === "number") {
            value = Math.floor(value);
        }
        this._data[variableId] = value;
        this.onChange();
    }
  };

  onChange(): void {
    $gameMap.requestRefresh();
  };
}