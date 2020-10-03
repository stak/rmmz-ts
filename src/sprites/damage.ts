import { Sprite, Bitmap } from '../pixi';
import { ColorManager } from '../managers';
import { $gameSystem } from '../managers';
import { Game_Battler } from '../game';
import { MZ } from '../MZ';

interface Sprite_DamageChild extends Sprite {
  ry: number
  dy: number
}

//-----------------------------------------------------------------------------
// Sprite_Damage
//
// The sprite for displaying a popup damage.

export class Sprite_Damage extends Sprite {
  _duration = 90;
  _flashColor: MZ.RGBAColorArray = [0, 0, 0, 0];
  _flashDuration = 0;
  _colorType = 0;

  constructor()
  constructor(thisClass: Constructable<Sprite_Damage>)
  constructor(arg?: any) {
    super(Sprite);
    if (typeof arg === "function" && arg === Sprite_Damage) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this._duration = 90;
    this._flashColor = [0, 0, 0, 0];
    this._flashDuration = 0;
    this._colorType = 0;
  };

  destroy(options?: any): void {
    for (const child of this.children) {
        if ((child as any).bitmap) {
            (child as any).bitmap.destroy();
        }
    }
    super.destroy(options);
  };

  setup(target: Game_Battler): void {
    const result = target.result();
    if (result.missed || result.evaded) {
        this._colorType = 0;
        this.createMiss();
    } else if (result.hpAffected) {
        this._colorType = result.hpDamage >= 0 ? 0 : 1;
        this.createDigits(result.hpDamage);
    } else if (target.isAlive() && result.mpDamage !== 0) {
        this._colorType = result.mpDamage >= 0 ? 2 : 3;
        this.createDigits(result.mpDamage);
    }
    if (result.critical) {
        this.setupCriticalEffect();
    }
  };

  setupCriticalEffect(): void {
    this._flashColor = [255, 0, 0, 160];
    this._flashDuration = 60;
  };

  fontFace(): string {
    return $gameSystem.numberFontFace();
  };

  fontSize(): number {
    return $gameSystem.mainFontSize() + 4;
  };

  damageColor(): string {
    return ColorManager.damageColor(this._colorType as any);
  };

  outlineColor(): string {
    return "rgba(0, 0, 0, 0.7)";
  };

  outlineWidth(): number {
    return 4;
  };

  createMiss(): void {
    const h = this.fontSize();
    const w = Math.floor(h * 3.0);
    const sprite = this.createChildSprite(w, h);
    sprite.bitmap!.drawText("Miss", 0, 0, w, h, "center");
    sprite.dy = 0;
  };

  createDigits(value: number): void {
    const string = Math.abs(value).toString();
    const h = this.fontSize();
    const w = Math.floor(h * 0.75);
    for (let i = 0; i < string.length; i++) {
        const sprite = this.createChildSprite(w, h);
        sprite.bitmap!.drawText(string[i], 0, 0, w, h, "center");
        sprite.x = (i - (string.length - 1) / 2) * w;
        sprite.dy = -i;
    }
  };

  createChildSprite(width: number, height: number): Sprite_DamageChild {
    const sprite = new Sprite() as Sprite_DamageChild;
    sprite.bitmap = this.createBitmap(width, height);
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 1;
    sprite.y = -40;
    sprite.ry = sprite.y;
    this.addChild(sprite);
    return sprite;
  };

  createBitmap(width: number, height: number): Bitmap {
    const bitmap = new Bitmap(width, height);
    bitmap.fontFace = this.fontFace();
    bitmap.fontSize = this.fontSize();
    bitmap.textColor = this.damageColor();
    bitmap.outlineColor = this.outlineColor();
    bitmap.outlineWidth = this.outlineWidth();
    return bitmap;
  };

  update(): void {
    super.update();
    if (this._duration > 0) {
        this._duration--;
        for (const child of this.children) {
            this.updateChild(child as Sprite_DamageChild);
        }
    }
    this.updateFlash();
    this.updateOpacity();
  };

  updateChild(sprite: Sprite_DamageChild): void {
    sprite.dy += 0.5;
    sprite.ry += sprite.dy;
    if (sprite.ry >= 0) {
        sprite.ry = 0;
        sprite.dy *= -0.6;
    }
    sprite.y = Math.round(sprite.ry);
    sprite.setBlendColor(this._flashColor);
  };

  updateFlash(): void {
    if (this._flashDuration > 0) {
        const d = this._flashDuration--;
        this._flashColor[3] *= (d - 1) / d;
    }
  };

  updateOpacity(): void {
    if (this._duration < 10) {
        this.opacity = (255 * this._duration) / 10;
    }
  };

  isPlaying(): boolean {
    return this._duration > 0;
  };
}
