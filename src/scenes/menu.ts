import { Scene_MenuBase } from '.';
import { Scene_Item } from '.';
import { Scene_Options } from '.';
import { Scene_Save } from '.';
import { Scene_GameEnd } from '.';
import { Scene_Skill } from '.';
import { Scene_Equip } from '.';
import { Scene_Status } from '.';

import { SceneManager } from '../managers';
import { Window_MenuCommand, Window_MenuStatus, Window_Gold } from '../windows';
import { Rectangle } from '../pixi';
import { Graphics } from '../dom';
import { $gameParty } from '../managers';

//-----------------------------------------------------------------------------
// Scene_Menu
//
// The scene class of the menu screen.

export class Scene_Menu extends Scene_MenuBase {
  _statusWindow?: Window_MenuStatus
  _commandWindow?: Window_MenuCommand
  _goldWindow?: Window_Gold

  constructor()
  constructor(thisClass: Constructable<Scene_Menu>)
  constructor(arg?: any) {
    super(Scene_MenuBase);
    if (typeof arg === "function" && arg === Scene_Menu) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  helpAreaHeight(): number {
    return 0;
  };

  create(): void {
    super.create();
    this.createCommandWindow();
    this.createGoldWindow();
    this.createStatusWindow();
  };

  start(): void {
    super.start();
    this._statusWindow!.refresh();
  };

  createCommandWindow(): void {
    const rect = this.commandWindowRect();
    const commandWindow = new Window_MenuCommand(rect);
    commandWindow.setHandler("item", this.commandItem.bind(this));
    commandWindow.setHandler("skill", this.commandPersonal.bind(this));
    commandWindow.setHandler("equip", this.commandPersonal.bind(this));
    commandWindow.setHandler("status", this.commandPersonal.bind(this));
    commandWindow.setHandler("formation", this.commandFormation.bind(this));
    commandWindow.setHandler("options", this.commandOptions.bind(this));
    commandWindow.setHandler("save", this.commandSave.bind(this));
    commandWindow.setHandler("gameEnd", this.commandGameEnd.bind(this));
    commandWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(commandWindow);
    this._commandWindow = commandWindow;
  };

  commandWindowRect(): Rectangle {
    const ww = this.mainCommandWidth();
    const wh = this.mainAreaHeight() - this.goldWindowRect().height;
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
  };

  createGoldWindow(): void {
    const rect = this.goldWindowRect();
    this._goldWindow = new Window_Gold(rect);
    this.addWindow(this._goldWindow);
  };

  goldWindowRect(): Rectangle {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(1, true);
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = this.mainAreaBottom() - wh;
    return new Rectangle(wx, wy, ww, wh);
  };

  createStatusWindow(): void {
    const rect = this.statusWindowRect();
    this._statusWindow = new Window_MenuStatus(rect);
    this.addWindow(this._statusWindow);
  };

  statusWindowRect(): Rectangle {
    const ww = Graphics.boxWidth - this.mainCommandWidth();
    const wh = this.mainAreaHeight();
    const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
  };

  commandItem(): void {
    SceneManager.push(Scene_Item);
  };

  commandPersonal(): void {
    this._statusWindow!.setFormationMode(false);
    this._statusWindow!.selectLast();
    this._statusWindow!.activate();
    this._statusWindow!.setHandler("ok", this.onPersonalOk.bind(this));
    this._statusWindow!.setHandler("cancel", this.onPersonalCancel.bind(this));
  };

  commandFormation(): void {
    this._statusWindow!.setFormationMode(true);
    this._statusWindow!.selectLast();
    this._statusWindow!.activate();
    this._statusWindow!.setHandler("ok", this.onFormationOk.bind(this));
    this._statusWindow!.setHandler("cancel", this.onFormationCancel.bind(this));
  };

  commandOptions(): void {
    SceneManager.push(Scene_Options);
  };

  commandSave(): void {
    SceneManager.push(Scene_Save);
  };

  commandGameEnd(): void {
    SceneManager.push(Scene_GameEnd);
  };

  onPersonalOk(): void {
    switch (this._commandWindow!.currentSymbol()) {
        case "skill":
            SceneManager.push(Scene_Skill);
            break;
        case "equip":
            SceneManager.push(Scene_Equip);
            break;
        case "status":
            SceneManager.push(Scene_Status);
            break;
    }
  };

  onPersonalCancel(): void {
    this._statusWindow!.deselect();
    this._commandWindow!.activate();
  };

  onFormationOk(): void {
    const index = this._statusWindow!.index();
    const pendingIndex = this._statusWindow!.pendingIndex();
    if (pendingIndex >= 0) {
        $gameParty.swapOrder(index, pendingIndex);
        this._statusWindow!.setPendingIndex(-1);
        this._statusWindow!.redrawItem(index);
    } else {
        this._statusWindow!.setPendingIndex(index);
    }
    this._statusWindow!.activate();
  };

  onFormationCancel(): void {
    if (this._statusWindow!.pendingIndex() >= 0) {
        this._statusWindow!.setPendingIndex(-1);
        this._statusWindow!.activate();
    } else {
        this._statusWindow!.deselect();
        this._commandWindow!.activate();
    }
  };
}
