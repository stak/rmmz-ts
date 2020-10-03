import { Scene_MenuBase } from '.';
import { Scene_Map } from '.';

import { Graphics } from '../dom';
import { Rectangle } from '../pixi';
import { SceneManager, SoundManager } from '../managers';
import { Game_Action, Game_Actor, Game_Battler } from '../game';
import { $gameParty, $gameTemp } from '../managers';
import { Window_ItemList, Window_MenuActor, Window_SkillList } from '../windows';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Scene_ItemBase
//
// The superclass of Scene_Item and Scene_Skill.

export class Scene_ItemBase extends Scene_MenuBase {
  _itemWindow?: Window_ItemList | Window_SkillList
  _actorWindow?: Window_MenuActor

  constructor()
  constructor(thisClass: Constructable<Scene_ItemBase>)
  constructor(arg?: any) {
    super(Scene_MenuBase);
    if (typeof arg === "function" && arg === Scene_ItemBase) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  create(): void {
    super.create();
  };

  createActorWindow(): void {
    const rect = this.actorWindowRect();
    this._actorWindow = new Window_MenuActor(rect);
    this._actorWindow.setHandler("ok", this.onActorOk.bind(this));
    this._actorWindow.setHandler("cancel", this.onActorCancel.bind(this));
    this.addWindow(this._actorWindow);
  };

  actorWindowRect(): Rectangle {
    const wx = 0;
    const wy = Math.min(this.mainAreaTop(), this.helpAreaTop());
    const ww = Graphics.boxWidth - this.mainCommandWidth();
    const wh = this.mainAreaHeight() + this.helpAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
  };

  item(): MZ.DataConsumable | null {
    return this._itemWindow!.item() as MZ.DataConsumable;
  };

  user(): Game_Battler | null {
    return null;
  };

  isCursorLeft(): boolean {
    return this._itemWindow!.index() % 2 === 0;
  };

  showActorWindow(): void {
    if (this.isCursorLeft()) {
        this._actorWindow!.x = Graphics.boxWidth - this._actorWindow!.width;
    } else {
        this._actorWindow!.x = 0;
    }
    this._actorWindow!.show();
    this._actorWindow!.activate();
  };

  hideActorWindow(): void {
    this._actorWindow!.hide();
    this._actorWindow!.deactivate();
  };

  isActorWindowActive(): boolean {
    return !!this._actorWindow && this._actorWindow.active;
  };

  onActorOk(): void {
    if (this.canUse()) {
        this.useItem();
    } else {
        SoundManager.playBuzzer();
    }
  };

  onActorCancel(): void {
    this.hideActorWindow();
    this.activateItemWindow();
  };

  determineItem(): void {
    const action = new Game_Action(this.user()!);
    const item = this.item();
    action.setItemObject(item);
    if (action.isForFriend()) {
        this.showActorWindow();
        this._actorWindow!.selectForItem(this.item());
    } else {
        this.useItem();
        this.activateItemWindow();
    }
  };

  useItem(): void {
    this.playSeForItem();
    this.user()!.useItem(this.item()!);
    this.applyItem();
    this.checkCommonEvent();
    this.checkGameover();
    this._actorWindow!.refresh();
  };

  activateItemWindow(): void {
    this._itemWindow!.refresh();
    this._itemWindow!.activate();
  };

  itemTargetActors(): Game_Actor[] {
    const action = new Game_Action(this.user()!);
    action.setItemObject(this.item());
    if (!action.isForFriend()) {
        return [];
    } else if (action.isForAll()) {
        return $gameParty.members();
    } else {
        return [$gameParty.members()[this._actorWindow!.index()]];
    }
  };

  canUse(): boolean {
    const user = this.user();
    return !!user && user.canUse(this.item()) && this.isItemEffectsValid();
  };

  isItemEffectsValid(): boolean {
    const action = new Game_Action(this.user()!);
    action.setItemObject(this.item());
    return this.itemTargetActors().some(target => action.testApply(target));
  };

  applyItem(): void {
    const action = new Game_Action(this.user()!);
    action.setItemObject(this.item());
    for (const target of this.itemTargetActors()) {
        for (let i = 0; i < action.numRepeats(); i++) {
            action.apply(target);
        }
    }
    action.applyGlobal();
  };

  checkCommonEvent(): void {
    if ($gameTemp.isCommonEventReserved()) {
        SceneManager.goto(Scene_Map);
    }
  };

  // FIX: add virtual impl
  playSeForItem(): void {
    //
  }
}
