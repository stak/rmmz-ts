import { Window_Selectable } from '.';
import { $gameTemp, $gameTroop } from '../managers';
import { Rectangle } from '../pixi';
import { Game_Enemy } from '../game';

//-----------------------------------------------------------------------------
// Window_BattleEnemy
//
// The window for selecting a target enemy on the battle screen.

export class Window_BattleEnemy extends Window_Selectable {
  _enemies: Game_Enemy[] = []

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_BattleEnemy>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_BattleEnemy) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    this._enemies = [];
    super.initialize(rect);
    this.refresh();
    this.hide();
  };

  maxCols(): number {
    return 2;
  };

  maxItems(): number {
    return this._enemies.length;
  };

  enemy(): Game_Enemy {
    return this._enemies[this.index()];
  };

  enemyIndex(): number {
    const enemy = this.enemy();
    return enemy ? enemy.index() : -1;
  };

  drawItem(index: number): void {
    this.resetTextColor();
    const name = this._enemies[index].name();
    const rect = this.itemLineRect(index);
    this.drawText(name, rect.x, rect.y, rect.width);
  };

  show(): void {
    this.refresh();
    this.forceSelect(0);
    $gameTemp.clearTouchState();
    super.show();
  };

  hide(): void {
    super.hide();
    $gameTroop.select(null);
  };

  refresh(): void {
    this._enemies = $gameTroop.aliveMembers() as Game_Enemy[];
    super.refresh();
  };

  select(index: number): void {
    super.select(index);
    $gameTroop.select(this.enemy());
  };

  processTouch(): void {
    super.processTouch();
    if (this.isOpenAndActive()) {
        const target = $gameTemp.touchTarget();
        if (target) {
            if (this._enemies.includes(target as Game_Enemy)) {
                this.select(this._enemies.indexOf(target as Game_Enemy));
                if ($gameTemp.touchState() === "click") {
                    this.processOk();
                }
            }
            $gameTemp.clearTouchState();
        }
    }
  };
}
