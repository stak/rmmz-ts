import { Game_Item } from '.';
import { Game_Actor } from '.';
import { Game_Enemy } from '.';
import { Game_Battler } from '.';
import { Game_Party } from '.';
import { Game_Troop } from '.';
import { Game_Unit } from '.';
import { DataManager } from '../managers';
import {
  $gameActors,
  $gameTroop,
  $gameVariables,
  $gameParty,
  $gameTemp,
  $dataSkills,
  $dataItems,
  $dataSystem,
} from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Action
//
// The game object class for a battle action.

export class Game_Action {
  _subjectActorId = 0
  _subjectEnemyIndex = -1
  _forcing = false
  _item = new Game_Item()
  _targetIndex = -1
  _reflectionTarget?: Game_Battler

  static EFFECT_RECOVER_HP = 11;
  static EFFECT_RECOVER_MP = 12;
  static EFFECT_GAIN_TP = 13;
  static EFFECT_ADD_STATE = 21;
  static EFFECT_REMOVE_STATE = 22;
  static EFFECT_ADD_BUFF = 31;
  static EFFECT_ADD_DEBUFF = 32;
  static EFFECT_REMOVE_BUFF = 33;
  static EFFECT_REMOVE_DEBUFF = 34;
  static EFFECT_SPECIAL = 41;
  static EFFECT_GROW = 42;
  static EFFECT_LEARN_SKILL = 43;
  static EFFECT_COMMON_EVENT = 44;
  static SPECIAL_EFFECT_ESCAPE = 0;
  static HITTYPE_CERTAIN = 0;
  static HITTYPE_PHYSICAL = 1;
  static HITTYPE_MAGICAL = 2;

  constructor(subject: Game_Battler, forcing?: boolean)
  constructor(thisClass: Constructable<Game_Action>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_Action) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(subject?: Game_Battler, forcing?: boolean): void {
    this._subjectActorId = 0;
    this._subjectEnemyIndex = -1;
    this._forcing = forcing || false;
    this.setSubject(subject!);
    this.clear();
  };

  clear(): void {
    this._item = new Game_Item();
    this._targetIndex = -1;
  };

  setSubject(subject: Game_Battler): void {
    if (subject.isActor()) {
        this._subjectActorId = (subject as Game_Actor).actorId();
        this._subjectEnemyIndex = -1;
    } else {
        this._subjectEnemyIndex = (subject as Game_Enemy).index();
        this._subjectActorId = 0;
    }
  };

  subject(): Game_Battler {
    if (this._subjectActorId > 0) {
        return $gameActors.actor(this._subjectActorId)!;
    } else {
        return $gameTroop.members()[this._subjectEnemyIndex];
    }
  };

  friendsUnit(): Game_Troop | Game_Party {
    return (this.subject() as Game_Actor | Game_Enemy).friendsUnit();
  };

  opponentsUnit(): Game_Troop | Game_Party {
    return (this.subject() as Game_Actor | Game_Enemy).opponentsUnit();
  };

  setEnemyAction(action: MZ.Action | null): void {
    if (action) {
        this.setSkill(action.skillId);
    } else {
        this.clear();
    }
  };

  setAttack(): void {
    this.setSkill(this.subject().attackSkillId());
  };

  setGuard(): void {
    this.setSkill(this.subject().guardSkillId());
  };

  setSkill(skillId: MZ.SkillID): void {
    this._item.setObject($dataSkills[skillId]);
  };

  setItem(itemId: MZ.ItemID): void {
    this._item.setObject($dataItems[itemId]);
  };

  setItemObject(object: MZ.DataConsumable | null): void {
    this._item.setObject(object);
  };

  setTarget(targetIndex: number): void {
    this._targetIndex = targetIndex;
  };

  item(): MZ.DataConsumable {
    return this._item.object() as MZ.DataConsumable;
  };

  isSkill(): boolean {
    return this._item.isSkill();
  };

  isItem(): boolean {
    return this._item.isItem();
  };

  numRepeats(): number {
    let repeats = this.item().repeats;
    if (this.isAttack()) {
        repeats += this.subject().attackTimesAdd();
    }
    return Math.floor(repeats);
  };

  checkItemScope(list: MZ.ConsumableScope[]): boolean {
    return list.includes(this.item().scope);
  };

  isForOpponent(): boolean {
    return this.checkItemScope([1, 2, 3, 4, 5, 6, 14]);
  };

  isForFriend(): boolean {
    return this.checkItemScope([7, 8, 9, 10, 11, 12, 13, 14]);
  };

