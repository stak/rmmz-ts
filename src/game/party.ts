import { Game_Unit } from '.';
import { Game_Item } from '.';
import { Game_Actor } from '.';
import { DataManager, TextManager } from '../managers';
import { $gameActors, $gameMap, $gamePlayer, $gameTemp } from '../managers';
import { $dataActors, $dataArmors, $dataItems, $dataSystem, $dataWeapons } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Party
//
// The game object class for the party. Information such as gold and items is
// included.

export class Game_Party extends Game_Unit {
  _gold = 0;
  _steps = 0;
  _lastItem: Game_Item = new Game_Item()
  _menuActorId: MZ.ActorID = 0;
  _targetActorId: MZ.ActorID = 0;
  _actors: MZ.ActorID[] = [];
  _items: {[key: number]: number} = {}
  _weapons: {[key: number]: number} = {}
  _armors: {[key: number]: number} = {}

  constructor()
  constructor(thisClass: Constructable<Game_Party>)
  constructor(arg?: any) {
    super(Game_Unit);
    if (typeof arg === "function" && arg === Game_Party) {
      return;
    }
    this.initialize(...arguments);
  }

  static ABILITY_ENCOUNTER_HALF = 0;
  static ABILITY_ENCOUNTER_NONE = 1;
  static ABILITY_CANCEL_SURPRISE = 2;
  static ABILITY_RAISE_PREEMPTIVE = 3;
  static ABILITY_GOLD_DOUBLE = 4;
  static ABILITY_DROP_ITEM_DOUBLE = 5;

  initialize(..._: any): void {
    super.initialize();
    this._gold = 0;
    this._steps = 0;
    this._lastItem = new Game_Item();
    this._menuActorId = 0;
    this._targetActorId = 0;
    this._actors = [];
    this.initAllItems();
  };

  initAllItems(): void {
    this._items = {};
    this._weapons = {};
    this._armors = {};
  };

  exists(): boolean {
    return this._actors.length > 0;
  };

  size(): number {
    return this.members().length;
  };

  isEmpty(): boolean {
    return this.size() === 0;
  };

  members(): Game_Actor[] {
    return this.inBattle() ? this.battleMembers() : this.allMembers();
  };

  allMembers(): Game_Actor[] {
    return this._actors.map(id => $gameActors.actor(id)!);
  };

  battleMembers(): Game_Actor[] {
    return this.allMembers()
        .slice(0, this.maxBattleMembers())
        .filter(actor => actor.isAppeared());
  };

  maxBattleMembers(): number {
    return 4;
  };

  leader(): Game_Actor {
    return this.battleMembers()[0];
  };

  removeInvalidMembers(): void {
    for (const actorId of this._actors) {
        if (!$dataActors[actorId]) {
            this._actors.remove(actorId);
        }
    }
  };

  reviveBattleMembers(): void {
    for (const actor of this.battleMembers()) {
        if (actor.isDead()) {
            actor.setHp(1);
        }
    }
  };

  items(): MZ.DataItem[] {
    return Object.keys(this._items).map(id => $dataItems[Number(id)]);
  };

  weapons(): MZ.DataWeapon[] {
    return Object.keys(this._weapons).map(id => $dataWeapons[Number(id)]);
  };

  armors(): MZ.DataArmor[] {
    return Object.keys(this._armors).map(id => $dataArmors[Number(id)]);
  };

  equipItems(): MZ.DataEquipItem[] {
    return (this.weapons() as MZ.DataEquipItem[]).concat(this.armors());
  };

  allItems(): MZ.DataItemBase[] {
    return (this.items() as MZ.DataItemBase[]).concat(this.equipItems());
  };

  itemContainer(item: MZ.DataItemBase | null): {[key: number]: number} | null {
    if (!item) {
        return null;
    } else if (DataManager.isItem(item)) {
        return this._items;
    } else if (DataManager.isWeapon(item)) {
        return this._weapons;
    } else if (DataManager.isArmor(item)) {
        return this._armors;
    } else {
        return null;
    }
  };

  setupStartingMembers(): void {
    this._actors = [];
    for (const actorId of $dataSystem.partyMembers) {
        if ($gameActors.actor(actorId)) {
            this._actors.push(actorId);
        }
    }
  };

