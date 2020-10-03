import { Scene_ItemBase } from './';

import { Window_ItemCategory, Window_ItemList } from '../windows';
import { Rectangle } from '../pixi';
import { Graphics } from '../dom';
import { SoundManager } from '../managers';
import { $gameParty } from '../managers';
import { Game_Battler } from '../game';

//-----------------------------------------------------------------------------
// Scene_Item
//
// The scene class of the item screen.

export class Scene_Item extends Scene_ItemBase {
  _itemWindow?: Window_ItemList
  _categoryWindow?: Window_ItemCategory

  constructor()
  constructor(thisClass: Constructable<Scene_Item>)
  constructor(arg?: any) {
    super(Scene_ItemBase);
    if (typeof arg === "function" && arg === Scene_Item) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  create(): void {
    super.create();
    this.createHelpWindow();
    this.createCategoryWindow();
    this.createItemWindow();
    this.createActorWindow();
  };

  createCategoryWindow(): void {
    const rect = this.categoryWindowRect();
    this._categoryWindow = new Window_ItemCategory(rect);
    this._categoryWindow.setHelpWindow(this._helpWindow!);
    this._categoryWindow.setHandler("ok", this.onCategoryOk.bind(this));
    this._categoryWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._categoryWindow);
  };

  categoryWindowRect(): Rectangle {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(1, true);
    return new Rectangle(wx, wy, ww, wh);
  };

  createItemWindow(): void {
    const rect = this.itemWindowRect();
    this._itemWindow = new Window_ItemList(rect);
    this._itemWindow.setHelpWindow(this._helpWindow!);
    this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
    this._categoryWindow!.setItemWindow(this._itemWindow);
    if (!this._categoryWindow!.needsSelection()) {
        this._itemWindow.y -= this._categoryWindow!.height;
        this._itemWindow.height += this._categoryWindow!.height;
        this._categoryWindow!.hide();
        this._categoryWindow!.deactivate();
        this.onCategoryOk();
    }
  };

  itemWindowRect(): Rectangle {
    const wx = 0;
    const wy = this._categoryWindow!.y + this._categoryWindow!.height;
    const ww = Graphics.boxWidth;
    const wh = this.mainAreaBottom() - wy;
    return new Rectangle(wx, wy, ww, wh);
  };

  user(): Game_Battler {
    const members = $gameParty.movableMembers();
    const bestPha = Math.max(...members.map(member => member.pha));
    return members.find(member => member.pha === bestPha)!;
  };

  onCategoryOk(): void {
    this._itemWindow!.activate();
    this._itemWindow!.selectLast();
  };

  onItemOk(): void {
    $gameParty.setLastItem(this.item()!);
    this.determineItem();
  };

  onItemCancel(): void {
    if (this._categoryWindow!.needsSelection()) {
        this._itemWindow!.deselect();
        this._categoryWindow!.activate();
    } else {
        this.popScene();
    }
  };

  playSeForItem(): void {
    SoundManager.playUseItem();
  };

  useItem(): void {
    super.useItem();
    this._itemWindow!.redrawCurrentItem();
  };
}