  isForEveryone(): boolean {
    return this.checkItemScope([14]);
  };

  isForAliveFriend(): boolean {
    return this.checkItemScope([7, 8, 11, 14]);
  };

  isForDeadFriend(): boolean {
    return this.checkItemScope([9, 10]);
  };

  isForUser(): boolean {
    return this.checkItemScope([11]);
  };

  isForOne(): boolean {
    return this.checkItemScope([1, 3, 7, 9, 11, 12]);
  };

  isForRandom(): boolean {
    return this.checkItemScope([3, 4, 5, 6]);
  };

  isForAll(): boolean {
    return this.checkItemScope([2, 8, 10, 13, 14]);
  };

  needsSelection(): boolean {
    return this.checkItemScope([1, 7, 9, 12]);
  };

  numTargets(): number {
    return this.isForRandom() ? this.item().scope - 2 : 0;
  };

  checkDamageType(list: number[]): boolean {
    return list.includes(this.item().damage.type);
  };

  isHpEffect(): boolean {
    return this.checkDamageType([1, 3, 5]);
  };

  isMpEffect(): boolean {
    return this.checkDamageType([2, 4, 6]);
  };

  isDamage(): boolean {
    return this.checkDamageType([1, 2]);
  };

  isRecover(): boolean {
    return this.checkDamageType([3, 4]);
  };

  isDrain(): boolean {
    return this.checkDamageType([5, 6]);
  };

  isHpRecover(): boolean {
    return this.checkDamageType([3]);
  };

  isMpRecover(): boolean {
    return this.checkDamageType([4]);
  };

  isCertainHit(): boolean {
    return this.item().hitType === Game_Action.HITTYPE_CERTAIN;
  };

  isPhysical(): boolean {
    return this.item().hitType === Game_Action.HITTYPE_PHYSICAL;
  };

  isMagical(): boolean {
    return this.item().hitType === Game_Action.HITTYPE_MAGICAL;
  };

  isAttack(): boolean {
    return this.item() === $dataSkills[this.subject().attackSkillId()];
  };

  isGuard(): boolean {
    return this.item() === $dataSkills[this.subject().guardSkillId()];
  };

  isMagicSkill(): boolean {
    if (this.isSkill()) {
        return $dataSystem.magicSkills.includes((this.item() as MZ.DataSkill).stypeId);
    } else {
        return false;
    }
  };

  decideRandomTarget(): void {
    let target;
    if (this.isForDeadFriend()) {
        target = this.friendsUnit().randomDeadTarget();
    } else if (this.isForFriend()) {
        target = this.friendsUnit().randomTarget();
    } else {
        target = this.opponentsUnit().randomTarget();
    }
    if (target) {
        this._targetIndex = (target as Game_Actor | Game_Enemy).index();
    } else {
        this.clear();
    }
  };

  setConfusion(): void {
    this.setAttack();
  };

  prepare(): void {
    if (this.subject().isConfused() && !this._forcing) {
        this.setConfusion();
    }
  };

  isValid(): boolean {
    return (this._forcing && !!this.item()) || this.subject().canUse(this.item());
  };

  speed(): number {
    const agi = this.subject().agi;
    let speed = agi + Math.randomInt(Math.floor(5 + agi / 4));
    if (this.item()) {
        speed += this.item().speed;
    }
    if (this.isAttack()) {
        speed += this.subject().attackSpeed();
    }
    return speed;
  };

  makeTargets(): Game_Battler[] {
    const targets = [];
    if (!this._forcing && this.subject().isConfused()) {
        targets.push(this.confusionTarget());
    } else if (this.isForEveryone()) {
        targets.push(...this.targetsForEveryone());
    } else if (this.isForOpponent()) {
        targets.push(...this.targetsForOpponents());
    } else if (this.isForFriend()) {
        targets.push(...this.targetsForFriends());
    }
    return this.repeatTargets(targets);
  };

  repeatTargets(targets: (Game_Battler | null)[]): Game_Battler[] {
    const repeatedTargets = [];
    const repeats = this.numRepeats();
    for (const target of targets) {
        if (target) {
            for (let i = 0; i < repeats; i++) {
                repeatedTargets.push(target);
            }
        }
    }
    return repeatedTargets;
  };