  name(): string {
    const numBattleMembers = this.battleMembers().length;
    if (numBattleMembers === 0) {
        return "";
    } else if (numBattleMembers === 1) {
        return this.leader().name();
    } else {
        return TextManager.partyName.format(this.leader().name());
    }
  };

  setupBattleTest(): void {
    this.setupBattleTestMembers();
    this.setupBattleTestItems();
  };

  setupBattleTestMembers(): void {
    for (const battler of $dataSystem.testBattlers) {
        const actor = $gameActors.actor(battler.actorId);
        if (actor) {
            actor.changeLevel(battler.level, false);
            actor.initEquips(battler.equips);
            actor.recoverAll();
            this.addActor(battler.actorId);
        }
    }
  };

  setupBattleTestItems(): void {
    for (const item of $dataItems) {
        if (item && item.name.length > 0) {
            this.gainItem(item, this.maxItems(item));
        }
    }
  };

  highestLevel(): number {
    return Math.max(...this.members().map(actor => actor.level));
  };

  addActor(actorId: MZ.ActorID): void {
    if (!this._actors.includes(actorId)) {
        this._actors.push(actorId);
        $gamePlayer.refresh();
        $gameMap.requestRefresh();
        $gameTemp.requestBattleRefresh();
        if (this.inBattle()) {
            const actor = $gameActors.actor(actorId);
            if (this.battleMembers().includes(actor!)) {
                actor!.onBattleStart();
            }
        }
    }
  };

  removeActor(actorId: MZ.ActorID): void {
    if (this._actors.includes(actorId)) {
        const actor = $gameActors.actor(actorId);
        const wasBattleMember = this.battleMembers().includes(actor!);
        this._actors.remove(actorId);
        $gamePlayer.refresh();
        $gameMap.requestRefresh();
        $gameTemp.requestBattleRefresh();
        if (this.inBattle() && wasBattleMember) {
            actor!.onBattleEnd();
        }
    }
  };

  gold(): number {
    return this._gold;
  };

  gainGold(amount: number): void {
    this._gold = (this._gold + amount).clamp(0, this.maxGold());
  };

  loseGold(amount: number): void {
    this.gainGold(-amount);
  };

  maxGold(): number {
    return 99999999;
  };

  steps(): number {
    return this._steps;
  };

  increaseSteps(): void {
    this._steps++;
  };

  numItems(item: MZ.DataItemBase | null): number {
    const container = this.itemContainer(item);
    return container ? container[item!.id] || 0 : 0;
  };

  maxItems(item: MZ.DataItemBase | null): number {
    return 99;
  };

  hasMaxItems(item: MZ.DataItemBase): boolean {
    return this.numItems(item) >= this.maxItems(item);
  };

  hasItem(item: MZ.DataItemBase, includeEquip?: boolean): boolean {
    if (this.numItems(item) > 0) {
        return true;
    } else if (includeEquip && this.isAnyMemberEquipped(item as MZ.DataEquipItem)) {
        return true;
    } else {
        return false;
    }
  };

  isAnyMemberEquipped(item: MZ.DataEquipItem): boolean {
    return this.members().some(actor => actor.equips().includes(item));
  };

  gainItem(item: MZ.DataItemBase | null, amount: number, includeEquip?: boolean): void {
    const container = this.itemContainer(item);
    if (container) {
        const lastNumber = this.numItems(item);
        const newNumber = lastNumber + amount;
        container[item!.id] = newNumber.clamp(0, this.maxItems(item));
        if (container[item!.id] === 0) {
            delete container[item!.id];
        }
        if (includeEquip && newNumber < 0) {
            this.discardMembersEquip(item as MZ.DataEquipItem, -newNumber);
        }
        $gameMap.requestRefresh();
    }
  };

  discardMembersEquip(item: MZ.DataEquipItem, amount: number): void {
    let n = amount;
    for (const actor of this.members()) {
        while (n > 0 && actor.isEquipped(item)) {
            actor.discardEquip(item);
            n--;
        }
    }
  };

  loseItem(item: MZ.DataItemBase | null, amount: number, includeEquip?: boolean): void {
    this.gainItem(item, -amount, includeEquip);
  };

  consumeItem(item: MZ.DataItemBase): void {
    if (DataManager.isItem(item) && (item as MZ.DataItem).consumable) {
        this.loseItem(item, 1);
    }
  };

  canUse(item: MZ.DataItemBase): boolean {
    return this.members().some(actor => actor.canUse(item));
  };

