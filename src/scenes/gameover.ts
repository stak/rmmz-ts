import { Scene_Base } from '.';
import { Scene_Title } from '.';
import { SceneManager, AudioManager, ImageManager } from '../managers';
import { Input, TouchInput } from '../dom';
import { Sprite } from '../pixi';
import { $dataSystem } from '../managers';

//-----------------------------------------------------------------------------
// Scene_Gameover
//
// The scene class of the game over screen.

export class Scene_Gameover extends Scene_Base {
  _backSprite?: Sprite

  constructor()
  constructor(thisClass: Constructable<Scene_Gameover>)
  constructor(arg?: any) {
    super(Scene_Base);
    if (typeof arg === "function" && arg === Scene_Gameover) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  create(): void {
    super.create();
    this.playGameoverMusic();
    this.createBackground();
  };

  start(): void {
    super.start();
    this.adjustBackground();
    this.startFadeIn(this.slowFadeSpeed(), false);
  };

  update(): void {
    if (this.isActive() && !this.isBusy() && this.isTriggered()) {
        this.gotoTitle();
    }
    super.update();
  };

  stop(): void {
    super.stop();
    this.fadeOutAll();
  };

  terminate(): void {
    super.terminate();
    AudioManager.stopAll();
  };

  playGameoverMusic(): void {
    AudioManager.stopBgm();
    AudioManager.stopBgs();
    AudioManager.playMe($dataSystem.gameoverMe);
  };

  createBackground(): void {
    this._backSprite = new Sprite();
    this._backSprite.bitmap = ImageManager.loadSystem("GameOver");
    this.addChild(this._backSprite);
  };

  adjustBackground(): void {
    this.scaleSprite(this._backSprite!);
    this.centerSprite(this._backSprite!);
  };

  isTriggered(): boolean {
    return Input.isTriggered("ok") || TouchInput.isTriggered();
  };

  gotoTitle(): void {
    SceneManager.goto(Scene_Title);
  };
}
