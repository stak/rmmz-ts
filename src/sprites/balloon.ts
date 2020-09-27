import { Sprite } from '../pixi';
import { ImageManager } from '../managers';

//-----------------------------------------------------------------------------
// Sprite_Balloon
//
// The sprite for displaying a balloon icon.

export class Sprite_Balloon extends Sprite {
  _target: Sprite | null = null;
  _balloonId = 0;
  _duration = 0;
  z = 7;

  constructor()
  constructor(thisClass: Constructable<Sprite_Balloon>)
  constructor(arg?: any) {
    super(Sprite);
    if (typeof arg === "function" && arg === Sprite_Balloon) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this.initMembers();
    this.loadBitmap();
  };

  initMembers(): void {
    this._target = null;
    this._balloonId = 0;
    this._duration = 0;
    this.anchor.x = 0.5;
    this.anchor.y = 1;
    this.z = 7;
  };

  loadBitmap(): void {
    this.bitmap = ImageManager.loadSystem("Balloon");
    this.setFrame(0, 0, 0, 0);
  };

  setup(targetSprite: Sprite, balloonId: number): void {
    this._target = targetSprite;
    this._balloonId = balloonId;
    this._duration = 8 * this.speed() + this.waitTime();
  };

  update(): void {
    super.update();
    if (this._duration > 0) {
        this._duration--;
        if (this._duration > 0) {
            this.updatePosition();
            this.updateFrame();
        }
    }
  };

  updatePosition(): void {
    this.x = this._target!.x;
    this.y = this._target!.y - this._target!.height;
  };

  updateFrame(): void {
    const w = 48;
    const h = 48;
    const sx = this.frameIndex() * w;
    const sy = (this._balloonId - 1) * h;
    this.setFrame(sx, sy, w, h);
  };

  speed(): number {
    return 8;
  };

  waitTime(): number {
    return 12;
  };

  frameIndex(): number {
    const index = (this._duration - this.waitTime()) / this.speed();
    return 7 - Math.max(Math.floor(index), 0);
  };

  isPlaying(): boolean {
    return this._duration > 0;
  };
}