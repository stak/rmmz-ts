import { Game_Interpreter } from '.';
import { $gameSwitches, $dataCommonEvents } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_CommonEvent
//
// The game object class for a common event. It contains functionality for
// running parallel process events.

export class Game_CommonEvent {
  _commonEventId: MZ.CommonEventID = 0
  _interpreter: Game_Interpreter | null = null

  constructor()
  constructor(thisClass: Constructable<Game_CommonEvent>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_CommonEvent) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(commonEventId?: MZ.CommonEventID): void {
    this._commonEventId = commonEventId!;
    this.refresh();
  }

  event(): MZ.DataCommonEvent {
    return $dataCommonEvents[this._commonEventId];
  }

  list(): MZ.EventCommand[] {
    return this.event().list;
  }

  refresh(): void {
    if (this.isActive()) {
        if (!this._interpreter) {
            this._interpreter = new Game_Interpreter();
        }
    } else {
        this._interpreter = null;
    }
  }

  isActive(): boolean {
    const event = this.event();
    return event.trigger === 2 && $gameSwitches.value(event.switchId);
  }

  update(): void {
    if (this._interpreter) {
        if (!this._interpreter.isRunning()) {
            this._interpreter.setup(this.list());
        }
        this._interpreter.update();
    }
  }
}
