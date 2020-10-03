import { Window_Command } from '.';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_HorzCommand
//
// The command window for the horizontal selection format.

export class Window_HorzCommand extends Window_Command {
  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_HorzCommand>)
  constructor(arg?: any) {
    super(Window_Command);
    if (typeof arg === "function" && arg === Window_HorzCommand) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
  };

  maxCols(): number {
    return 4;
  };

  itemTextAlign(): CanvasTextAlign {
    return "center";
  };
}
