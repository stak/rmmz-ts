import { Game_Battler } from '.';
import { Game_Action } from '.';
import { Game_Party } from '.';
import { Game_Troop } from '.';
import { SoundManager } from '../managers';
import { $gameParty, $gameSwitches, $gameTroop, $dataEnemies, $dataItems, $dataSkills, $dataWeapons, $dataArmors } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Enemy
//
// The game object class for an enemy.

export class Game_Enemy extends Game_Battler {
  _enemyId = 0;
  _letter = "";
  _plural = false;
  _screenX = 0;
  _screenY = 0;
  
  constructor(enemyId: MZ.EnemyID, x: number, y: number)
  constructor(thisClass: Constructable<Game_Enemy>)
  constructor(arg?: any) {
    super(Game_Battler);
    if (typeof arg === "function" && arg === Game_Enemy) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(enemyId?: MZ.EnemyID, x?: number, y?: number): void {
    super.initialize();
    this.setup(enemyId!, x!, y!);
  };

  initMembers(): void {
    super.initMembers();
    this._enemyId = 0;
    this._letter = "";
    this._plural = false;
    this._screenX = 0;
    this._screenY = 0;
  };

  setup(enemyId: MZ.EnemyID, x: number, y: number): void {
    this._enemyId = enemyId;
    this._screenX = x;
    this._screenY = y;
    this.recoverAll();
  };

  isEnemy(): boolean {
    return true;
  };

  friendsUnit(): Game_Troop {
    return $gameTroop;
  };

  opponentsUnit(): Game_Party {
    return $gameParty;
  };

  index(): number {
    return $gameTroop.members().indexOf(this);
  };

  isBattleMember(): boolean {
    return this.index() >= 0;
  };

  enemyId(): MZ.EnemyID {
    return this._enemyId;
  };

  enemy(): MZ.DataEnemy {
    return $dataEnemies[this._enemyId];
  };

  traitObjects(): MZ.HasTrait[] {
    return super.traitObjects().concat(this.enemy());
  };

  paramBase(paramId: number): number {
    return this.enemy().params[paramId];
  };

  exp(): number {
    return this.enemy().exp;
  };

  gold(): number {
    return this.enemy().gold;
  };

  makeDropItems(): MZ.DataItemBase[] {
    const rate = this.dropItemRate();
    return this.enemy().dropItems.reduce((r, di) => {
        if (di.kind > 0 && Math.random() * di.denominator < rate) {
            return r.concat(this.itemObject(di.kind, di.dataId)!);
        } else {
            return r;
        }
    }, [] as MZ.DataItemBase[]);
  };

  dropItemRate(): number {
    return $gameParty.hasDropItemDouble() ? 2 : 1;
  };

  itemObject(kind: MZ.ItemKind, dataId: MZ.DataID): MZ.DataItemBase | null {
    if (kind === 1) {
        return $dataItems[dataId];
    } else if (kind === 2) {
        return $dataWeapons[dataId];
    } else if (kind === 3) {
        return $dataArmors[dataId];
    } else {
        return null;
    }
  };

  isSpriteVisible(): boolean {
    return true;
  };

  screenX(): number {
    return this._screenX;
  };

  screenY(): number {
    return this._screenY;
  };

  battlerName(): string {
    return this.enemy().battlerName;
  };

  battlerHue(): number {
    return this.enemy().battlerHue;
  };

  originalName(): string {
    return this.enemy().name;
  };

  name(): string {
    return this.originalName() + (this._plural ? this._letter : "");
  };

  isLetterEmpty(): boolean {
    return this._letter === "";
  };

  setLetter(letter: string): void {
    this._letter = letter;
  };

  setPlural(plural: boolean): void {
    this._plural = plural;
  };

  performActionStart(action: Game_Action): void {
    super.performActionStart(action);
    this.requestEffect("whiten");
  };

  performAction(action: Game_Action): void {
    super.performAction(action);
  };

  performActionEnd(): void {
    super.performActionEnd();
  };

  performDamage(): void {
    super.performDamage();
    SoundManager.playEnemyDamage();
    this.requestEffect("blink");
  };

  performCollapse(): void {
    super.performCollapse();
    switch (this.collapseType()) {
        case 0:
            this.requestEffect("collapse");
            SoundManager.playEnemyCollapse();
            break;
        case 1:
            this.requestEffect("bossCollapse");
            SoundManager.playBossCollapse1();
            break;
        case 2:
            this.requestEffect("instantCollapse");
            break;
    }
  };

  transform(enemyId: MZ.EnemyID): void {
    const name = this.originalName();
    this._enemyId = enemyId;
    if (this.originalName() !== name) {
        this._letter = "";
        this._plural = false;
    }
    this.refresh();
    if (this.numActions() > 0) {
        this.makeActions();
    }
  };

  meetsCondition(action: MZ.Action): boolean {
    const param1 = action.conditionParam1;
    const param2 = action.conditionParam2;
    switch (action.conditionType) {
        case 1:
            return this.meetsTurnCondition(param1, param2);
        case 2:
            return this.meetsHpCondition(param1, param2);
        case 3:
            return this.meetsMpCondition(param1, param2);
        case 4:
            return this.meetsStateCondition(param1);
        case 5:
            return this.meetsPartyLevelCondition(param1);
        case 6:
            return this.meetsSwitchCondition(param1);
        default:
            return true;
    }
  };

  meetsTurnCondition(param1: number, param2: number): boolean {
    const n = this.turnCount();
    if (param2 === 0) {
        return n === param1;
    } else {
        return n > 0 && n >= param1 && n % param2 === param1 % param2;
    }
  };

  meetsHpCondition(param1: number, param2: number): boolean {
    return this.hpRate() >= param1 && this.hpRate() <= param2;
  };

  meetsMpCondition(param1: number, param2: number): boolean {
    return this.mpRate() >= param1 && this.mpRate() <= param2;
  };

  meetsStateCondition(param: MZ.StateID): boolean {
    return this.isStateAffected(param);
  };

  meetsPartyLevelCondition(param: number): boolean {
    return $gameParty.highestLevel() >= param;
  };

  meetsSwitchCondition(param: MZ.SwitchID): boolean {
    return $gameSwitches.value(param);
  };

  isActionValid(action: MZ.Action): boolean {
    return (
        this.meetsCondition(action) && this.canUse($dataSkills[action.skillId])
    );
  };

  selectAction(actionList: MZ.Action[], ratingZero: number): MZ.Action | null {
    const sum = actionList.reduce((r, a) => r + a.rating - ratingZero, 0);
    if (sum > 0) {
        let value = Math.randomInt(sum);
        for (const action of actionList) {
            value -= action.rating - ratingZero;
            if (value < 0) {
                return action;
            }
        }
    }
    return null;
  };

  selectAllActions(actionList: MZ.Action[]): void {
    const ratingMax = Math.max(...actionList.map(a => a.rating));
    const ratingZero = ratingMax - 3;
    actionList = actionList.filter(a => a.rating > ratingZero);
    for (let i = 0; i < this.numActions(); i++) {
        this.action(i).setEnemyAction(
            this.selectAction(actionList, ratingZero)
        );
    }
  };

  makeActions(): void {
    super.makeActions();
    if (this.numActions() > 0) {
        const actionList = this.enemy().actions.filter(a =>
            this.isActionValid(a)
        );
        if (actionList.length > 0) {
            this.selectAllActions(actionList);
        }
    }
    this.setActionState("waiting");
  };
}
