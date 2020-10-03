import { Window_SkillList } from '.';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_BattleSkill
//
// The window for selecting a skill to use on the battle screen.

export class Window_BattleSkill extends Window_SkillList {
  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_BattleSkill>)
  constructor(arg?: any) {
    super(Window_SkillList);
    if (typeof arg === "function" && arg === Window_BattleSkill) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.hide();
  };

  show(): void {
    this.selectLast();
    this.showHelpWindow();
    super.show();
  };

  hide(): void {
    this.hideHelpWindow();
    super.hide();
  };
}