  canInput(): boolean {
    return this.members().some(actor => actor.canInput());
  };

  isAllDead(): boolean {
    if (Game_Unit.prototype.isAllDead.call(this)) {
        return this.inBattle() || !this.isEmpty();
    } else {
        return false;
    }
  };

  onPlayerWalk(): void {
    for (const actor of this.members()) {
        actor.onPlayerWalk();
    }
  };

  menuActor(): Game_Actor {
    let actor = $gameActors.actor(this._menuActorId);
    if (!this.members().includes(actor!)) {
        actor = this.members()[0];
    }
    return actor!;
  };

  setMenuActor(actor: Game_Actor): void {
    this._menuActorId = actor.actorId();
  };

  makeMenuActorNext(): void {
    let index = this.members().indexOf(this.menuActor());
    if (index >= 0) {
        index = (index + 1) % this.members().length;
        this.setMenuActor(this.members()[index]);
    } else {
        this.setMenuActor(this.members()[0]);
    }
  };

  makeMenuActorPrevious(): void {
    let index = this.members().indexOf(this.menuActor());
    if (index >= 0) {
        index = (index + this.members().length - 1) % this.members().length;
        this.setMenuActor(this.members()[index]);
    } else {
        this.setMenuActor(this.members()[0]);
    }
  };

  targetActor(): Game_Actor {
    let actor = $gameActors.actor(this._targetActorId);
    if (!this.members().includes(actor!)) {
        actor = this.members()[0];
    }
    return actor!;
  };

  setTargetActor(actor: Game_Actor): void {
    this._targetActorId = actor.actorId();
  };

  lastItem(): object | null {
    return this._lastItem.object();
  };

  setLastItem(item: MZ.DataItemBase): void {
    this._lastItem.setObject(item);
  };

  swapOrder(index1: number, index2: number): void {
    const temp = this._actors[index1];
    this._actors[index1] = this._actors[index2];
    this._actors[index2] = temp;
    $gamePlayer.refresh();
  };

  charactersForSavefile(): Array<[string, number]> {
    return this.battleMembers().map(actor => [
        actor.characterName(),
        actor.characterIndex()
    ]);
  };

  facesForSavefile(): Array<[string, number]> {
    return this.battleMembers().map(actor => [
        actor.faceName(),
        actor.faceIndex()
    ]);
  };

  partyAbility(abilityId: number): boolean {
    return this.battleMembers().some(actor => actor.partyAbility(abilityId));
  };

  hasEncounterHalf(): boolean {
    return this.partyAbility(Game_Party.ABILITY_ENCOUNTER_HALF);
  };

  hasEncounterNone(): boolean {
    return this.partyAbility(Game_Party.ABILITY_ENCOUNTER_NONE);
  };

  hasCancelSurprise(): boolean {
    return this.partyAbility(Game_Party.ABILITY_CANCEL_SURPRISE);
  };

  hasRaisePreemptive(): boolean {
    return this.partyAbility(Game_Party.ABILITY_RAISE_PREEMPTIVE);
  };

  hasGoldDouble(): boolean {
    return this.partyAbility(Game_Party.ABILITY_GOLD_DOUBLE);
  };

  hasDropItemDouble(): boolean {
    return this.partyAbility(Game_Party.ABILITY_DROP_ITEM_DOUBLE);
  };

  ratePreemptive(troopAgi: number): number {
    let rate = this.agility() >= troopAgi ? 0.05 : 0.03;
    if (this.hasRaisePreemptive()) {
        rate *= 4;
    }
    return rate;
  };

  rateSurprise(troopAgi: number): number {
    let rate = this.agility() >= troopAgi ? 0.03 : 0.05;
    if (this.hasCancelSurprise()) {
        rate = 0;
    }
    return rate;
  };

  performVictory(): void {
    for (const actor of this.members()) {
        actor.performVictory();
    }
  };

  performEscape(): void {
    for (const actor of this.members()) {
        actor.performEscape();
    }
  };

  removeBattleStates(): void {
    for (const actor of this.members()) {
        actor.removeBattleStates();
    }
  };

  requestMotionRefresh(): void {
    for (const actor of this.members()) {
        actor.requestMotionRefresh();
    }
  };

  onEscapeFailure(): void {
    for (const actor of this.members()) {
        actor.onEscapeFailure();
    }
  };
}