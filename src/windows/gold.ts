import { Window_Selectable } from '.';
import { TextManager } from '../managers';
import { $gameParty } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_Gold
//
// The window for displaying the party's gold.

export class Window_Gold extends Window_Selectable {

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_Gold>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_Gold) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.refresh();
  };

  colSpacing(): number {
    return 0;
  };

  refresh(): void {
    const rect = this.itemLineRect(0);
    const x = rect.x;
    const y = rect.y;
    const width = rect.width;
    this.contents.clear();
    this.drawCurrencyValue(this.value(), this.currencyUnit(), x, y, width);
  };

  value(): number {
    return $gameParty.gold();
  };

  currencyUnit(): string {
    return TextManager.currencyUnit;
  };

  open(): void {
    this.refresh();
    super.open();
  };
}
