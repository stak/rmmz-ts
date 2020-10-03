import { Graphics } from '../dom';
import { AudioManager } from '../managers';
import { $dataSystem, $dataMap } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_System
//
// The game object class for the system data.

export class Game_System {
  _saveEnabled = true
  _menuEnabled = true
  _encounterEnabled = true
  _formationEnabled = true
  _battleCount = 0
  _winCount = 0
  _escapeCount = 0
  _saveCount = 0
  _versionId = 0
  _savefileId = 0
  _framesOnSave = 0
  _bgmOnSave: MZ.AudioParam | null = null
  _bgsOnSave: MZ.AudioParam | null = null
  _windowTone: MZ.RGBAColorArray | null = null
  _battleBgm: MZ.AudioParam | null = null
  _victoryMe: MZ.AudioParam | null = null
  _defeatMe: MZ.AudioParam | null = null
  _savedBgm: MZ.AudioParam | null = null
  _walkingBgm: MZ.AudioParam | null = null

  constructor()
  constructor(thisClass: Constructable<Game_System>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_System) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this._saveEnabled = true;
    this._menuEnabled = true;
    this._encounterEnabled = true;
    this._formationEnabled = true;
    this._battleCount = 0;
    this._winCount = 0;
    this._escapeCount = 0;
    this._saveCount = 0;
    this._versionId = 0;
    this._savefileId = 0;
    this._framesOnSave = 0;
    this._bgmOnSave = null;
    this._bgsOnSave = null;
    this._windowTone = null;
    this._battleBgm = null;
    this._victoryMe = null;
    this._defeatMe = null;
    this._savedBgm = null;
    this._walkingBgm = null;
  }

  isJapanese(): RegExpMatchArray | null {
    return $dataSystem.locale.match(/^ja/);
  }

  isChinese(): RegExpMatchArray | null {
    return $dataSystem.locale.match(/^zh/);
  }

  isKorean(): RegExpMatchArray | null {
    return $dataSystem.locale.match(/^ko/);
  }

  isCJK(): RegExpMatchArray | null {
    return $dataSystem.locale.match(/^(ja|zh|ko)/);
  }

  isRussian(): RegExpMatchArray | null {
    return $dataSystem.locale.match(/^ru/);
  }

  isSideView(): boolean {
    return $dataSystem.optSideView;
  }

  isAutosaveEnabled(): boolean {
    return $dataSystem.optAutosave;
  }

  isSaveEnabled(): boolean {
    return this._saveEnabled;
  }

  disableSave(): void {
    this._saveEnabled = false;
  }

  enableSave(): void {
    this._saveEnabled = true;
  }

  isMenuEnabled(): boolean {
    return this._menuEnabled;
  }

  disableMenu(): void {
    this._menuEnabled = false;
  }

  enableMenu(): void {
    this._menuEnabled = true;
  }

  isEncounterEnabled(): boolean {
    return this._encounterEnabled;
  }

  disableEncounter(): void {
    this._encounterEnabled = false;
  }

  enableEncounter(): void {
    this._encounterEnabled = true;
  }

  isFormationEnabled(): boolean {
    return this._formationEnabled;
  }

  disableFormation(): void {
    this._formationEnabled = false;
  }

  enableFormation(): void {
    this._formationEnabled = true;
  }

  battleCount(): number {
    return this._battleCount;
  }

  winCount(): number {
    return this._winCount;
  }

  escapeCount(): number {
    return this._escapeCount;
  }

  saveCount(): number {
    return this._saveCount;
  }

  versionId(): number {
    return this._versionId;
  }

  savefileId(): number {
    return this._savefileId || 0;
  }

  setSavefileId(savefileId: number): void {
    this._savefileId = savefileId;
  }

  windowTone(): MZ.RGBAColorArray {
    return this._windowTone || $dataSystem.windowTone;
  }

  setWindowTone(value: MZ.RGBAColorArray): void {
    this._windowTone = value;
  }

  battleBgm(): MZ.AudioParam {
    return this._battleBgm || $dataSystem.battleBgm;
  }

  setBattleBgm(value: MZ.AudioParam): void {
    this._battleBgm = value;
  }

  victoryMe(): MZ.AudioParam {
    return this._victoryMe || $dataSystem.victoryMe;
  }

  setVictoryMe(value: MZ.AudioParam): void {
    this._victoryMe = value;
  }

  defeatMe(): MZ.AudioParam {
    return this._defeatMe || $dataSystem.defeatMe;
  }

  setDefeatMe(value: MZ.AudioParam): void {
    this._defeatMe = value;
  }

  onBattleStart(): void {
    this._battleCount++;
  }

  onBattleWin(): void {
    this._winCount++;
  }

  onBattleEscape(): void {
    this._escapeCount++;
  }

  onBeforeSave(): void {
    this._saveCount++;
    this._versionId = $dataSystem.versionId;
    this._framesOnSave = Graphics.frameCount;
    this._bgmOnSave = AudioManager.saveBgm();
    this._bgsOnSave = AudioManager.saveBgs();
  }

  onAfterLoad(): void {
    Graphics.frameCount = this._framesOnSave;
    AudioManager.playBgm(this._bgmOnSave!);
    AudioManager.playBgs(this._bgsOnSave!);
  }

  playtime(): number {
    return Math.floor(Graphics.frameCount / 60);
  }

  playtimeText(): string {
    const hour = Math.floor(this.playtime() / 60 / 60);
    const min = Math.floor(this.playtime() / 60) % 60;
    const sec = this.playtime() % 60;
    return hour.padZero(2) + ":" + min.padZero(2) + ":" + sec.padZero(2);
  }

  saveBgm(): void {
    this._savedBgm = AudioManager.saveBgm();
  }

  replayBgm(): void {
    if (this._savedBgm) {
        AudioManager.replayBgm(this._savedBgm);
    }
  }

  saveWalkingBgm(): void {
    this._walkingBgm = AudioManager.saveBgm();
  }

  replayWalkingBgm(): void {
    if (this._walkingBgm) {
        AudioManager.playBgm(this._walkingBgm);
    }
  }

  saveWalkingBgm2(): void {
    this._walkingBgm = $dataMap.bgm;
  }

  mainFontFace(): string {
    return "rmmz-mainfont, " + $dataSystem.advanced.fallbackFonts;
  }

  numberFontFace(): string {
    return "rmmz-numberfont, " + this.mainFontFace();
  }

  mainFontSize(): number {
    return $dataSystem.advanced.fontSize;
  }

  windowPadding(): number {
    return 12;
  }
}
