import { Game_Battler } from '.';
import { Game_Action } from '.';
import { Game_Item } from '.';
import { Game_Troop } from '.';
import { Game_Party } from '.';
import { DataManager, BattleManager, TextManager, SoundManager } from '../managers';
import {
  $gameMessage,
  $gameParty,
  $gamePlayer,
  $gameScreen,
  $gameSystem,
  $gameTemp,
  $gameTroop,
  $dataActors,
  $dataStates,
  $dataSystem,
  $dataWeapons,
  $dataArmors,
  $dataClasses,
  $dataSkills,
} from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Actor
//
// The game object class for an actor.

export class Game_Actor extends Game_Battler {
  _actorId: MZ.ActorID = 0;
  _name = "";
  _nickname = "";
  _profile = "";
  _classId: MZ.ClassID = 0;
  _level = 0;
  _characterName = "";
  _characterIndex = 0;
  _faceName = "";
  _faceIndex = 0;
  _battlerName = "";
  _exp: {[key: number]: number} = {};
  _skills: MZ.SkillID[] = [];
  _equips: Game_Item[] = [];
  _stateSteps: {[key: number]: number} = {};
  _actionInputIndex = 0;
  _lastMenuSkill = new Game_Item();
  _lastBattleSkill = new Game_Item();
  _lastCommandSymbol = "";

  constructor(actorId: MZ.ActorID)
  constructor(thisClass: Constructable<Game_Actor>)
  constructor(arg?: any) {
    super(Game_Battler);
    if (typeof arg === "function" && arg === Game_Actor) {
      return;
    }
    this.initialize(...arguments);
  }

  get level() {
    return this._level;
  }

  initialize(actorId?: MZ.ActorID): void {
    super.initialize();
    this.setup(actorId!);
  };

  initMembers(): void {
    super.initMembers();
    this._actorId = 0;
    this._name = "";
    this._nickname = "";
    this._classId = 0;
    this._level = 0;
    this._characterName = "";
    this._characterIndex = 0;
    this._faceName = "";
    this._faceIndex = 0;
    this._battlerName = "";
    this._exp = {};
    this._skills = [];
    this._equips = [];
    this._actionInputIndex = 0;
    this._lastMenuSkill = new Game_Item();
    this._lastBattleSkill = new Game_Item();
    this._lastCommandSymbol = "";
  };

  setup(actorId: MZ.ActorID): void {
    const actor = $dataActors[actorId];
    this._actorId = actorId;
    this._name = actor.name;
    this._nickname = actor.nickname;
    this._profile = actor.profile;
    this._classId = actor.classId;
    this._level = actor.initialLevel;
    this.initImages();
    this.initExp();
    this.initSkills();
    this.initEquips(actor.equips);
    this.clearParamPlus();
    this.recoverAll();
  };

  actorId(): MZ.ActorID {
    return this._actorId;
  };

  actor(): MZ.DataActor {
    return $dataActors[this._actorId];
  };

  name(): string {
    return this._name;
  };

  setName(name: string): void {
    this._name = name;
  };

  nickname(): string {
    return this._nickname;
  };

  setNickname(nickname: string): void {
    this._nickname = nickname;
  };

  profile(): string {
    return this._profile;
  };

  setProfile(profile: string): void {
    this._profile = profile;
  };

  characterName(): string {
    return this._characterName;
  };

  characterIndex(): number {
    return this._characterIndex;
  };

  faceName(): string {
    return this._faceName;
  };

  faceIndex(): number {
    return this._faceIndex;
  };

  battlerName(): string {
    return this._battlerName;
  };

  clearStates(): void {
    super.clearStates();
    this._stateSteps = {};
  };

  eraseState(stateId: MZ.StateID): void {
    super.eraseState(stateId);
    delete this._stateSteps[stateId];
  };

  resetStateCounts(stateId: MZ.StateID): void {
    super.resetStateCounts(stateId);
    this._stateSteps[stateId] = $dataStates[stateId].stepsToRemove;
  };

  initImages(): void {
    const actor = this.actor();
    this._characterName = actor.characterName;
    this._characterIndex = actor.characterIndex;
    this._faceName = actor.faceName;
    this._faceIndex = actor.faceIndex;
    this._battlerName = actor.battlerName;
  };

