import { Utils } from '../dom';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Message
//
// The game object class for the state of the message window that displays text
// or selections, etc.

export class Game_Message {
  _texts: string[] = [];
  _choices: string[] = [];
  _speakerName = "";
  _faceName = "";
  _faceIndex = 0;
  _background = 0;
  _positionType = 2;
  _choiceDefaultType = 0;
  _choiceCancelType = 0;
  _choiceBackground = 0;
  _choicePositionType = 2;
  _numInputVariableId: MZ.VariableID = 0;
  _numInputMaxDigits = 0;
  _itemChoiceVariableId = 0;
  _itemChoiceItypeId = 0;
  _scrollMode = false;
  _scrollSpeed = 2;
  _scrollNoFast = false;
  _choiceCallback: ((n: number) => void) | null  = null;
  
  constructor()
  constructor(thisClass: Constructable<Game_Message>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_Message) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this.clear();
  };

  clear(): void {
    this._texts = [];
    this._choices = [];
    this._speakerName = "";
    this._faceName = "";
    this._faceIndex = 0;
    this._background = 0;
    this._positionType = 2;
    this._choiceDefaultType = 0;
    this._choiceCancelType = 0;
    this._choiceBackground = 0;
    this._choicePositionType = 2;
    this._numInputVariableId = 0;
    this._numInputMaxDigits = 0;
    this._itemChoiceVariableId = 0;
    this._itemChoiceItypeId = 0;
    this._scrollMode = false;
    this._scrollSpeed = 2;
    this._scrollNoFast = false;
    this._choiceCallback = null;
  };

  choices(): string[] {
    return this._choices;
  };

  speakerName(): string {
    return this._speakerName;
  };

  faceName(): string {
    return this._faceName;
  };

  faceIndex(): number {
    return this._faceIndex;
  };

  background(): number {
    return this._background;
  };

  positionType(): number {
    return this._positionType;
  };

  choiceDefaultType(): number {
    return this._choiceDefaultType;
  };

  choiceCancelType(): number {
    return this._choiceCancelType;
  };

  choiceBackground(): number {
    return this._choiceBackground;
  };

  choicePositionType(): number {
    return this._choicePositionType;
  };

  numInputVariableId(): MZ.VariableID {
    return this._numInputVariableId;
  };

  numInputMaxDigits(): number {
    return this._numInputMaxDigits;
  };

  itemChoiceVariableId(): number {
    return this._itemChoiceVariableId;
  };

  itemChoiceItypeId(): number {
    return this._itemChoiceItypeId;
  };

  scrollMode(): boolean {
    return this._scrollMode;
  };

  scrollSpeed(): number {
    return this._scrollSpeed;
  };

  scrollNoFast(): boolean {
    return this._scrollNoFast;
  };

  add(text: string): void {
    this._texts.push(text);
  };

  setSpeakerName(speakerName: string): void {
    this._speakerName = speakerName ? speakerName : "";
  };

  setFaceImage(faceName: string, faceIndex: number): void {
    this._faceName = faceName;
    this._faceIndex = faceIndex;
  };

  setBackground(background: number): void {
    this._background = background;
  };

  setPositionType(positionType: number): void {
    this._positionType = positionType;
  };

  setChoices(choices: string[], defaultType: number, cancelType: number): void {
    this._choices = choices;
    this._choiceDefaultType = defaultType;
    this._choiceCancelType = cancelType;
  };

  setChoiceBackground(background: number): void {
    this._choiceBackground = background;
  };

  setChoicePositionType(positionType: number): void {
    this._choicePositionType = positionType;
  };

  setNumberInput(variableId: MZ.VariableID, maxDigits: number): void {
    this._numInputVariableId = variableId;
    this._numInputMaxDigits = maxDigits;
  };

  setItemChoice(variableId: MZ.VariableID, itemType: MZ.ItemTypeID): void {
    this._itemChoiceVariableId = variableId;
    this._itemChoiceItypeId = itemType;
  };

  setScroll(speed: number, noFast: boolean): void {
    this._scrollMode = true;
    this._scrollSpeed = speed;
    this._scrollNoFast = noFast;
  };

  setChoiceCallback(callback: (n: number) => void): void {
    this._choiceCallback = callback;
  };

  onChoice(n: number): void {
    if (this._choiceCallback) {
        this._choiceCallback(n);
        this._choiceCallback = null;
    }
  };

  hasText(): boolean {
    return this._texts.length > 0;
  };

  isChoice(): boolean {
    return this._choices.length > 0;
  };

  isNumberInput(): boolean {
    return this._numInputVariableId > 0;
  };

  isItemChoice(): boolean {
    return this._itemChoiceVariableId > 0;
  };

  isBusy(): boolean {
    return (
        this.hasText() ||
        this.isChoice() ||
        this.isNumberInput() ||
        this.isItemChoice()
    );
  };

  newPage(): void {
    if (this._texts.length > 0) {
        this._texts[this._texts.length - 1] += "\f";
    }
  };

  allText(): string {
    return this._texts.join("\n");
  };

  isRTL(): boolean {
    return Utils.containsArabic(this.allText());
  };
}