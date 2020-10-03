import { Window_HorzCommand } from '.';
import { TextManager } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_EquipCommand
//
// The window for selecting a command on the equipment screen.

export class Window_EquipCommand extends Window_HorzCommand {
  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_EquipCommand>)
  constructor(arg?: any) {
    super(Window_HorzCommand);
    if (typeof arg === "function" && arg === Window_EquipCommand) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
  };

  maxCols(): number {
    return 3;
  };

  makeCommandList(): void {
    this.addCommand(TextManager.equip2, "equip");
    this.addCommand(TextManager.optimize, "optimize");
    this.addCommand(TextManager.clear, "clear");
  };
}
