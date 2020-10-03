import { Window_StatusBase } from '.';
import { TextManager, DataManager, ColorManager } from '../managers';
import { $gameParty } from '../managers';
import { MZ } from '../MZ';
import { Rectangle } from '../pixi';
import { Game_Actor } from '../game';
import { Input, TouchInput } from '../dom';

//-----------------------------------------------------------------------------
// Window_ShopStatus
//
// The window for displaying number of items in possession and the actor's
// equipment on the shop screen.

export class Window_ShopStatus extends Window_StatusBase {
  _item: MZ.DataItemBase | null = null
  _pageIndex = 0

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_ShopStatus>)
  constructor(arg?: any) {
    super(Window_StatusBase);
    if (typeof arg === "function" && arg === Window_ShopStatus) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._item = null;
    this._pageIndex = 0;
    this.refresh();
  };

  refresh(): void {
    this.contents.clear();
    if (this._item) {
        const x = this.itemPadding();
        this.drawPossession(x, 0);
        if (this.isEquipItem()) {
            const y = Math.floor(this.lineHeight() * 1.5);
            this.drawEquipInfo(x, y);
        }
    }
  };

  setItem(item: MZ.DataItemBase | null): void {
    this._item = item;
    this.refresh();
  };

  isEquipItem(): boolean {
    return DataManager.isWeapon(this._item) || DataManager.isArmor(this._item);
  };

  drawPossession(x: number, y: number): void {
    const width = this.innerWidth - this.itemPadding() - x;
    const possessionWidth = this.textWidth("0000");
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.possession, x, y, width - possessionWidth);
    this.resetTextColor();
    this.drawText(String($gameParty.numItems(this._item)), x, y, width, "right");
  };

  drawEquipInfo(x: number, y: number): void {
    const members = this.statusMembers();
    for (let i = 0; i < members.length; i++) {
        const actorY = y + Math.floor(this.lineHeight() * i * 2.2);
        this.drawActorEquipInfo(x, actorY, members[i]);
    }
  };

  statusMembers(): Game_Actor[] {
    const start = this._pageIndex * this.pageSize();
    const end = start + this.pageSize();
    return $gameParty.members().slice(start, end);
  };

  pageSize(): number {
    return 4;
  };

  maxPages(): number {
    return Math.floor(
        ($gameParty.size() + this.pageSize() - 1) / this.pageSize()
    );
  };

  drawActorEquipInfo(x: number, y: number, actor: Game_Actor): void {
    const item1 = this.currentEquippedItem(actor, (this._item as MZ.DataEquipItem).etypeId);
    const width = this.innerWidth - x - this.itemPadding();
    const enabled = actor.canEquip(this._item!);
    this.changePaintOpacity(enabled);
    this.resetTextColor();
    this.drawText(actor.name(), x, y, width);
    if (enabled) {
        this.drawActorParamChange(x, y, actor, item1!);
    }
    this.drawItemName(item1, x, y + this.lineHeight(), width);
    this.changePaintOpacity(true);
  };

  drawActorParamChange(x: number, y: number, actor: Game_Actor, item1: MZ.DataEquipItem) {
    const width = this.innerWidth - this.itemPadding() - x;
    const paramId = this.paramId();
    const change =
        (this._item as MZ.DataEquipItem).params[paramId] - (item1 ? item1.params[paramId] : 0);
    this.changeTextColor(ColorManager.paramchangeTextColor(change));
    this.drawText((change > 0 ? "+" : "") + change, x, y, width, "right");
  };

  paramId(): number {
    return DataManager.isWeapon(this._item) ? 2 : 3;
  };

  currentEquippedItem(actor: Game_Actor, etypeId: MZ.EquipTypeID): MZ.DataEquipItem | null {
    const list = [];
    const equips = actor.equips();
    const slots = actor.equipSlots();
    for (let i = 0; i < slots.length; i++) {
        if (slots[i] === etypeId) {
            list.push(equips[i]);
        }
    }
    const paramId = this.paramId();
    let worstParam = Number.MAX_VALUE;
    let worstItem = null;
    for (const item of list) {
        if (item && item.params[paramId] < worstParam) {
            worstParam = item.params[paramId];
            worstItem = item;
        }
    }
    return worstItem;
  };

  update(): void {
    super.update();
    this.updatePage();
  };

  updatePage(): void {
    if (this.isPageChangeEnabled() && this.isPageChangeRequested()) {
        this.changePage();
    }
  };

  isPageChangeEnabled(): boolean {
    return this.visible && this.maxPages() >= 2;
  };

  isPageChangeRequested(): boolean {
    if (Input.isTriggered("shift")) {
        return true;
    }
    if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
        return true;
    }
    return false;
  };

  changePage(): void {
    this._pageIndex = (this._pageIndex + 1) % this.maxPages();
    this.refresh();
    this.playCursorSound();
  };
}