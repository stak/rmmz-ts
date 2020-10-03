import { Sprite } from '../pixi';
import { Sprite_Battler } from '.';
import { Sprite_StateOverlay } from '.';
import { Sprite_Weapon } from '.';
import { Game_Actor, Game_Battler } from '../game';
import { ImageManager, BattleManager } from '../managers';
import { MZ } from '../MZ';


//-----------------------------------------------------------------------------
// Sprite_Actor
//
// The sprite for displaying an actor.

export class Sprite_Actor extends Sprite_Battler {

  static readonly MOTIONS = {
    walk: { index: 0, loop: true },
    wait: { index: 1, loop: true },
    chant: { index: 2, loop: true },
    guard: { index: 3, loop: true },
    damage: { index: 4, loop: false },
    evade: { index: 5, loop: false },
    thrust: { index: 6, loop: false },
    swing: { index: 7, loop: false },
    missile: { index: 8, loop: false },
    skill: { index: 9, loop: false },
    spell: { index: 10, loop: false },
    item: { index: 11, loop: false },
    escape: { index: 12, loop: true },
    victory: { index: 13, loop: true },
    dying: { index: 14, loop: true },
    abnormal: { index: 15, loop: true },
    sleep: { index: 16, loop: true },
    dead: { index: 17, loop: true }
  };

  _actor?: Game_Actor
  _battlerName = "";
  _motion: { index: number, loop: boolean} | null = null;
  _motionCount = 0;
  _pattern = 0;
  _mainSprite?: Sprite
  _shadowSprite?: Sprite
  _weaponSprite?: Sprite_Weapon
  _stateSprite?: Sprite_StateOverlay

  constructor(battler?: Game_Actor)
  constructor(thisClass: Constructable<Sprite_Actor>)
  constructor(arg?: any) {
    super(Sprite_Battler);
    if (typeof arg === "function" && arg === Sprite_Actor) {
      return;
    }
    this.initialize(...arguments);
  }


  initialize(battler?: Game_Actor): void {
    super.initialize(battler);
    this.moveToStartPosition();
  };

  initMembers(): void {
    super.initMembers();
    this._battlerName = "";
    this._motion = null;
    this._motionCount = 0;
    this._pattern = 0;
    this.createShadowSprite();
    this.createWeaponSprite();
    this.createMainSprite();
    this.createStateSprite();
  };

  mainSprite(): Sprite {
    return this._mainSprite!;
  };

  createMainSprite(): void {
    this._mainSprite = new Sprite();
    this._mainSprite.anchor.x = 0.5;
    this._mainSprite.anchor.y = 1;
    this.addChild(this._mainSprite);
  };

  createShadowSprite(): void {
    this._shadowSprite = new Sprite();
    this._shadowSprite.bitmap = ImageManager.loadSystem("Shadow2");
    this._shadowSprite.anchor.x = 0.5;
    this._shadowSprite.anchor.y = 0.5;
    this._shadowSprite.y = -2;
    this.addChild(this._shadowSprite);
  };

  createWeaponSprite(): void {
    this._weaponSprite = new Sprite_Weapon();
    this.addChild(this._weaponSprite);
  };

  createStateSprite(): void {
    this._stateSprite = new Sprite_StateOverlay();
    this.addChild(this._stateSprite);
  };

  setBattler(battler: Game_Actor): void {
    super.setBattler(battler);
    if (battler !== this._actor) {
        this._actor = battler;
        if (battler) {
            this.setActorHome(battler.index());
        } else {
            this._mainSprite!.bitmap = null;
        }
        this.startEntryMotion();
        this._stateSprite!.setup(battler);
    }
  };

  moveToStartPosition(): void {
    this.startMove(300, 0, 0);
  };

  setActorHome(index: number): void {
    this.setHome(600 + index * 32, 280 + index * 48);
  };

  update(): void {
    super.update();
    this.updateShadow();
    if (this._actor) {
        this.updateMotion();
    }
  };

  updateShadow(): void {
    this._shadowSprite!.visible = !!this._actor;
  };

  updateMain(): void {
    super.updateMain();
    if (this._actor!.isSpriteVisible() && !this.isMoving()) {
        this.updateTargetPosition();
    }
  };

  setupMotion(): void {
    if (this._actor!.isMotionRequested()) {
        this.startMotion(this._actor!.motionType()!);
        this._actor!.clearMotion();
    }
  };

