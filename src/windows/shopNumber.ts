import { Window_Selectable } from '.';
import { TextManager, ConfigManager } from '../managers';
import { MZ } from '../MZ';
import { Rectangle } from '../pixi';
import { Sprite_Button } from '../sprites';
import { Input } from '../dom';

//-----------------------------------------------------------------------------
// Window_ShopNumber
//
// The window for inputting quantity of items to buy or sell on the shop
// screen.

export class Window_ShopNumber extends Window_Selectable {
  _item: MZ.DataItemBase | null = null
  _max = 1
  _price = 0
  _number = 1
  _currencyUnit = TextManager.currencyUnit
  _buttons?: Sprite_Button[]

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_ShopNumber>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_ShopNumber) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._item = null;
    this._max = 1;
    this._price = 0;
    this._number = 1;
    this._currencyUnit = TextManager.currencyUnit;
    this.createButtons();
    this.select(0);
    this._canRepeat = false;
  };

  isScrollEnabled(): boolean {
    return false;
  };

  number(): number {
    return this._number;
  };

  setup(item: MZ.DataItemBase, max: number, price: number): void {
    this._item = item;
    this._max = Math.floor(max);
    this._price = price;
    this._number = 1;
    this.placeButtons();
    this.refresh();
  };

  setCurrencyUnit(currencyUnit: string): void {
    this._currencyUnit = currencyUnit;
    this.refresh();
  };

  createButtons(): void {
    this._buttons = [];
    if (ConfigManager.touchUI) {
        for (const type of ["down2", "down", "up", "up2", "ok"]) {
            const button = new Sprite_Button(type as MZ.ButtonType);
            this._buttons.push(button);
            this.addInnerChild(button);
        }
        this._buttons[0].setClickHandler(this.onButtonDown2.bind(this));
        this._buttons[1].setClickHandler(this.onButtonDown.bind(this));
        this._buttons[2].setClickHandler(this.onButtonUp.bind(this));
        this._buttons[3].setClickHandler(this.onButtonUp2.bind(this));
        this._buttons[4].setClickHandler(this.onButtonOk.bind(this));
    }
  };

  placeButtons(): void {
    const sp = this.buttonSpacing();
    const totalWidth = this.totalButtonWidth();
    let x = (this.innerWidth - totalWidth) / 2;
    for (const button of this._buttons!) {
        button.x = x;
        button.y = this.buttonY();
        x += button.width + sp;
    }
  };

  totalButtonWidth(): number {
    const sp = this.buttonSpacing();
    return this._buttons!.reduce((r, button) => r + button.width + sp, -sp);
  };

  buttonSpacing(): number {
    return 8;
  };

  refresh(): void {
    super.refresh();
    this.drawItemBackground(0);
    this.drawCurrentItemName();
    this.drawMultiplicationSign();
    this.drawNumber();
    this.drawHorzLine();
    this.drawTotalPrice();
  };

  drawCurrentItemName(): void {
    const padding = this.itemPadding();
    const x = padding * 2;
    const y = this.itemNameY();
    const width = this.multiplicationSignX() - padding * 3;
    this.drawItemName(this._item, x, y, width);
  };

  drawMultiplicationSign(): void {
    const sign = this.multiplicationSign();
    const width = this.textWidth(sign);
    const x = this.multiplicationSignX();
    const y = this.itemNameY();
    this.resetTextColor();
    this.drawText(sign, x, y, width);
  };

  multiplicationSign(): string {
    return "\u00d7";
  };

  multiplicationSignX(): number {
    const sign = this.multiplicationSign();
    const width = this.textWidth(sign);
    return this.cursorX() - width * 2;
  };

  drawNumber(): void {
    const x = this.cursorX();
    const y = this.itemNameY();
    const width = this.cursorWidth() - this.itemPadding();
    this.resetTextColor();
    this.drawText(String(this._number), x, y, width, "right");
  };

  drawHorzLine(): void {
    const padding = this.itemPadding();
    const lineHeight = this.lineHeight();
    const itemY = this.itemNameY();
    const totalY = this.totalPriceY();
    const x = padding;
    const y = Math.floor((itemY + totalY + lineHeight) / 2);
    const width = this.innerWidth - padding * 2;
    this.drawRect(x, y, width, 5);
  };

  drawTotalPrice(): void {
    const padding = this.itemPadding();
    const total = this._price * this._number;
    const width = this.innerWidth - padding * 2;
    const y = this.totalPriceY();
    this.drawCurrencyValue(total, this._currencyUnit, 0, y, width);
  };

  itemNameY(): number {
    return Math.floor(this.innerHeight / 2 - this.lineHeight() * 1.5);
  };

  totalPriceY(): number {
    return Math.floor(this.itemNameY() + this.lineHeight() * 2);
  };

  buttonY(): number {
    return Math.floor(this.totalPriceY() + this.lineHeight() * 2);
  };

  cursorWidth(): number {
    const padding = this.itemPadding();
    const digitWidth = this.textWidth("0");
    return this.maxDigits() * digitWidth + padding * 2;
  };

  cursorX(): number {
    const padding = this.itemPadding();
    return this.innerWidth - this.cursorWidth() - padding * 2;
  };

  maxDigits(): number {
    return 2;
  };

  update(): void {
    super.update();
    this.processNumberChange();
  };

  playOkSound(): void {
    //
  };

  processNumberChange(): void {
    if (this.isOpenAndActive()) {
        if (Input.isRepeated("right")) {
            this.changeNumber(1);
        }
        if (Input.isRepeated("left")) {
            this.changeNumber(-1);
        }
        if (Input.isRepeated("up")) {
            this.changeNumber(10);
        }
        if (Input.isRepeated("down")) {
            this.changeNumber(-10);
        }
    }
  };

  changeNumber(amount: number): void {
    const lastNumber = this._number;
    this._number = (this._number + amount).clamp(1, this._max);
    if (this._number !== lastNumber) {
        this.playCursorSound();
        this.refresh();
    }
  };

  itemRect(): Rectangle {
    const rect = new Rectangle();
    rect.x = this.cursorX();
    rect.y = this.itemNameY();
    rect.width = this.cursorWidth();
    rect.height = this.lineHeight();
    return rect;
  };

  isTouchOkEnabled(): boolean {
    return false;
  };

  onButtonUp(): void {
    this.changeNumber(1);
  };

  onButtonUp2(): void {
    this.changeNumber(10);
  };

  onButtonDown(): void {
    this.changeNumber(-1);
  };

  onButtonDown2(): void {
    this.changeNumber(-10);
  };

  onButtonOk(): void {
    this.processOk();
  };
}
