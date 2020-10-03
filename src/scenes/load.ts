import { Scene_File } from '.';
import { Scene_Map } from '.';

import { SceneManager, SoundManager, DataManager, TextManager } from '../managers';
import { $gameMap, $gamePlayer, $gameSystem } from '../managers';
import { $dataSystem } from '../managers';

//-----------------------------------------------------------------------------
// Scene_Load
//
// The scene class of the load screen.

export class Scene_Load extends Scene_File {
  _loadSuccess = false

  constructor()
  constructor(thisClass: Constructable<Scene_Load>)
  constructor(arg?: any) {
    super(Scene_File);
    if (typeof arg === "function" && arg === Scene_Load) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this._loadSuccess = false;
  };

  terminate(): void {
    super.terminate();
    if (this._loadSuccess) {
        $gameSystem.onAfterLoad();
    }
  };

  mode(): string {
    return "load";
  };

  helpWindowText(): string {
    return TextManager.loadMessage;
  };

  firstSavefileId(): number {
    return DataManager.latestSavefileId();
  };

  onSavefileOk(): void {
    super.onSavefileOk();
    const savefileId = this.savefileId();
    if (this.isSavefileEnabled(savefileId)) {
        this.executeLoad(savefileId);
    } else {
        this.onLoadFailure();
    }
  };

  executeLoad(savefileId: number): void {
    DataManager.loadGame(savefileId)
        .then(() => this.onLoadSuccess())
        .catch(() => this.onLoadFailure());
  };

  onLoadSuccess(): void {
    SoundManager.playLoad();
    this.fadeOutAll();
    this.reloadMapIfUpdated();
    SceneManager.goto(Scene_Map);
    this._loadSuccess = true;
  };

  onLoadFailure(): void {
    SoundManager.playBuzzer();
    this.activateListWindow();
  };

  reloadMapIfUpdated(): void {
    if ($gameSystem.versionId() !== $dataSystem.versionId) {
        const mapId = $gameMap.mapId();
        const x = $gamePlayer.x;
        const y = $gamePlayer.y;
        $gamePlayer.reserveTransfer(mapId, x, y);
        $gamePlayer.requestMapReload();
    }
  };
}