  confusionTarget(): Game_Battler | null {
    switch (this.subject().confusionLevel()) {
        case 1:
            return this.opponentsUnit().randomTarget();
        case 2:
            if (Math.randomInt(2) === 0) {
                return this.opponentsUnit().randomTarget();
            }
            return this.friendsUnit().randomTarget();
        default:
            return this.friendsUnit().randomTarget();
    }
  };

  targetsForEveryone(): Game_Battler[] {
    const opponentMembers = this.opponentsUnit().aliveMembers();
    const friendMembers = this.friendsUnit().aliveMembers();
    return opponentMembers.concat(friendMembers);
  };

  targetsForOpponents(): Game_Battler[] {
    const unit = this.opponentsUnit();
    if (this.isForRandom()) {
        return this.randomTargets(unit);
    } else {
        return this.targetsForAlive(unit);
    }
  };

  targetsForFriends(): Game_Battler[] {
    const unit = this.friendsUnit();
    if (this.isForUser()) {
        return [this.subject()];
    } else if (this.isForDeadFriend()) {
        return this.targetsForDead(unit);
    } else if (this.isForAliveFriend()) {
        return this.targetsForAlive(unit);
    } else {
        return this.targetsForDeadAndAlive(unit);
    }
  };

  randomTargets(unit: Game_Unit): Game_Battler[] {
    const targets: Game_Battler[] = [];
    for (let i = 0; i < this.numTargets(); i++) {
        targets.push(unit.randomTarget()!);
    }
    return targets;
  };

  targetsForDead(unit: Game_Unit): Game_Battler[] {
    if (this.isForOne()) {
        return [unit.smoothDeadTarget(this._targetIndex)];
    } else {
        return unit.deadMembers();
    }
  };

  targetsForAlive(unit: Game_Unit): Game_Battler[] {
    if (this.isForOne()) {
        if (this._targetIndex < 0) {
            return [unit.randomTarget()!];
        } else {
            return [unit.smoothTarget(this._targetIndex)];
        }
    } else {
        return unit.aliveMembers();
    }
  };

  targetsForDeadAndAlive(unit: Game_Unit): Game_Battler[] {
    if (this.isForOne()) {
        return [unit.members()[this._targetIndex]];
    } else {
        return unit.members();
    }
  };

  evaluate(): number {
    let value = 0;
    for (const target of this.itemTargetCandidates()) {
        const targetValue = this.evaluateWithTarget(target);
        if (this.isForAll()) {
            value += targetValue;
        } else if (targetValue > value) {
            value = targetValue;
            this._targetIndex = (target as Game_Actor | Game_Enemy).index();
        }
    }
    value *= this.numRepeats();
    if (value > 0) {
        value += Math.random();
    }
    return value;
  };

  itemTargetCandidates(): Game_Battler[] {
    if (!this.isValid()) {
        return [];
    } else if (this.isForOpponent()) {
        return this.opponentsUnit().aliveMembers();
    } else if (this.isForUser()) {
        return [this.subject()];
    } else if (this.isForDeadFriend()) {
        return this.friendsUnit().deadMembers();
    } else {
        return this.friendsUnit().aliveMembers();
    }
  };

  evaluateWithTarget(target: Game_Battler): number {
    if (this.isHpEffect()) {
        const value = this.makeDamageValue(target, false);
        if (this.isForOpponent()) {
            return value / Math.max(target.hp, 1);
        } else {
            const recovery = Math.min(-value, target.mhp - target.hp);
            return recovery / target.mhp;
        }
    }
    return 0;
  };

  testApply(target: Game_Battler): boolean {
    return (
        this.testLifeAndDeath(target) &&
        ($gameParty.inBattle() ||
            (this.isHpRecover() && target.hp < target.mhp) ||
            (this.isMpRecover() && target.mp < target.mmp) ||
            this.hasItemAnyValidEffects(target))
    );
  };

  testLifeAndDeath(target: Game_Battler): boolean {
    if (this.isForOpponent() || this.isForAliveFriend()) {
        return target.isAlive();
    } else if (this.isForDeadFriend()) {
        return target.isDead();
    } else {
        return true;
    }
  };

  hasItemAnyValidEffects(target: Game_Battler): boolean {
    return this.item().effects.some(effect =>
        this.testItemEffect(target, effect)
    );
  };

