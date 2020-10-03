import { Window_ItemList } from '.';
import { $gameParty } from '../managers';
import { MZ } from '../MZ';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_BattleItem
//
// The window for selecting an item to use on the battle screen.

export class Window_BattleItem extends Window_ItemList {
  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_BattleItem>)
  constructor(arg?: any) {
    super(Window_ItemList);
    if (typeof arg === "function" && arg === Window_BattleItem) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.hide();
  };

  includes(item: MZ.DataItemBase): boolean {
    return $gameParty.canUse(item);
  };

  show(): void {
    this.selectLast();
    this.showHelpWindow();
    super.show();
  };

  hide(): void {
    this.hideHelpWindow();
    super.hide();
  };
}
