import { Window_Base } from '.';
import { ColorManager } from '../managers';
import { $gameMap } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_MapName
//
// The window for displaying the map name on the map screen.

export class Window_MapName extends Window_Base {
  _showCount = 0

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_MapName>)
  constructor(arg?: any) {
    super(Window_Base);
    if (typeof arg === "function" && arg === Window_MapName) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.opacity = 0;
    this.contentsOpacity = 0;
    this._showCount = 0;
    this.refresh();
  };

  update(): void {
    super.update();
    if (this._showCount > 0 && $gameMap.isNameDisplayEnabled()) {
        this.updateFadeIn();
        this._showCount--;
    } else {
        this.updateFadeOut();
    }
  };

  updateFadeIn(): void {
    this.contentsOpacity += 16;
  };

  updateFadeOut(): void {
    this.contentsOpacity -= 16;
  };

  open(): void {
    this.refresh();
    this._showCount = 150;
  };

  close(): void {
    this._showCount = 0;
  };

  refresh(): void {
    this.contents.clear();
    if ($gameMap.displayName()) {
        const width = this.innerWidth;
        this.drawBackground(0, 0, width, this.lineHeight());
        this.drawText($gameMap.displayName(), 0, 0, width, "center");
    }
  };

  drawBackground(x: number, y: number, width: number, height: number): void {
    const color1 = ColorManager.dimColor1();
    const color2 = ColorManager.dimColor2();
    const half = width / 2;
    this.contents.gradientFillRect(x, y, half, height, color2, color1);
    this.contents.gradientFillRect(x + half, y, half, height, color1, color2);
  };
}