  expForLevel(level: number): number {
    const c = this.currentClass();
    const basis = c.expParams[0];
    const extra = c.expParams[1];
    const acc_a = c.expParams[2];
    const acc_b = c.expParams[3];
    return Math.round(
        (basis * Math.pow(level - 1, 0.9 + acc_a / 250) * level * (level + 1)) /
            (6 + Math.pow(level, 2) / 50 / acc_b) +
            (level - 1) * extra
    );
  };

  initExp(): void {
    this._exp[this._classId] = this.currentLevelExp();
  };

  currentExp(): number {
    return this._exp[this._classId];
  };

  currentLevelExp(): number {
    return this.expForLevel(this._level);
  };

  nextLevelExp(): number {
    return this.expForLevel(this._level + 1);
  };

  nextRequiredExp(): number {
    return this.nextLevelExp() - this.currentExp();
  };

  maxLevel(): number {
    return this.actor().maxLevel;
  };

  isMaxLevel(): boolean {
    return this._level >= this.maxLevel();
  };

  initSkills(): void {
    this._skills = [];
    for (const learning of this.currentClass().learnings) {
        if (learning.level <= this._level) {
            this.learnSkill(learning.skillId);
        }
    }
  };

  initEquips(equips: MZ.ID[]): void {
    const slots = this.equipSlots();
    const maxSlots = slots.length;
    this._equips = [];
    for (let i = 0; i < maxSlots; i++) {
        this._equips[i] = new Game_Item();
    }
    for (let j = 0; j < equips.length; j++) {
        if (j < maxSlots) {
            this._equips[j].setEquip(slots[j] === 1, equips[j]);
        }
    }
    this.releaseUnequippableItems(true);
    this.refresh();
  };

  equipSlots(): number[] {
    const slots = [];
    for (let i = 1; i < $dataSystem.equipTypes.length; i++) {
        slots.push(i);
    }
    if (slots.length >= 2 && this.isDualWield()) {
        slots[1] = 1;
    }
    return slots;
  };

  equips(): (MZ.DataEquipItem | null)[] {
    return this._equips.map(item => item.object() as MZ.DataEquipItem);
  };

  weapons(): MZ.DataWeapon[] {
    return this.equips().filter(item => item && DataManager.isWeapon(item)) as MZ.DataWeapon[];
  };

  armors(): MZ.DataArmor[] {
    return this.equips().filter(item => item && DataManager.isArmor(item)) as MZ.DataArmor[];
  };

  hasWeapon(weapon: MZ.DataWeapon): boolean {
    return this.weapons().includes(weapon);
  };

  hasArmor(armor: MZ.DataArmor): boolean {
    return this.armors().includes(armor);
  };

  isEquipChangeOk(slotId: number): boolean {
    return (
        !this.isEquipTypeLocked(this.equipSlots()[slotId]) &&
        !this.isEquipTypeSealed(this.equipSlots()[slotId])
    );
  };

  changeEquip(slotId: number, item: MZ.DataEquipItem | null): void {
    if (
        this.tradeItemWithParty(item, this.equips()[slotId]!) &&
        (!item || this.equipSlots()[slotId] === item.etypeId)
    ) {
        this._equips[slotId].setObject(item);
        this.refresh();
    }
  };

  forceChangeEquip(slotId: number, item: MZ.DataEquipItem): void {
    this._equips[slotId].setObject(item);
    this.releaseUnequippableItems(true);
    this.refresh();
  };

  tradeItemWithParty(newItem: MZ.DataItemBase | null, oldItem: MZ.DataItemBase): boolean {
    if (newItem && !$gameParty.hasItem(newItem)) {
        return false;
    } else {
        $gameParty.gainItem(oldItem, 1);
        $gameParty.loseItem(newItem, 1);
        return true;
    }
  };

  changeEquipById(etypeId: MZ.EquipTypeID, itemId: MZ.ID): void {
    const slotId = etypeId - 1;
    if (this.equipSlots()[slotId] === 1) {
        this.changeEquip(slotId, $dataWeapons[itemId]);
    } else {
        this.changeEquip(slotId, $dataArmors[itemId]);
    }
  };

