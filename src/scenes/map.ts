import { Scene_Message } from '.';
import { Scene_Battle } from '.';
import { Scene_Load } from '.';
import { Scene_Title } from '.';
import { Scene_Gameover } from '.';
import { Scene_Menu } from '.';
import { Scene_Debug } from '.';
import {
  AudioManager,
  BattleManager,
  DataManager,
  ImageManager,
  EffectManager,
  SceneManager,
  ConfigManager,
  SoundManager,
} from '../managers';
import { Graphics, Input, TouchInput } from '../dom';
import { Rectangle } from '../pixi';
import { Window_MapName, Window_MenuCommand } from '../windows';
import { Spriteset_Map, Sprite_Button } from '../sprites';
import { $gameMap, $gameMessage, $gamePlayer, $gameScreen, $gameSystem, $gameTemp, $gameTimer } from '../managers';
import { $dataMap } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.

export class Scene_Map extends Scene_Message {
  _waitCount = 0
  _encounterEffectDuration = 0
  _mapLoaded = false
  _touchCount = 0
  _menuEnabled = false
  _transfer = false
  _lastMapWasNull = false
  
  _mapNameWindow?: Window_MapName
  _menuButton?: Sprite_Button
  _spriteset?: Spriteset_Map

  menuCalling = false

  constructor()
  constructor(thisClass: Constructable<Scene_Battle>)
  constructor(arg?: any) {
    super(Scene_Message);
    if (typeof arg === "function" && arg === Scene_Battle) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this._waitCount = 0;
    this._encounterEffectDuration = 0;
    this._mapLoaded = false;
    this._touchCount = 0;
    this._menuEnabled = false;
  };

  create(): void {
    super.create();
    this._transfer = $gamePlayer.isTransferring();
    this._lastMapWasNull = !$dataMap;
    if (this._transfer) {
        DataManager.loadMapData($gamePlayer.newMapId());
        this.onTransfer();
    } else if (!$dataMap || ($dataMap as any).id !== $gameMap.mapId()) {
        DataManager.loadMapData($gameMap.mapId());
    }
  };

  isReady(): boolean {
    if (!this._mapLoaded && DataManager.isMapLoaded()) {
        this.onMapLoaded();
        this._mapLoaded = true;
    }
    return this._mapLoaded && super.isReady();
  };

  onMapLoaded(): void {
    if (this._transfer) {
        $gamePlayer.performTransfer();
    }
    this.createDisplayObjects();
  };

  onTransfer(): void {
    ImageManager.clear();
    EffectManager.clear();
  };

  start(): void {
    super.start();
    SceneManager.clearStack();
    if (this._transfer) {
        this.fadeInForTransfer();
        this.onTransferEnd();
    } else if (this.needsFadeIn()) {
        this.startFadeIn(this.fadeSpeed(), false);
    }
    this.menuCalling = false;
  };

  onTransferEnd(): void {
    this._mapNameWindow!.open();
    $gameMap.autoplay();
    if (this.shouldAutosave()) {
        this.requestAutosave();
    }
  };

  shouldAutosave(): boolean {
    return !this._lastMapWasNull;
  };

  update(): void {
    super.update();
    this.updateDestination();
    this.updateMenuButton();
    this.updateMapNameWindow();
    this.updateMainMultiply();
    if (this.isSceneChangeOk()) {
        this.updateScene();
    } else if (SceneManager.isNextScene(Scene_Battle)) {
        this.updateEncounterEffect();
    }
    this.updateWaitCount();
  };

  updateMainMultiply(): void {
    if (this.isFastForward()) {
        this.updateMain();
    }
    this.updateMain();
  };

  updateMain(): void {
    $gameMap.update(this.isActive());
    $gamePlayer.update(this.isPlayerActive());
    $gameTimer.update(this.isActive());
    $gameScreen.update();
  };

  isPlayerActive(): boolean {
    return this.isActive() && !this.isFading();
  };

  isFastForward(): boolean {
    return (
        $gameMap.isEventRunning() &&
        !SceneManager.isSceneChanging() &&
        (Input.isLongPressed("ok") || TouchInput.isLongPressed())
    );
  };

