import { Window_Command } from '.';
import { DataManager, TextManager } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_TitleCommand
//
// The window for selecting New Game/Continue on the title screen.

export class Window_TitleCommand extends Window_Command {
  static _lastCommandSymbol: string | null = null;
  static initCommandPosition() {
    this._lastCommandSymbol = null;
  };

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_TitleCommand>)
  constructor(arg?: any) {
    super(Window_Command);
    if (typeof arg === "function" && arg === Window_TitleCommand) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.openness = 0;
    this.selectLast();
  };

  makeCommandList(): void {
    const continueEnabled = this.isContinueEnabled();
    this.addCommand(TextManager.newGame, "newGame");
    this.addCommand(TextManager.continue_, "continue", continueEnabled);
    this.addCommand(TextManager.options, "options");
  };

  isContinueEnabled(): boolean {
    return DataManager.isAnySavefileExists();
  };

  processOk(): void {
    Window_TitleCommand._lastCommandSymbol = this.currentSymbol();
    super.processOk();
  };

  selectLast(): void {
    if (Window_TitleCommand._lastCommandSymbol) {
        this.selectSymbol(Window_TitleCommand._lastCommandSymbol);
    } else if (this.isContinueEnabled()) {
        this.selectSymbol("continue");
    }
  };
}