  isEquipped(item: MZ.DataEquipItem): boolean {
    return this.equips().includes(item);
  };

  discardEquip(item: MZ.DataEquipItem): void {
    const slotId = this.equips().indexOf(item);
    if (slotId >= 0) {
        this._equips[slotId].setObject(null);
    }
  };

  releaseUnequippableItems(forcing: boolean): void {
    for (;;) {
        const slots = this.equipSlots();
        const equips = this.equips();
        let changed = false;
        for (let i = 0; i < equips.length; i++) {
            const item = equips[i];
            if (item && (!this.canEquip(item) || item!.etypeId !== slots[i])) {
                if (!forcing) {
                    this.tradeItemWithParty(null, item);
                }
                this._equips[i].setObject(null);
                changed = true;
            }
        }
        if (!changed) {
            break;
        }
    }
  };

  clearEquipments(): void {
    const maxSlots = this.equipSlots().length;
    for (let i = 0; i < maxSlots; i++) {
        if (this.isEquipChangeOk(i)) {
            this.changeEquip(i, null);
        }
    }
  };

  optimizeEquipments(): void {
    const maxSlots = this.equipSlots().length;
    this.clearEquipments();
    for (let i = 0; i < maxSlots; i++) {
        if (this.isEquipChangeOk(i)) {
            this.changeEquip(i, this.bestEquipItem(i));
        }
    }
  };

  bestEquipItem(slotId: number): MZ.DataEquipItem | null {
    const etypeId = this.equipSlots()[slotId];
    const items = $gameParty
        .equipItems()
        .filter(item => item.etypeId === etypeId && this.canEquip(item));
    let bestItem = null;
    let bestPerformance = -1000;
    for (let i = 0; i < items.length; i++) {
        const performance = this.calcEquipItemPerformance(items[i]);
        if (performance > bestPerformance) {
            bestPerformance = performance;
            bestItem = items[i];
        }
    }
    return bestItem;
  };

  calcEquipItemPerformance(item: MZ.DataEquipItem): number {
    return item.params.reduce((a, b) => a + b);
  };

  isSkillWtypeOk(skill: MZ.DataSkill): boolean {
    const wtypeId1 = skill.requiredWtypeId1;
    const wtypeId2 = skill.requiredWtypeId2;
    if (
        (wtypeId1 === 0 && wtypeId2 === 0) ||
        (wtypeId1 > 0 && this.isWtypeEquipped(wtypeId1)) ||
        (wtypeId2 > 0 && this.isWtypeEquipped(wtypeId2))
    ) {
        return true;
    } else {
        return false;
    }
  };

  isWtypeEquipped(wtypeId: MZ.WeaponTypeID): boolean {
    return this.weapons().some(weapon => weapon.wtypeId === wtypeId);
  };

  refresh(): void {
    this.releaseUnequippableItems(false);
    super.refresh();
  };

  hide(): void {
    super.hide();
    $gameTemp.requestBattleRefresh();
  };

  isActor(): boolean {
    return true;
  };

  friendsUnit(): Game_Party {
    return $gameParty;
  };

  opponentsUnit(): Game_Troop {
    return $gameTroop;
  };

  index(): number {
    return $gameParty.members().indexOf(this);
  };

  isBattleMember(): boolean {
    return $gameParty.battleMembers().includes(this);
  };

  isFormationChangeOk(): boolean {
    return true;
  };

  currentClass(): MZ.DataClass {
    return $dataClasses[this._classId];
  };

  isClass(gameClass: MZ.DataClass): boolean {
    return gameClass && this._classId === gameClass.id;
  };

  skillTypes(): number[] {
    const skillTypes = this.addedSkillTypes().sort((a, b) => a - b);
    return skillTypes.filter((x, i, self) => self.indexOf(x) === i);
  };

  skills(): MZ.DataSkill[] {
    const list: MZ.DataSkill[] = [];
    for (const id of this._skills.concat(this.addedSkills())) {
        if (!list.includes($dataSkills[id])) {
            list.push($dataSkills[id]);
        }
    }
    return list;
  };

