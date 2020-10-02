import { Window_StatusBase } from '.';
import { Game_Actor } from '../game';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_SkillStatus
//
// The window for displaying the skill user's status on the skill screen.

export class Window_SkillStatus extends Window_StatusBase {
  _actor: Game_Actor | null = null

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_SkillStatus>)
  constructor(arg?: any) {
    super(Window_StatusBase);
    if (typeof arg === "function" && arg === Window_SkillStatus) {
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
    }
  };

  refresh(): void {
    super.refresh();
    if (this._actor) {
        const x = this.colSpacing() / 2;
        const h = this.innerHeight;
        const y = h / 2 - this.lineHeight() * 1.5;
        this.drawActorFace(this._actor, x + 1, 0, 144, h);
        this.drawActorSimpleStatus(this._actor, x + 180, y);
    }
  };
}
