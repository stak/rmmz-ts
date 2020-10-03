import { Scene_MenuBase } from '.';

import { Window_NameEdit, Window_NameInput } from '../windows';
import { ImageManager } from '../managers';
import { Rectangle } from '../pixi';
import { Graphics } from '../dom';
import { $gameActors, $gameSystem } from '../managers';
import { MZ } from '../MZ';
import { Game_Actor } from '../game';

//-----------------------------------------------------------------------------
// Scene_Name
//
// The scene class of the name input screen.

export class Scene_Name extends Scene_MenuBase {
  _actorId: MZ.ActorID = 0
  _actor?: Game_Actor
  _maxLength = 0
  _editWindow?: Window_NameEdit
  _inputWindow?: Window_NameInput

  constructor()
  constructor(thisClass: Constructable<Scene_Name>)
  constructor(arg?: any) {
    super(Scene_MenuBase);
    if (typeof arg === "function" && arg === Scene_Name) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  prepare(actorId: MZ.ActorID, maxLength: number): void {
    this._actorId = actorId;
    this._maxLength = maxLength;
  };

  create(): void {
    super.create();
    this._actor = $gameActors.actor(this._actorId)!;
    this.createEditWindow();
    this.createInputWindow();
  };

  start(): void {
    super.start();
    this._editWindow!.refresh();
  };

  createEditWindow(): void {
    const rect = this.editWindowRect();
    this._editWindow = new Window_NameEdit(rect);
    this._editWindow.setup(this._actor!, this._maxLength);
    this.addWindow(this._editWindow as any);
  };

  editWindowRect(): Rectangle {
    const inputWindowHeight = this.calcWindowHeight(9, true);
    const padding = $gameSystem.windowPadding();
    const ww = 600;
    const wh = ImageManager.faceHeight + padding * 2;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = (Graphics.boxHeight - (wh + inputWindowHeight + 8)) / 2;
    return new Rectangle(wx, wy, ww, wh);
  };

  createInputWindow(): void {
    const rect = this.inputWindowRect();
    this._inputWindow = new Window_NameInput(rect);
    this._inputWindow.setEditWindow(this._editWindow!);
    this._inputWindow.setHandler("ok", this.onInputOk.bind(this));
    this.addWindow(this._inputWindow);
  };

  inputWindowRect(): Rectangle {
    const wx = this._editWindow!.x;
    const wy = this._editWindow!.y + this._editWindow!.height + 8;
    const ww = this._editWindow!.width;
    const wh = this.calcWindowHeight(9, true);
    return new Rectangle(wx, wy, ww, wh);
  };

  onInputOk(): void {
    this._actor!.setName(this._editWindow!.name());
    this.popScene();
  };
}
