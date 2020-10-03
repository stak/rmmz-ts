import { Sprite } from '../pixi';
import { ImageManager } from '../managers';
import { Game_Battler } from '../game';

//-----------------------------------------------------------------------------
// Sprite_StateOverlay
//
// The sprite for displaying an overlay image for a state.

export class Sprite_StateOverlay extends Sprite {
  _battler: Game_Battler | null = null;
  _overlayIndex = 0;
  _animationCount = 0;
  _pattern = 0;

  constructor()
  constructor(thisClass: Constructable<Sprite_StateOverlay>)
  constructor(arg?: any) {
    super(Sprite);
    if (typeof arg === "function" && arg === Sprite_StateOverlay) {
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
    this._battler = null;
    this._overlayIndex = 0;
    this._animationCount = 0;
    this._pattern = 0;
    this.anchor.x = 0.5;
    this.anchor.y = 1;
  };

  loadBitmap(): void {
    this.bitmap = ImageManager.loadSystem("States");
    this.setFrame(0, 0, 0, 0);
  };

  setup(battler: Game_Battler): void {
    this._battler = battler;
  };

  update(): void {
    super.update();
    this._animationCount++;
    if (this._animationCount >= this.animationWait()) {
        this.updatePattern();
        this.updateFrame();
        this._animationCount = 0;
    }
  };

  animationWait(): number {
    return 8;
  };

  updatePattern(): void {
    this._pattern++;
    this._pattern %= 8;
    if (this._battler) {
        this._overlayIndex = this._battler.stateOverlayIndex();
    } else {
        this._overlayIndex = 0;
    }
  };

  updateFrame(): void {
    if (this._overlayIndex > 0) {
        const w = 96;
        const h = 96;
        const sx = this._pattern * w;
        const sy = (this._overlayIndex - 1) * h;
        this.setFrame(sx, sy, w, h);
    } else {
        this.setFrame(0, 0, 0, 0);
    }
  };
}