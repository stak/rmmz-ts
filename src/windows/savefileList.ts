import { Window_Selectable } from '.';
import { TextManager, DataManager } from '../managers';
import { MZ } from '../MZ';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_SavefileList
//
// The window for selecting a save file on the save and load screens.

export class Window_SavefileList extends Window_Selectable {
  _mode: string | null = null
  _autosave = false

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_SavefileList>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_SavefileList) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.activate();
    this._mode = null;
    this._autosave = false;
  };

  setMode(mode: string, autosave: boolean): void {
    this._mode = mode;
    this._autosave = autosave;
    this.refresh();
  };

  maxItems(): number {
    return DataManager.maxSavefiles() - (this._autosave ? 0 : 1);
  };

  numVisibleRows(): number {
    return 5;
  };

  itemHeight(): number {
    return Math.floor(this.innerHeight / this.numVisibleRows());
  };

  drawItem(index: number): void {
    const savefileId = this.indexToSavefileId(index);
    const info = DataManager.savefileInfo(savefileId);
    const rect = this.itemRectWithPadding(index);
    this.resetTextColor();
    this.changePaintOpacity(this.isEnabled(savefileId));
    this.drawTitle(savefileId, rect.x, rect.y + 4);
    if (info) {
        this.drawContents(info, rect);
    }
  };

  indexToSavefileId(index: number): number {
    return index + (this._autosave ? 0 : 1);
  };

  savefileIdToIndex(savefileId: number): number {
    return savefileId - (this._autosave ? 0 : 1);
  };

  isEnabled(savefileId: number): boolean {
    if (this._mode === "save") {
        return savefileId > 0;
    } else {
        return !!DataManager.savefileInfo(savefileId);
    }
  };

  savefileId(): number {
    return this.indexToSavefileId(this.index());
  };

  selectSavefile(savefileId: number): void {
    const index = Math.max(0, this.savefileIdToIndex(savefileId));
    this.select(index);
    this.setTopRow(index - 2);
  };

  drawTitle(savefileId: number, x: number, y: number): void {
    if (savefileId === 0) {
        this.drawText(TextManager.autosave, x, y, 180);
    } else {
        this.drawText(TextManager.file + " " + savefileId, x, y, 180);
    }
  };

  drawContents(info: MZ.SaveFileInfo, rect: Rectangle): void {
    const bottom = rect.y + rect.height;
    if (rect.width >= 420) {
        this.drawPartyCharacters(info, rect.x + 220, bottom - 8);
    }
    const lineHeight = this.lineHeight();
    const y2 = bottom - lineHeight - 4;
    if (y2 >= lineHeight) {
        this.drawPlaytime(info, rect.x, y2, rect.width);
    }
  };

  drawPartyCharacters(info: MZ.SaveFileInfo, x: number, y: number): void {
    if (info.characters) {
        let characterX = x;
        for (const data of info.characters) {
            this.drawCharacter(data[0], data[1], characterX, y);
            characterX += 48;
        }
    }
  };

  drawPlaytime(info: MZ.SaveFileInfo, x: number, y: number, width: number): void {
    if (info.playtime) {
        this.drawText(info.playtime, x, y, width, "right");
    }
  };

  playOkSound(): void {
    //
  };
}
