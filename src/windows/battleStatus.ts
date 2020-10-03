import { Window_StatusBase } from '.';
import { Game_Actor } from '../game';
import { ImageManager } from '../managers';
import { $gameTemp, $gameParty } from '../managers';
import { $dataSystem } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_BattleStatus
//
// The window for displaying the status of party members on the battle screen.

export class Window_BattleStatus extends Window_StatusBase {
  frameVisible = false
  _bitmapsReady = 0

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_BattleStatus>)
  constructor(arg?: any) {
    super(Window_StatusBase);
    if (typeof arg === "function" && arg === Window_BattleStatus) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.frameVisible = false;
    this.openness = 0;
    this._bitmapsReady = 0;
    this.preparePartyRefresh();
  };

  extraHeight(): number {
    return 10;
  };

  maxCols(): number {
    return 4;
  };

  itemHeight(): number {
    return this.innerHeight;
  };

  maxItems(): number {
    return $gameParty.battleMembers().length;
  };

  rowSpacing(): number {
    return 0;
  };

  updatePadding(): void {
    this.padding = 8;
  };

  actor(index: number): Game_Actor {
    return $gameParty.battleMembers()[index];
  };

  selectActor(actor: Game_Actor): void {
    const members = $gameParty.battleMembers();
    this.select(members.indexOf(actor));
  };

  update(): void {
    super.update();
    if ($gameTemp.isBattleRefreshRequested()) {
        this.preparePartyRefresh();
    }
  };

  preparePartyRefresh(): void {
    $gameTemp.clearBattleRefreshRequest();
    this._bitmapsReady = 0;
    for (const actor of $gameParty.members()) {
        const bitmap = ImageManager.loadFace(actor.faceName());
        bitmap.addLoadListener(this.performPartyRefresh.bind(this));
    }
  };

  performPartyRefresh(): void {
    this._bitmapsReady++;
    if (this._bitmapsReady >= $gameParty.members().length) {
        this.refresh();
    }
  };

  drawItem(index: number): void {
    this.drawItemImage(index);
    this.drawItemStatus(index);
  };

  drawItemImage(index: number): void {
    const actor = this.actor(index);
    const rect = this.faceRect(index);
    this.drawActorFace(actor, rect.x, rect.y, rect.width, rect.height);
  };

  drawItemStatus(index: number): void {
    const actor = this.actor(index);
    const rect = this.itemRectWithPadding(index);
    const nameX = this.nameX(rect);
    const nameY = this.nameY(rect);
    const stateIconX = this.stateIconX(rect);
    const stateIconY = this.stateIconY(rect);
    const basicGaugesX = this.basicGaugesX(rect);
    const basicGaugesY = this.basicGaugesY(rect);
    this.placeTimeGauge(actor, nameX, nameY);
    this.placeActorName(actor, nameX, nameY);
    this.placeStateIcon(actor, stateIconX, stateIconY);
    this.placeBasicGauges(actor, basicGaugesX, basicGaugesY);
  };

  faceRect(index: number): Rectangle {
    const rect = this.itemRect(index);
    rect.pad(-1);
    rect.height = this.nameY(rect) + this.gaugeLineHeight() / 2 - rect.y;
    return rect;
  };

  nameX(rect: Rectangle): number {
    return rect.x;
  };

  nameY(rect: Rectangle): number {
    return this.basicGaugesY(rect) - this.gaugeLineHeight();
  };

  stateIconX(rect: Rectangle): number {
    return rect.x + rect.width - ImageManager.iconWidth / 2 + 4;
  };

  stateIconY(rect: Rectangle): number {
    return rect.y + ImageManager.iconHeight / 2 + 4;
  };

  basicGaugesX(rect: Rectangle): number {
    return rect.x;
  };

  basicGaugesY(rect: Rectangle): number {
    const bottom = rect.y + rect.height - this.extraHeight();
    const numGauges = $dataSystem.optDisplayTp ? 3 : 2;
    return bottom - this.gaugeLineHeight() * numGauges;
  };
}