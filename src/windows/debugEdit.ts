import { Window_Selectable } from '.'
import { $gameVariables, $gameSwitches } from '../managers';
import { $dataSystem } from '../managers';
import { MZ } from '../MZ';
import { Rectangle } from '../pixi';
import { Input } from '../dom';

//-----------------------------------------------------------------------------
// Window_DebugEdit
//
// The window for displaying switches and variables on the debug screen.

export class Window_DebugEdit extends Window_Selectable {
  _mode = "switch"
  _topId = 1

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_DebugEdit>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_DebugEdit) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._mode = "switch";
    this._topId = 1;
    this.refresh();
  };

  maxItems(): number {
    return 10;
  };

  drawItem(index: number): void {
    const dataId = this._topId + index;
    const idText = dataId.padZero(4) + ":";
    const idWidth = this.textWidth(idText);
    const statusWidth = this.textWidth("-00000000");
    const name = this.itemName(dataId);
    const status = this.itemStatus(dataId);
    const rect = this.itemLineRect(index);
    this.resetTextColor();
    this.drawText(idText, rect.x, rect.y, rect.width);
    rect.x += idWidth;
    rect.width -= idWidth + statusWidth;
    this.drawText(String(name), rect.x, rect.y, rect.width);
    this.drawText(status, rect.x + rect.width, rect.y, statusWidth, "right");
  };

  itemName(dataId: MZ.SwitchID | MZ.VariableID): '' | number {
    if (this._mode === "switch") {
        return $dataSystem.switches[dataId];
    } else {
        return $dataSystem.variables[dataId];
    }
  };

  itemStatus(dataId: MZ.SwitchID | MZ.VariableID): string {
    if (this._mode === "switch") {
        return $gameSwitches.value(dataId) ? "[ON]" : "[OFF]";
    } else {
        return String($gameVariables.value(dataId));
    }
  };

  setMode(mode: string): void {
    if (this._mode !== mode) {
        this._mode = mode;
        this.refresh();
    }
  };

  setTopId(id: number): void {
    if (this._topId !== id) {
        this._topId = id;
        this.refresh();
    }
  };

  currentId(): number {
    return this._topId + this.index();
  };

  update(): void {
    super.update();
    if (this.active) {
        if (this._mode === "switch") {
            this.updateSwitch();
        } else {
            this.updateVariable();
        }
    }
  };

  updateSwitch(): void {
    if (Input.isRepeated("ok")) {
        const switchId = this.currentId();
        this.playCursorSound();
        $gameSwitches.setValue(switchId, !$gameSwitches.value(switchId));
        this.redrawCurrentItem();
    }
  };

  updateVariable(): void {
    const variableId = this.currentId();
    const value = $gameVariables.value(variableId);
    if (typeof value === "number") {
        const newValue = value + this.deltaForVariable();
        if (value !== newValue) {
            $gameVariables.setValue(variableId, newValue);
            this.playCursorSound();
            this.redrawCurrentItem();
        }
    }
  };

  deltaForVariable(): number {
    if (Input.isRepeated("right")) {
        return 1;
    } else if (Input.isRepeated("left")) {
        return -1;
    } else if (Input.isRepeated("pagedown")) {
        return 10;
    } else if (Input.isRepeated("pageup")) {
        return -10;
    }
    return 0;
  };
}