  stop(): void {
    super.stop();
    $gamePlayer.straighten();
    this._mapNameWindow!.close();
    if (this.needsSlowFadeOut()) {
        this.startFadeOut(this.slowFadeSpeed(), false);
    } else if (SceneManager.isNextScene(Scene_Map)) {
        this.fadeOutForTransfer();
    } else if (SceneManager.isNextScene(Scene_Battle)) {
        this.launchBattle();
    }
  };

  isBusy(): boolean {
    return (
        this.isMessageWindowClosing() ||
        this._waitCount > 0 ||
        this._encounterEffectDuration > 0 ||
        super.isBusy()
    );
  };

  terminate(): void {
    super.terminate();
    if (!SceneManager.isNextScene(Scene_Battle)) {
        this._spriteset!.update();
        this._mapNameWindow!.hide();
        this.hideMenuButton();
        SceneManager.snapForBackground();
    }
    $gameScreen.clearZoom();
  };

  needsFadeIn(): boolean {
    return (
        SceneManager.isPreviousScene(Scene_Battle) ||
        SceneManager.isPreviousScene(Scene_Load)
    );
  };

  needsSlowFadeOut(): boolean {
    return (
        SceneManager.isNextScene(Scene_Title) ||
        SceneManager.isNextScene(Scene_Gameover)
    );
  };

  updateWaitCount(): boolean {
    if (this._waitCount > 0) {
        this._waitCount--;
        return true;
    }
    return false;
  };

  updateDestination(): void {
    if (this.isMapTouchOk()) {
        this.processMapTouch();
    } else {
        $gameTemp.clearDestination();
        this._touchCount = 0;
    }
  };

  updateMenuButton(): void {
    if (this._menuButton) {
        const menuEnabled = this.isMenuEnabled();
        if (menuEnabled === this._menuEnabled) {
            this._menuButton.visible = this._menuEnabled;
        } else {
            this._menuEnabled = menuEnabled;
        }
    }
  };

  hideMenuButton(): void {
    if (this._menuButton) {
        this._menuButton.visible = false;
        this._menuEnabled = false;
    }
  };

  updateMapNameWindow(): void {
    if ($gameMessage.isBusy()) {
        this._mapNameWindow!.close();
    }
  };

  isMenuEnabled(): boolean {
    return $gameSystem.isMenuEnabled() && !$gameMap.isEventRunning();
  };

  isMapTouchOk(): boolean {
    return this.isActive() && $gamePlayer.canMove();
  };

  processMapTouch(): void {
    if (TouchInput.isTriggered() || this._touchCount > 0) {
        if (TouchInput.isPressed() && !this.isAnyButtonPressed()) {
            if (this._touchCount === 0 || this._touchCount >= 15) {
                this.onMapTouch();
            }
            this._touchCount++;
        } else {
            this._touchCount = 0;
        }
    }
  };

  isAnyButtonPressed(): boolean {
    return !!this._menuButton && this._menuButton.isPressed();
  };

  onMapTouch(): void {
    const x = $gameMap.canvasToMapX(TouchInput.x);
    const y = $gameMap.canvasToMapY(TouchInput.y);
    $gameTemp.setDestination(x, y);
  };

  isSceneChangeOk(): boolean {
    return this.isActive() && !$gameMessage.isBusy();
  };

  updateScene(): void {
    this.checkGameover();
    if (!SceneManager.isSceneChanging()) {
        this.updateTransferPlayer();
    }
    if (!SceneManager.isSceneChanging()) {
        this.updateEncounter();
    }
    if (!SceneManager.isSceneChanging()) {
        this.updateCallMenu();
    }
    if (!SceneManager.isSceneChanging()) {
        this.updateCallDebug();
    }
  };

  createDisplayObjects(): void {
    this.createSpriteset();
    this.createWindowLayer();
    this.createAllWindows();
    this.createButtons();
  };

  createSpriteset(): void {
    this._spriteset = new Spriteset_Map();
    this.addChild(this._spriteset);
    this._spriteset.update();
  };

  createAllWindows(): void {
    this.createMapNameWindow();
    super.createAllWindows();
  };

  createMapNameWindow(): void {
    const rect = this.mapNameWindowRect();
    this._mapNameWindow = new Window_MapName(rect);
    this.addWindow(this._mapNameWindow);
  };

  mapNameWindowRect(): Rectangle {
    const wx = 0;
    const wy = 0;
    const ww = 360;
    const wh = this.calcWindowHeight(1, false);
    return new Rectangle(wx, wy, ww, wh);
  };

