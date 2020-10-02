import { Window_Command } from '.';
import { TextManager, ConfigManager } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_Options
//
// The window for changing various settings on the options screen.

export class Window_Options extends Window_Command {
  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_Options>)
  constructor(arg?: any) {
    super(Window_Command);
    if (typeof arg === "function" && arg === Window_Options) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
  };

  makeCommandList(): void {
    this.addGeneralOptions();
    this.addVolumeOptions();
  };

  addGeneralOptions(): void {
    this.addCommand(TextManager.alwaysDash, "alwaysDash");
    this.addCommand(TextManager.commandRemember, "commandRemember");
    this.addCommand(TextManager.touchUI, "touchUI");
  };

  addVolumeOptions(): void {
    this.addCommand(TextManager.bgmVolume, "bgmVolume");
    this.addCommand(TextManager.bgsVolume, "bgsVolume");
    this.addCommand(TextManager.meVolume, "meVolume");
    this.addCommand(TextManager.seVolume, "seVolume");
  };

  drawItem(index: number): void {
    const title = this.commandName(index);
    const status = this.statusText(index);
    const rect = this.itemLineRect(index);
    const statusWidth = this.statusWidth();
    const titleWidth = rect.width - statusWidth;
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(title, rect.x, rect.y, titleWidth, "left");
    this.drawText(status, rect.x + titleWidth, rect.y, statusWidth, "right");
  };

  statusWidth(): number {
    return 120;
  };

  statusText(index: number): string {
    const symbol = this.commandSymbol(index);
    const value = this.getConfigValue(symbol);
    if (this.isVolumeSymbol(symbol)) {
        return this.volumeStatusText(value as number);
    } else {
        return this.booleanStatusText(value as boolean);
    }
  };

  isVolumeSymbol(symbol: string): boolean {
    return symbol.includes("Volume");
  };

  booleanStatusText(value: boolean): string {
    return value ? "ON" : "OFF";
  };

  volumeStatusText(value: number): string {
    return value + "%";
  };

  processOk(): void {
    const index = this.index();
    const symbol = this.commandSymbol(index);
    if (this.isVolumeSymbol(symbol)) {
        this.changeVolume(symbol, true, true);
    } else {
        this.changeValue(symbol, !this.getConfigValue(symbol));
    }
  };

  cursorRight(): void {
    const index = this.index();
    const symbol = this.commandSymbol(index);
    if (this.isVolumeSymbol(symbol)) {
        this.changeVolume(symbol, true, false);
    } else {
        this.changeValue(symbol, true);
    }
  };

  cursorLeft(): void {
    const index = this.index();
    const symbol = this.commandSymbol(index);
    if (this.isVolumeSymbol(symbol)) {
        this.changeVolume(symbol, false, false);
    } else {
        this.changeValue(symbol, false);
    }
  };

  changeVolume(symbol: string, forward: boolean, wrap: boolean): void {
    const lastValue = this.getConfigValue(symbol) as number;
    const offset = this.volumeOffset();
    const value = lastValue + (forward ? offset : -offset);
    if (value > 100 && wrap) {
        this.changeValue(symbol, 0);
    } else {
        this.changeValue(symbol, value.clamp(0, 100));
    }
  };

  volumeOffset(): number {
    return 20;
  };

  changeValue(symbol: string, value: number | boolean): void {
    const lastValue = this.getConfigValue(symbol);
    if (lastValue !== value) {
        this.setConfigValue(symbol, value);
        this.redrawItem(this.findSymbol(symbol));
        this.playCursorSound();
    }
  };

  getConfigValue(symbol: string): number | boolean {
    return (ConfigManager as any)[symbol];
  };

  setConfigValue(symbol: string, volume: number | boolean): void {
    (ConfigManager as any)[symbol] = volume;
  };
}