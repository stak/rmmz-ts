import { BattleManager } from '../managers';

//-----------------------------------------------------------------------------
// Game_Timer
//
// The game object class for the timer.

export class Game_Timer {
  _frames = 0
  _working = false

  constructor()
  constructor(thisClass: Constructable<Game_Timer>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_Timer) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this._frames = 0;
    this._working = false;
  };

  update(sceneActive: boolean): void {
    if (sceneActive && this._working && this._frames > 0) {
        this._frames--;
        if (this._frames === 0) {
            this.onExpire();
        }
    }
  };

  start(count: number): void {
    this._frames = count;
    this._working = true;
  };

  stop(): void {
    this._working = false;
  };

  isWorking(): boolean {
    return this._working;
  };

  seconds(): number {
    return Math.floor(this._frames / 60);
  };

  onExpire(): void {
    BattleManager.abort();
  };
}