  usableSkills(): MZ.DataSkill[] {
    return this.skills().filter(skill => this.canUse(skill));
  };

  traitObjects(): MZ.HasTrait[] {
    const objects = super.traitObjects();
    objects.push(this.actor(), this.currentClass());
    for (const item of this.equips()) {
        if (item) {
            objects.push(item);
        }
    }
    return objects;
  };

  attackElements(): number[] {
    const set = super.attackElements();
    if (this.hasNoWeapons() && !set.includes(this.bareHandsElementId())) {
        set.push(this.bareHandsElementId());
    }
    return set;
  };

  hasNoWeapons(): boolean {
    return this.weapons().length === 0;
  };

  bareHandsElementId(): number {
    return 1;
  };

  paramBase(paramId: number): number {
    return this.currentClass().params[paramId][this._level];
  };

  paramPlus(paramId: number): number {
    let value = Game_Battler.prototype.paramPlus.call(this, paramId);
    for (const item of this.equips()) {
        if (item) {
            value += item.params[paramId];
        }
    }
    return value;
  };

  attackAnimationId1(): MZ.AnimationID {
    if (this.hasNoWeapons()) {
        return this.bareHandsAnimationId();
    } else {
        const weapons = this.weapons();
        return weapons[0] ? weapons[0].animationId : 0;
    }
  };

  attackAnimationId2(): MZ.AnimationID {
    const weapons = this.weapons();
    return weapons[1] ? weapons[1].animationId : 0;
  };

  bareHandsAnimationId(): MZ.AnimationID {
    return 1;
  };

  changeExp(exp: number, show: boolean): void {
    this._exp[this._classId] = Math.max(exp, 0);
    const lastLevel = this._level;
    const lastSkills = this.skills();
    while (!this.isMaxLevel() && this.currentExp() >= this.nextLevelExp()) {
        this.levelUp();
    }
    while (this.currentExp() < this.currentLevelExp()) {
        this.levelDown();
    }
    if (show && this._level > lastLevel) {
        this.displayLevelUp(this.findNewSkills(lastSkills));
    }
    this.refresh();
  };

  levelUp(): void {
    this._level++;
    for (const learning of this.currentClass().learnings) {
        if (learning.level === this._level) {
            this.learnSkill(learning.skillId);
        }
    }
  };

  levelDown(): void {
    this._level--;
  };

  findNewSkills(lastSkills: MZ.DataSkill[]): MZ.DataSkill[] {
    const newSkills = this.skills();
    for (const lastSkill of lastSkills) {
        newSkills.remove(lastSkill);
    }
    return newSkills;
  };

  displayLevelUp(newSkills: MZ.DataSkill[]): void {
    const text = TextManager.levelUp.format(
        this._name,
        TextManager.level,
        this._level
    );
    $gameMessage.newPage();
    $gameMessage.add(text);
    for (const skill of newSkills) {
        $gameMessage.add(TextManager.obtainSkill.format(skill.name));
    }
  };

  gainExp(exp: number): void {
    const newExp = this.currentExp() + Math.round(exp * this.finalExpRate());
    this.changeExp(newExp, this.shouldDisplayLevelUp());
  };

  finalExpRate(): number {
    return this.exr * (this.isBattleMember() ? 1 : this.benchMembersExpRate());
  };

  benchMembersExpRate(): number {
    return $dataSystem.optExtraExp ? 1 : 0;
  };

  shouldDisplayLevelUp(): boolean {
    return true;
  };

  changeLevel(level: number, show: boolean): void {
    level = level.clamp(1, this.maxLevel());
    this.changeExp(this.expForLevel(level), show);
  };

  learnSkill(skillId: MZ.SkillID): void {
    if (!this.isLearnedSkill(skillId)) {
        this._skills.push(skillId);
        this._skills.sort((a, b) => a - b);
    }
  };

  forgetSkill(skillId: MZ.SkillID): void {
    this._skills.remove(skillId);
  };

  isLearnedSkill(skillId: MZ.SkillID): boolean {
    return this._skills.includes(skillId);
  };

