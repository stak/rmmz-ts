import { Scene_MenuBase } from '.';
import { Window_Help, Window_SavefileList } from '../windows';
import { DataManager } from '../managers';
import { Rectangle } from '../pixi';
import { Graphics } from '../dom';
import { $gameSystem } from '../managers';

//-----------------------------------------------------------------------------
// Scene_File
//
// The superclass of Scene_Save and Scene_Load.

export class Scene_File extends Scene_MenuBase {
  _listWindow?: Window_SavefileList

  constructor()
  constructor(thisClass: Constructable<Scene_File>)
  constructor(arg?: any) {
    super(Scene_MenuBase);
    if (typeof arg === "function" && arg === Scene_File) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  create(): void {
    super.create();
    DataManager.loadAllSavefileImages();
    this.createHelpWindow();
    this.createListWindow();
    this._helpWindow!.setText(this.helpWindowText());
  };

  helpAreaHeight(): number {
    return 0;
  };

  start(): void {
    super.start();
    this._listWindow!.refresh();
  };

  savefileId(): number {
    return this._listWindow!.savefileId();
  };

  isSavefileEnabled(savefileId: number): boolean {
    return this._listWindow!.isEnabled(savefileId);
  };

  createHelpWindow(): void {
    const rect = this.helpWindowRect();
    this._helpWindow = new Window_Help(rect);
    this.addWindow(this._helpWindow);
  };

  helpWindowRect(): Rectangle {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(1, false);
    return new Rectangle(wx, wy, ww, wh);
  };

  createListWindow(): void {
    const rect = this.listWindowRect();
    this._listWindow = new Window_SavefileList(rect);
    this._listWindow.setHandler("ok", this.onSavefileOk.bind(this));
    this._listWindow.setHandler("cancel", this.popScene.bind(this));
    this._listWindow.setMode(this.mode(), this.needsAutosave());
    this._listWindow.selectSavefile(this.firstSavefileId());
    this._listWindow.refresh();
    this.addWindow(this._listWindow);
  };

  listWindowRect(): Rectangle {
    const wx = 0;
    const wy = this.mainAreaTop() + this._helpWindow!.height;
    const ww = Graphics.boxWidth;
    const wh = this.mainAreaHeight() - this._helpWindow!.height;
    return new Rectangle(wx, wy, ww, wh);
  };

  mode(): string | null {
    return null;
  };

  needsAutosave(): boolean {
    return $gameSystem.isAutosaveEnabled();
  };

  activateListWindow(): void {
    this._listWindow!.activate();
  };

  helpWindowText(): string {
    return "";
  };

  firstSavefileId(): number {
    return 0;
  };

  onSavefileOk(): void {
    //
  };
}
