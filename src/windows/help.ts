import { Window_Base } from '.';
import { Rectangle } from '../pixi';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Window_Help
//
// The window for displaying the description of the selected item.

export class Window_Help extends Window_Base {
  _text = ""

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_Help>)
  constructor(arg?: any) {
    super(Window_Base);
    if (typeof arg === "function" && arg === Window_Help) {
      return;
    }
    this.initialize(...arguments);
  }
    
  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._text = "";
  };

  setText(text: string): void {
    if (this._text !== text) {
        this._text = text;
        this.refresh();
    }
  };

  clear(): void {
    this.setText("");
  };

  setItem(item: MZ.DataItemBase | null): void {
    this.setText(item ? item.description : "");
  };

  refresh(): void {
    const rect = this.baseTextRect();
    this.contents.clear();
    this.drawTextEx(this._text, rect.x, rect.y, rect.width);
  };
}
