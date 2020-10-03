import { Window_StatusBase } from '.';
import { Window_EquipItem } from '.';
import { Window_EquipStatus } from '.';
import { Game_Actor } from '../game';
import { ColorManager } from '../managers';
import { MZ } from '../MZ';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_EquipSlot
//
// The window for selecting an equipment slot on the equipment screen.

export class Window_EquipSlot extends Window_StatusBase {
  _actor: Game_Actor | null = null
  _itemWindow?: Window_EquipItem
  _statusWindow?: Window_EquipStatus

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_EquipSlot>)
  constructor(arg?: any) {
    super(Window_StatusBase);
    if (typeof arg === "function" && arg === Window_EquipSlot) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._actor = null;
    this.refresh();
  };

  setActor(actor: Game_Actor): void {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
  };

  update(): void {
    super.update();
    if (this._itemWindow) {
        this._itemWindow.setSlotId(this.index());
    }
  };

  maxItems(): number {
    return this._actor ? this._actor.equipSlots().length : 0;
  };

  item(): MZ.DataEquipItem | null {
    return this.itemAt(this.index());
  };

  itemAt(index: number): MZ.DataEquipItem | null {
    return this._actor ? this._actor.equips()[index] : null;
  };

  drawItem(index: number): void {
    if (this._actor) {
        const slotName = this.actorSlotName(this._actor, index);
        const item = this.itemAt(index);
        const slotNameWidth = this.slotNameWidth();
        const rect = this.itemLineRect(index);
        const itemWidth = rect.width - slotNameWidth;
        this.changeTextColor(ColorManager.systemColor());
        this.changePaintOpacity(this.isEnabled(index));
        
        // FIX: signature mismatch with Window_Base.drawText
        // this.drawText(slotName, rect.x, rect.y, slotNameWidth, rect.height);
        this.contents.drawText(slotName, rect.x, rect.y, slotNameWidth, rect.height);
        
        this.drawItemName(item!, rect.x + slotNameWidth, rect.y, itemWidth);
        this.changePaintOpacity(true);
    }
  };

  slotNameWidth(): number {
    return 138;
  };

  isEnabled(index: number): boolean {
    return this._actor ? this._actor.isEquipChangeOk(index) : false;
  };

  isCurrentItemEnabled(): boolean {
    return this.isEnabled(this.index());
  };

  setStatusWindow(statusWindow: Window_EquipStatus): void {
    this._statusWindow = statusWindow;
    this.callUpdateHelp();
  };

  setItemWindow(itemWindow: Window_EquipItem): void {
    this._itemWindow = itemWindow;
  };

  updateHelp(): void {
    super.updateHelp();
    this.setHelpWindowItem(this.item());
    if (this._statusWindow) {
        this._statusWindow.setTempActor(null);
    }
  };
}