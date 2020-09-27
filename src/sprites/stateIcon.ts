import { Sprite } from '../pixi';
import { ImageManager } from '../managers';
import { Game_Battler } from '../game';

//-----------------------------------------------------------------------------
// Sprite_StateIcon
//
// The sprite for displaying state icons.

export class Sprite_StateIcon extends Sprite {
  _battler: Game_Battler | null = null;
  _iconIndex = 0;
  _animationCount = 0;
  _animationIndex = 0;

  constructor()
  constructor(thisClass: Constructable<Sprite_StateIcon>)
  constructor(arg?: any) {
    super(Sprite);
    if (typeof arg === "function" && arg === Sprite_StateIcon) {
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
    this._iconIndex = 0;
    this._animationCount = 0;
    this._animationIndex = 0;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
  };

  loadBitmap(): void {
    this.bitmap = ImageManager.loadSystem("IconSet");
    this.setFrame(0, 0, 0, 0);
  };

  setup(battler: Game_Battler): void {
    if (this._battler !== battler) {
        this._battler = battler;
        this._animationCount = this.animationWait();
    }
  };

  update(): void {
    super.update();
    this._animationCount++;
    if (this._animationCount >= this.animationWait()) {
        this.updateIcon();
        this.updateFrame();
        this._animationCount = 0;
    }
  };

  animationWait(): number {
    return 40;
  };

  updateIcon(): void {
    const icons = [];
    if (this.shouldDisplay()) {
        icons.push(...this._battler!.allIcons());
    }
    if (icons.length > 0) {
        this._animationIndex++;
        if (this._animationIndex >= icons.length) {
            this._animationIndex = 0;
        }
        this._iconIndex = icons[this._animationIndex];
    } else {
        this._animationIndex = 0;
        this._iconIndex = 0;
    }
  };

  shouldDisplay(): boolean {
    const battler = this._battler;
    return !!battler && (battler.isActor() || battler.isAlive());
  };

  updateFrame(): void {
    const pw = ImageManager.iconWidth;
    const ph = ImageManager.iconHeight;
    const sx = (this._iconIndex % 16) * pw;
    const sy = Math.floor(this._iconIndex / 16) * ph;
    this.setFrame(sx, sy, pw, ph);
  };
}