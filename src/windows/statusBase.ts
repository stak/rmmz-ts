import { Window_Selectable } from '.';
import { BattleManager, ImageManager, ColorManager, TextManager } from '../managers';
import { $gameParty } from '../managers';
import { $dataSystem } from '../managers';
import { Rectangle, Sprite } from '../pixi';
import { Sprite_Name, Sprite_Gauge, Sprite_StateIcon } from '../sprites';
import { Game_Actor } from '../game';

//-----------------------------------------------------------------------------
// Window_StatusBase
//
// The superclass of windows for displaying actor status.

export class Window_StatusBase extends Window_Selectable {
  _additionalSprites: {[key: string]: Sprite} = {}

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_StatusBase>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_StatusBase) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._additionalSprites = {};
    this.loadFaceImages();
  };

  loadFaceImages(): void {
    for (const actor of $gameParty.members()) {
        ImageManager.loadFace(actor.faceName());
    }
  };

  refresh(): void {
    this.hideAdditionalSprites();
    super.refresh();
  };

  hideAdditionalSprites(): void {
    for (const sprite of Object.values(this._additionalSprites)) {
        sprite.hide();
    }
  };

  placeActorName(actor: Game_Actor, x: number, y: number): void {
    const key = "actor%1-name".format(actor.actorId());
    const sprite = this.createInnerSprite(key, Sprite_Name as any);
    (sprite as any).setup(actor);
    sprite.move(x, y);
    sprite.show();
  };

  placeStateIcon(actor: Game_Actor, x: number, y: number): void {
    const key = "actor%1-stateIcon".format(actor.actorId());
    const sprite = this.createInnerSprite(key, Sprite_StateIcon);
    sprite.setup(actor);
    sprite.move(x, y);
    sprite.show();
  };

  placeGauge(actor: Game_Actor, type: string, x: number, y: number): void {
    const key = "actor%1-gauge-%2".format(actor.actorId(), type);
    const sprite = this.createInnerSprite(key, Sprite_Gauge);
    sprite.setup(actor, type);
    sprite.move(x, y);
    sprite.show();
  };

  createInnerSprite<T extends Sprite>(key: string, spriteClass: Constructable<T>): T {
    const dict = this._additionalSprites;
    if (dict[key]) {
        return dict[key] as any;
    } else {
        const sprite = new spriteClass();
        dict[key] = sprite;
        this.addInnerChild(sprite);
        return sprite;
    }
  };

  placeTimeGauge(actor: Game_Actor, x: number, y: number): void {
    if (BattleManager.isTpb()) {
        this.placeGauge(actor, "time", x, y);
    }
  };

  placeBasicGauges(actor: Game_Actor, x: number, y: number): void {
    this.placeGauge(actor, "hp", x, y);
    this.placeGauge(actor, "mp", x, y + this.gaugeLineHeight());
    if ($dataSystem.optDisplayTp) {
        this.placeGauge(actor, "tp", x, y + this.gaugeLineHeight() * 2);
    }
  };

  gaugeLineHeight(): number {
    return 24;
  };

  drawActorCharacter(actor: Game_Actor, x: number, y: number): void {
    this.drawCharacter(actor.characterName(), actor.characterIndex(), x, y);
  };

  drawActorFace(actor: Game_Actor, x: number, y: number, width?: number, height?: number) {
    this.drawFace(actor.faceName(), actor.faceIndex(), x, y, width, height);
  };

  drawActorName(actor: Game_Actor, x: number, y: number, width?: number): void {
    width = width || 168;
    this.changeTextColor(ColorManager.hpColor(actor));
    this.drawText(actor.name(), x, y, width);
  };

  drawActorClass(actor: Game_Actor, x: number, y: number, width?: number): void {
    width = width || 168;
    this.resetTextColor();
    this.drawText(actor.currentClass().name, x, y, width);
  };

  drawActorNickname(actor: Game_Actor, x: number, y: number, width?: number): void {
    width = width || 270;
    this.resetTextColor();
    this.drawText(actor.nickname(), x, y, width);
  };

  drawActorLevel(actor: Game_Actor, x: number, y: number): void {
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.levelA, x, y, 48);
    this.resetTextColor();
    this.drawText(String(actor.level), x + 84, y, 36, "right");
  };

  drawActorIcons(actor: Game_Actor, x: number, y: number, width?: number): void {
    width = width || 144;
    const iconWidth = ImageManager.iconWidth;
    const icons = actor.allIcons().slice(0, Math.floor(width / iconWidth));
    let iconX = x;
    for (const icon of icons) {
        this.drawIcon(icon, iconX, y + 2);
        iconX += iconWidth;
    }
  };

  drawActorSimpleStatus(actor: Game_Actor, x: number, y: number): void {
    const lineHeight = this.lineHeight();
    const x2 = x + 180;
    this.drawActorName(actor, x, y);
    this.drawActorLevel(actor, x, y + lineHeight * 1);
    this.drawActorIcons(actor, x, y + lineHeight * 2);
    this.drawActorClass(actor, x2, y);
    this.placeBasicGauges(actor, x2, y + lineHeight);
  };

  actorSlotName(actor: Game_Actor, index: number): string {
    const slots = actor.equipSlots();
    return $dataSystem.equipTypes[slots[index]];
  };
}
