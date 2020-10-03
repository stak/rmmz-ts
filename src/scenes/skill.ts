import { Scene_ItemBase } from '.';
import { Scene_MenuBase } from '.';

import {
  Window_SkillType,
  Window_SkillStatus,
  Window_SkillList,
} from '../windows';
import { Rectangle } from '../pixi';
import { Graphics } from '../dom';
import { SoundManager } from '../managers';
import { Game_Actor } from '../game';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Scene_Skill
//
// The scene class of the skill screen.

export class Scene_Skill extends Scene_ItemBase {
  _skillTypeWindow?: Window_SkillType
  _statusWindow?: Window_SkillStatus
  _itemWindow?: Window_SkillList

  constructor()
  constructor(thisClass: Constructable<Scene_Skill>)
  constructor(arg?: any) {
    super(Scene_ItemBase);
    if (typeof arg === "function" && arg === Scene_Skill) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  create(): void {
    super.create();
    this.createHelpWindow();
    this.createSkillTypeWindow();
    this.createStatusWindow();
    this.createItemWindow();
    this.createActorWindow();
  };

  start(): void {
    super.start();
    this.refreshActor();
  };

  createSkillTypeWindow(): void {
    const rect = this.skillTypeWindowRect();
    this._skillTypeWindow = new Window_SkillType(rect);
    this._skillTypeWindow.setHelpWindow(this._helpWindow!);
    this._skillTypeWindow.setHandler("skill", this.commandSkill.bind(this));
    this._skillTypeWindow.setHandler("cancel", this.popScene.bind(this));
    this._skillTypeWindow.setHandler("pagedown", this.nextActor.bind(this));
    this._skillTypeWindow.setHandler("pageup", this.previousActor.bind(this));
    this.addWindow(this._skillTypeWindow);
  };

  skillTypeWindowRect(): Rectangle {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(3, true);
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
  };

  createStatusWindow(): void {
    const rect = this.statusWindowRect();
    this._statusWindow = new Window_SkillStatus(rect);
    this.addWindow(this._statusWindow);
  };

  statusWindowRect(): Rectangle {
    const ww = Graphics.boxWidth - this.mainCommandWidth();
    const wh = this._skillTypeWindow!.height;
    const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;
    const wy = this.mainAreaTop();
    return new Rectangle(wx, wy, ww, wh);
  };

  createItemWindow(): void {
    const rect = this.itemWindowRect();
    this._itemWindow = new Window_SkillList(rect);
    this._itemWindow.setHelpWindow(this._helpWindow!);
    this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
    this._skillTypeWindow!.setSkillWindow(this._itemWindow);
    this.addWindow(this._itemWindow);
  };

  itemWindowRect(): Rectangle {
    const wx = 0;
    const wy = this._statusWindow!.y + this._statusWindow!.height;
    const ww = Graphics.boxWidth;
    const wh = this.mainAreaHeight() - this._statusWindow!.height;
    return new Rectangle(wx, wy, ww, wh);
  };

  needsPageButtons(): boolean {
    return true;
  };

  arePageButtonsEnabled(): boolean {
    return !this.isActorWindowActive();
  };

  refreshActor(): void {
    const actor = this.actor();
    this._skillTypeWindow!.setActor(actor);
    this._statusWindow!.setActor(actor);
    this._itemWindow!.setActor(actor);
  };

  user(): Game_Actor {
    return this.actor();
  };

  commandSkill(): void {
    this._itemWindow!.activate();
    this._itemWindow!.selectLast();
  };

  onItemOk(): void {
    this.actor().setLastMenuSkill(this.item() as MZ.DataSkill);
    this.determineItem();
  };

  onItemCancel(): void {
    this._itemWindow!.deselect();
    this._skillTypeWindow!.activate();
  };

  playSeForItem(): void {
    SoundManager.playUseSkill();
  };

  useItem(): void {
    super.useItem();
    this._statusWindow!.refresh();
    this._itemWindow!.refresh();
  };

  onActorChange(): void {
    super.onActorChange();
    this.refreshActor();
    this._itemWindow!.deselect();
    this._skillTypeWindow!.activate();
  };
}