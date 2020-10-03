import { Scene_MenuBase } from '.';

import { Window_Options } from '../windows';
import { ConfigManager } from '../managers';
import { Rectangle } from '../pixi';
import { Graphics } from '../dom';

//-----------------------------------------------------------------------------
// Scene_Options
//
// The scene class of the options screen.

export class Scene_Options extends Scene_MenuBase {
  _optionsWindow?: Window_Options

  constructor()
  constructor(thisClass: Constructable<Scene_Options>)
  constructor(arg?: any) {
    super(Scene_MenuBase);
    if (typeof arg === "function" && arg === Scene_Options) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  create(): void {
    super.create();
    this.createOptionsWindow();
  };

  terminate(): void {
    super.terminate();
    ConfigManager.save();
  };

  createOptionsWindow(): void {
    const rect = this.optionsWindowRect();
    this._optionsWindow = new Window_Options(rect);
    this._optionsWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._optionsWindow);
  };

  optionsWindowRect(): Rectangle {
    const n = Math.min(this.maxCommands(), this.maxVisibleCommands());
    const ww = 400;
    const wh = this.calcWindowHeight(n, true);
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = (Graphics.boxHeight - wh) / 2;
    return new Rectangle(wx, wy, ww, wh);
  };

  maxCommands(): number {
    // Increase this value when adding option items.
    return 7;
  };

  maxVisibleCommands(): number {
    return 12;
  };
}
