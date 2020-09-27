import * as PIXI from 'pixi.js';
import { Graphics } from '../dom';
import { Spriteset_Base } from '.';
import { Sprite_Battleback } from '.';
import { Sprite_Battler } from '.';
import { Sprite_Actor } from '.';
import { Sprite_Enemy } from '.';
import { Sprite } from '../pixi';
import { Game_Battler } from '../game';
import { ImageManager, SceneManager, $gameParty, $gameSystem, $gameTroop } from '../managers';

//-----------------------------------------------------------------------------
// Spriteset_Battle
//
// The set of sprites on the battle screen.

export class Spriteset_Battle extends Spriteset_Base {
  _battlebackLocated = false
  _backgroundFilter?: PIXI.filters.BlurFilter
  _backgroundSprite?: Sprite
  _battleField?: Sprite
  _back1Sprite?: Sprite_Battleback
  _back2Sprite?: Sprite_Battleback
  _enemySprites?: Sprite_Enemy[]
  _actorSprites?: Sprite_Actor[]

  constructor()
  constructor(thisClass: Constructable<Spriteset_Battle>)
  constructor(arg?: any) {
    super(Spriteset_Base);
    if (typeof arg === "function" && arg === Spriteset_Battle) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this._battlebackLocated = false;
  };

  loadSystemImages(): void {
    super.loadSystemImages();
    ImageManager.loadSystem("Shadow2");
    ImageManager.loadSystem("Weapons1");
    ImageManager.loadSystem("Weapons2");
    ImageManager.loadSystem("Weapons3");
  };

  createLowerLayer(): void {
    super.createLowerLayer();
    this.createBackground();
    this.createBattleback();
    this.createBattleField();
    this.createEnemies();
    this.createActors();
  };

  createBackground(): void {
    this._backgroundFilter = new PIXI.filters.BlurFilter();
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this._backgroundSprite.filters = [this._backgroundFilter];
    this._baseSprite!.addChild(this._backgroundSprite);
  };

  createBattleback(): void {
    this._back1Sprite = new Sprite_Battleback(0);
    this._back2Sprite = new Sprite_Battleback(1);
    this._baseSprite!.addChild(this._back1Sprite);
    this._baseSprite!.addChild(this._back2Sprite);
  };

  createBattleField(): void {
    const width = Graphics.boxWidth;
    const height = Graphics.boxHeight;
    const x = (Graphics.width - width) / 2;
    const y = (Graphics.height - height) / 2;
    this._battleField = new Sprite();
    this._battleField.setFrame(0, 0, width, height);
    this._battleField.x = x;
    this._battleField.y = y - this.battleFieldOffsetY();
    this._baseSprite!.addChild(this._battleField);
    this._effectsContainer = this._battleField;
  };

  battleFieldOffsetY(): number {
    return 24;
  };

  update(): void {
    super.update();
    this.updateActors();
    this.updateBattleback();
    this.updateAnimations();
  };

  updateBattleback(): void {
    if (!this._battlebackLocated) {
        this._back1Sprite!.adjustPosition();
        this._back2Sprite!.adjustPosition();
        this._battlebackLocated = true;
    }
  };

  createEnemies(): void {
    const enemies = $gameTroop.members();
    const sprites: Sprite_Enemy[] = [];
    for (const enemy of enemies) {
        sprites.push(new Sprite_Enemy(enemy));
    }
    sprites.sort(this.compareEnemySprite.bind(this));
    for (const sprite of sprites) {
        this._battleField!.addChild(sprite);
    }
    this._enemySprites = sprites;
  };

  compareEnemySprite(a: Sprite_Enemy, b: Sprite_Enemy): number {
    if (a.y !== b.y) {
        return a.y - b.y;
    } else {
        return b.spriteId - a.spriteId;
    }
  };

  createActors(): void {
    this._actorSprites = [];
    if ($gameSystem.isSideView()) {
        for (let i = 0; i < $gameParty.maxBattleMembers(); i++) {
            const sprite = new Sprite_Actor();
            this._actorSprites.push(sprite);
            this._battleField!.addChild(sprite);
        }
    }
  };

  updateActors(): void {
    const members = $gameParty.battleMembers();
    for (let i = 0; i < this._actorSprites!.length; i++) {
        this._actorSprites![i].setBattler(members[i]);
    }
  };

  findTargetSprite(target: Game_Battler): Sprite_Battler | undefined {
    return this.battlerSprites().find(sprite => sprite.checkBattler(target));
  };

  battlerSprites(): Sprite_Battler[] {
    return (this._enemySprites as Sprite_Battler[]).concat(this._actorSprites as Sprite_Battler[]);
  };

  isEffecting(): boolean {
    return this.battlerSprites().some(sprite => sprite.isEffecting());
  };

  isAnyoneMoving(): boolean {
    return this.battlerSprites().some(sprite => sprite.isMoving());
  };

  isBusy(): boolean {
    return this.isAnimationPlaying() || this.isAnyoneMoving();
  };
}