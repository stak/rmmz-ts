import { Scene_Base } from '.';
import { Scene_Map } from '.';
import { Scene_Load } from '.';
import { Scene_Options } from '.';
import { DataManager, SceneManager, AudioManager, ImageManager } from '../managers';
import { Graphics } from '../dom';
import { Bitmap, Rectangle, Sprite } from '../pixi';
import { Window_TitleCommand } from '../windows';
import { $gameSystem } from '../managers';
import { $dataSystem } from '../managers';

//-----------------------------------------------------------------------------
// Scene_Title
//
// The scene class of the title screen.

export class Scene_Title extends Scene_Base {
  _commandWindow?: Window_TitleCommand
  _gameTitleSprite?: Sprite
  _backSprite1?: Sprite
  _backSprite2?: Sprite

  constructor()
  constructor(thisClass: Constructable<Scene_Title>)
  constructor(arg?: any) {
    super(Scene_Base);
    if (typeof arg === "function" && arg === Scene_Title) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  create(): void {
    super.create();
    this.createBackground();
    this.createForeground();
    this.createWindowLayer();
    this.createCommandWindow();
  };

  start(): void {
    super.start();
    SceneManager.clearStack();
    this.adjustBackground();
    this.playTitleMusic();
    this.startFadeIn(this.fadeSpeed(), false);
  };

  update(): void {
    if (!this.isBusy()) {
        this._commandWindow!.open();
    }
    super.update();
  };

  isBusy(): boolean {
    return (
        this._commandWindow!.isClosing() ||
        super.isBusy()
    );
  };

  terminate(): void {
    super.terminate();
    SceneManager.snapForBackground();
    if (this._gameTitleSprite) {
        this._gameTitleSprite.bitmap!.destroy();
    }
  };

  createBackground(): void {
    this._backSprite1 = new Sprite(
        ImageManager.loadTitle1($dataSystem.title1Name)
    );
    this._backSprite2 = new Sprite(
        ImageManager.loadTitle2($dataSystem.title2Name)
    );
    this.addChild(this._backSprite1);
    this.addChild(this._backSprite2);
  };

  createForeground(): void {
    this._gameTitleSprite = new Sprite(
        new Bitmap(Graphics.width, Graphics.height)
    );
    this.addChild(this._gameTitleSprite);
    if ($dataSystem.optDrawTitle) {
        this.drawGameTitle();
    }
  };

  drawGameTitle(): void {
    const x = 20;
    const y = Graphics.height / 4;
    const maxWidth = Graphics.width - x * 2;
    const text = $dataSystem.gameTitle;
    const bitmap = this._gameTitleSprite!.bitmap!;
    bitmap.fontFace = $gameSystem.mainFontFace();
    bitmap.outlineColor = "black";
    bitmap.outlineWidth = 8;
    bitmap.fontSize = 72;
    bitmap.drawText(text, x, y, maxWidth, 48, "center");
  };

  adjustBackground(): void {
    this.scaleSprite(this._backSprite1!);
    this.scaleSprite(this._backSprite2!);
    this.centerSprite(this._backSprite1!);
    this.centerSprite(this._backSprite2!);
  };

  createCommandWindow(): void {
    const background = $dataSystem.titleCommandWindow.background;
    const rect = this.commandWindowRect();
    this._commandWindow = new Window_TitleCommand(rect);
    this._commandWindow.setBackgroundType(background);
    this._commandWindow.setHandler("newGame", this.commandNewGame.bind(this));
    this._commandWindow.setHandler("continue", this.commandContinue.bind(this));
    this._commandWindow.setHandler("options", this.commandOptions.bind(this));
    this.addWindow(this._commandWindow);
  };

  commandWindowRect(): Rectangle {
    const offsetX = $dataSystem.titleCommandWindow.offsetX;
    const offsetY = $dataSystem.titleCommandWindow.offsetY;
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(3, true);
    const wx = (Graphics.boxWidth - ww) / 2 + offsetX;
    const wy = Graphics.boxHeight - wh - 96 + offsetY;
    return new Rectangle(wx, wy, ww, wh);
  };

  commandNewGame(): void {
    DataManager.setupNewGame();
    this._commandWindow!.close();
    this.fadeOutAll();
    SceneManager.goto(Scene_Map);
  };

  commandContinue(): void {
    this._commandWindow!.close();
    SceneManager.push(Scene_Load);
  };

  commandOptions(): void {
    this._commandWindow!.close();
    SceneManager.push(Scene_Options);
  };

  playTitleMusic(): void {
    AudioManager.playBgm($dataSystem.titleBgm);
    AudioManager.stopBgs();
    AudioManager.stopMe();
  };
}
