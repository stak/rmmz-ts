import { Scene_MenuBase } from '.';

import {
  Window_Help,
  Window_Status,
  Window_StatusParams,
  Window_StatusEquip,
} from '../windows';
import { Rectangle } from '../pixi';
import { Graphics } from '../dom';

//-----------------------------------------------------------------------------
// Scene_Status
//
// The scene class of the status screen.

export class Scene_Status extends Scene_MenuBase {
  _statusWindow?: Window_Status
  _statusParamsWindow?: Window_StatusParams
  _statusEquipWindow?: Window_StatusEquip
  _profileWindow?: Window_Help

  constructor()
  constructor(thisClass: Constructable<Scene_Status>)
  constructor(arg?: any) {
    super(Scene_MenuBase);
    if (typeof arg === "function" && arg === Scene_Status) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };


  create(): void {
    super.create();
    this.createProfileWindow();
    this.createStatusWindow();
    this.createStatusParamsWindow();
    this.createStatusEquipWindow();
  };

  helpAreaHeight(): number {
    return 0;
  };

  createProfileWindow(): void {
    const rect = this.profileWindowRect();
    this._profileWindow = new Window_Help(rect);
    this.addWindow(this._profileWindow);
  };

  profileWindowRect(): Rectangle {
    const ww = Graphics.boxWidth;
    const wh = this.profileHeight();
    const wx = 0;
    const wy = this.mainAreaBottom() - wh;
    return new Rectangle(wx, wy, ww, wh);
  };

  createStatusWindow(): void {
    const rect = this.statusWindowRect();
    this._statusWindow = new Window_Status(rect);
    this._statusWindow.setHandler("cancel", this.popScene.bind(this));
    this._statusWindow.setHandler("pagedown", this.nextActor.bind(this));
    this._statusWindow.setHandler("pageup", this.previousActor.bind(this));
    this.addWindow(this._statusWindow);
  };

  statusWindowRect(): Rectangle {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.statusParamsWindowRect().y - wy;
    return new Rectangle(wx, wy, ww, wh);
  };

  createStatusParamsWindow(): void {
    const rect = this.statusParamsWindowRect();
    this._statusParamsWindow = new Window_StatusParams(rect);
    this.addWindow(this._statusParamsWindow);
  };

  statusParamsWindowRect(): Rectangle {
    const ww = this.statusParamsWidth();
    const wh = this.statusParamsHeight();
    const wx = 0;
    const wy = this.mainAreaBottom() - this.profileHeight() - wh;
    return new Rectangle(wx, wy, ww, wh);
  };

  createStatusEquipWindow(): void {
    const rect = this.statusEquipWindowRect();
    this._statusEquipWindow = new Window_StatusEquip(rect);
    this.addWindow(this._statusEquipWindow);
  };

  statusEquipWindowRect(): Rectangle {
    const ww = Graphics.boxWidth - this.statusParamsWidth();
    const wh = this.statusParamsHeight();
    const wx = this.statusParamsWidth();
    const wy = this.mainAreaBottom() - this.profileHeight() - wh;
    return new Rectangle(wx, wy, ww, wh);
  };

  statusParamsWidth(): number {
    return 300;
  };

  statusParamsHeight(): number {
    return this.calcWindowHeight(6, false);
  };

  profileHeight(): number {
    return this.calcWindowHeight(2, false);
  };

  start(): void {
    super.start();
    this.refreshActor();
  };

  needsPageButtons(): boolean {
    return true;
  };

  refreshActor(): void {
    const actor = this.actor();
    this._profileWindow!.setText(actor.profile());
    this._statusWindow!.setActor(actor);
    this._statusParamsWindow!.setActor(actor);
    this._statusEquipWindow!.setActor(actor);
  };

  onActorChange(): void {
    super.onActorChange();
    this.refreshActor();
    this._statusWindow!.activate();
  };
}
