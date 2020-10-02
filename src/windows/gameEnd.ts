import { Window_Command } from '.';
import { TextManager } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_GameEnd
//
// The window for selecting "Go to Title" on the game end screen.

export class Window_GameEnd extends Window_Command {
  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_GameEnd>)
  constructor(arg?: any) {
    super(Window_Command);
    if (typeof arg === "function" && arg === Window_GameEnd) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.openness = 0;
    this.open();
  };

  makeCommandList(): void {
    this.addCommand(TextManager.toTitle, "toTitle");
    this.addCommand(TextManager.cancel, "cancel");
  };
}
