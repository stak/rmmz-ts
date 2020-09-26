import { Game_Follower } from '.';
import { $gameParty, $gamePlayer, $dataSystem } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Followers
//
// The wrapper class for a follower array.

export class Game_Followers {
  _visible = false
  _gathering = false
  _data: Game_Follower[] = []

  constructor()
  constructor(thisClass: Constructable<Game_Followers>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_Followers) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this._visible = $dataSystem.optFollowers;
    this._gathering = false;
    this._data = [];
    this.setup();
  };

  setup(): void {
    this._data = [];
    for (let i = 1; i < $gameParty.maxBattleMembers(); i++) {
        this._data.push(new Game_Follower(i));
    }
  };

  isVisible(): boolean {
    return this._visible;
  };

  show(): void {
    this._visible = true;
  };

  hide(): void {
    this._visible = false;
  };

  data(): Game_Follower[] {
    return this._data.clone();
  };

  reverseData(): Game_Follower[] {
    return this._data.clone().reverse();
  };

  follower(index: number): Game_Follower {
    return this._data[index];
  };

  refresh(): void {
    for (const follower of this._data) {
        follower.refresh();
    }
  };

  update(): void {
    if (this.areGathering()) {
        if (!this.areMoving()) {
            this.updateMove();
        }
        if (this.areGathered()) {
            this._gathering = false;
        }
    }
    for (const follower of this._data) {
        follower.update();
    }
  };

  updateMove(): void {
    for (let i = this._data.length - 1; i >= 0; i--) {
        const precedingCharacter = i > 0 ? this._data[i - 1] : $gamePlayer;
        this._data[i].chaseCharacter(precedingCharacter);
    }
  };

  jumpAll(): void {
    if ($gamePlayer.isJumping()) {
        for (const follower of this._data) {
            const sx = $gamePlayer.deltaXFrom(follower.x);
            const sy = $gamePlayer.deltaYFrom(follower.y);
            follower.jump(sx, sy);
        }
    }
  };

  synchronize(x: number, y: number, d: MZ.MoveDirection): void {
    for (const follower of this._data) {
        follower.locate(x, y);
        follower.setDirection(d);
    }
  };

  gather(): void {
    this._gathering = true;
  };

  areGathering(): boolean {
    return this._gathering;
  };

  visibleFollowers(): Game_Follower[] {
    return this._data.filter(follower => follower.isVisible());
  };

  areMoving(): boolean {
    return this.visibleFollowers().some(follower => follower.isMoving());
  };

  areGathered(): boolean {
    return this.visibleFollowers().every(follower => follower.isGathered());
  };

  isSomeoneCollided(x: number, y: number): boolean {
    return this.visibleFollowers().some(follower => follower.pos(x, y));
  };
}
