import { Scene_MenuBase } from '.';
import { Window_Base, Window_DebugEdit, Window_DebugRange } from '../windows';

import { Rectangle } from '../pixi';
import { Graphics } from '../dom';

//-----------------------------------------------------------------------------
// Scene_Debug
//
// The scene class of the debug screen.

export class Scene_Debug extends Scene_MenuBase {
  _rangeWindow?: Window_DebugRange
  _editWindow?: Window_DebugEdit
  _debugHelpWindow?: Window_Base

  constructor()
  constructor(thisClass: Constructable<Scene_Debug>)
  constructor(arg?: any) {
    super(Scene_MenuBase);
    if (typeof arg === "function" && arg === Scene_Debug) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  create(): void {
    super.create();
    this.createRangeWindow();
    this.createEditWindow();
    this.createDebugHelpWindow();
  };

  needsCancelButton(): boolean {
    return false;
  };

  createRangeWindow(): void {
    const rect = this.rangeWindowRect();
    this._rangeWindow = new Window_DebugRange(rect);
    this._rangeWindow.setHandler("ok", this.onRangeOk.bind(this));
    this._rangeWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._rangeWindow);
  };

  rangeWindowRect(): Rectangle {
    const wx = 0;
    const wy = 0;
    const ww = 246;
    const wh = Graphics.boxHeight;
    return new Rectangle(wx, wy, ww, wh);
  };

  createEditWindow(): void {
    const rect = this.editWindowRect();
    this._editWindow = new Window_DebugEdit(rect);
    this._editWindow.setHandler("cancel", this.onEditCancel.bind(this));
    this._rangeWindow!.setEditWindow(this._editWindow);
    this.addWindow(this._editWindow);
  };

  editWindowRect(): Rectangle {
    const wx = this._rangeWindow!.width;
    const wy = 0;
    const ww = Graphics.boxWidth - wx;
    const wh = this.calcWindowHeight(10, true);
    return new Rectangle(wx, wy, ww, wh);
  };

  createDebugHelpWindow(): void {
    const rect = this.debugHelpWindowRect();
    this._debugHelpWindow = new Window_Base(rect);
    this.addWindow(this._debugHelpWindow);
  };

  debugHelpWindowRect(): Rectangle {
    const wx = this._editWindow!.x;
    const wy = this._editWindow!.height;
    const ww = this._editWindow!.width;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
  };

  onRangeOk(): void {
    this._editWindow!.activate();
    this._editWindow!.select(0);
    this.refreshHelpWindow();
  };

  onEditCancel(): void {
    this._rangeWindow!.activate();
    this._editWindow!.deselect();
    this.refreshHelpWindow();
  };

  refreshHelpWindow(): void {
    const helpWindow = this._debugHelpWindow!;
    helpWindow.contents.clear();
    if (this._editWindow!.active) {
        const rect = helpWindow.baseTextRect();
        helpWindow.drawTextEx(this.helpText(), rect.x, rect.y, rect.width);
    }
  };

  helpText(): string {
    if ((this._rangeWindow as any).mode() === "switch") {
        return "Enter : ON / OFF";
    } else {
        return (
            "Left     :  -1    Pageup   : -10\n" +
            "Right    :  +1    Pagedown : +10"
        );
    }
  };
}
