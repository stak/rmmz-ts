import { Window_Selectable } from '.';
import { DataManager } from '../managers';
import { $gameParty } from '../managers';
import { $dataSystem } from '../managers';
import { Rectangle } from '../pixi';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Window_ItemList
//
// The window for selecting an item on the item screen.

export class Window_ItemList extends Window_Selectable {
  _category = "none"
  _data: (MZ.DataItemBase | null)[] = []

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_ItemList>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_ItemList) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._category = "none";
    this._data = [];
  };

  setCategory(category: string): void {
    if (this._category !== category) {
        this._category = category;
        this.refresh();
        this.scrollTo(0, 0);
    }
  };

  maxCols(): number {
    return 2;
  };

  colSpacing(): number {
    return 16;
  };

  maxItems(): number {
    return this._data ? this._data.length : 1;
  };

  item(): MZ.DataItemBase | null {
    return this.itemAt(this.index());
  };

  itemAt(index: number): MZ.DataItemBase | null {
    return this._data && index >= 0 ? this._data[index] : null;
  };

  isCurrentItemEnabled(): boolean {
    return this.isEnabled(this.item());
  };

  includes(item: MZ.DataItemBase | null): boolean {
    switch (this._category) {
        case "item":
            return DataManager.isItem(item) && (item as MZ.DataItem).itypeId === 1;
        case "weapon":
            return DataManager.isWeapon(item);
        case "armor":
            return DataManager.isArmor(item);
        case "keyItem":
            return DataManager.isItem(item) && (item as MZ.DataItem).itypeId === 2;
        default:
            return false;
    }
  };

  needsNumber(): boolean {
    if (this._category === "keyItem") {
        return $dataSystem.optKeyItemsNumber;
    } else {
        return true;
    }
  };

  isEnabled(item: MZ.DataItemBase | null): boolean {
    return $gameParty.canUse(item);
  };

  makeItemList(): void {
    this._data = $gameParty.allItems().filter(item => this.includes(item));
    if (this.includes(null)) {
        this._data.push(null);
    }
  };

  selectLast(): void {
    const index = this._data.indexOf($gameParty.lastItem());
    this.forceSelect(index >= 0 ? index : 0);
  };

  drawItem(index: number): void {
    const item = this.itemAt(index);
    if (item) {
        const numberWidth = this.numberWidth();
        const rect = this.itemLineRect(index);
        this.changePaintOpacity(this.isEnabled(item));
        this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
        this.drawItemNumber(item, rect.x, rect.y, rect.width);
        this.changePaintOpacity(1);
    }
  };

  numberWidth(): number {
    return this.textWidth("000");
  };

  drawItemNumber(item: MZ.DataItemBase, x: number, y: number, width: number): void {
    if (this.needsNumber()) {
        this.drawText(":", x, y, width - this.textWidth("00"), "right");
        this.drawText(String($gameParty.numItems(item)), x, y, width, "right");
    }
  };

  updateHelp(): void {
    this.setHelpWindowItem(this.item());
  };

  refresh(): void {
    this.makeItemList();
    super.refresh();
  };
}