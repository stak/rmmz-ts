import { Window_Selectable, Window_Message } from '.';
import { ConfigManager } from '../managers';
import { $gameMessage, $gameVariables } from '../managers';
import { Rectangle } from '../pixi';
import { Sprite_Button } from '../sprites';
import { Graphics, Input } from '../dom';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Window_NumberInput
//
// The window used for the event command [Input Number].

export class Window_NumberInput extends Window_Selectable {
  _number = 0
  _maxDigits = 1
  _messageWindow?: Window_Message
  _buttons: Sprite_Button[] = []

  constructor()
  constructor(thisClass: Constructable<Window_NumberInput>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_NumberInput) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize(new Rectangle());
    this._number = 0;
    this._maxDigits = 1;
    this.openness = 0;
    this.createButtons();
    this.deactivate();
    this._canRepeat = false;
  };

  setMessageWindow(messageWindow: Window_Message): void {
    this._messageWindow = messageWindow;
  };

  start(): void {
    this._maxDigits = $gameMessage.numInputMaxDigits();
    this._number = $gameVariables.value($gameMessage.numInputVariableId());
    this._number = this._number.clamp(0, Math.pow(10, this._maxDigits) - 1);
    this.updatePlacement();
    this.placeButtons();
    this.createContents();
    this.refresh();
    this.open();
    this.activate();
    this.select(0);
  };

  updatePlacement(): void {
    const messageY = this._messageWindow!.y;
    const spacing = 8;
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.x = (Graphics.boxWidth - this.width) / 2;
    if (messageY >= Graphics.boxHeight / 2) {
        this.y = messageY - this.height - spacing;
    } else {
        this.y = messageY + this._messageWindow!.height + spacing;
    }
  };

  windowWidth(): number {
    const totalItemWidth = this.maxCols() * this.itemWidth();
    const totalButtonWidth = this.totalButtonWidth();
    return Math.max(totalItemWidth, totalButtonWidth) + this.padding * 2;
  };

  windowHeight(): number {
    if (ConfigManager.touchUI) {
        return this.fittingHeight(1) + this.buttonSpacing() + 48;
    } else {
        return this.fittingHeight(1);
    }
  };

  maxCols(): number {
    return this._maxDigits;
  };

  maxItems(): number {
    return this._maxDigits;
  };

  itemWidth(): number {
    return 48;
  };

  itemRect(index: number): Rectangle {
    const rect = Window_Selectable.prototype.itemRect.call(this, index);
    const innerMargin = this.innerWidth - this.maxCols() * this.itemWidth();
    rect.x += innerMargin / 2;
    return rect;
  };

  isScrollEnabled(): boolean {
    return false;
  };

  isHoverEnabled(): boolean {
    return false;
  };

  createButtons(): void {
    this._buttons = [];
    if (ConfigManager.touchUI) {
        for (const type of ["down", "up", "ok"]) {
            const button = new Sprite_Button(type as MZ.ButtonType);
            this._buttons.push(button);
            this.addInnerChild(button);
        }
        this._buttons[0].setClickHandler(this.onButtonDown.bind(this));
        this._buttons[1].setClickHandler(this.onButtonUp.bind(this));
        this._buttons[2].setClickHandler(this.onButtonOk.bind(this));
    }
  };

  placeButtons(): void {
    const sp = this.buttonSpacing();
    const totalWidth = this.totalButtonWidth();
    let x = (this.innerWidth - totalWidth) / 2;
    for (const button of this._buttons) {
        button.x = x;
        button.y = this.buttonY();
        x += button.width + sp;
    }
  };

  totalButtonWidth(): number {
    const sp = this.buttonSpacing();
    return this._buttons.reduce((r, button) => r + button.width + sp, -sp);
  };

  buttonSpacing(): number {
    return 8;
  };

  buttonY(): number {
    return this.itemHeight() + this.buttonSpacing();
  };

  update(): void {
    super.update();
    this.processDigitChange();
  };

  processDigitChange(): void {
    if (this.isOpenAndActive()) {
        if (Input.isRepeated("up")) {
            this.changeDigit(true);
        } else if (Input.isRepeated("down")) {
            this.changeDigit(false);
        }
    }
  };

  changeDigit(up: boolean): void {
    const index = this.index();
    const place = Math.pow(10, this._maxDigits - 1 - index);
    let n = Math.floor(this._number / place) % 10;
    this._number -= n * place;
    if (up) {
        n = (n + 1) % 10;
    } else {
        n = (n + 9) % 10;
    }
    this._number += n * place;
    this.refresh();
    this.playCursorSound();
  };

  isTouchOkEnabled(): boolean {
    return false;
  };

  isOkEnabled(): boolean {
    return true;
  };

  isCancelEnabled(): boolean {
    return false;
  };

  processOk(): void {
    this.playOkSound();
    $gameVariables.setValue($gameMessage.numInputVariableId(), this._number);
    this._messageWindow!.terminateMessage();
    this.updateInputData();
    this.deactivate();
    this.close();
  };

  drawItem(index: number): void {
    const rect = this.itemLineRect(index);
    const align = "center";
    const s = this._number.padZero(this._maxDigits);
    const c = s.slice(index, index + 1);
    this.resetTextColor();
    this.drawText(c, rect.x, rect.y, rect.width, align);
  };

  onButtonUp(): void {
    this.changeDigit(true);
  };

  onButtonDown(): void {
    this.changeDigit(false);
  };

  onButtonOk(): void {
    this.processOk();
  };
}
