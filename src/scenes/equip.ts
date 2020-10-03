import { Scene_MenuBase } from '.';

import {
  Window_EquipStatus,
  Window_EquipCommand,
  Window_EquipSlot,
  Window_EquipItem,
} from '../windows';
import { Rectangle } from '../pixi';
import { Graphics } from '../dom';
import { SoundManager } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Scene_Equip
//
// The scene class of the equipment screen.

export class Scene_Equip extends Scene_MenuBase {
  _statusWindow?: Window_EquipStatus
  _commandWindow?: Window_EquipCommand
  _slotWindow?: Window_EquipSlot
  _itemWindow?: Window_EquipItem

  constructor()
  constructor(thisClass: Constructable<Scene_Equip>)
  constructor(arg?: any) {
    super(Scene_MenuBase);
    if (typeof arg === "function" && arg === Scene_Equip) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  create(): void {
    super.create();
    this.createHelpWindow();
    this.createStatusWindow();
    this.createCommandWindow();
    this.createSlotWindow();
    this.createItemWindow();
    this.refreshActor();
  };

  createStatusWindow(): void {
    const rect = this.statusWindowRect();
    this._statusWindow = new Window_EquipStatus(rect);
    this.addWindow(this._statusWindow);
  };

  statusWindowRect(): Rectangle {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = this.statusWidth();
    const wh = this.mainAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
  };

  createCommandWindow(): void {
    const rect = this.commandWindowRect();
    this._commandWindow = new Window_EquipCommand(rect);
    this._commandWindow.setHelpWindow(this._helpWindow!);
    this._commandWindow.setHandler("equip", this.commandEquip.bind(this));
    this._commandWindow.setHandler("optimize", this.commandOptimize.bind(this));
    this._commandWindow.setHandler("clear", this.commandClear.bind(this));
    this._commandWindow.setHandler("cancel", this.popScene.bind(this));
    this._commandWindow.setHandler("pagedown", this.nextActor.bind(this));
    this._commandWindow.setHandler("pageup", this.previousActor.bind(this));
    this.addWindow(this._commandWindow);
  };

  commandWindowRect(): Rectangle {
    const wx = this.statusWidth();
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth - this.statusWidth();
    const wh = this.calcWindowHeight(1, true);
    return new Rectangle(wx, wy, ww, wh);
  };

  createSlotWindow(): void {
    const rect = this.slotWindowRect();
    this._slotWindow = new Window_EquipSlot(rect);
    this._slotWindow.setHelpWindow(this._helpWindow!);
    this._slotWindow.setStatusWindow(this._statusWindow!);
    this._slotWindow.setHandler("ok", this.onSlotOk.bind(this));
    this._slotWindow.setHandler("cancel", this.onSlotCancel.bind(this));
    this.addWindow(this._slotWindow);
  };

  slotWindowRect(): Rectangle {
    const commandWindowRect = this.commandWindowRect();
    const wx = this.statusWidth();
    const wy = commandWindowRect.y + commandWindowRect.height;
    const ww = Graphics.boxWidth - this.statusWidth();
    const wh = this.mainAreaHeight() - commandWindowRect.height;
    return new Rectangle(wx, wy, ww, wh);
  };

  createItemWindow(): void {
    const rect = this.itemWindowRect();
    this._itemWindow = new Window_EquipItem(rect);
    this._itemWindow.setHelpWindow(this._helpWindow!);
    this._itemWindow.setStatusWindow(this._statusWindow!);
    this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
    this._itemWindow.hide();
    this._slotWindow!.setItemWindow(this._itemWindow);
    this.addWindow(this._itemWindow);
  };

  itemWindowRect(): Rectangle {
    return this.slotWindowRect();
  };

  statusWidth(): number {
    return 312;
  };

  needsPageButtons(): boolean {
    return true;
  };

  arePageButtonsEnabled(): boolean {
    return !(this._itemWindow && this._itemWindow.active);
  };

  refreshActor(): void {
    const actor = this.actor();
    this._statusWindow!.setActor(actor);
    this._slotWindow!.setActor(actor);
    this._itemWindow!.setActor(actor);
  };

  commandEquip(): void {
    this._slotWindow!.activate();
    this._slotWindow!.select(0);
  };

  commandOptimize(): void {
    SoundManager.playEquip();
    this.actor().optimizeEquipments();
    this._statusWindow!.refresh();
    this._slotWindow!.refresh();
    this._commandWindow!.activate();
  };

  commandClear(): void {
    SoundManager.playEquip();
    this.actor().clearEquipments();
    this._statusWindow!.refresh();
    this._slotWindow!.refresh();
    this._commandWindow!.activate();
  };

  onSlotOk(): void {
    this._slotWindow!.hide();
    this._itemWindow!.show();
    this._itemWindow!.activate();
    this._itemWindow!.select(0);
  };

  onSlotCancel(): void {
    this._slotWindow!.deselect();
    this._commandWindow!.activate();
  };

  onItemOk(): void {
    SoundManager.playEquip();
    this.executeEquipChange();
    this.hideItemWindow();
    this._slotWindow!.refresh();
    this._itemWindow!.refresh();
    this._statusWindow!.refresh();
  };

  executeEquipChange(): void {
    const actor = this.actor();
    const slotId = this._slotWindow!.index();
    const item = this._itemWindow!.item() as MZ.DataEquipItem;
    actor.changeEquip(slotId, item);
  };

  onItemCancel(): void {
    this.hideItemWindow();
  };

  onActorChange(): void {
    super.onActorChange();
    this.refreshActor();
    this.hideItemWindow();
    this._slotWindow!.deselect();
    this._slotWindow!.deactivate();
    this._commandWindow!.activate();
  };

  hideItemWindow(): void {
    this._slotWindow!.show();
    this._slotWindow!.activate();
    this._itemWindow!.hide();
    this._itemWindow!.deselect();
  };
}
