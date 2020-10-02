import { Window_Base } from '.';
import { $gameMessage } from '../managers';
import { Rectangle } from '../pixi';
import { Input, TouchInput } from '../dom';

//-----------------------------------------------------------------------------
// Window_ScrollText
//
// The window for displaying scrolling text. No frame is displayed, but it
// is handled as a window for convenience.

export class Window_ScrollText extends Window_Base {
  _reservedRect?: Rectangle
  _text: string | null = ""
  _allTextHeight = 0

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_ScrollText>)
  constructor(arg?: any) {
    super(Window_Base);
    if (typeof arg === "function" && arg === Window_ScrollText) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(new Rectangle());
    this.opacity = 0;
    this.hide();
    this._reservedRect = rect;
    this._text = "";
    this._allTextHeight = 0;
  };

  update(): void {
    super.update();
    if ($gameMessage.scrollMode()) {
        if (this._text) {
            this.updateMessage();
        }
        if (!this._text && $gameMessage.hasText()) {
            this.startMessage();
        }
    }
  };

  startMessage(): void {
    this._text = $gameMessage.allText();
    this.updatePlacement();
    this.refresh();
    this.show();
  };

  refresh(): void {
    this._allTextHeight = this.textSizeEx(this._text!).height;
    this.createContents();
    this.origin.y = -this.height;
    const rect = this.baseTextRect();
    this.drawTextEx(this._text!, rect.x, rect.y, rect.width);
  };

  updatePlacement(): void {
    const rect = this._reservedRect!;
    this.move(rect.x, rect.y, rect.width, rect.height);
  };

  contentsHeight(): number {
    return Math.max(this._allTextHeight, 1);
  };

  updateMessage(): void {
    this.origin.y += this.scrollSpeed();
    if (this.origin.y >= this.contents.height) {
        this.terminateMessage();
    }
  };

  scrollSpeed(): number {
    let speed = $gameMessage.scrollSpeed() / 2;
    if (this.isFastForward()) {
        speed *= this.fastForwardRate();
    }
    return speed;
  };

  isFastForward(): boolean {
    if ($gameMessage.scrollNoFast()) {
        return false;
    } else {
        return (
            Input.isPressed("ok") ||
            Input.isPressed("shift") ||
            TouchInput.isPressed()
        );
    }
  };

  fastForwardRate(): number {
    return 3;
  };

  terminateMessage(): void {
    this._text = null;
    $gameMessage.clear();
    this.hide();
  };
}
