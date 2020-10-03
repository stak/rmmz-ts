import { Sprite_Clickable } from '.';
import { Sprite_Damage } from '.';
import { $gameTemp } from '../managers';
import { Game_Battler } from '../game';
import { Sprite } from '../pixi';

//-----------------------------------------------------------------------------
// Sprite_Battler
//
// The superclass of Sprite_Actor and Sprite_Enemy.

export class Sprite_Battler extends Sprite_Clickable {
  _battler: Game_Battler | null = null;
  _damages: Sprite_Damage[] = [];
  _homeX = 0;
  _homeY = 0;
  _offsetX = 0;
  _offsetY = 0;
  _targetOffsetX = NaN;
  _targetOffsetY = NaN;
  _movementDuration = 0;
  _selectionEffectCount = 0;

  constructor(battler: Game_Battler)
  constructor(thisClass: Constructable<Sprite_Battler>)
  constructor(arg?: any) {
    super(Sprite_Clickable);
    if (typeof arg === "function" && arg === Sprite_Battler) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void
  initialize(battler?: Game_Battler): void {
    super.initialize();
    this.initMembers();
    this.setBattler(battler!);
  };

  initMembers(): void {
    this.anchor.x = 0.5;
    this.anchor.y = 1;
    this._battler = null;
    this._damages = [];
    this._homeX = 0;
    this._homeY = 0;
    this._offsetX = 0;
    this._offsetY = 0;
    this._targetOffsetX = NaN;
    this._targetOffsetY = NaN;
    this._movementDuration = 0;
    this._selectionEffectCount = 0;
  };

  setBattler(battler: Game_Battler): void {
    this._battler = battler;
  };

  checkBattler(battler: Game_Battler): boolean {
    return this._battler === battler;
  };

  mainSprite(): Sprite {
    return this;
  };

  setHome(x: number, y: number): void {
    this._homeX = x;
    this._homeY = y;
    this.updatePosition();
  };

  update(): void {
    super.update();
    if (this._battler) {
        this.updateMain();
        this.updateDamagePopup();
        this.updateSelectionEffect();
        this.updateVisibility();
    } else {
        this.bitmap = null;
    }
  };

  updateVisibility(): void {
    super.updateVisibility();
    if (!this._battler || !(this._battler as any).isSpriteVisible()) {
        this.visible = false;
    }
  };

  updateMain(): void {
    if ((this._battler as any).isSpriteVisible()) {
        this.updateBitmap();
        this.updateFrame();
    }
    this.updateMove();
    this.updatePosition();
  };

  updateBitmap(): void {
    //
  };

  updateFrame(): void {
    //
  };

  updateMove(): void {
    if (this._movementDuration > 0) {
        const d = this._movementDuration;
        this._offsetX = (this._offsetX * (d - 1) + this._targetOffsetX) / d;
        this._offsetY = (this._offsetY * (d - 1) + this._targetOffsetY) / d;
        this._movementDuration--;
        if (this._movementDuration === 0) {
            this.onMoveEnd();
        }
    }
  };

  updatePosition(): void {
    this.x = this._homeX + this._offsetX;
    this.y = this._homeY + this._offsetY;
  };

  updateDamagePopup(): void {
    this.setupDamagePopup();
    if (this._damages.length > 0) {
        for (const damage of this._damages) {
            damage.update();
        }
        if (!this._damages[0].isPlaying()) {
            this.destroyDamageSprite(this._damages[0]);
        }
    }
  };

  updateSelectionEffect(): void {
    const target = this.mainSprite();
    if (this._battler!.isSelected()) {
        this._selectionEffectCount++;
        if (this._selectionEffectCount % 30 < 15) {
            target.setBlendColor([255, 255, 255, 64]);
        } else {
            target.setBlendColor([0, 0, 0, 0]);
        }
    } else if (this._selectionEffectCount > 0) {
        this._selectionEffectCount = 0;
        target.setBlendColor([0, 0, 0, 0]);
    }
  };

  setupDamagePopup(): void {
    if (this._battler!.isDamagePopupRequested()) {
        if ((this._battler as any).isSpriteVisible()) {
            this.createDamageSprite();
        }
        this._battler!.clearDamagePopup();
        this._battler!.clearResult();
    }
  };

  createDamageSprite(): void {
    const last = this._damages[this._damages.length - 1];
    const sprite = new Sprite_Damage();
    if (last) {
        sprite.x = last.x + 8;
        sprite.y = last.y - 16;
    } else {
        sprite.x = this.x + this.damageOffsetX();
        sprite.y = this.y + this.damageOffsetY();
    }
    sprite.setup(this._battler!);
    this._damages.push(sprite);
    this.parent.addChild(sprite);
  };

  destroyDamageSprite(sprite: Sprite_Damage): void {
    this.parent.removeChild(sprite);
    this._damages.remove(sprite);
    sprite.destroy();
  };

  damageOffsetX(): number {
    return 0;
  };

  damageOffsetY(): number {
    return 0;
  };

  startMove(x: number, y: number, duration: number): void {
    if (this._targetOffsetX !== x || this._targetOffsetY !== y) {
        this._targetOffsetX = x;
        this._targetOffsetY = y;
        this._movementDuration = duration;
        if (duration === 0) {
            this._offsetX = x;
            this._offsetY = y;
        }
    }
  };

  onMoveEnd(): void {
    //
  };

  isEffecting(): boolean {
    return false;
  };

  isMoving(): boolean {
    return this._movementDuration > 0;
  };

  inHomePosition(): boolean {
    return this._offsetX === 0 && this._offsetY === 0;
  };

  onMouseEnter(): void {
    $gameTemp.setTouchState(this._battler!, "select");
  };

  onPress(): void {
    $gameTemp.setTouchState(this._battler!, "select");
  };

  onClick(): void {
    $gameTemp.setTouchState(this._battler!, "click");
  };
}