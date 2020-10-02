import { Window_Selectable, Window_DebugEdit } from '.';
import { $dataSystem } from '../managers';
import { Rectangle } from '../pixi';
import { Input } from '../dom';

//-----------------------------------------------------------------------------
// Window_DebugRange
//
// The window for selecting a block of switches/variables on the debug screen.

export class Window_DebugRange extends Window_Selectable {
  static lastTopRow = 0
  static lastIndex = 0
  _maxSwitches = 0
  _maxVariables = 0
  _editWindow?: Window_DebugEdit

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_DebugRange>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_DebugRange) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    this._maxSwitches = Math.ceil(($dataSystem.switches.length - 1) / 10);
    this._maxVariables = Math.ceil(($dataSystem.variables.length - 1) / 10);
    super.initialize(rect);
    this.refresh();
    this.setTopRow(Window_DebugRange.lastTopRow);
    this.select(Window_DebugRange.lastIndex);
    this.activate();
  };

  maxItems(): number {
    return this._maxSwitches + this._maxVariables;
  };

  update(): void {
    super.update();
    if (this._editWindow) {
        const index = this.index();
        this._editWindow.setMode(this.mode(index));
        this._editWindow.setTopId(this.topId(index));
    }
  };

  mode(index: number): string {
    return this.isSwitchMode(index) ? "switch" : "variable";
  };

  topId(index: number): number {
    if (this.isSwitchMode(index)) {
        return index * 10 + 1;
    } else {
        return (index - this._maxSwitches) * 10 + 1;
    }
  };

  isSwitchMode(index: number): boolean {
    return index < this._maxSwitches;
  };

  drawItem(index: number): void {
    const rect = this.itemLineRect(index);
    const c = this.isSwitchMode(index) ? "S" : "V";
    const start = this.topId(index);
    const end = start + 9;
    const text = c + " [" + start.padZero(4) + "-" + end.padZero(4) + "]";
    this.drawText(text, rect.x, rect.y, rect.width);
  };

  isCancelTriggered(): boolean {
    return (
        super.isCancelTriggered() ||
        Input.isTriggered("debug")
    );
  };

  processCancel(): void {
    super.processCancel();
    Window_DebugRange.lastTopRow = this.topRow();
    Window_DebugRange.lastIndex = this.index();
  };

  setEditWindow(editWindow: Window_DebugEdit): void {
    this._editWindow = editWindow;
  };
}