  hasSkill(skillId: MZ.SkillID): boolean {
    return this.skills().includes($dataSkills[skillId]);
  };

  changeClass(classId: MZ.ClassID, keepExp: boolean): void {
    if (keepExp) {
        this._exp[classId] = this.currentExp();
    }
    this._classId = classId;
    this._level = 0;
    this.changeExp(this._exp[this._classId] || 0, false);
    this.refresh();
  };

  setCharacterImage(characterName: string, characterIndex: number): void {
    this._characterName = characterName;
    this._characterIndex = characterIndex;
  };

  setFaceImage(faceName: string, faceIndex: number): void {
    this._faceName = faceName;
    this._faceIndex = faceIndex;
    $gameTemp.requestBattleRefresh();
  };

  setBattlerImage(battlerName: string): void {
    this._battlerName = battlerName;
  };

  isSpriteVisible(): boolean {
    return $gameSystem.isSideView();
  };

  performActionStart(action: Game_Action): void {
    super.performActionStart(action);
  };

  performAction(action: Game_Action): void {
    super.performAction(action);
    if (action.isAttack()) {
        this.performAttack();
    } else if (action.isGuard()) {
        this.requestMotion("guard");
    } else if (action.isMagicSkill()) {
        this.requestMotion("spell");
    } else if (action.isSkill()) {
        this.requestMotion("skill");
    } else if (action.isItem()) {
        this.requestMotion("item");
    }
  };

  performActionEnd(): void {
    super.performActionEnd();
  };

  performAttack(): void {
    const weapons = this.weapons();
    const wtypeId = weapons[0] ? weapons[0].wtypeId : 0;
    const attackMotion = $dataSystem.attackMotions[wtypeId];
    if (attackMotion) {
        if (attackMotion.type === 0) {
            this.requestMotion("thrust");
        } else if (attackMotion.type === 1) {
            this.requestMotion("swing");
        } else if (attackMotion.type === 2) {
            this.requestMotion("missile");
        }
        this.startWeaponAnimation(attackMotion.weaponImageId);
    }
  };

  performDamage(): void {
    super.performDamage();
    if (this.isSpriteVisible()) {
        this.requestMotion("damage");
    } else {
        $gameScreen.startShake(5, 5, 10);
    }
    SoundManager.playActorDamage();
  };

  performEvasion(): void {
    super.performEvasion();
    this.requestMotion("evade");
  };

  performMagicEvasion(): void {
    super.performMagicEvasion();
    this.requestMotion("evade");
  };

  performCounter(): void {
    super.performCounter();
    this.performAttack();
  };

  performCollapse(): void {
    super.performCollapse();
    if ($gameParty.inBattle()) {
        SoundManager.playActorCollapse();
    }
  };

  performVictory(): void {
    this.setActionState("done");
    if (this.canMove()) {
        this.requestMotion("victory");
    }
  };

  performEscape(): void {
    if (this.canMove()) {
        this.requestMotion("escape");
    }
  };

  makeActionList(): Game_Action[] {
    const list: Game_Action[] = [];
    const attackAction = new Game_Action(this);
    attackAction.setAttack();
    list.push(attackAction);
    for (const skill of this.usableSkills()) {
        const skillAction = new Game_Action(this);
        skillAction.setSkill(skill.id);
        list.push(skillAction);
    }
    return list;
  };

  makeAutoBattleActions(): void {
    for (let i = 0; i < this.numActions(); i++) {
        const list = this.makeActionList();
        let maxValue = Number.MIN_VALUE;
        for (const action of list) {
            const value = action.evaluate();
            if (value > maxValue) {
                maxValue = value;
                this.setAction(i, action);
            }
        }
    }
    this.setActionState("waiting");
  };

  makeConfusionActions(): void {
    for (let i = 0; i < this.numActions(); i++) {
        this.action(i).setConfusion();
    }
    this.setActionState("waiting");
  };

  makeActions(): void {
    super.makeActions();
    if (this.numActions() > 0) {
        this.setActionState("undecided");
    } else {
        this.setActionState("waiting");
    }
    if (this.isAutoBattle()) {
        this.makeAutoBattleActions();
    } else if (this.isConfused()) {
        this.makeConfusionActions();
    }
  };

