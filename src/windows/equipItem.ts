import { Window_ItemList } from '.';
import { JsonEx } from '../dom';
import { Game_Actor } from '../game';
import { MZ } from '../MZ';
import { Rectangle } from '../pixi';
import { Window_EquipStatus } from '.';

//-----------------------------------------------------------------------------
// Window_EquipItem
//
// The window for selecting an equipment item on the equipment screen.

export class Window_EquipItem extends Window_ItemList {
  _actor: Game_Actor | null = null
  _slotId = 0
  _statusWindow?: Window_EquipStatus

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_EquipItem>)
  constructor(arg?: any) {
    super(Window_ItemList);
    if (typeof arg === "function" && arg === Window_EquipItem) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._actor = null;
    this._slotId = 0;
  };

  maxCols(): number {
    return 1;
  };

  colSpacing(): number {
    return 8;
  };

  setActor(actor: Game_Actor): void {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
        this.scrollTo(0, 0);
    }
  };

  setSlotId(slotId: number): void {
    if (this._slotId !== slotId) {
        this._slotId = slotId;
        this.refresh();
        this.scrollTo(0, 0);
    }
  };

  includes(item: MZ.DataEquipItem): boolean {
    if (item === null) {
        return true;
    }
    return (
        !!this._actor &&
        this._actor.canEquip(item) &&
        (item as any).etypeId === this.etypeId()
    );
  };

  etypeId(): MZ.EquipTypeID {
    if (this._actor && this._slotId >= 0) {
        return this._actor.equipSlots()[this._slotId];
    } else {
        return 0;
    }
  };

  isEnabled(item: MZ.DataEquipItem): boolean {
    return true;
  };

  selectLast(): void {
    //
  };

  setStatusWindow(statusWindow: Window_EquipStatus): void {
    this._statusWindow = statusWindow;
    this.callUpdateHelp();
  };

  updateHelp(): void {
    super.updateHelp();
    if (this._actor && this._statusWindow && this._slotId >= 0) {
        const actor = JsonEx.makeDeepCopy(this._actor) as Game_Actor;
        actor.forceChangeEquip(this._slotId, this.item() as MZ.DataEquipItem);
        this._statusWindow.setTempActor(actor);
    }
  };

  playOkSound(): void {
    //
  };
}
