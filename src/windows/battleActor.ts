import { Window_BattleStatus } from '.';
import { $gameParty, $gameTemp } from '../managers';
import { Rectangle } from '../pixi';
import { Game_Battler } from '../game';

//-----------------------------------------------------------------------------
// Window_BattleActor
//
// The window for selecting a target actor on the battle screen.

export class Window_BattleActor extends Window_BattleStatus {
  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_BattleActor>)
  constructor(arg?: any) {
    super(Window_BattleStatus);
    if (typeof arg === "function" && arg === Window_BattleActor) {
      return;
    }
    this.initialize(...arguments);
  }
    
  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.openness = 255;
    this.hide();
  };

  show(): void {
    this.forceSelect(0);
    $gameTemp.clearTouchState();
    super.show();
  };

  hide(): void {
    super.hide();
    $gameParty.select(null);
  };

  select(index: number): void {
    super.select(index);
    $gameParty.select(this.actor(index));
  };

  processTouch(): void {
    super.processTouch();
    if (this.isOpenAndActive()) {
        const target = $gameTemp.touchTarget();
        if (target) {
            const members = $gameParty.battleMembers() as Game_Battler[];
            if (members.includes(target)) {
                this.select(members.indexOf(target));
                if ($gameTemp.touchState() === "click") {
                    this.processOk();
                }
            }
            $gameTemp.clearTouchState();
        }
    }
  };
}