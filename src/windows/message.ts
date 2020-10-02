import { Window_Base } from '.';
import { ImageManager } from '../managers';
import { $gameMessage } from '../managers';
import { Graphics, Input, TouchInput } from '../dom';
import { Bitmap, Rectangle } from '../pixi';
import { Window_Gold, Window_NameBox, Window_ChoiceList, Window_NumberInput, Window_EventItem } from '.';
import { MZ } from '../MZ';


//-----------------------------------------------------------------------------
// Window_Message
//
// The window for displaying text messages.

export class Window_Message extends Window_Base {
  _background = 0
  _positionType = 2
  _waitCount = 0
  _showFast = false
  _lineShowFast = false
  _pauseSkip = false
  _faceBitmap: Bitmap | null = null
  _textState: MZ.TextState | null = null
  _goldWindow: Window_Gold = null
  _nameBoxWindow: Window_NameBox | null = null
  _choiceListWindow: Window_ChoiceList | null = null
  _numberInputWindow: Window_NumberInput | null = null
  _eventItemWindow: Window_EventItem | null = null

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_Message>)
  constructor(arg?: any) {
    super(Window_Base);
    if (typeof arg === "function" && arg === Window_Message) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.openness = 0;
    this.initMembers();
  };

  initMembers(): void {
    this._background = 0;
    this._positionType = 2;
    this._waitCount = 0;
    this._faceBitmap = null;
    this._textState = null;
    this._goldWindow = null;
    this._nameBoxWindow = null;
    this._choiceListWindow = null;
    this._numberInputWindow = null;
    this._eventItemWindow = null;
    this.clearFlags();
  };

  setGoldWindow(goldWindow: Window_Gold): void {
    this._goldWindow = goldWindow;
  };

  setNameBoxWindow(nameBoxWindow: Window_NameBox): void {
    this._nameBoxWindow = nameBoxWindow;
  };

  setChoiceListWindow(choiceListWindow: Window_ChoiceList): void {
    this._choiceListWindow = choiceListWindow;
  };

  setNumberInputWindow(numberInputWindow: Window_NumberInput): void {
    this._numberInputWindow = numberInputWindow;
  };

  setEventItemWindow(eventItemWindow: Window_EventItem): void {
    this._eventItemWindow = eventItemWindow;
  };

  clearFlags(): void {
    this._showFast = false;
    this._lineShowFast = false;
    this._pauseSkip = false;
  };

  update(): void {
    this.checkToNotClose();
    super.update();
    this.synchronizeNameBox();
    while (!this.isOpening() && !this.isClosing()) {
        if (this.updateWait()) {
            return;
        } else if (this.updateLoading()) {
            return;
        } else if (this.updateInput()) {
            return;
        } else if (this.updateMessage()) {
            return;
        } else if (this.canStart()) {
            this.startMessage();
        } else {
            this.startInput();
            return;
        }
    }
  };

  checkToNotClose(): void {
    if (this.isOpen() && this.isClosing() && this.doesContinue()) {
        this.open();
    }
  };

  synchronizeNameBox(): void {
    this._nameBoxWindow.openness = this.openness;
  };

  canStart(): boolean {
    return $gameMessage.hasText() && !$gameMessage.scrollMode();
  };

  startMessage(): void {
    const text = $gameMessage.allText();
    const textState = this.createTextState(text, 0, 0, 0);
    textState.x = this.newLineX(textState);
    textState.startX = textState.x;
    this._textState = textState;
    this.newPage(this._textState);
    this.updatePlacement();
    this.updateBackground();
    this.open();
    this._nameBoxWindow.start();
  };

  newLineX(textState: MZ.TextState): number {
    const faceExists = $gameMessage.faceName() !== "";
    const faceWidth = ImageManager.faceWidth;
    const spacing = 20;
    const margin = faceExists ? faceWidth + spacing : 4;
    return textState.rtl ? this.innerWidth - margin : margin;
  };

  updatePlacement(): void {
    const goldWindow = this._goldWindow;
    this._positionType = $gameMessage.positionType();
    this.y = (this._positionType * (Graphics.boxHeight - this.height)) / 2;
    if (goldWindow) {
        goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - goldWindow.height;
    }
  };

  updateBackground(): void {
    this._background = $gameMessage.background();
    this.setBackgroundType(this._background);
  };

  terminateMessage(): void {
    this.close();
    this._goldWindow.close();
    $gameMessage.clear();
  };

  updateWait(): boolean {
    if (this._waitCount > 0) {
        this._waitCount--;
        return true;
    } else {
        return false;
    }
  };

  updateLoading(): boolean {
    if (this._faceBitmap) {
        if (this._faceBitmap.isReady()) {
            this.drawMessageFace();
            this._faceBitmap = null;
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
  };

  updateInput(): boolean {
    if (this.isAnySubWindowActive()) {
        return true;
    }
    if (this.pause) {
        if (this.isTriggered()) {
            Input.update();
            this.pause = false;
            if (!this._textState) {
                this.terminateMessage();
            }
        }
        return true;
    }
    return false;
  };

  isAnySubWindowActive(): boolean {
    return (
        this._choiceListWindow.active ||
        this._numberInputWindow.active ||
        this._eventItemWindow.active
    );
  };

  updateMessage(): boolean {
    const textState = this._textState;
    if (textState) {
        while (!this.isEndOfText(textState)) {
            if (this.needsNewPage(textState)) {
                this.newPage(textState);
            }
            this.updateShowFast();
            this.processCharacter(textState);
            if (this.shouldBreakHere(textState)) {
                break;
            }
        }
        this.flushTextState(textState);
        if (this.isEndOfText(textState) && !this.pause) {
            this.onEndOfText();
        }
        return true;
    } else {
        return false;
    }
  };

  shouldBreakHere(textState: MZ.TextState): boolean {
    if (this.canBreakHere(textState)) {
        if (!this._showFast && !this._lineShowFast) {
            return true;
        }
        if (this.pause || this._waitCount > 0) {
            return true;
        }
    }
    return false;
  };

  canBreakHere(textState: MZ.TextState): boolean {
    if (!this.isEndOfText(textState)) {
        const c = textState.text[textState.index];
        if (c.charCodeAt(0) >= 0xdc00 && c.charCodeAt(0) <= 0xdfff) {
            // surrogate pair
            return false;
        }
        if (textState.rtl && c.charCodeAt(0) > 0x20) {
            return false;
        }
    }
    return true;
  };

  onEndOfText(): void {
    if (!this.startInput()) {
        if (!this._pauseSkip) {
            this.startPause();
        } else {
            this.terminateMessage();
        }
    }
    this._textState = null;
  };

  startInput(): boolean {
    if ($gameMessage.isChoice()) {
        this._choiceListWindow.start();
        return true;
    } else if ($gameMessage.isNumberInput()) {
        this._numberInputWindow.start();
        return true;
    } else if ($gameMessage.isItemChoice()) {
        this._eventItemWindow.start();
        return true;
    } else {
        return false;
    }
  };

  isTriggered(): boolean {
    return (
        Input.isRepeated("ok") ||
        Input.isRepeated("cancel") ||
        TouchInput.isRepeated()
    );
  };

  doesContinue(): boolean {
    return (
        $gameMessage.hasText() &&
        !$gameMessage.scrollMode() &&
        !this.areSettingsChanged()
    );
  };

  areSettingsChanged(): boolean {
    return (
        this._background !== $gameMessage.background() ||
        this._positionType !== $gameMessage.positionType()
    );
  };

  updateShowFast(): void {
    if (this.isTriggered()) {
        this._showFast = true;
    }
  };

  newPage(textState: MZ.TextState): void {
    this.contents.clear();
    this.resetFontSettings();
    this.clearFlags();
    this.updateSpeakerName();
    this.loadMessageFace();
    textState.x = textState.startX;
    textState.y = 0;
    textState.height = this.calcTextHeight(textState);
  };

  updateSpeakerName(): void {
    this._nameBoxWindow.setName($gameMessage.speakerName());
  };

  loadMessageFace(): void {
    this._faceBitmap = ImageManager.loadFace($gameMessage.faceName());
  };

  drawMessageFace(): void {
    const faceName = $gameMessage.faceName();
    const faceIndex = $gameMessage.faceIndex();
    const rtl = $gameMessage.isRTL();
    const width = ImageManager.faceWidth;
    const height = this.innerHeight;
    const x = rtl ? this.innerWidth - width - 4 : 4;
    this.drawFace(faceName, faceIndex, x, 0, width, height);
  };

  processControlCharacter(textState: MZ.TextState, c: string): void {
    super.processControlCharacter(textState, c);
    if (c === "\f") {
        this.processNewPage(textState);
    }
  };

  processNewLine(textState: MZ.TextState): void {
    this._lineShowFast = false;
    super.processNewLine(textState);
    if (this.needsNewPage(textState)) {
        this.startPause();
    }
  };

  processNewPage(textState: MZ.TextState): void {
    if (textState.text[textState.index] === "\n") {
        textState.index++;
    }
    textState.y = this.contents.height;
    this.startPause();
  };

  isEndOfText(textState: MZ.TextState): boolean {
    return textState.index >= textState.text.length;
  };

  needsNewPage(textState: MZ.TextState): boolean {
    return (
        !this.isEndOfText(textState) &&
        textState.y + textState.height > this.contents.height
    );
  };

  processEscapeCharacter(code: string, textState: MZ.TextState): void {
    switch (code) {
        case "$":
            this._goldWindow.open();
            break;
        case ".":
            this.startWait(15);
            break;
        case "|":
            this.startWait(60);
            break;
        case "!":
            this.startPause();
            break;
        case ">":
            this._lineShowFast = true;
            break;
        case "<":
            this._lineShowFast = false;
            break;
        case "^":
            this._pauseSkip = true;
            break;
        default:
            super.processEscapeCharacter(code, textState);
            break;
    }
  };

  startWait(count: number): void {
    this._waitCount = count;
  };

  startPause(): void {
    this.startWait(10);
    this.pause = true;
  };
}
