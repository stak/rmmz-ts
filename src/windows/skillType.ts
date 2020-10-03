import { Window_Command } from '.';
import { Window_SkillList } from '.';
import { Game_Actor } from '../game';
import { $dataSystem } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_SkillType
//
// The window for selecting a skill type on the skill screen.

export class Window_SkillType extends Window_Command {
  _actor: Game_Actor | null = null
  _skillWindow?: Window_SkillList

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_SkillType>)
  constructor(arg?: any) {
    super(Window_Command);
    if (typeof arg === "function" && arg === Window_SkillType) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._actor = null;
  };

  setActor(actor: Game_Actor): void {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
        this.selectLast();
    }
  };

  makeCommandList(): void {
    if (this._actor) {
        const skillTypes = this._actor.skillTypes();
        for (const stypeId of skillTypes) {
            const name = $dataSystem.skillTypes[stypeId];
            this.addCommand(name, "skill", true, stypeId);
        }
    }
  };

  update(): void {
    super.update();
    if (this._skillWindow) {
        this._skillWindow.setStypeId(this.currentExt());
    }
  };

  setSkillWindow(skillWindow: Window_SkillList): void {
    this._skillWindow = skillWindow;
  };

  selectLast(): void {
    const skill = this._actor!.lastMenuSkill();
    if (skill) {
        this.selectExt(skill.stypeId);
    } else {
        this.forceSelect(0);
    }
  };
}