import { Window_StatusBase } from '.';
import { Game_Actor } from '../game';
import { ImageManager, ColorManager } from '../managers';
import { $gameParty } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_MenuStatus
//
// The window for displaying party member status on the menu screen.

export class Window_MenuStatus extends Window_StatusBase {
  _formationMode = false
  _pendingIndex = -1

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_MenuStatus>)
  constructor(arg?: any) {
    super(Window_StatusBase);
    if (typeof arg === "function" && arg === Window_MenuStatus) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._formationMode = false;
    this._pendingIndex = -1;
    this.refresh();
  };

  maxItems(): number {
    return $gameParty.size();
  };

  numVisibleRows(): number {
    return 4;
  };

  itemHeight(): number {
    return Math.floor(this.innerHeight / this.numVisibleRows());
  };

  actor(index: number): Game_Actor {
    return $gameParty.members()[index];
  };

  drawItem(index: number): void {
    this.drawPendingItemBackground(index);
    this.drawItemImage(index);
    this.drawItemStatus(index);
  };

  drawPendingItemBackground(index: number): void {
    if (index === this._pendingIndex) {
        const rect = this.itemRect(index);
        const color = ColorManager.pendingColor();
        this.changePaintOpacity(false);
        this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color);
        this.changePaintOpacity(true);
    }
  };

  drawItemImage(index: number): void {
    const actor = this.actor(index);
    const rect = this.itemRect(index);
    const width = ImageManager.faceWidth;
    const height = rect.height - 2;
    this.changePaintOpacity(actor.isBattleMember());
    this.drawActorFace(actor, rect.x + 1, rect.y + 1, width, height);
    this.changePaintOpacity(true);
  };

  drawItemStatus(index: number): void {
    const actor = this.actor(index);
    const rect = this.itemRect(index);
    const x = rect.x + 180;
    const y = rect.y + rect.height / 2 - this.lineHeight() * 1.5;
    this.drawActorSimpleStatus(actor, x, y);
  };

  processOk(): void {
    super.processOk();
    const actor = this.actor(this.index());
    $gameParty.setMenuActor(actor);
  };

  isCurrentItemEnabled(): boolean {
    if (this._formationMode) {
        const actor = this.actor(this.index());
        return actor && actor.isFormationChangeOk();
    } else {
        return true;
    }
  };

  selectLast(): void {
    this.smoothSelect($gameParty.menuActor().index() || 0);
  };

  formationMode(): boolean {
    return this._formationMode;
  };

  setFormationMode(formationMode: boolean): void {
    this._formationMode = formationMode;
  };

  pendingIndex(): number {
    return this._pendingIndex;
  };

  setPendingIndex(index: number): void {
    const lastPendingIndex = this._pendingIndex;
    this._pendingIndex = index;
    this.redrawItem(this._pendingIndex);
    this.redrawItem(lastPendingIndex);
  };
}