  createButtons(): void {
    if (ConfigManager.touchUI) {
        this.createMenuButton();
    }
  };

  createMenuButton(): void {
    this._menuButton = new Sprite_Button("menu");
    this._menuButton.x = Graphics.boxWidth - this._menuButton.width - 4;
    this._menuButton.y = this.buttonY();
    this._menuButton.visible = false;
    this.addWindow(this._menuButton);
  };

  updateTransferPlayer(): void {
    if ($gamePlayer.isTransferring()) {
        SceneManager.goto(Scene_Map);
    }
  };

  updateEncounter(): void {
    if ($gamePlayer.executeEncounter()) {
        SceneManager.push(Scene_Battle);
    }
  };

  updateCallMenu(): void {
    if (this.isMenuEnabled()) {
        if (this.isMenuCalled()) {
            this.menuCalling = true;
        }
        if (this.menuCalling && !$gamePlayer.isMoving()) {
            this.callMenu();
        }
    } else {
        this.menuCalling = false;
    }
  };

  isMenuCalled(): boolean {
    return Input.isTriggered("menu") || TouchInput.isCancelled();
  };

  callMenu(): void {
    SoundManager.playOk();
    SceneManager.push(Scene_Menu);
    Window_MenuCommand.initCommandPosition();
    $gameTemp.clearDestination();
    this._mapNameWindow!.hide();
    this._waitCount = 2;
  };

  updateCallDebug(): void {
    if (this.isDebugCalled()) {
        SceneManager.push(Scene_Debug);
    }
  };

  isDebugCalled(): boolean {
    return Input.isTriggered("debug") && $gameTemp.isPlaytest();
  };

  fadeInForTransfer(): void {
    const fadeType = $gamePlayer.fadeType();
    switch (fadeType) {
        case 0:
        case 1:
            this.startFadeIn(this.fadeSpeed(), fadeType === 1);
            break;
    }
  };

  fadeOutForTransfer(): void {
    const fadeType = $gamePlayer.fadeType();
    switch (fadeType) {
        case 0:
        case 1:
            this.startFadeOut(this.fadeSpeed(), fadeType === 1);
            break;
    }
  };

  launchBattle(): void {
    BattleManager.saveBgmAndBgs();
    this.stopAudioOnBattleStart();
    SoundManager.playBattleStart();
    this.startEncounterEffect();
    this._mapNameWindow!.hide();
  };

  stopAudioOnBattleStart(): void {
    if (!AudioManager.isCurrentBgm($gameSystem.battleBgm())) {
        AudioManager.stopBgm();
    }
    AudioManager.stopBgs();
    AudioManager.stopMe();
    AudioManager.stopSe();
  };

  startEncounterEffect(): void {
    this._spriteset!.hideCharacters();
    this._encounterEffectDuration = this.encounterEffectSpeed();
  };

  updateEncounterEffect(): void {
    if (this._encounterEffectDuration > 0) {
        this._encounterEffectDuration--;
        const speed = this.encounterEffectSpeed();
        const n = speed - this._encounterEffectDuration;
        const p = n / speed;
        const q = ((p - 1) * 20 * p + 5) * p + 1;
        const zoomX = $gamePlayer.screenX();
        const zoomY = $gamePlayer.screenY() - 24;
        if (n === 2) {
            $gameScreen.setZoom(zoomX, zoomY, 1);
            this.snapForBattleBackground();
            this.startFlashForEncounter(speed / 2);
        }
        $gameScreen.setZoom(zoomX, zoomY, q);
        if (n === Math.floor(speed / 6)) {
            this.startFlashForEncounter(speed / 2);
        }
        if (n === Math.floor(speed / 2)) {
            BattleManager.playBattleBgm();
            this.startFadeOut(this.fadeSpeed());
        }
    }
  };

  snapForBattleBackground(): void {
    this._windowLayer!.visible = false;
    SceneManager.snapForBackground();
    this._windowLayer!.visible = true;
  };

  startFlashForEncounter(duration: number): void {
    const color = [255, 255, 255, 255] as MZ.RGBAColorArray;
    $gameScreen.startFlash(color, duration);
  };

  encounterEffectSpeed(): number {
    return 60;
  };
}
