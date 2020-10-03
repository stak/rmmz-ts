import { Window_StatusBase } from '.';
import { Game_Actor } from '../game';
import { ColorManager } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_StatusEquip
//
// The window for displaying equipment items on the status screen.

export class Window_StatusEquip extends Window_StatusBase {
  _actor: Game_Actor | null = null

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_StatusEquip>)
  constructor(arg?: any) {
    super(Window_StatusBase);
    if (typeof arg === "function" && arg === Window_StatusEquip) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._actor = null;
  };

  setActor(actor: Game_Actor): void {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
  };

  maxItems(): number {
    return this._actor ? this._actor.equipSlots().length : 0;
  };

  itemHeight(): number {
    return this.lineHeight();
  };

  drawItem(index: number): void {
    const rect = this.itemLineRect(index);
    const equips = this._actor!.equips();
    const item = equips[index];
    const slotName = this.actorSlotName(this._actor!, index);
    const sw = 138;
    this.changeTextColor(ColorManager.systemColor());

    // FIX: signature mismatch with Window_Base.drawText
    // this.drawText(slotName, rect.x, rect.y, sw, rect.height);
    this.contents.drawText(slotName, rect.x, rect.y, sw, rect.height);

    this.drawItemName(item, rect.x + sw, rect.y, rect.width - sw);
  };

  drawItemBackground(index: number): void {
    //
  };
}
