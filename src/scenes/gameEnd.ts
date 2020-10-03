import { Scene_MenuBase } from '.';
import { Scene_Title } from '.';

import { Window_GameEnd, Window_TitleCommand } from '../windows';
import { SceneManager } from '../managers';
import { Rectangle } from '../pixi';
import { Graphics } from '../dom';

//-----------------------------------------------------------------------------
// Scene_GameEnd
//
// The scene class of the game end screen.

export class Scene_GameEnd extends Scene_MenuBase {
  _commandWindow?: Window_GameEnd

  constructor()
  constructor(thisClass: Constructable<Scene_GameEnd>)
  constructor(arg?: any) {
    super(Scene_MenuBase);
    if (typeof arg === "function" && arg === Scene_GameEnd) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  create(): void {
    super.create();
    this.createCommandWindow();
  };

  stop(): void {
    super.stop();
    this._commandWindow!.close();
  };

  createBackground(): void {
    super.createBackground();
    this.setBackgroundOpacity(128);
  };

  createCommandWindow(): void {
    const rect = this.commandWindowRect();
    this._commandWindow = new Window_GameEnd(rect);
    this._commandWindow.setHandler("toTitle", this.commandToTitle.bind(this));
    this._commandWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._commandWindow);
  };

  commandWindowRect(): Rectangle {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(2, true);
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = (Graphics.boxHeight - wh) / 2;
    return new Rectangle(wx, wy, ww, wh);
  };

  commandToTitle(): void {
    this.fadeOutAll();
    SceneManager.goto(Scene_Title);
    Window_TitleCommand.initCommandPosition();
  };
}
