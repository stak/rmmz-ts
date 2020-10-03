import { Game_Actor } from '.';
import { $dataActors } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Actors
//
// The wrapper class for an actor array.

export class Game_Actors {
  _data: {[key: number]: Game_Actor} = []

  constructor()
  constructor(thisClass: Constructable<Game_Actors>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_Actors) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this._data = [];
  };

  actor(actorId: MZ.ActorID): Game_Actor | null {
    if ($dataActors[actorId]) {
        if (!this._data[actorId]) {
            this._data[actorId] = new Game_Actor(actorId);
        }
        return this._data[actorId];
    }
    return null;
  };
}