  setupWeaponAnimation(): void {
    if (this._actor!.isWeaponAnimationRequested()) {
        this._weaponSprite!.setup(this._actor!.weaponImageId());
        this._actor!.clearWeaponAnimation();
    }
  };

  startMotion(motionType: MZ.MotionType): void {
    const newMotion = Sprite_Actor.MOTIONS[motionType];
    if (this._motion !== newMotion) {
        this._motion = newMotion;
        this._motionCount = 0;
        this._pattern = 0;
    }
  };

  updateTargetPosition(): void {
    if (this._actor!.canMove() && BattleManager.isEscaped()) {
        this.retreat();
    } else if (this.shouldStepForward()) {
        this.stepForward();
    } else if (!this.inHomePosition()) {
        this.stepBack();
    }
  };

  shouldStepForward(): boolean {
    return this._actor!.isInputting() || this._actor!.isActing();
  };

  updateBitmap(): void {
    super.updateBitmap();
    const name = this._actor!.battlerName();
    if (this._battlerName !== name) {
        this._battlerName = name;
        this._mainSprite!.bitmap = ImageManager.loadSvActor(name);
    }
  };

  updateFrame(): void {
    super.updateFrame();
    const bitmap = this._mainSprite!.bitmap;
    if (bitmap) {
        const motionIndex = this._motion ? this._motion.index : 0;
        const pattern = this._pattern < 3 ? this._pattern : 1;
        const cw = bitmap.width / 9;
        const ch = bitmap.height / 6;
        const cx = Math.floor(motionIndex / 6) * 3 + pattern;
        const cy = motionIndex % 6;
        this._mainSprite!.setFrame(cx * cw, cy * ch, cw, ch);
        this.setFrame(0, 0, cw, ch);
    }
  };

  updateMove(): void {
    const bitmap = this._mainSprite!.bitmap;
    if (!bitmap || bitmap.isReady()) {
        super.updateMove();
    }
  };

  updateMotion(): void {
    this.setupMotion();
    this.setupWeaponAnimation();
    if (this._actor!.isMotionRefreshRequested()) {
        this.refreshMotion();
        this._actor!.clearMotion();
    }
    this.updateMotionCount();
  };

  updateMotionCount(): void {
    if (this._motion && ++this._motionCount >= this.motionSpeed()) {
        if (this._motion.loop) {
            this._pattern = (this._pattern + 1) % 4;
        } else if (this._pattern < 2) {
            this._pattern++;
        } else {
            this.refreshMotion();
        }
        this._motionCount = 0;
    }
  };

  motionSpeed(): number {
    return 12;
  };

  refreshMotion(): void {
    const actor = this._actor;
    if (actor) {
        const stateMotion = actor.stateMotionIndex();
        if (actor.isInputting() || actor.isActing()) {
            this.startMotion("walk");
        } else if (stateMotion === 3) {
            this.startMotion("dead");
        } else if (stateMotion === 2) {
            this.startMotion("sleep");
        } else if (actor.isChanting()) {
            this.startMotion("chant");
        } else if (actor.isGuard() || actor.isGuardWaiting()) {
            this.startMotion("guard");
        } else if (stateMotion === 1) {
            this.startMotion("abnormal");
        } else if (actor.isDying()) {
            this.startMotion("dying");
        } else if (actor.isUndecided()) {
            this.startMotion("walk");
        } else {
            this.startMotion("wait");
        }
    }
  };

  startEntryMotion(): void {
    if (this._actor && this._actor.canMove()) {
        this.startMotion("walk");
        this.startMove(0, 0, 30);
    } else if (!this.isMoving()) {
        this.refreshMotion();
        this.startMove(0, 0, 0);
    }
  };

  stepForward(): void {
    this.startMove(-48, 0, 12);
  };

  stepBack(): void {
    this.startMove(0, 0, 12);
  };

  retreat(): void {
    this.startMove(300, 0, 30);
  };

  onMoveEnd(): void {
    super.onMoveEnd();
    if (!BattleManager.isBattleEnd()) {
        this.refreshMotion();
    }
  };

  damageOffsetX(): number {
    return super.damageOffsetX() - 32;
  };

  damageOffsetY(): number {
    return super.damageOffsetY();
  };
}