  testItemEffect(target: Game_Battler, effect: MZ.Effect): boolean {
    switch (effect.code) {
        case Game_Action.EFFECT_RECOVER_HP:
            return (
                target.hp < target.mhp || effect.value1 < 0 || effect.value2 < 0
            );
        case Game_Action.EFFECT_RECOVER_MP:
            return (
                target.mp < target.mmp || effect.value1 < 0 || effect.value2 < 0
            );
        case Game_Action.EFFECT_ADD_STATE:
            return !target.isStateAffected(effect.dataId);
        case Game_Action.EFFECT_REMOVE_STATE:
            return target.isStateAffected(effect.dataId);
        case Game_Action.EFFECT_ADD_BUFF:
            return !target.isMaxBuffAffected(effect.dataId);
        case Game_Action.EFFECT_ADD_DEBUFF:
            return !target.isMaxDebuffAffected(effect.dataId);
        case Game_Action.EFFECT_REMOVE_BUFF:
            return target.isBuffAffected(effect.dataId);
        case Game_Action.EFFECT_REMOVE_DEBUFF:
            return target.isDebuffAffected(effect.dataId);
        case Game_Action.EFFECT_LEARN_SKILL:
            return target.isActor() && !(target as Game_Actor).isLearnedSkill(effect.dataId);
        default:
            return true;
    }
  };

  itemCnt(target: Game_Battler): number {
    if (this.isPhysical() && target.canMove()) {
        return target.cnt;
    } else {
        return 0;
    }
  };

  itemMrf(target: Game_Battler): number {
    if (this.isMagical()) {
        return target.mrf;
    } else {
        return 0;
    }
  };

  itemHit(target: Game_Battler): number {
    const successRate = this.item().successRate;
    if (this.isPhysical()) {
        return successRate * 0.01 * this.subject().hit;
    } else {
        return successRate * 0.01;
    }
  };

  itemEva(target: Game_Battler): number {
    if (this.isPhysical()) {
        return target.eva;
    } else if (this.isMagical()) {
        return target.mev;
    } else {
        return 0;
    }
  };

  itemCri(target: Game_Battler): number {
    return this.item().damage.critical
        ? this.subject().cri * (1 - target.cev)
        : 0;
  };

  apply(target: Game_Battler): void {
    const result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = this.testApply(target);
    result.missed = result.used && Math.random() >= this.itemHit(target);
    result.evaded = !result.missed && Math.random() < this.itemEva(target);
    result.physical = this.isPhysical();
    result.drain = this.isDrain();
    if (result.isHit()) {
        if (this.item().damage.type > 0) {
            result.critical = Math.random() < this.itemCri(target);
            const value = this.makeDamageValue(target, result.critical);
            this.executeDamage(target, value);
        }
        for (const effect of this.item().effects) {
            this.applyItemEffect(target, effect);
        }
        this.applyItemUserEffect(target);
    }
    this.updateLastTarget(target);
  };

  makeDamageValue(target: Game_Battler, critical: boolean): number {
    const item = this.item();
    const baseValue = this.evalDamageFormula(target);
    let value = baseValue * this.calcElementRate(target);
    if (this.isPhysical()) {
        value *= target.pdr;
    }
    if (this.isMagical()) {
        value *= target.mdr;
    }
    if (baseValue < 0) {
        value *= target.rec;
    }
    if (critical) {
        value = this.applyCritical(value);
    }
    value = this.applyVariance(value, item.damage.variance);
    value = this.applyGuard(value, target);
    value = Math.round(value);
    return value;
  };

  evalDamageFormula(target: Game_Battler): number {
    try {
        const item = this.item();
        const a = this.subject(); // eslint-disable-line no-unused-vars
        const b = target; // eslint-disable-line no-unused-vars
        const v = $gameVariables._data; // eslint-disable-line no-unused-vars
        const sign = [3, 4].includes(item.damage.type) ? -1 : 1;
        const value = Math.max(eval(item.damage.formula), 0) * sign;
        return isNaN(value) ? 0 : value;
    } catch (e) {
        return 0;
    }
  };

  calcElementRate(target: Game_Battler): number {
    if (this.item().damage.elementId < 0) {
        return this.elementsMaxRate(target, this.subject().attackElements());
    } else {
        return target.elementRate(this.item().damage.elementId);
    }
  };

  elementsMaxRate(target: Game_Battler, elements: number[]): number {
    if (elements.length > 0) {
        const rates = elements.map(elementId => target.elementRate(elementId));
        return Math.max(...rates);
    } else {
        return 1;
    }
  };

  applyCritical(damage: number): number {
    return damage * 3;
  };

  applyVariance(damage: number, variance: number): number {
    const amp = Math.floor(Math.max((Math.abs(damage) * variance) / 100, 0));
    const v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
    return damage >= 0 ? damage + v : damage - v;
  };

