import { Scene_Base } from '.';
import { Scene_Title } from '.';
import { Scene_Battle } from '.';
import { Scene_Map } from '.';
import { SceneManager, SoundManager, ColorManager, ImageManager, FontManager, ConfigManager, DataManager, StorageManager } from '../managers';
import { Graphics, Utils } from '../dom';
import { Window_TitleCommand } from '../windows';
import { $dataSystem } from '../managers';

//-----------------------------------------------------------------------------
// Scene_Boot
//
// The scene class for initializing the entire game.

export class Scene_Boot extends Scene_Base {
  _databaseLoaded = false

  constructor()
  constructor(thisClass: Constructable<Scene_Boot>)
  constructor(arg?: any) {
    super(Scene_Base);
    if (typeof arg === "function" && arg === Scene_Boot) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this._databaseLoaded = false;
  };

  create(): void {
    super.create();
    DataManager.loadDatabase();
    StorageManager.updateForageKeys();
  };

  isReady(): boolean {
    if (!this._databaseLoaded) {
        if (
            DataManager.isDatabaseLoaded() &&
            StorageManager.forageKeysUpdated()
        ) {
            this._databaseLoaded = true;
            this.onDatabaseLoaded();
        }
        return false;
    }
    return super.isReady() && this.isPlayerDataLoaded();
  };

  onDatabaseLoaded(): void {
    this.setEncryptionInfo();
    this.loadSystemImages();
    this.loadPlayerData();
    this.loadGameFonts();
  };

  setEncryptionInfo(): void {
    const hasImages = $dataSystem.hasEncryptedImages;
    const hasAudio = $dataSystem.hasEncryptedAudio;
    const key = $dataSystem.encryptionKey;
    Utils.setEncryptionInfo(hasImages, hasAudio, key);
  };

  loadSystemImages(): void {
    ColorManager.loadWindowskin();
    ImageManager.loadSystem("IconSet");
  };

  loadPlayerData(): void {
    DataManager.loadGlobalInfo();
    ConfigManager.load();
  };

  loadGameFonts(): void {
    const advanced = $dataSystem.advanced;
    FontManager.load("rmmz-mainfont", advanced.mainFontFilename);
    FontManager.load("rmmz-numberfont", advanced.numberFontFilename);
  };

  isPlayerDataLoaded(): boolean {
    return DataManager.isGlobalInfoLoaded() && ConfigManager.isLoaded();
  };

  start(): void {
    super.start();
    SoundManager.preloadImportantSounds();
    if (DataManager.isBattleTest()) {
        DataManager.setupBattleTest();
        SceneManager.goto(Scene_Battle);
    } else if (DataManager.isEventTest()) {
        DataManager.setupEventTest();
        SceneManager.goto(Scene_Map);
    } else {
        this.startNormalGame();
    }
    this.resizeScreen();
    this.updateDocumentTitle();
  };

  startNormalGame(): void {
    this.checkPlayerLocation();
    DataManager.setupNewGame();
    SceneManager.goto(Scene_Title);
    Window_TitleCommand.initCommandPosition();
  };

  resizeScreen(): void {
    const screenWidth = $dataSystem.advanced.screenWidth;
    const screenHeight = $dataSystem.advanced.screenHeight;
    Graphics.resize(screenWidth, screenHeight);
    this.adjustBoxSize();
    this.adjustWindow();
  };

  adjustBoxSize(): void {
    const uiAreaWidth = $dataSystem.advanced.uiAreaWidth;
    const uiAreaHeight = $dataSystem.advanced.uiAreaHeight;
    const boxMargin = 4;
    Graphics.boxWidth = uiAreaWidth - boxMargin * 2;
    Graphics.boxHeight = uiAreaHeight - boxMargin * 2;
  };

  adjustWindow(): void {
    if (Utils.isNwjs()) {
        const xDelta = Graphics.width - window.innerWidth;
        const yDelta = Graphics.height - window.innerHeight;
        window.moveBy(-xDelta / 2, -yDelta / 2);
        window.resizeBy(xDelta, yDelta);
    }
  };

  updateDocumentTitle(): void {
    document.title = $dataSystem.gameTitle;
  };

  checkPlayerLocation(): void {
    if ($dataSystem.startMapId === 0) {
        throw new Error("Player's starting position is not set");
    }
  };
}
