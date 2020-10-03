import { Sprite_Battler } from '.';
import { Sprite_StateIcon } from '.';
import { $gameSystem } from '../managers';
import { Game_Enemy } from '../game';
import { ImageManager, SoundManager } from '../managers';

type EffectType =
  "appear" |
  "disappear" |
  "whiten" |
  "blink" |
  "collapse" |
  "bossCollapse" |
  "instantCollapse";

//-----------------------------------------------------------------------------
// Sprite_Enemy
//
// The sprite for displaying an enemy.

export class Sprite_Enemy extends Sprite_Battler {
  _enemy: Game_Enemy | null = null;
  _appeared = false;
  _battlerName = "";
  _battlerHue = 0;
  _effectType: EffectType | null = null;
  _effectDuration = 0;
  _shake = 0;
  _stateIconSprite?: Sprite_StateIcon

  constructor(battler: Game_Enemy)
  constructor(thisClass: Constructable<Sprite_Enemy>)
  constructor(arg?: any) {
    super(Sprite_Battler);
    if (typeof arg === "function" && arg === Sprite_Enemy) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(battler?: Game_Enemy): void {
    super.initialize(battler);
  };

  initMembers(): void {
    super.initMembers();
    this._enemy = null;
    this._appeared = false;
    this._battlerName = "";
    this._battlerHue = 0;
    this._effectType = null;
    this._effectDuration = 0;
    this._shake = 0;
    this.createStateIconSprite();
  };

  createStateIconSprite(): void {
    this._stateIconSprite = new Sprite_StateIcon();
    this.addChild(this._stateIconSprite);
  };

  setBattler(battler: Game_Enemy): void {
    super.setBattler(battler);
    this._enemy = battler;
    this.setHome(battler.screenX(), battler.screenY());
    this._stateIconSprite!.setup(battler);
  };

  update(): void {
    super.update();
    if (this._enemy) {
        this.updateEffect();
        this.updateStateSprite();
    }
  };

  updateBitmap(): void {
    super.updateBitmap();
    const name = this._enemy!.battlerName();
    const hue = this._enemy!.battlerHue();
    if (this._battlerName !== name || this._battlerHue !== hue) {
        this._battlerName = name;
        this._battlerHue = hue;
        this.loadBitmap(name);
        this.setHue(hue);
        this.initVisibility();
    }
  };

  loadBitmap(name: string): void {
    if ($gameSystem.isSideView()) {
        this.bitmap = ImageManager.loadSvEnemy(name);
    } else {
        this.bitmap = ImageManager.loadEnemy(name);
    }
  };

  setHue(hue: number): void {
    super.setHue(hue);
    for (const child of this.children) {
        if ((child as any).setHue) {
            (child as any).setHue(-hue);
        }
    }
  };

  updateFrame(): void {
    super.updateFrame();
    if (this._effectType === "bossCollapse") {
        this.setFrame(0, 0, this.bitmap!.width, this._effectDuration);
    } else {
        this.setFrame(0, 0, this.bitmap!.width, this.bitmap!.height);
    }
  };

  updatePosition(): void {
    super.updatePosition();
    this.x += this._shake;
  };

  updateStateSprite(): void {
    this._stateIconSprite!.y = -Math.round((this.bitmap!.height + 40) * 0.9);
    if (this._stateIconSprite!.y < 20 - this.y) {
        this._stateIconSprite!.y = 20 - this.y;
    }
  };

  initVisibility(): void {
    this._appeared = this._enemy!.isAlive();
    if (!this._appeared) {
        this.opacity = 0;
    }
  };

  setupEffect(): void {
    if (this._appeared && this._enemy!.isEffectRequested()) {
        this.startEffect(this._enemy!.effectType() as EffectType);
        this._enemy!.clearEffect();
    }
    if (!this._appeared && this._enemy!.isAlive()) {
        this.startEffect("appear");
    } else if (this._appeared && this._enemy!.isHidden()) {
        this.startEffect("disappear");
    }
  };

  startEffect(effectType: EffectType): void {
    this._effectType = effectType;
    switch (this._effectType) {
        case "appear":
            this.startAppear();
            break;
        case "disappear":
            this.startDisappear();
            break;
        case "whiten":
            this.startWhiten();
            break;
        case "blink":
            this.startBlink();
            break;
        case "collapse":
            this.startCollapse();
            break;
        case "bossCollapse":
            this.startBossCollapse();
            break;
        case "instantCollapse":
            this.startInstantCollapse();
            break;
    }
    this.revertToNormal();
  };

  startAppear(): void {
    this._effectDuration = 16;
    this._appeared = true;
  };

  startDisappear(): void {
    this._effectDuration = 32;
    this._appeared = false;
  };

  startWhiten(): void {
    this._effectDuration = 16;
  };

  startBlink(): void {
    this._effectDuration = 20;
  };

  startCollapse(): void {
    this._effectDuration = 32;
    this._appeared = false;
  };

  startBossCollapse(): void {
    this._effectDuration = this.bitmap!.height;
    this._appeared = false;
  };

  startInstantCollapse(): void {
    this._effectDuration = 16;
    this._appeared = false;
  };

  updateEffect(): void {
    this.setupEffect();
    if (this._effectDuration > 0) {
        this._effectDuration--;
        switch (this._effectType) {
            case "whiten":
                this.updateWhiten();
                break;
            case "blink":
                this.updateBlink();
                break;
            case "appear":
                this.updateAppear();
                break;
            case "disappear":
                this.updateDisappear();
                break;
            case "collapse":
                this.updateCollapse();
                break;
            case "bossCollapse":
                this.updateBossCollapse();
                break;
            case "instantCollapse":
                this.updateInstantCollapse();
                break;
        }
        if (this._effectDuration === 0) {
            this._effectType = null;
        }
    }
  };

  isEffecting(): boolean {
    return this._effectType !== null;
  };

  revertToNormal(): void {
    this._shake = 0;
    this.blendMode = 0;
    this.opacity = 255;
    this.setBlendColor([0, 0, 0, 0]);
  };

  updateWhiten(): void {
    const alpha = 128 - (16 - this._effectDuration) * 8;
    this.setBlendColor([255, 255, 255, alpha]);
  };

  updateBlink(): void {
    this.opacity = this._effectDuration % 10 < 5 ? 255 : 0;
  };

  updateAppear(): void {
    this.opacity = (16 - this._effectDuration) * 16;
  };

  updateDisappear(): void {
    this.opacity = 256 - (32 - this._effectDuration) * 10;
  };

  updateCollapse(): void {
    this.blendMode = 1;
    this.setBlendColor([255, 128, 128, 128]);
    this.opacity *= this._effectDuration / (this._effectDuration + 1);
  };

  updateBossCollapse(): void {
    this._shake = (this._effectDuration % 2) * 4 - 2;
    this.blendMode = 1;
    this.opacity *= this._effectDuration / (this._effectDuration + 1);
    this.setBlendColor([255, 255, 255, 255 - this.opacity]);
    if (this._effectDuration % 20 === 19) {
        SoundManager.playBossCollapse2();
    }
  };

  updateInstantCollapse(): void {
    this.opacity = 0;
  };

  damageOffsetX(): number {
    return super.damageOffsetX();
  };

  damageOffsetY(): number {
    return super.damageOffsetY() - 8;
  };
}
