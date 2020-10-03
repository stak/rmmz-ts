import { Rectangle } from '../pixi';
import { Window_Base } from '.';
import { $gameMessage } from '../managers';
import { Window_Message } from './message';
import { Graphics } from '../dom';

//-----------------------------------------------------------------------------
// Window_NameBox
//
// The window for displaying a speaker name above the message window.

export class Window_NameBox extends Window_Base {
  _name = ""
  _messageWindow?: Window_Message

  constructor()
  constructor(thisClass: Constructable<Window_NameBox>)
  constructor(arg?: any) {
    super(Window_Base);
    if (typeof arg === "function" && arg === Window_NameBox) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize(new Rectangle());
    this.openness = 0;
    this._name = "";
  };

  setMessageWindow(messageWindow: Window_Message): void {
    this._messageWindow = messageWindow;
  };

  setName(name: string): void {
    if (this._name !== name) {
        this._name = name;
        this.refresh();
    }
  };

  clear(): void {
    this.setName("");
  };

  start(): void {
    this.updatePlacement();
    this.updateBackground();
    this.createContents();
    this.refresh();
  };

  updatePlacement(): void {
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    const messageWindow = this._messageWindow!;
    if ($gameMessage.isRTL()) {
        this.x = messageWindow.x + messageWindow.width - this.width;
    } else {
        this.x = messageWindow.x;
    }
    if (messageWindow.y > 0) {
        this.y = messageWindow.y - this.height;
    } else {
        this.y = messageWindow.y + messageWindow.height;
    }
  };

  updateBackground(): void {
    this.setBackgroundType($gameMessage.background());
  };

  windowWidth(): number {
    if (this._name) {
        const textWidth = this.textSizeEx(this._name).width;
        const padding = this.padding + this.itemPadding();
        const width = Math.ceil(textWidth) + padding * 2;
        return Math.min(width, Graphics.boxWidth);
    } else {
        return 0;
    }
  };

  windowHeight(): number {
    return this.fittingHeight(1);
  };

  refresh(): void {
    const rect = this.baseTextRect();
    this.contents.clear();
    this.drawTextEx(this._name, rect.x, rect.y, rect.width);
  };
}
