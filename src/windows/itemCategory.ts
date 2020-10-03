import { Window_HorzCommand } from '.';
import { Window_ItemList } from '.';
import { TextManager } from '../managers';
import { $dataSystem } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_ItemCategory
//
// The window for selecting a category of items on the item and shop screens.

export class Window_ItemCategory extends Window_HorzCommand {
  _itemWindow?: Window_ItemList

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_ItemCategory>)
  constructor(arg?: any) {
    super(Window_HorzCommand);
    if (typeof arg === "function" && arg === Window_ItemCategory) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
  };

  maxCols(): number {
    return 4;
  };

  update(): void {
    super.update();
    if (this._itemWindow) {
        this._itemWindow.setCategory(this.currentSymbol()!);
    }
  };

  makeCommandList(): void {
    if (this.needsCommand("item")) {
        this.addCommand(TextManager.item, "item");
    }
    if (this.needsCommand("weapon")) {
        this.addCommand(TextManager.weapon, "weapon");
    }
    if (this.needsCommand("armor")) {
        this.addCommand(TextManager.armor, "armor");
    }
    if (this.needsCommand("keyItem")) {
        this.addCommand(TextManager.keyItem, "keyItem");
    }
  };

  needsCommand(name: string): boolean {
    const table = ["item", "weapon", "armor", "keyItem"];
    const index = table.indexOf(name);
    if (index >= 0) {
        return $dataSystem.itemCategories[index];
    }
    return true;
  };

  setItemWindow(itemWindow: Window_ItemList): void {
    this._itemWindow = itemWindow;
  };

  needsSelection(): boolean {
    return this.maxItems() >= 2;
  };
}
