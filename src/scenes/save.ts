import { Scene_File } from '.';

import { SoundManager, DataManager, TextManager } from '../managers';
import { $gameSystem } from '../managers';

//-----------------------------------------------------------------------------
// Scene_Save
//
// The scene class of the save screen.

export class Scene_Save extends Scene_File {
  constructor()
  constructor(thisClass: Constructable<Scene_Save>)
  constructor(arg?: any) {
    super(Scene_File);
    if (typeof arg === "function" && arg === Scene_Save) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  mode(): string {
    return "save";
  };

  helpWindowText(): string {
    return TextManager.saveMessage;
  };

  firstSavefileId(): number {
    return $gameSystem.savefileId();
  };

  onSavefileOk(): void {
    super.onSavefileOk();
    const savefileId = this.savefileId();
    if (this.isSavefileEnabled(savefileId)) {
        this.executeSave(savefileId);
    } else {
        this.onSaveFailure();
    }
  };

  executeSave(savefileId: number): void {
    $gameSystem.setSavefileId(savefileId);
    $gameSystem.onBeforeSave();
    DataManager.saveGame(savefileId)
        .then(() => this.onSaveSuccess())
        .catch(() => this.onSaveFailure());
  };

  onSaveSuccess(): void {
    SoundManager.playSave();
    this.popScene();
  };

  onSaveFailure(): void {
    SoundManager.playBuzzer();
    this.activateListWindow();
  };
}
