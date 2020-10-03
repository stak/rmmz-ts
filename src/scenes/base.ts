import { Sprite, Stage, Window, WindowLayer, ColorFilter } from '../pixi';
import { SceneManager, AudioManager, DataManager, ImageManager, EffectManager, FontManager } from '../managers';
import { Graphics } from '../dom';
import { Window_Base, Window_Selectable } from '../windows';
import { $gameParty, $gameSystem } from '../managers';
import { Scene_Gameover } from '.';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Scene_Base
//
// The superclass of all scenes within the game.

export class Scene_Base extends Stage {
  _started = false
  _active = false
  _fadeSign = 0
  _fadeDuration = 0
  _fadeWhite?: boolean | number = 0
  _fadeOpacity = 0
  _windowLayer?: WindowLayer
  _colorFilter?: ColorFilter

  constructor()
  constructor(thisClass: Constructable<Scene_Base>)
  constructor(arg?: any) {
    super(Stage);
    if (typeof arg === "function" && arg === Scene_Base) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this._started = false;
    this._active = false;
    this._fadeSign = 0;
    this._fadeDuration = 0;
    this._fadeWhite = 0;
    this._fadeOpacity = 0;
    this.createColorFilter();
  };

  create(): void {
    //
  };

  isActive(): boolean {
    return this._active;
  };

  isReady(): boolean {
    return (
        ImageManager.isReady() &&
        EffectManager.isReady() &&
        FontManager.isReady()
    );
  };

  start(): void {
    this._started = true;
    this._active = true;
  };

  update(): void {
    this.updateFade();
    this.updateColorFilter();
    this.updateChildren();
    AudioManager.checkErrors();
  };

  stop(): void {
    this._active = false;
  };

  isStarted(): boolean {
    return this._started;
  };

  isBusy(): boolean {
    return this.isFading();
  };

  isFading(): boolean {
    return this._fadeDuration > 0;
  };

  terminate(): void {
    //
  };

  createWindowLayer(): void {
    this._windowLayer = new WindowLayer();
    this._windowLayer.x = (Graphics.width - Graphics.boxWidth) / 2;
    this._windowLayer.y = (Graphics.height - Graphics.boxHeight) / 2;
    this.addChild(this._windowLayer);
  };

  addWindow(window: PIXI.DisplayObject): void {
    this._windowLayer!.addChild(window);
  };

  startFadeIn(duration: number, white?: number | boolean): void {
    this._fadeSign = 1;
    this._fadeDuration = duration || 30;
    this._fadeWhite = white;
    this._fadeOpacity = 255;
    this.updateColorFilter();
  };

  startFadeOut(duration: number, white?: number | boolean): void {
    this._fadeSign = -1;
    this._fadeDuration = duration || 30;
    this._fadeWhite = white;
    this._fadeOpacity = 0;
    this.updateColorFilter();
  };

  createColorFilter(): void {
    this._colorFilter = new ColorFilter();
    this.filters = [this._colorFilter];
  };

  updateColorFilter(): void {
    const c = this._fadeWhite ? 255 : 0;
    const blendColor = [c, c, c, this._fadeOpacity] as MZ.RGBAColorArray;
    this._colorFilter!.setBlendColor(blendColor);
  };

  updateFade(): void {
    if (this._fadeDuration > 0) {
        const d = this._fadeDuration;
        if (this._fadeSign > 0) {
            this._fadeOpacity -= this._fadeOpacity / d;
        } else {
            this._fadeOpacity += (255 - this._fadeOpacity) / d;
        }
        this._fadeDuration--;
    }
  };

  updateChildren(): void {
    for (const child of this.children) {
        if ((child as any).update) {
            (child as any).update();
        }
    }
  };

  popScene(): void {
    SceneManager.pop();
  };

  checkGameover(): void {
    if ($gameParty.isAllDead()) {
        SceneManager.goto(Scene_Gameover);
    }
  };

  fadeOutAll(): void {
    const time = this.slowFadeSpeed() / 60;
    AudioManager.fadeOutBgm(time);
    AudioManager.fadeOutBgs(time);
    AudioManager.fadeOutMe(time);
    this.startFadeOut(this.slowFadeSpeed());
  };

  fadeSpeed(): number {
    return 24;
  };

  slowFadeSpeed(): number {
    return this.fadeSpeed() * 2;
  };

  scaleSprite(sprite: Sprite): void {
    const ratioX = Graphics.width / sprite.bitmap!.width;
    const ratioY = Graphics.height / sprite.bitmap!.height;
    const scale = Math.max(ratioX, ratioY, 1.0);
    sprite.scale.x = scale;
    sprite.scale.y = scale;
  };

  centerSprite(sprite: Sprite): void {
    sprite.x = Graphics.width / 2;
    sprite.y = Graphics.height / 2;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
  };

  isBottomHelpMode(): boolean {
    return true;
  };

  isBottomButtonMode(): boolean {
    return false;
  };

  isRightInputMode(): boolean {
    return true;
  };

  mainCommandWidth(): number {
    return 240;
  };

  buttonAreaTop(): number {
    if (this.isBottomButtonMode()) {
        return Graphics.boxHeight - this.buttonAreaHeight();
    } else {
        return 0;
    }
  };

  buttonAreaBottom(): number {
    return this.buttonAreaTop() + this.buttonAreaHeight();
  };

  buttonAreaHeight(): number {
    return 52;
  };

  buttonY(): number {
    const offsetY = Math.floor((this.buttonAreaHeight() - 48) / 2);
    return this.buttonAreaTop() + offsetY;
  };

  calcWindowHeight(numLines: number, selectable: boolean): number {
    if (selectable) {
        return Window_Selectable.prototype.fittingHeight(numLines);
    } else {
        return Window_Base.prototype.fittingHeight(numLines);
    }
  };

  requestAutosave(): void {
    if (this.isAutosaveEnabled()) {
        this.executeAutosave();
    }
  };

  isAutosaveEnabled(): boolean {
    return (
        !DataManager.isBattleTest() &&
        !DataManager.isEventTest() &&
        $gameSystem.isAutosaveEnabled() &&
        $gameSystem.isSaveEnabled()
    );
  };

  executeAutosave(): void {
    $gameSystem.onBeforeSave();
    DataManager.saveGame(0)
        .then(() => this.onAutosaveSuccess())
        .catch(() => this.onAutosaveFailure());
  };

  onAutosaveSuccess(): void {
    //
  };

  onAutosaveFailure(): void {
    //
  };
}
