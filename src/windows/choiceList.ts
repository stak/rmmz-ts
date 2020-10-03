import { Window_Command } from '.';
import { Window_Message } from '.';
import { ConfigManager } from '../managers';
import { $gameMessage } from '../managers';
import { Rectangle } from '../pixi';
import { Sprite_Button } from '../sprites';
import { Graphics } from '../dom';

//-----------------------------------------------------------------------------
// Window_ChoiceList
//
// The window used for the event command [Show Choices].

export class Window_ChoiceList extends Window_Command {
  _background = 0
  _messageWindow?: Window_Message
  _cancelButton?: Sprite_Button

  constructor()
  constructor(thisClass: Constructable<Window_ChoiceList>)
  constructor(arg?: any) {
    super(Window_Command);
    if (typeof arg === "function" && arg === Window_ChoiceList) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize(new Rectangle());
    this.createCancelButton();
    this.openness = 0;
    this.deactivate();
    this._background = 0;
    this._canRepeat = false;
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
    this.updatePlacement();
    this.updateBackground();
    this.placeCancelButton();
    this.createContents();
    this.refresh();
    this.selectDefault();
    this.open();
    this.activate();
  };

  update(): void {
    super.update();
    this.updateCancelButton();
  };

  updateCancelButton(): void {
    if (this._cancelButton) {
        this._cancelButton.visible = this.needsCancelButton() && this.isOpen();
    }
  };

  selectDefault(): void {
    this.select($gameMessage.choiceDefaultType());
  };

  updatePlacement(): void {
    this.x = this.windowX();
    this.y = this.windowY();
    this.width = this.windowWidth();
    this.height = this.windowHeight();
  };

  updateBackground(): void {
    this._background = $gameMessage.choiceBackground();
    this.setBackgroundType(this._background);
  };

  placeCancelButton(): void {
    if (this._cancelButton) {
        const spacing = 8;
        const button = this._cancelButton;
        const right = this.x + this.width;
        if (right < Graphics.boxWidth - button.width + spacing) {
            button.x = this.width + spacing;
        } else {
            button.x = -button.width - spacing;
        }
        button.y = this.height / 2 - button.height / 2;
    }
  };

  windowX(): number {
    const positionType = $gameMessage.choicePositionType();
    if (positionType === 1) {
        return (Graphics.boxWidth - this.windowWidth()) / 2;
    } else if (positionType === 2) {
        return Graphics.boxWidth - this.windowWidth();
    } else {
        return 0;
    }
  };

  windowY(): number {
    const messageY = this._messageWindow!.y;
    if (messageY >= Graphics.boxHeight / 2) {
        return messageY - this.windowHeight();
    } else {
        return messageY + this._messageWindow!.height;
    }
  };

  windowWidth(): number {
    const width = this.maxChoiceWidth() + this.colSpacing() + this.padding * 2;
    return Math.min(width, Graphics.boxWidth);
  };

  windowHeight(): number {
    return this.fittingHeight(this.numVisibleRows());
  };

  numVisibleRows(): number {
    const choices = $gameMessage.choices();
    return Math.min(choices.length, this.maxLines());
  };

  maxLines(): number {
    const messageWindow = this._messageWindow;
    const messageY = messageWindow ? messageWindow.y : 0;
    const messageHeight = messageWindow ? messageWindow.height : 0;
    const centerY = Graphics.boxHeight / 2;
    if (messageY < centerY && messageY + messageHeight > centerY) {
        return 4;
    } else {
        return 8;
    }
  };

  maxChoiceWidth(): number {
    let maxWidth = 96;
    const choices = $gameMessage.choices();
    for (const choice of choices) {
        const textWidth = this.textSizeEx(choice).width;
        const choiceWidth = Math.ceil(textWidth) + this.itemPadding() * 2;
        if (maxWidth < choiceWidth) {
            maxWidth = choiceWidth;
        }
    }
    return maxWidth;
  };

  makeCommandList(): void {
    const choices = $gameMessage.choices();
    for (const choice of choices) {
        this.addCommand(choice, "choice");
    }
  };

  drawItem(index: number): void {
    const rect = this.itemLineRect(index);
    this.drawTextEx(this.commandName(index), rect.x, rect.y, rect.width);
  };

  isCancelEnabled(): boolean {
    return $gameMessage.choiceCancelType() !== -1;
  };

  needsCancelButton(): boolean {
    return $gameMessage.choiceCancelType() === -2;
  };

  callOkHandler(): void {
    $gameMessage.onChoice(this.index());
    this._messageWindow!.terminateMessage();
    this.close();
  };

  callCancelHandler(): void {
    $gameMessage.onChoice($gameMessage.choiceCancelType());
    this._messageWindow!.terminateMessage();
    this.close();
  };
}