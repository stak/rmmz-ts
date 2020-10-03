import { Window_Selectable } from '.';
import { Game_Actor } from '../game';
import { ColorManager } from '../managers';
import { MZ } from '../MZ';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_SkillList
//
// The window for selecting a skill on the skill screen.

export class Window_SkillList extends Window_Selectable {
  _actor: Game_Actor | null = null
  _stypeId: MZ.SkillTypeID = 0
  _data: MZ.DataSkill[] = []

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_SkillList>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_SkillList) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._actor = null;
    this._stypeId = 0;
    this._data = [];
  };

  setActor(actor: Game_Actor | null): void {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
        this.scrollTo(0, 0);
    }
  };

  setStypeId(stypeId: MZ.SkillTypeID): void {
    if (this._stypeId !== stypeId) {
        this._stypeId = stypeId;
        this.refresh();
        this.scrollTo(0, 0);
    }
  };

  maxCols(): number {
    return 2;
  };

  colSpacing(): number {
    return 16;
  };

  maxItems(): number {
    return this._data ? this._data.length : 1;
  };

  item(): MZ.DataSkill | null {
    return this.itemAt(this.index());
  };

  itemAt(index: number): MZ.DataSkill | null {
    return this._data && index >= 0 ? this._data[index] : null;
  };

  isCurrentItemEnabled(): boolean {
    return this.isEnabled(this._data[this.index()]);
  };

  includes(item: MZ.DataSkill | null): boolean {
    return !!item && item.stypeId === this._stypeId;
  };

  isEnabled(item: MZ.DataSkill | null): boolean {
    return !!this._actor && this._actor.canUse(item);
  };

  makeItemList(): void {
    if (this._actor) {
        this._data = this._actor.skills().filter(item => this.includes(item));
    } else {
        this._data = [];
    }
  };

  selectLast(): void {
    const index = this._data.indexOf(this._actor!.lastSkill());
    this.forceSelect(index >= 0 ? index : 0);
  };

  drawItem(index: number): void {
    const skill = this.itemAt(index);
    if (skill) {
        const costWidth = this.costWidth();
        const rect = this.itemLineRect(index);
        this.changePaintOpacity(this.isEnabled(skill));
        this.drawItemName(skill, rect.x, rect.y, rect.width - costWidth);
        this.drawSkillCost(skill, rect.x, rect.y, rect.width);
        this.changePaintOpacity(1);
    }
  };

  costWidth(): number {
    return this.textWidth("000");
  };

  drawSkillCost(skill: MZ.DataSkill, x: number, y: number, width: number): void {
    if (this._actor!.skillTpCost(skill) > 0) {
        this.changeTextColor(ColorManager.tpCostColor());
        this.drawText(String(this._actor!.skillTpCost(skill)), x, y, width, "right");
    } else if (this._actor!.skillMpCost(skill) > 0) {
        this.changeTextColor(ColorManager.mpCostColor());
        this.drawText(String(this._actor!.skillMpCost(skill)), x, y, width, "right");
    }
  };

  updateHelp(): void {
    this.setHelpWindowItem(this.item());
  };

  refresh(): void {
    this.makeItemList();
    super.refresh();
  };
}
