import { Window_Command } from '.';
import { TextManager, BattleManager } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_PartyCommand
//
// The window for selecting whether to fight or escape on the battle screen.

export class Window_PartyCommand extends Window_Command {
  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_PartyCommand>)
  constructor(arg?: any) {
    super(Window_Command);
    if (typeof arg === "function" && arg === Window_PartyCommand) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.openness = 0;
    this.deactivate();
  };

  makeCommandList(): void {
    this.addCommand(TextManager.fight, "fight");
    this.addCommand(TextManager.escape, "escape", BattleManager.canEscape());
  };

  setup(): void {
    this.refresh();
    this.forceSelect(0);
    this.activate();
    this.open();
  };
}
