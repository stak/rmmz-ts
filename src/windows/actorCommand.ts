import { Window_Command } from '.';
import { Game_Actor } from '../game';
import { ConfigManager, TextManager } from '../managers';
import { $dataSystem } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_ActorCommand
//
// The window for selecting an actor's action on the battle screen.

export class Window_ActorCommand extends Window_Command {
  _actor: Game_Actor | null = null

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_ActorCommand>)
  constructor(arg?: any) {
    super(Window_Command);
    if (typeof arg === "function" && arg === Window_ActorCommand) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.openness = 0;
    this.deactivate();
    this._actor = null;
  };

  makeCommandList(): void {
    if (this._actor) {
        this.addAttackCommand();
        this.addSkillCommands();
        this.addGuardCommand();
        this.addItemCommand();
    }
  };

  addAttackCommand(): void {
    this.addCommand(TextManager.attack, "attack", this._actor!.canAttack());
  };

  addSkillCommands(): void {
    const skillTypes = this._actor!.skillTypes();
    for (const stypeId of skillTypes) {
        const name = $dataSystem.skillTypes[stypeId];
        this.addCommand(name, "skill", true, stypeId);
    }
  };

  addGuardCommand(): void {
    this.addCommand(TextManager.guard, "guard", this._actor!.canGuard());
  };

  addItemCommand(): void {
    this.addCommand(TextManager.item, "item");
  };

  setup(actor: Game_Actor | null): void {
    this._actor = actor;
    this.refresh();
    this.selectLast();
    this.activate();
    this.open();
  };

  actor(): Game_Actor {
    return this._actor!;
  };

  processOk(): void {
    if (this._actor) {
        if (ConfigManager.commandRemember) {
            this._actor.setLastCommandSymbol(this.currentSymbol()!);
        } else {
            this._actor.setLastCommandSymbol("");
        }
    }
    super.processOk();
  };

  selectLast(): void {
    this.forceSelect(0);
    if (this._actor && ConfigManager.commandRemember) {
        const symbol = this._actor.lastCommandSymbol();
        this.selectSymbol(symbol);
        if (symbol === "skill") {
            const skill = this._actor.lastBattleSkill();
            if (skill) {
                this.selectExt(skill.stypeId);
            }
        }
    }
  };
}