  onPlayerWalk(): void {
    this.clearResult();
    this.checkFloorEffect();
    if ($gamePlayer.isNormal()) {
        this.turnEndOnMap();
        for (const state of this.states()) {
            this.updateStateSteps(state);
        }
        this.showAddedStates();
        this.showRemovedStates();
    }
  };

  updateStateSteps(state: MZ.DataState): void {
    if (state.removeByWalking) {
        if (this._stateSteps[state.id] > 0) {
            if (--this._stateSteps[state.id] === 0) {
                this.removeState(state.id);
            }
        }
    }
  };

  showAddedStates(): void {
    for (const state of this.result().addedStateObjects()) {
        if (state.message1) {
            $gameMessage.add(state.message1.format(this._name));
        }
    }
  };

  showRemovedStates(): void {
    for (const state of this.result().removedStateObjects()) {
        if (state.message4) {
            $gameMessage.add(state.message4.format(this._name));
        }
    }
  };

  stepsForTurn(): number {
    return 20;
  };

  turnEndOnMap(): void {
    if ($gameParty.steps() % this.stepsForTurn() === 0) {
        this.onTurnEnd();
        if (this.result().hpDamage > 0) {
            this.performMapDamage();
        }
    }
  };

  checkFloorEffect(): void {
    if ($gamePlayer.isOnDamageFloor()) {
        this.executeFloorDamage();
    }
  };

  executeFloorDamage(): void {
    const floorDamage = Math.floor(this.basicFloorDamage() * this.fdr);
    const realDamage = Math.min(floorDamage, this.maxFloorDamage());
    this.gainHp(-realDamage);
    if (realDamage > 0) {
        this.performMapDamage();
    }
  };

  basicFloorDamage(): number {
    return 10;
  };

  maxFloorDamage(): number {
    return $dataSystem.optFloorDeath ? this.hp : Math.max(this.hp - 1, 0);
  };

  performMapDamage(): void {
    if (!$gameParty.inBattle()) {
        $gameScreen.startFlashForDamage();
    }
  };

  clearActions(): void {
    super.clearActions();
    this._actionInputIndex = 0;
  };

  inputtingAction(): Game_Action {
    return this.action(this._actionInputIndex);
  };

  selectNextCommand(): boolean {
    if (this._actionInputIndex < this.numActions() - 1) {
        this._actionInputIndex++;
        return true;
    } else {
        return false;
    }
  };

  selectPreviousCommand(): boolean {
    if (this._actionInputIndex > 0) {
        this._actionInputIndex--;
        return true;
    } else {
        return false;
    }
  };

  lastSkill(): MZ.DataSkill {
    if ($gameParty.inBattle()) {
        return this.lastBattleSkill();
    } else {
        return this.lastMenuSkill();
    }
  };

  lastMenuSkill(): MZ.DataSkill {
    return this._lastMenuSkill.object() as MZ.DataSkill;
  };

  setLastMenuSkill(skill: MZ.DataSkill): void {
    this._lastMenuSkill.setObject(skill);
  };

  lastBattleSkill(): MZ.DataSkill {
    return this._lastBattleSkill.object() as MZ.DataSkill;
  };

  setLastBattleSkill(skill: MZ.DataSkill): void {
    this._lastBattleSkill.setObject(skill);
  };

  lastCommandSymbol(): string {
    return this._lastCommandSymbol;
  };

  setLastCommandSymbol(symbol: string): void {
    this._lastCommandSymbol = symbol;
  };

  testEscape(item: MZ.DataConsumable): boolean {
    return item.effects.some(
        effect => effect && effect.code === Game_Action.EFFECT_SPECIAL
    );
  };

  meetsUsableItemConditions(item: MZ.DataConsumable): boolean {
    if ($gameParty.inBattle()) {
        if (!BattleManager.canEscape() && this.testEscape(item)) {
            return false;
        }
    }
    return super.meetsUsableItemConditions(item);
  };

  onEscapeFailure(): void {
    if (BattleManager.isTpb()) {
        this.applyTpbPenalty();
    }
    this.clearActions();
    this.requestMotionRefresh();
  };
}