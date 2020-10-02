import { Window_HorzCommand } from '.';
import { TextManager } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_ShopCommand
//
// The window for selecting buy/sell on the shop screen.

export class Window_ShopCommand extends Window_HorzCommand {
  _purchaseOnly = false

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_ShopCommand>)
  constructor(arg?: any) {
    super(Window_HorzCommand);
    if (typeof arg === "function" && arg === Window_ShopCommand) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
  };

  setPurchaseOnly(purchaseOnly: boolean): void {
    this._purchaseOnly = purchaseOnly;
    this.refresh();
  };

  maxCols(): number {
    return 3;
  };

  makeCommandList(): void {
    this.addCommand(TextManager.buy, "buy");
    this.addCommand(TextManager.sell, "sell", !this._purchaseOnly);
    this.addCommand(TextManager.cancel, "cancel");
  };
}
