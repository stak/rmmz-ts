import * as PIXI from 'pixi.js';
import { Scene_Base } from '.';
import { Sprite, Rectangle } from '../pixi';
import { Sprite_Button } from '../sprites';
import { Graphics } from '../dom';
import {
  SceneManager,
  ConfigManager,
  SoundManager,
} from '../managers';
import { Window_Help } from '../windows';
import { $gameParty } from '../managers';
import { Game_Actor } from '../game';

//-----------------------------------------------------------------------------
// Scene_MenuBase
//
// The superclass of all the menu-type scenes.

export class Scene_MenuBase extends Scene_Base {
  _actor?: Game_Actor
  _backgroundFilter?: PIXI.filters.BlurFilter
  _backgroundSprite?: Sprite
  _cancelButton?: Sprite_Button
  _pageupButton?: Sprite_Button
  _pagedownButton?: Sprite_Button
  _helpWindow?: Window_Help

  constructor()
  constructor(thisClass: Constructable<Scene_MenuBase>)
  constructor(arg?: any) {
    super(Scene_Base);
    if (typeof arg === "function" && arg === Scene_MenuBase) {
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
    this.updateActor();
    this.createWindowLayer();
    this.createButtons();
  };

  update(): void {
    super.update();
    this.updatePageButtons();
  };

  helpAreaTop(): number {
    if (this.isBottomHelpMode()) {
        return this.mainAreaBottom();
    } else if (this.isBottomButtonMode()) {
        return 0;
    } else {
        return this.buttonAreaBottom();
    }
  };

  helpAreaBottom(): number {
    return this.helpAreaTop() + this.helpAreaHeight();
  };

  helpAreaHeight(): number {
    return this.calcWindowHeight(2, false);
  };

  mainAreaTop(): number {
    if (!this.isBottomHelpMode()) {
        return this.helpAreaBottom();
    } else if (this.isBottomButtonMode()) {
        return 0;
    } else {
        return this.buttonAreaBottom();
    }
  };

  mainAreaBottom(): number {
    return this.mainAreaTop() + this.mainAreaHeight();
  };

  mainAreaHeight(): number {
    return Graphics.boxHeight - this.buttonAreaHeight() - this.helpAreaHeight();
  };

  actor(): Game_Actor {
    return this._actor!;
  };

  updateActor(): void {
    this._actor = $gameParty.menuActor();
  };

  createBackground(): void {
    this._backgroundFilter = new PIXI.filters.BlurFilter();
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this._backgroundSprite.filters = [this._backgroundFilter];
    this.addChild(this._backgroundSprite);
    this.setBackgroundOpacity(192);
  };

  setBackgroundOpacity(opacity: number): void {
    this._backgroundSprite!.opacity = opacity;
  };

  createHelpWindow(): void {
    const rect = this.helpWindowRect();
    this._helpWindow = new Window_Help(rect);
    this.addWindow(this._helpWindow);
  };

  helpWindowRect(): Rectangle {
    const wx = 0;
    const wy = this.helpAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.helpAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
  };

  createButtons(): void {
    if (ConfigManager.touchUI) {
        if (this.needsCancelButton()) {
            this.createCancelButton();
        }
        if (this.needsPageButtons()) {
            this.createPageButtons();
        }
    }
  };

  needsCancelButton(): boolean {
    return true;
  };

  createCancelButton(): void {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
  };

  needsPageButtons(): boolean {
    return false;
  };

  createPageButtons(): void {
    this._pageupButton = new Sprite_Button("pageup");
    this._pageupButton.x = 4;
    this._pageupButton.y = this.buttonY();
    const pageupRight = this._pageupButton.x + this._pageupButton.width;
    this._pagedownButton = new Sprite_Button("pagedown");
    this._pagedownButton.x = pageupRight + 4;
    this._pagedownButton.y = this.buttonY();
    this.addWindow(this._pageupButton);
    this.addWindow(this._pagedownButton);
    this._pageupButton.setClickHandler(this.previousActor.bind(this));
    this._pagedownButton.setClickHandler(this.nextActor.bind(this));
  };

  updatePageButtons(): void {
    if (this._pageupButton && this._pagedownButton) {
        const enabled = this.arePageButtonsEnabled();
        this._pageupButton.visible = enabled;
        this._pagedownButton.visible = enabled;
    }
  };

  arePageButtonsEnabled(): boolean {
    return true;
  };

  nextActor(): void {
    $gameParty.makeMenuActorNext();
    this.updateActor();
    this.onActorChange();
  };

  previousActor(): void {
    $gameParty.makeMenuActorPrevious();
    this.updateActor();
    this.onActorChange();
  };

  onActorChange(): void {
    SoundManager.playCursor();
  };
}