  applyGuard(damage: number, target: Game_Battler): number {
    return damage / (damage > 0 && target.isGuard() ? 2 * target.grd : 1);
  };

  executeDamage(target: Game_Battler, value: number): void {
    const result = target.result();
    if (value === 0) {
        result.critical = false;
    }
    if (this.isHpEffect()) {
        this.executeHpDamage(target, value);
    }
    if (this.isMpEffect()) {
        this.executeMpDamage(target, value);
    }
  };

  executeHpDamage(target: Game_Battler, value: number): void {
    if (this.isDrain()) {
        value = Math.min(target.hp, value);
    }
    this.makeSuccess(target);
    target.gainHp(-value);
    if (value > 0) {
        target.onDamage(value);
    }
    this.gainDrainedHp(value);
  };

  executeMpDamage(target: Game_Battler, value: number): void {
    if (!this.isMpRecover()) {
        value = Math.min(target.mp, value);
    }
    if (value !== 0) {
        this.makeSuccess(target);
    }
    target.gainMp(-value);
    this.gainDrainedMp(value);
  };

  gainDrainedHp(value: number): void {
    if (this.isDrain()) {
        let gainTarget = this.subject();
        if (this._reflectionTarget) {
            gainTarget = this._reflectionTarget;
        }
        gainTarget.gainHp(value);
    }
  };

  gainDrainedMp(value: number): void {
    if (this.isDrain()) {
        let gainTarget = this.subject();
        if (this._reflectionTarget) {
            gainTarget = this._reflectionTarget;
        }
        gainTarget.gainMp(value);
    }
  };

  applyItemEffect(target: Game_Battler, effect: MZ.Effect): void {
    switch (effect.code) {
        case Game_Action.EFFECT_RECOVER_HP:
            this.itemEffectRecoverHp(target, effect);
            break;
        case Game_Action.EFFECT_RECOVER_MP:
            this.itemEffectRecoverMp(target, effect);
            break;
        case Game_Action.EFFECT_GAIN_TP:
            this.itemEffectGainTp(target, effect);
            break;
        case Game_Action.EFFECT_ADD_STATE:
            this.itemEffectAddState(target, effect);
            break;
        case Game_Action.EFFECT_REMOVE_STATE:
            this.itemEffectRemoveState(target, effect);
            break;
        case Game_Action.EFFECT_ADD_BUFF:
            this.itemEffectAddBuff(target, effect);
            break;
        case Game_Action.EFFECT_ADD_DEBUFF:
            this.itemEffectAddDebuff(target, effect);
            break;
        case Game_Action.EFFECT_REMOVE_BUFF:
            this.itemEffectRemoveBuff(target, effect);
            break;
        case Game_Action.EFFECT_REMOVE_DEBUFF:
            this.itemEffectRemoveDebuff(target, effect);
            break;
        case Game_Action.EFFECT_SPECIAL:
            this.itemEffectSpecial(target, effect);
            break;
        case Game_Action.EFFECT_GROW:
            this.itemEffectGrow(target, effect);
            break;
        case Game_Action.EFFECT_LEARN_SKILL:
            this.itemEffectLearnSkill(target, effect);
            break;
        case Game_Action.EFFECT_COMMON_EVENT:
            this.itemEffectCommonEvent(target, effect);
            break;
    }
  };

  itemEffectRecoverHp(target: Game_Battler, effect: MZ.Effect): void {
    let value = (target.mhp * effect.value1 + effect.value2) * target.rec;
    if (this.isItem()) {
        value *= this.subject().pha;
    }
    value = Math.floor(value);
    if (value !== 0) {
        target.gainHp(value);
        this.makeSuccess(target);
    }
  };

  itemEffectRecoverMp(target: Game_Battler, effect: MZ.Effect): void {
    let value = (target.mmp * effect.value1 + effect.value2) * target.rec;
    if (this.isItem()) {
        value *= this.subject().pha;
    }
    value = Math.floor(value);
    if (value !== 0) {
        target.gainMp(value);
        this.makeSuccess(target);
    }
  };

  itemEffectGainTp(target: Game_Battler, effect: MZ.Effect): void {
    let value = Math.floor(effect.value1);
    if (value !== 0) {
        target.gainTp(value);
        this.makeSuccess(target);
    }
  };

  itemEffectAddState(target: Game_Battler, effect: MZ.Effect): void {
    if (effect.dataId === 0) {
        this.itemEffectAddAttackState(target, effect);
    } else {
        this.itemEffectAddNormalState(target, effect);
    }
  };

