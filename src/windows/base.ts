import { Window } from '../pixi/window';
import { Utils } from '../dom';
import {
  ColorManager,
  TextManager,
  ImageManager,
  SoundManager,
} from '../managers';
import { $gameSystem, $gameActors, $gameParty, $gameVariables } from '../managers';
import { Rectangle, Sprite, Bitmap } from '../pixi';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.

export class Window_Base extends Window {
  _opening = false;
  _closing = false;
  _dimmerSprite: Sprite | null = null;

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_Base>)
  constructor(arg?: any) {
    super(Window);
    if (typeof arg === "function" && arg === Window_Base) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize();
    this.loadWindowskin();
    this.checkRectObject(rect);
    this.move(rect!.x, rect!.y, rect!.width, rect!.height);
    this.updatePadding();
    this.updateBackOpacity();
    this.updateTone();
    this.createContents();
    this._opening = false;
    this._closing = false;
    this._dimmerSprite = null;
  };

  destroy(options?: any): void {
    this.destroyContents();
    if (this._dimmerSprite) {
        this._dimmerSprite.bitmap!.destroy();
    }
    super.destroy(options);
  };

  checkRectObject(rect?: Rectangle): void {
    if (typeof rect !== "object" || !("x" in rect)) {
        // Probably MV plugin is used
        throw new Error("Argument must be a Rectangle");
    }
  };

  lineHeight(): number {
    return 36;
  };

  itemWidth(): number {
    return this.innerWidth;
  };

  itemHeight(): number {
    return this.lineHeight();
  };

  itemPadding(): number {
    return 8;
  };

  baseTextRect(): Rectangle {
    const rect = new Rectangle(0, 0, this.innerWidth, this.innerHeight);
    rect.pad(-this.itemPadding(), 0);
    return rect;
  };

  loadWindowskin(): void {
    this.windowskin = ImageManager.loadSystem("Window");
  };

  updatePadding(): void {
    this.padding = $gameSystem.windowPadding();
  };

  updateBackOpacity(): void {
    this.backOpacity = 192;
  };

  fittingHeight(numLines: number): number {
    return numLines * this.itemHeight() + $gameSystem.windowPadding() * 2;
  };

  updateTone(): void {
    const tone = $gameSystem.windowTone();
    this.setTone(tone[0], tone[1], tone[2]);
  };

  createContents(): void {
    const width = this.contentsWidth();
    const height = this.contentsHeight();
    this.destroyContents();
    this.contents = new Bitmap(width, height);
    this.contentsBack = new Bitmap(width, height);
    this.resetFontSettings();
  };

  destroyContents(): void {
    if (this.contents) {
        this.contents.destroy();
    }
    if (this.contentsBack) {
        this.contentsBack.destroy();
    }
  };

  contentsWidth(): number {
    return this.innerWidth;
  };

  contentsHeight(): number {
    return this.innerHeight;
  };

  resetFontSettings(): void {
    this.contents.fontFace = $gameSystem.mainFontFace();
    this.contents.fontSize = $gameSystem.mainFontSize();
    this.resetTextColor();
  };

  resetTextColor(): void {
    this.changeTextColor(ColorManager.normalColor());
    this.changeOutlineColor(ColorManager.outlineColor());
  };

  update(): void {
    super.update();
    this.updateTone();
    this.updateOpen();
    this.updateClose();
    this.updateBackgroundDimmer();
  };

  updateOpen(): void {
    if (this._opening) {
        this.openness += 32;
        if (this.isOpen()) {
            this._opening = false;
        }
    }
  };

  updateClose(): void {
    if (this._closing) {
        this.openness -= 32;
        if (this.isClosed()) {
            this._closing = false;
        }
    }
  };

  open(): void {
    if (!this.isOpen()) {
        this._opening = true;
    }
    this._closing = false;
  };

  close(): void {
    if (!this.isClosed()) {
        this._closing = true;
    }
    this._opening = false;
  };

  isOpening(): boolean {
    return this._opening;
  };

  isClosing(): boolean {
    return this._closing;
  };

  show(): void {
    this.visible = true;
  };

  hide(): void {
    this.visible = false;
  };

  activate(): void {
    this.active = true;
  };

  deactivate(): void {
    this.active = false;
  };

  systemColor(): string {
    return ColorManager.systemColor();
  };

  translucentOpacity(): number {
    return 160;
  };

  changeTextColor(color: string): void {
    this.contents.textColor = color;
  };

  changeOutlineColor(color: string): void {
    this.contents.outlineColor = color;
  };

  changePaintOpacity(enabled: boolean | number): void {
    this.contents.paintOpacity = enabled ? 255 : this.translucentOpacity();
  };

  drawRect(x: number, y: number, width: number, height: number): void {
    const outlineColor = this.contents.outlineColor;
    const mainColor = this.contents.textColor;
    this.contents.fillRect(x, y, width, height, outlineColor);
    this.contents.fillRect(x + 1, y + 1, width - 2, height - 2, mainColor);
  };

  drawText(text: string, x: number, y: number, maxWidth?: number, align?: CanvasTextAlign): void {
    this.contents.drawText(text, x, y, maxWidth, this.lineHeight(), align);
  };

  textWidth(text: string): number {
    return this.contents.measureTextWidth(text);
  };

  drawTextEx(text: string, x: number, y: number, width: number): number {
    this.resetFontSettings();
    const textState = this.createTextState(text, x, y, width);
    this.processAllText(textState);
    return textState.outputWidth;
  };

  textSizeEx(text: string): { width: number, height: number } {
    this.resetFontSettings();
    const textState = this.createTextState(text, 0, 0, 0);
    textState.drawing = false;
    this.processAllText(textState);
    return { width: textState.outputWidth, height: textState.outputHeight };
  };

  createTextState(text: string, x: number, y: number, width: number): MZ.TextState {
    const rtl = Utils.containsArabic(text);
    const textState = {} as MZ.TextState;
    textState.text = this.convertEscapeCharacters(text);
    textState.index = 0;
    textState.x = rtl ? x + width : x;
    textState.y = y;
    textState.width = width;
    textState.height = this.calcTextHeight(textState);
    textState.startX = textState.x;
    textState.startY = textState.y;
    textState.rtl = rtl;
    textState.buffer = this.createTextBuffer(rtl);
    textState.drawing = true;
    textState.outputWidth = 0;
    textState.outputHeight = 0;
    return textState;
  };

  processAllText(textState: MZ.TextState): void {
    while (textState.index < textState.text.length) {
        this.processCharacter(textState);
    }
    this.flushTextState(textState);
  };

  flushTextState(textState: MZ.TextState): void {
    const text = textState.buffer;
    const rtl = textState.rtl;
    const width = this.textWidth(text);
    const height = textState.height;
    const x = rtl ? textState.x - width : textState.x;
    const y = textState.y;
    if (textState.drawing) {
        this.contents.drawText(text, x, y, width, height);
    }
    textState.x += rtl ? -width : width;
    textState.buffer = this.createTextBuffer(rtl);
    const outputWidth = Math.abs(textState.x - textState.startX);
    if (textState.outputWidth < outputWidth) {
        textState.outputWidth = outputWidth;
    }
    textState.outputHeight = y - textState.startY + height;
  };

  createTextBuffer(rtl: boolean): string {
    // U+202B: RIGHT-TO-LEFT EMBEDDING
    return rtl ? "\u202B" : "";
  };

  convertEscapeCharacters(text: string): string {
    /* eslint no-control-regex: 0 */
    text = text.replace(/\\/g, "\x1b");
    text = text.replace(/\x1b\x1b/g, "\\");
    text = text.replace(/\x1bV\[(\d+)\]/gi, (_, p1) =>
        String($gameVariables.value(parseInt(p1)))
    );
    text = text.replace(/\x1bV\[(\d+)\]/gi, (_, p1) =>
        String($gameVariables.value(parseInt(p1)))
    );
    text = text.replace(/\x1bN\[(\d+)\]/gi, (_, p1) =>
        this.actorName(parseInt(p1))
    );
    text = text.replace(/\x1bP\[(\d+)\]/gi, (_, p1) =>
        this.partyMemberName(parseInt(p1))
    );
    text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
    return text;
  };

  actorName(n: number): string {
    const actor = n >= 1 ? $gameActors.actor(n) : null;
    return actor ? actor.name() : "";
  };

  partyMemberName(n: number): string {
    const actor = n >= 1 ? $gameParty.members()[n - 1] : null;
    return actor ? actor.name() : "";
  };

  processCharacter(textState: MZ.TextState): void {
    const c = textState.text[textState.index++];
    if (c.charCodeAt(0) < 0x20) {
        this.flushTextState(textState);
        this.processControlCharacter(textState, c);
    } else {
        textState.buffer += c;
    }
  };

  processControlCharacter(textState: MZ.TextState, c: string): void {
    if (c === "\n") {
        this.processNewLine(textState);
    }
    if (c === "\x1b") {
        const code = this.obtainEscapeCode(textState);
        this.processEscapeCharacter(code, textState);
    }
  };

  processNewLine(textState: MZ.TextState): void {
    textState.x = textState.startX;
    textState.y += textState.height;
    textState.height = this.calcTextHeight(textState);
  };

  obtainEscapeCode(textState: MZ.TextState): string {
    const regExp = /^[$.|^!><{}\\]|^[A-Z]+/i;
    const arr = regExp.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        return arr[0].toUpperCase();
    } else {
        return "";
    }
  };

  obtainEscapeParam(textState: MZ.TextState): string | number {
    const regExp = /^\[\d+\]/;
    const arr = regExp.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        return parseInt(arr[0].slice(1));
    } else {
        return "";
    }
  };

  processEscapeCharacter(code: string, textState: MZ.TextState): void {
    switch (code) {
        case "C":
            this.processColorChange(this.obtainEscapeParam(textState) as number);
            break;
        case "I":
            this.processDrawIcon(this.obtainEscapeParam(textState) as number, textState);
            break;
        case "PX":
            textState.x = this.obtainEscapeParam(textState) as number;
            break;
        case "PY":
            textState.y = this.obtainEscapeParam(textState) as number;
            break;
        case "FS":
            this.contents.fontSize = this.obtainEscapeParam(textState) as number;
            break;
        case "{":
            this.makeFontBigger();
            break;
        case "}":
            this.makeFontSmaller();
            break;
    }
  };

  processColorChange(colorIndex: number): void {
    this.changeTextColor(ColorManager.textColor(colorIndex));
  };

  processDrawIcon(iconIndex: number, textState: MZ.TextState): void {
    if (textState.drawing) {
        this.drawIcon(iconIndex, textState.x + 2, textState.y + 2);
    }
    textState.x += ImageManager.iconWidth + 4;
  };

  makeFontBigger(): void {
    if (this.contents.fontSize <= 96) {
        this.contents.fontSize += 12;
    }
  };

  makeFontSmaller(): void {
    if (this.contents.fontSize >= 24) {
        this.contents.fontSize -= 12;
    }
  };

  calcTextHeight(textState: MZ.TextState): number {
    const lineSpacing = this.lineHeight() - $gameSystem.mainFontSize();
    const lastFontSize = this.contents.fontSize;
    const lines = textState.text.slice(textState.index).split("\n");
    const textHeight = this.maxFontSizeInLine(lines[0]) + lineSpacing;
    this.contents.fontSize = lastFontSize;
    return textHeight;
  };

  maxFontSizeInLine(line: string): number {
    let maxFontSize = this.contents.fontSize;
    const regExp = /\x1b({|}|FS)(\[(\d+)])?/gi;
    for (;;) {
        const array = regExp.exec(line);
        if (!array) {
            break;
        }
        const code = String(array[1]).toUpperCase();
        if (code === "{") {
            this.makeFontBigger();
        } else if (code === "}") {
            this.makeFontSmaller();
        } else if (code === "FS") {
            this.contents.fontSize = parseInt(array[3]);
        }
        if (this.contents.fontSize > maxFontSize) {
            maxFontSize = this.contents.fontSize;
        }
    }
    return maxFontSize;
  };

  drawIcon(iconIndex: number, x: number, y: number): void {
    const bitmap = ImageManager.loadSystem("IconSet");
    const pw = ImageManager.iconWidth;
    const ph = ImageManager.iconHeight;
    const sx = (iconIndex % 16) * pw;
    const sy = Math.floor(iconIndex / 16) * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
  };

  // prettier-ignore
  drawFace(
    faceName: string,
    faceIndex: number,
    x: number,
    y: number,
    width?: number,
    height?: number
  ) {
    width = width || ImageManager.faceWidth;
    height = height || ImageManager.faceHeight;
    const bitmap = ImageManager.loadFace(faceName);
    const pw = ImageManager.faceWidth;
    const ph = ImageManager.faceHeight;
    const sw = Math.min(width, pw);
    const sh = Math.min(height, ph);
    const dx = Math.floor(x + Math.max(width - pw, 0) / 2);
    const dy = Math.floor(y + Math.max(height - ph, 0) / 2);
    const sx = (faceIndex % 4) * pw + (pw - sw) / 2;
    const sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;
    this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
  };

  // prettier-ignore
  drawCharacter(characterName: string, characterIndex: number, x: number, y: number) {
    const bitmap = ImageManager.loadCharacter(characterName);
    const big = ImageManager.isBigCharacter(characterName);
    const pw = bitmap.width / (big ? 3 : 12);
    const ph = bitmap.height / (big ? 4 : 8);
    const n = big ? 0: characterIndex;
    const sx = ((n % 4) * 3 + 1) * pw;
    const sy = Math.floor(n / 4) * 4 * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, x - pw / 2, y - ph);
  };

  drawItemName(item: MZ.DataItemBase | null, x: number, y: number, width: number): void {
    if (item) {
        const iconY = y + (this.lineHeight() - ImageManager.iconHeight) / 2;
        const textMargin = ImageManager.iconWidth + 4;
        const itemWidth = Math.max(0, width - textMargin);
        this.resetTextColor();
        this.drawIcon(item.iconIndex, x, iconY);
        this.drawText(item.name, x + textMargin, y, itemWidth);
    }
  };

  drawCurrencyValue(value: number, unit: string, x: number, y: number, width: number): void {
    const unitWidth = Math.min(80, this.textWidth(unit));
    this.resetTextColor();
    this.drawText(String(value), x, y, width - unitWidth - 6, "right");
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(unit, x + width - unitWidth, y, unitWidth, "right");
  };

  setBackgroundType(type: number): void {
    if (type === 0) {
        this.opacity = 255;
    } else {
        this.opacity = 0;
    }
    if (type === 1) {
        this.showBackgroundDimmer();
    } else {
        this.hideBackgroundDimmer();
    }
  };

  showBackgroundDimmer(): void {
    if (!this._dimmerSprite) {
        this.createDimmerSprite();
    }
    const bitmap = this._dimmerSprite!.bitmap;
    if (bitmap!.width !== this.width || bitmap!.height !== this.height) {
        this.refreshDimmerBitmap();
    }
    this._dimmerSprite!.visible = true;
    this.updateBackgroundDimmer();
  };

  createDimmerSprite(): void {
    this._dimmerSprite = new Sprite();
    this._dimmerSprite.bitmap = new Bitmap(0, 0);
    this._dimmerSprite.x = -4;
    this.addChildToBack(this._dimmerSprite);
  };

  hideBackgroundDimmer(): void {
    if (this._dimmerSprite) {
        this._dimmerSprite.visible = false;
    }
  };

  updateBackgroundDimmer(): void {
    if (this._dimmerSprite) {
        this._dimmerSprite.opacity = this.openness;
    }
  };

  refreshDimmerBitmap(): void {
    if (this._dimmerSprite) {
        const bitmap = this._dimmerSprite.bitmap!;
        const w = this.width > 0 ? this.width + 8 : 0;
        const h = this.height;
        const m = this.padding;
        const c1 = ColorManager.dimColor1();
        const c2 = ColorManager.dimColor2();
        bitmap.resize(w, h);
        bitmap.gradientFillRect(0, 0, w, m, c2, c1, true);
        bitmap.fillRect(0, m, w, h - m * 2, c1);
        bitmap.gradientFillRect(0, h - m, w, m, c1, c2, true);
        this._dimmerSprite.setFrame(0, 0, w, h);
    }
  };

  playCursorSound(): void {
    SoundManager.playCursor();
  };

  playOkSound(): void {
    SoundManager.playOk();
  };

  playBuzzerSound(): void {
    SoundManager.playBuzzer();
  };
}