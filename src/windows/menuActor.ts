import { Window_MenuStatus } from '.';
import { DataManager } from '../managers';
import { $gameParty } from '../managers';
import { MZ } from '../MZ';
import { Rectangle } from '../pixi';
import { Game_Action } from '../game';

//-----------------------------------------------------------------------------
// Window_MenuActor
//
// The window for selecting a target actor on the item and skill screens.

export class Window_MenuActor extends Window_MenuStatus {
  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_MenuActor>)
  constructor(arg?: any) {
    super(Window_MenuStatus);
    if (typeof arg === "function" && arg === Window_MenuActor) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.hide();
  };

  processOk(): void {
    if (!this.cursorAll()) {
        $gameParty.setTargetActor($gameParty.members()[this.index()]);
    }
    this.callOkHandler();
  };

  selectLast(): void {
    this.forceSelect($gameParty.targetActor().index() || 0);
  };

  selectForItem(item: MZ.DataConsumable | null): void {
    const actor = $gameParty.menuActor();
    const action = new Game_Action(actor);
    action.setItemObject(item);
    this.setCursorFixed(false);
    this.setCursorAll(false);
    if (action.isForUser()) {
        if (DataManager.isSkill(item)) {
            this.setCursorFixed(true);
            this.forceSelect(actor.index());
        } else {
            this.selectLast();
        }
    } else if (action.isForAll()) {
        this.setCursorAll(true);
        this.forceSelect(0);
    } else {
        this.selectLast();
    }
  };
}