  itemEffectAddAttackState(target: Game_Battler, effect: MZ.Effect): void {
    for (const stateId of this.subject().attackStates()) {
        let chance = effect.value1;
        chance *= target.stateRate(stateId);
        chance *= this.subject().attackStatesRate(stateId);
        chance *= this.lukEffectRate(target);
        if (Math.random() < chance) {
            target.addState(stateId);
            this.makeSuccess(target);
        }
    }
  };

  itemEffectAddNormalState(target: Game_Battler, effect: MZ.Effect): void {
    let chance = effect.value1;
    if (!this.isCertainHit()) {
        chance *= target.stateRate(effect.dataId);
        chance *= this.lukEffectRate(target);
    }
    if (Math.random() < chance) {
        target.addState(effect.dataId);
        this.makeSuccess(target);
    }
  };

  itemEffectRemoveState(target: Game_Battler, effect: MZ.Effect): void {
    let chance = effect.value1;
    if (Math.random() < chance) {
        target.removeState(effect.dataId);
        this.makeSuccess(target);
    }
  };

  itemEffectAddBuff(target: Game_Battler, effect: MZ.Effect): void {
    target.addBuff(effect.dataId, effect.value1);
    this.makeSuccess(target);
  };

  itemEffectAddDebuff(target: Game_Battler, effect: MZ.Effect): void {
    let chance = target.debuffRate(effect.dataId) * this.lukEffectRate(target);
    if (Math.random() < chance) {
        target.addDebuff(effect.dataId, effect.value1);
        this.makeSuccess(target);
    }
  };

  itemEffectRemoveBuff(target: Game_Battler, effect: MZ.Effect): void {
    if (target.isBuffAffected(effect.dataId)) {
        target.removeBuff(effect.dataId);
        this.makeSuccess(target);
    }
  };

  itemEffectRemoveDebuff(target: Game_Battler, effect: MZ.Effect): void {
    if (target.isDebuffAffected(effect.dataId)) {
        target.removeBuff(effect.dataId);
        this.makeSuccess(target);
    }
  };

  itemEffectSpecial(target: Game_Battler, effect: MZ.Effect): void {
    if (effect.dataId === Game_Action.SPECIAL_EFFECT_ESCAPE) {
        target.escape();
        this.makeSuccess(target);
    }
  };

  itemEffectGrow(target: Game_Battler, effect: MZ.Effect): void {
    target.addParam(effect.dataId, Math.floor(effect.value1));
    this.makeSuccess(target);
  };

  itemEffectLearnSkill(target: Game_Battler, effect: MZ.Effect): void {
    if (target.isActor()) {
        (target as Game_Actor).learnSkill(effect.dataId);
        this.makeSuccess(target);
    }
  };

  itemEffectCommonEvent(target: Game_Battler, effect: MZ.Effect): void {
    //
  };

  makeSuccess(target: Game_Battler): void {
    target.result().success = true;
  };

  applyItemUserEffect(target: Game_Battler): void {
    const value = Math.floor(this.item().tpGain * this.subject().tcr);
    this.subject().gainSilentTp(value);
  };

  lukEffectRate(target: Game_Battler): number {
    return Math.max(1.0 + (this.subject().luk - target.luk) * 0.001, 0.0);
  };

  applyGlobal(): void {
    for (const effect of this.item().effects) {
        if (effect.code === Game_Action.EFFECT_COMMON_EVENT) {
            $gameTemp.reserveCommonEvent(effect.dataId);
        }
    }
    this.updateLastUsed();
    this.updateLastSubject();
  };

  updateLastUsed(): void {
    const item = this.item();
    if (DataManager.isSkill(item)) {
        $gameTemp.setLastUsedSkillId(item.id);
    } else if (DataManager.isItem(item)) {
        $gameTemp.setLastUsedItemId(item.id);
    }
  };

  updateLastSubject(): void {
    const subject = this.subject();
    if (subject.isActor()) {
        $gameTemp.setLastSubjectActorId((subject as Game_Actor).actorId());
    } else {
        $gameTemp.setLastSubjectEnemyIndex((subject as Game_Enemy).index() + 1);
    }
  };

  updateLastTarget(target: Game_Battler): void {
    if (target.isActor()) {
        $gameTemp.setLastTargetActorId((target as Game_Actor).actorId());
    } else {
        $gameTemp.setLastTargetEnemyIndex((target as Game_Enemy).index() + 1);
    }
  };
}
