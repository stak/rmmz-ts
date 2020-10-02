import { Window_Command } from '.';
import { TextManager, DataManager } from '../managers';
import { $gameParty, $gameSystem } from '../managers';
import { $dataSystem } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_MenuCommand
//
// The window for selecting a command on the menu screen.

export class Window_MenuCommand extends Window_Command {
  static _lastCommandSymbol: string | null = null;
  static initCommandPosition() {
    this._lastCommandSymbol = null;
  };

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_MenuCommand>)
  constructor(arg?: any) {
    super(Window_Command);
    if (typeof arg === "function" && arg === Window_MenuCommand) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.selectLast();
    this._canRepeat = false;
  };

  makeCommandList(): void {
    this.addMainCommands();
    this.addFormationCommand();
    this.addOriginalCommands();
    this.addOptionsCommand();
    this.addSaveCommand();
    this.addGameEndCommand();
  };

  addMainCommands(): void {
    const enabled = this.areMainCommandsEnabled();
    if (this.needsCommand("item")) {
        this.addCommand(TextManager.item, "item", enabled);
    }
    if (this.needsCommand("skill")) {
        this.addCommand(TextManager.skill, "skill", enabled);
    }
    if (this.needsCommand("equip")) {
        this.addCommand(TextManager.equip, "equip", enabled);
    }
    if (this.needsCommand("status")) {
        this.addCommand(TextManager.status, "status", enabled);
    }
  };

  addFormationCommand(): void {
    if (this.needsCommand("formation")) {
        const enabled = this.isFormationEnabled();
        this.addCommand(TextManager.formation, "formation", enabled);
    }
  };

  addOriginalCommands(): void {
    //
  };

  addOptionsCommand(): void {
    if (this.needsCommand("options")) {
        const enabled = this.isOptionsEnabled();
        this.addCommand(TextManager.options, "options", enabled);
    }
  };

  addSaveCommand(): void {
    if (this.needsCommand("save")) {
        const enabled = this.isSaveEnabled();
        this.addCommand(TextManager.save, "save", enabled);
    }
  };

  addGameEndCommand(): void {
    const enabled = this.isGameEndEnabled();
    this.addCommand(TextManager.gameEnd, "gameEnd", enabled);
  };

  needsCommand(name: string): boolean {
    const table = ["item", "skill", "equip", "status", "formation", "save"];
    const index = table.indexOf(name);
    if (index >= 0) {
        return $dataSystem.menuCommands[index];
    }
    return true;
  };

  areMainCommandsEnabled(): boolean {
    return $gameParty.exists();
  };

  isFormationEnabled(): boolean {
    return $gameParty.size() >= 2 && $gameSystem.isFormationEnabled();
  };

  isOptionsEnabled(): boolean {
    return true;
  };

  isSaveEnabled(): boolean {
    return !DataManager.isEventTest() && $gameSystem.isSaveEnabled();
  };

  isGameEndEnabled(): boolean {
    return true;
  };

  processOk(): void {
    Window_MenuCommand._lastCommandSymbol = this.currentSymbol();
    super.processOk();
  };

  selectLast(): void {
    this.selectSymbol(Window_MenuCommand._lastCommandSymbol);
  };
}
