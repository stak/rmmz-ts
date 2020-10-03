import { Window_ItemList } from './';
import { Graphics } from '../dom';
import { ConfigManager, DataManager } from '../managers';
import { $gameVariables, $gameMessage } from '../managers';
import { $dataSystem } from '../managers';
import { Rectangle } from '../pixi';
import { Window_Message } from '.';
import { Sprite_Button } from '../sprites';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Window_EventItem
//
// The window used for the event command [Select Item].

export class Window_EventItem extends Window_ItemList {
  _messageWindow?: Window_Message
  _cancelButton?: Sprite_Button

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_EventItem>)
  constructor(arg?: any) {
    super(Window_ItemList);
    if (typeof arg === "function" && arg === Window_EventItem) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.createCancelButton();
    this.openness = 0;
    this.deactivate();
    this.setHandler("ok", this.onOk.bind(this));
    this.setHandler("cancel", this.onCancel.bind(this));
  };

  setMessageWindow(messageWindow: Window_Message): void {
    this._messageWindow = messageWindow;
  };

  createCancelButton(): void {
    if (ConfigManager.touchUI) {
        this._cancelButton = new Sprite_Button("cancel");
        this._cancelButton.visible = false;
        this.addChild(this._cancelButton);
    }
  };

  start(): void {
    this.refresh();
    this.updatePlacement();
    this.placeCancelButton();
    this.forceSelect(0);
    this.open();
    this.activate();
  };

  update(): void {
    super.update();
    this.updateCancelButton();
  };

  updateCancelButton(): void {
    if (this._cancelButton) {
        this._cancelButton.visible = this.isOpen();
    }
  };

  updatePlacement(): void {
    if (this._messageWindow!.y >= Graphics.boxHeight / 2) {
        this.y = 0;
    } else {
        this.y = Graphics.boxHeight - this.height;
    }
  };

  placeCancelButton(): void {
    if (this._cancelButton) {
        const spacing = 8;
        const button = this._cancelButton;
        if (this.y === 0) {
            button.y = this.height + spacing;
        } else if (this._messageWindow!.y >= Graphics.boxHeight / 4) {
            const distance = this.y - this._messageWindow!.y;
            button.y = -button.height - spacing - distance;
        } else {
            button.y = -button.height - spacing;
        }
        button.x = this.width - button.width - spacing;
    }
  };

  includes(item: MZ.DataItemBase): boolean {
    const itypeId = $gameMessage.itemChoiceItypeId();
    return DataManager.isItem(item) && (item as MZ.DataItem).itypeId === itypeId;
  };

  needsNumber(): boolean {
    const itypeId = $gameMessage.itemChoiceItypeId();
    if (itypeId === 2) {
        // Key Item
        return $dataSystem.optKeyItemsNumber;
    } else if (itypeId >= 3) {
        // Hidden Item
        return false;
    } else {
        // Normal Item
        return true;
    }
  };

  isEnabled(item: MZ.DataItemBase): boolean {
    return true;
  };

  onOk(): void {
    const item = this.item();
    const itemId = item ? item.id : 0;
    $gameVariables.setValue($gameMessage.itemChoiceVariableId(), itemId);
    this._messageWindow!.terminateMessage();
    this.close();
  };

  onCancel(): void {
    $gameVariables.setValue($gameMessage.itemChoiceVariableId(), 0);
    this._messageWindow!.terminateMessage();
    this.close();
  };
}
