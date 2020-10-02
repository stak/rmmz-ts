import { Window_Scrollable } from '.';
import { ColorManager, SoundManager } from '../managers';
import { Rectangle, Point } from '../pixi';
import { Window_Help } from './help';
import { Input, TouchInput } from '../dom';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Window_Selectable
//
// The window class with cursor movement functions.

export class Window_Selectable extends Window_Scrollable {
  _index = -1
  _cursorFixed = false
  _cursorAll = false
  _helpWindow: Window_Help | null = null
  _handlers: {[key: string]: () => void} = {}
  _doubleTouch = false
  _canRepeat = true
  cursorVisible = false

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_Selectable>)
  constructor(arg?: any) {
    super(Window_Scrollable);
    if (typeof arg === "function" && arg === Window_Selectable) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._index = -1;
    this._cursorFixed = false;
    this._cursorAll = false;
    this._helpWindow = null;
    this._handlers = {};
    this._doubleTouch = false;
    this._canRepeat = true;
    this.deactivate();
  };

  index(): number {
    return this._index;
  };

  cursorFixed(): boolean {
    return this._cursorFixed;
  };

  setCursorFixed(cursorFixed: boolean): void {
    this._cursorFixed = cursorFixed;
  };

  cursorAll(): boolean {
    return this._cursorAll;
  };

  setCursorAll(cursorAll: boolean): void {
    this._cursorAll = cursorAll;
  };

  maxCols(): number {
    return 1;
  };

  maxItems(): number {
    return 0;
  };

  colSpacing(): number {
    return 8;
  };

  rowSpacing(): number {
    return 4;
  };

  itemWidth(): number {
    return Math.floor(this.innerWidth / this.maxCols());
  };

  itemHeight(): number {
    return super.itemHeight() + 8;
  };

  contentsHeight(): number {
    return this.innerHeight + this.itemHeight();
  };

  maxRows(): number {
    return Math.max(Math.ceil(this.maxItems() / this.maxCols()), 1);
  };

  overallHeight(): number {
    return this.maxRows() * this.itemHeight();
  };

  activate(): void {
    super.activate();
    this.reselect();
  };

  deactivate(): void {
    super.deactivate();
    this.reselect();
  };

  select(index: number): void {
    this._index = index;
    this.refreshCursor();
    this.callUpdateHelp();
  };

  forceSelect(index: number): void {
    this.select(index);
    this.ensureCursorVisible(false);
  };

  smoothSelect(index: number): void {
    this.select(index);
    this.ensureCursorVisible(true);
  };

  deselect(): void {
    this.select(-1);
  };

  reselect(): void {
    this.select(this._index);
    this.ensureCursorVisible(true);
    this.cursorVisible = true;
  };

  row(): number {
    return Math.floor(this.index() / this.maxCols());
  };

  topRow(): number {
    return Math.floor(this.scrollY() / this.itemHeight());
  };

  maxTopRow(): number {
    return Math.max(0, this.maxRows() - this.maxPageRows());
  };

  setTopRow(row: number): void {
    this.scrollTo(this.scrollX(), row * this.itemHeight());
  };

  maxPageRows(): number {
    return Math.floor(this.innerHeight / this.itemHeight());
  };

  maxPageItems(): number {
    return this.maxPageRows() * this.maxCols();
  };

  maxVisibleItems(): number {
    const visibleRows = Math.ceil(this.contentsHeight() / this.itemHeight());
    return visibleRows * this.maxCols();
  };

  isHorizontal(): boolean {
    return this.maxPageRows() === 1;
  };

  topIndex(): number {
    return this.topRow() * this.maxCols();
  };

  itemRect(index: number): Rectangle {
    const maxCols = this.maxCols();
    const itemWidth = this.itemWidth();
    const itemHeight = this.itemHeight();
    const colSpacing = this.colSpacing();
    const rowSpacing = this.rowSpacing();
    const col = index % maxCols;
    const row = Math.floor(index / maxCols);
    const x = col * itemWidth + colSpacing / 2 - this.scrollBaseX();
    const y = row * itemHeight + rowSpacing / 2 - this.scrollBaseY();
    const width = itemWidth - colSpacing;
    const height = itemHeight - rowSpacing;
    return new Rectangle(x, y, width, height);
  };

  itemRectWithPadding(index: number): Rectangle {
    const rect = this.itemRect(index);
    const padding = this.itemPadding();
    rect.x += padding;
    rect.width -= padding * 2;
    return rect;
  };

  itemLineRect(index: number): Rectangle {
    const rect = this.itemRectWithPadding(index);
    const padding = (rect.height - this.lineHeight()) / 2;
    rect.y += padding;
    rect.height -= padding * 2;
    return rect;
  };

  setHelpWindow(helpWindow: Window_Help): void {
    this._helpWindow = helpWindow;
    this.callUpdateHelp();
  };

  showHelpWindow(): void {
    if (this._helpWindow) {
        this._helpWindow.show();
    }
  };

  hideHelpWindow(): void {
    if (this._helpWindow) {
        this._helpWindow.hide();
    }
  };

  setHandler(symbol: string, method: () => void): void {
    this._handlers[symbol] = method;
  };

  isHandled(symbol: string | null): boolean {
    return !!this._handlers[symbol!];
  };

  callHandler(symbol: string | null): void {
    if (this.isHandled(symbol)) {
        this._handlers[symbol!]();
    }
  };

  isOpenAndActive(): boolean {
    return this.isOpen() && this.visible && this.active;
  };

  isCursorMovable(): boolean {
    return (
        this.isOpenAndActive() &&
        !this._cursorFixed &&
        !this._cursorAll &&
        this.maxItems() > 0
    );
  };

  cursorDown(wrap: boolean): void {
    const index = this.index();
    const maxItems = this.maxItems();
    const maxCols = this.maxCols();
    if (index < maxItems - maxCols || (wrap && maxCols === 1)) {
        this.smoothSelect((index + maxCols) % maxItems);
    }
  };

  cursorUp(wrap: boolean): void {
    const index = Math.max(0, this.index());
    const maxItems = this.maxItems();
    const maxCols = this.maxCols();
    if (index >= maxCols || (wrap && maxCols === 1)) {
        this.smoothSelect((index - maxCols + maxItems) % maxItems);
    }
  };

  cursorRight(wrap: boolean): void {
    const index = this.index();
    const maxItems = this.maxItems();
    const maxCols = this.maxCols();
    const horizontal = this.isHorizontal();
    if (maxCols >= 2 && (index < maxItems - 1 || (wrap && horizontal))) {
        this.smoothSelect((index + 1) % maxItems);
    }
  };

  cursorLeft(wrap: boolean): void {
    const index = Math.max(0, this.index());
    const maxItems = this.maxItems();
    const maxCols = this.maxCols();
    const horizontal = this.isHorizontal();
    if (maxCols >= 2 && (index > 0 || (wrap && horizontal))) {
        this.smoothSelect((index - 1 + maxItems) % maxItems);
    }
  };

  cursorPagedown(): void {
    const index = this.index();
    const maxItems = this.maxItems();
    if (this.topRow() + this.maxPageRows() < this.maxRows()) {
        this.smoothScrollDown(this.maxPageRows());
        this.select(Math.min(index + this.maxPageItems(), maxItems - 1));
    }
  };

  cursorPageup(): void {
    const index = this.index();
    if (this.topRow() > 0) {
        this.smoothScrollUp(this.maxPageRows());
        this.select(Math.max(index - this.maxPageItems(), 0));
    }
  };

  isScrollEnabled(): boolean {
    return this.active || this.index() < 0;
  };

  update(): void {
    this.processCursorMove();
    this.processHandling();
    this.processTouch();
    super.update();
  };

  processCursorMove(): void {
    if (this.isCursorMovable()) {
        const lastIndex = this.index();
        if (Input.isRepeated("down")) {
            this.cursorDown(Input.isTriggered("down"));
        }
        if (Input.isRepeated("up")) {
            this.cursorUp(Input.isTriggered("up"));
        }
        if (Input.isRepeated("right")) {
            this.cursorRight(Input.isTriggered("right"));
        }
        if (Input.isRepeated("left")) {
            this.cursorLeft(Input.isTriggered("left"));
        }
        if (!this.isHandled("pagedown") && Input.isTriggered("pagedown")) {
            this.cursorPagedown();
        }
        if (!this.isHandled("pageup") && Input.isTriggered("pageup")) {
            this.cursorPageup();
        }
        if (this.index() !== lastIndex) {
            this.playCursorSound();
        }
    }
  };

  processHandling(): void {
    if (this.isOpenAndActive()) {
        if (this.isOkEnabled() && this.isOkTriggered()) {
            return this.processOk();
        }
        if (this.isCancelEnabled() && this.isCancelTriggered()) {
            return this.processCancel();
        }
        if (this.isHandled("pagedown") && Input.isTriggered("pagedown")) {
            return this.processPagedown();
        }
        if (this.isHandled("pageup") && Input.isTriggered("pageup")) {
            return this.processPageup();
        }
    }
  };

  processTouch(): void {
    if (this.isOpenAndActive()) {
        if (this.isHoverEnabled() && TouchInput.isHovered()) {
            this.onTouchSelect(false);
        } else if (TouchInput.isTriggered()) {
            this.onTouchSelect(true);
        }
        if (TouchInput.isClicked()) {
            this.onTouchOk();
        } else if (TouchInput.isCancelled()) {
            this.onTouchCancel();
        }
    }
  };

  isHoverEnabled(): boolean {
    return true;
  };

  onTouchSelect(trigger: boolean): void {
    this._doubleTouch = false;
    if (this.isCursorMovable()) {
        const lastIndex = this.index();
        const hitIndex = this.hitIndex();
        if (hitIndex >= 0) {
            if (hitIndex === this.index()) {
                this._doubleTouch = true;
            }
            this.select(hitIndex);
        }
        if (trigger && this.index() !== lastIndex) {
            this.playCursorSound();
        }
    }
  };

  onTouchOk(): void {
    if (this.isTouchOkEnabled()) {
        const hitIndex = this.hitIndex();
        if (this._cursorFixed) {
            if (hitIndex === this.index()) {
                this.processOk();
            }
        } else if (hitIndex >= 0) {
            this.processOk();
        }
    }
  };

  onTouchCancel(): void {
    if (this.isCancelEnabled()) {
        this.processCancel();
    }
  };

  hitIndex(): number {
    const touchPos = new Point(TouchInput.x, TouchInput.y);
    const localPos = this.worldTransform.applyInverse(touchPos);
    return this.hitTest(localPos.x, localPos.y);
  };

  hitTest(x: number, y: number): number {
    if (this.innerRect.contains(x, y)) {
        const cx = this.origin.x + x - this.padding;
        const cy = this.origin.y + y - this.padding;
        const topIndex = this.topIndex();
        for (let i = 0; i < this.maxVisibleItems(); i++) {
            const index = topIndex + i;
            if (index < this.maxItems()) {
                const rect = this.itemRect(index);
                if (rect.contains(cx, cy)) {
                    return index;
                }
            }
        }
    }
    return -1;
  };

  isTouchOkEnabled(): boolean {
    return (
        this.isOkEnabled() &&
        (this._cursorFixed || this._cursorAll || this._doubleTouch)
    );
  };

  isOkEnabled(): boolean {
    return this.isHandled("ok");
  };

  isCancelEnabled(): boolean {
    return this.isHandled("cancel");
  };

  isOkTriggered(): boolean {
    return this._canRepeat ? Input.isRepeated("ok") : Input.isTriggered("ok");
  };

  isCancelTriggered(): boolean {
    return Input.isRepeated("cancel");
  };

  processOk(): void {
    if (this.isCurrentItemEnabled()) {
        this.playOkSound();
        this.updateInputData();
        this.deactivate();
        this.callOkHandler();
    } else {
        this.playBuzzerSound();
    }
  };

  callOkHandler(): void {
    this.callHandler("ok");
  };

  processCancel(): void {
    SoundManager.playCancel();
    this.updateInputData();
    this.deactivate();
    this.callCancelHandler();
  };

  callCancelHandler(): void {
    this.callHandler("cancel");
  };

  processPageup(): void {
    this.updateInputData();
    this.deactivate();
    this.callHandler("pageup");
  };

  processPagedown(): void {
    this.updateInputData();
    this.deactivate();
    this.callHandler("pagedown");
  };

  updateInputData(): void {
    Input.update();
    TouchInput.update();
    this.clearScrollStatus();
  };

  ensureCursorVisible(smooth: boolean): void {
    if (this._cursorAll) {
        this.scrollTo(0, 0);
    } else if (this.innerHeight > 0 && this.row() >= 0) {
        const scrollY = this.scrollY();
        const itemTop = this.row() * this.itemHeight();
        const itemBottom = itemTop + this.itemHeight();
        const scrollMin = itemBottom - this.innerHeight;
        if (scrollY > itemTop) {
            if (smooth) {
                this.smoothScrollTo(0, itemTop);
            } else {
                this.scrollTo(0, itemTop);
            }
        } else if (scrollY < scrollMin) {
            if (smooth) {
                this.smoothScrollTo(0, scrollMin);
            } else {
                this.scrollTo(0, scrollMin);
            }
        }
    }
  };

  callUpdateHelp(): void {
    if (this.active && this._helpWindow) {
        this.updateHelp();
    }
  };

  updateHelp(): void {
    this._helpWindow!.clear();
  };

  setHelpWindowItem(item: MZ.DataItemBase | null): void {
    if (this._helpWindow) {
        this._helpWindow.setItem(item);
    }
  };

  isCurrentItemEnabled(): boolean {
    return true;
  };

  drawAllItems(): void {
    const topIndex = this.topIndex();
    for (let i = 0; i < this.maxVisibleItems(); i++) {
        const index = topIndex + i;
        if (index < this.maxItems()) {
            this.drawItemBackground(index);
            this.drawItem(index);
        }
    }
  };

  drawItem(index: number): void {
    //
  };

  clearItem(index: number): void {
    const rect = this.itemRect(index);
    this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
    this.contentsBack.clearRect(rect.x, rect.y, rect.width, rect.height);
  };

  drawItemBackground(index: number): void {
    const rect = this.itemRect(index);
    this.drawBackgroundRect(rect);
  };

  drawBackgroundRect(rect: Rectangle): void {
    const c1 = ColorManager.itemBackColor1();
    const c2 = ColorManager.itemBackColor2();
    const x = rect.x;
    const y = rect.y;
    const w = rect.width;
    const h = rect.height;
    this.contentsBack.gradientFillRect(x, y, w, h, c1, c2, true);
    this.contentsBack.strokeRect(x, y, w, h, c1);
  };

  redrawItem(index: number): void {
    if (index >= 0) {
        this.clearItem(index);
        this.drawItemBackground(index);
        this.drawItem(index);
    }
  };

  redrawCurrentItem(): void {
    this.redrawItem(this.index());
  };

  refresh(): void {
    this.paint();
  };

  paint(): void {
    if (this.contents) {
        this.contents.clear();
        this.contentsBack.clear();
        this.drawAllItems();
    }
  };

  refreshCursor(): void {
    if (this._cursorAll) {
        this.refreshCursorForAll();
    } else if (this.index() >= 0) {
        const rect = this.itemRect(this.index());
        this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
    } else {
        this.setCursorRect(0, 0, 0, 0);
    }
  };

  refreshCursorForAll(): void {
    const maxItems = this.maxItems();
    if (maxItems > 0) {
        const rect = this.itemRect(0);
        rect.enlarge(this.itemRect(maxItems - 1));
        this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
    } else {
        this.setCursorRect(0, 0, 0, 0);
    }
  };
}
