import { BattleManager, SoundManager, DataManager } from '../managers';
import { Game_BattlerBase } from '.';
import { Game_Action } from '.';
import { Game_ActionResult } from '.';
import { $gameParty, $gameTroop, $dataStates, $dataSystem } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Battler
//
// The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
// and actions.

export class Game_Battler extends Game_BattlerBase {
  _actions: Game_Action[] = [];
  _speed = 0;
  _result = new Game_ActionResult();
  _actionState = "";
  _lastTargetIndex = 0;
  _damagePopup = false;
  _effectType: string | null = null;
  _motionType: string | null = null;
  _weaponImageId = 0;
  _motionRefresh = false;
  _selected = false;
  _tpbState = "";
  _tpbChargeTime = 0;
  _tpbCastTime = 0;
  _tpbIdleTime = 0;
  _tpbTurnCount = 0;
  _tpbTurnEnd = false;

  constructor()
  constructor(thisClass: Constructable<Game_Battler>)
  constructor(arg?: any) {
    super(Game_BattlerBase);
    if (typeof arg === "function" && arg === Game_Battler) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  initMembers(): void {
    super.initMembers();
    this._actions = [];
    this._speed = 0;
    this._result = new Game_ActionResult();
    this._actionState = "";
    this._lastTargetIndex = 0;
    this._damagePopup = false;
    this._effectType = null;
    this._motionType = null;
    this._weaponImageId = 0;
    this._motionRefresh = false;
    this._selected = false;
    this._tpbState = "";
    this._tpbChargeTime = 0;
    this._tpbCastTime = 0;
    this._tpbIdleTime = 0;
    this._tpbTurnCount = 0;
    this._tpbTurnEnd = false;
  };

  clearDamagePopup(): void {
    this._damagePopup = false;
  };

  clearWeaponAnimation(): void {
    this._weaponImageId = 0;
  };

  clearEffect(): void {
    this._effectType = null;
  };

  clearMotion(): void {
    this._motionType = null;
    this._motionRefresh = false;
  };

  requestEffect(effectType: string): void {
    this._effectType = effectType;
  };

  requestMotion(motionType: string): void {
    this._motionType = motionType;
  };

  requestMotionRefresh(): void {
    this._motionRefresh = true;
  };

  select(): void {
    this._selected = true;
  };

  deselect(): void {
    this._selected = false;
  };

  isDamagePopupRequested(): boolean {
    return this._damagePopup;
  };

  isEffectRequested(): boolean {
    return !!this._effectType;
  };

  isMotionRequested(): boolean {
    return !!this._motionType;
  };

  isWeaponAnimationRequested(): boolean {
    return this._weaponImageId > 0;
  };

  isMotionRefreshRequested(): boolean {
    return this._motionRefresh;
  };

  isSelected(): boolean {
    return this._selected;
  };

  effectType(): string | null {
    return this._effectType;
  };

  motionType(): string | null {
    return this._motionType;
  };

  weaponImageId(): number {
    return this._weaponImageId;
  };

  startDamagePopup(): void {
    this._damagePopup = true;
  };

  shouldPopupDamage(): boolean {
    const result = this._result;
    return (
        result.missed ||
        result.evaded ||
        result.hpAffected ||
        result.mpDamage !== 0
    );
  };

  startWeaponAnimation(weaponImageId: number): void {
    this._weaponImageId = weaponImageId;
  };

  action(index: number): Game_Action {
    return this._actions[index];
  };

  setAction(index: number, action: Game_Action): void {
    this._actions[index] = action;
  };

  numActions(): number {
    return this._actions.length;
  };

  clearActions(): void {
    this._actions = [];
  };

  result(): Game_ActionResult {
    return this._result;
  };

  clearResult(): void {
    this._result.clear();
  };

  clearTpbChargeTime(): void {
    this._tpbState = "charging";
    this._tpbChargeTime = 0;
  };

  applyTpbPenalty(): void {
    this._tpbState = "charging";
    this._tpbChargeTime -= 1;
  };

  initTpbChargeTime(advantageous?: boolean): void {
    const speed = this.tpbRelativeSpeed();
    this._tpbState = "charging";
    this._tpbChargeTime = advantageous ? 1 : speed * Math.random() * 0.5;
    if (this.isRestricted()) {
        this._tpbChargeTime = 0;
    }
  };

  tpbChargeTime(): number {
    return this._tpbChargeTime;
  };

  startTpbCasting(): void {
    this._tpbState = "casting";
    this._tpbCastTime = 0;
  };

  startTpbAction(): void {
    this._tpbState = "acting";
  };

  isTpbCharged(): boolean {
    return this._tpbState === "charged";
  };

  isTpbReady(): boolean {
    return this._tpbState === "ready";
  };

  isTpbTimeout(): boolean {
    return this._tpbIdleTime >= 1;
  };

  updateTpb(): void {
    if (this.canMove()) {
        this.updateTpbChargeTime();
        this.updateTpbCastTime();
        this.updateTpbAutoBattle();
    }
    if (this.isAlive()) {
        this.updateTpbIdleTime();
    }
  };

  updateTpbChargeTime(): void {
    if (this._tpbState === "charging") {
        this._tpbChargeTime += this.tpbAcceleration();
        if (this._tpbChargeTime >= 1) {
            this._tpbChargeTime = 1;
            this.onTpbCharged();
        }
    }
  };

  updateTpbCastTime(): void {
    if (this._tpbState === "casting") {
        this._tpbCastTime += this.tpbAcceleration();
        if (this._tpbCastTime >= this.tpbRequiredCastTime()) {
            this._tpbCastTime = this.tpbRequiredCastTime();
            this._tpbState = "ready";
        }
    }
  };

  updateTpbAutoBattle(): void {
    if (this.isTpbCharged() && !this.isTpbTurnEnd() && this.isAutoBattle()) {
        this.makeTpbActions();
    }
  };

  updateTpbIdleTime(): void {
    if (!this.canMove() || this.isTpbCharged()) {
        this._tpbIdleTime += this.tpbAcceleration();
    }
  };

  tpbAcceleration(): number {
    const speed = this.tpbRelativeSpeed();
    const referenceTime = $gameParty.tpbReferenceTime();
    return speed / referenceTime;
  };

  tpbRelativeSpeed(): number {
    return this.tpbSpeed() / $gameParty.tpbBaseSpeed();
  };

  tpbSpeed(): number {
    return Math.sqrt(this.agi) + 1;
  };

  tpbBaseSpeed(): number {
    const baseAgility = this.paramBasePlus(6);
    return Math.sqrt(baseAgility) + 1;
  };

  tpbRequiredCastTime(): number {
    const actions = this._actions.filter(action => action.isValid());
    const items = actions.map(action => action.item());
    const delay = items.reduce((r, item) => r + Math.max(0, -item.speed), 0);
    return Math.sqrt(delay) / this.tpbSpeed();
  };

  onTpbCharged(): void {
    if (!this.shouldDelayTpbCharge()) {
        this.finishTpbCharge();
    }
  };

  shouldDelayTpbCharge(): boolean {
    return !BattleManager.isActiveTpb() && $gameParty.canInput();
  };

  finishTpbCharge(): void {
    this._tpbState = "charged";
    this._tpbTurnEnd = true;
    this._tpbIdleTime = 0;
  };

  isTpbTurnEnd(): boolean {
    return this._tpbTurnEnd;
  };

  initTpbTurn(): void {
    this._tpbTurnEnd = false;
    this._tpbTurnCount = 0;
    this._tpbIdleTime = 0;
  };

  startTpbTurn(): void {
    this._tpbTurnEnd = false;
    this._tpbTurnCount++;
    this._tpbIdleTime = 0;
    if (this.numActions() === 0) {
        this.makeTpbActions();
    }
  };

  makeTpbActions(): void {
    this.makeActions();
    if (this.canInput()) {
        this.setActionState("undecided");
    } else {
        this.startTpbCasting();
        this.setActionState("waiting");
    }
  };

  onTpbTimeout(): void {
    this.onAllActionsEnd();
    this._tpbTurnEnd = true;
    this._tpbIdleTime = 0;
  };

  turnCount(): number {
    if (BattleManager.isTpb()) {
        return this._tpbTurnCount;
    } else {
        return $gameTroop.turnCount() + 1;
    }
  };

  canInput(): boolean {
    if (BattleManager.isTpb() && !this.isTpbCharged()) {
        return false;
    }
    return super.canInput();
  };

  refresh(): void {
    Game_BattlerBase.prototype.refresh.call(this);
    if (this.hp === 0) {
        this.addState(this.deathStateId());
    } else {
        this.removeState(this.deathStateId());
    }
  };

  addState(stateId: MZ.StateID): void {
    if (this.isStateAddable(stateId)) {
        if (!this.isStateAffected(stateId)) {
            this.addNewState(stateId);
            this.refresh();
        }
        this.resetStateCounts(stateId);
        this._result.pushAddedState(stateId);
    }
  };

  isStateAddable(stateId: MZ.StateID): boolean {
    return (
        this.isAlive() &&
        $dataStates[stateId] &&
        !this.isStateResist(stateId) &&
        !this.isStateRestrict(stateId)
    );
  };

  isStateRestrict(stateId: MZ.StateID): boolean {
    return $dataStates[stateId].removeByRestriction && this.isRestricted();
  };

  onRestrict(): void {
    Game_BattlerBase.prototype.onRestrict.call(this);
    this.clearTpbChargeTime();
    this.clearActions();
    for (const state of this.states()) {
        if (state.removeByRestriction) {
            this.removeState(state.id);
        }
    }
  };

  removeState(stateId: MZ.StateID): void {
    if (this.isStateAffected(stateId)) {
        if (stateId === this.deathStateId()) {
            this.revive();
        }
        this.eraseState(stateId);
        this.refresh();
        this._result.pushRemovedState(stateId);
    }
  };

  escape(): void {
    if ($gameParty.inBattle()) {
        this.hide();
    }
    this.clearActions();
    this.clearStates();
    SoundManager.playEscape();
  };

  addBuff(paramId: number, turns: number): void {
    if (this.isAlive()) {
        this.increaseBuff(paramId);
        if (this.isBuffAffected(paramId)) {
            this.overwriteBuffTurns(paramId, turns);
        }
        this._result.pushAddedBuff(paramId);
        this.refresh();
    }
  };

  addDebuff(paramId: number, turns: number): void {
    if (this.isAlive()) {
        this.decreaseBuff(paramId);
        if (this.isDebuffAffected(paramId)) {
            this.overwriteBuffTurns(paramId, turns);
        }
        this._result.pushAddedDebuff(paramId);
        this.refresh();
    }
  };

  removeBuff(paramId: number): void {
    if (this.isAlive() && this.isBuffOrDebuffAffected(paramId)) {
        this.eraseBuff(paramId);
        this._result.pushRemovedBuff(paramId);
        this.refresh();
    }
  };

  removeBattleStates(): void {
    for (const state of this.states()) {
        if (state.removeAtBattleEnd) {
            this.removeState(state.id);
        }
    }
  };

  removeAllBuffs(): void {
    for (let i = 0; i < this.buffLength(); i++) {
        this.removeBuff(i);
    }
  };

  removeStatesAuto(timing: number): void {
    for (const state of this.states()) {
        if (
            this.isStateExpired(state.id) &&
            state.autoRemovalTiming === timing
        ) {
            this.removeState(state.id);
        }
    }
  };

  removeBuffsAuto(): void {
    for (let i = 0; i < this.buffLength(); i++) {
        if (this.isBuffExpired(i)) {
            this.removeBuff(i);
        }
    }
  };

  removeStatesByDamage(): void {
    for (const state of this.states()) {
        if (
            state.removeByDamage &&
            Math.randomInt(100) < state.chanceByDamage
        ) {
            this.removeState(state.id);
        }
    }
  };

  makeActionTimes(): number {
    const actionPlusSet = this.actionPlusSet();
    return actionPlusSet.reduce((r, p) => (Math.random() < p ? r + 1 : r), 1);
  };

  makeActions(): void {
    this.clearActions();
    if (this.canMove()) {
        const actionTimes = this.makeActionTimes();
        this._actions = [];
        for (let i = 0; i < actionTimes; i++) {
            this._actions.push(new Game_Action(this));
        }
    }
  };

  speed(): number {
    return this._speed;
  };

  makeSpeed(): void {
    this._speed = Math.min(...this._actions.map(action => action.speed())) || 0;
  };

  currentAction(): Game_Action {
    return this._actions[0];
  };

  removeCurrentAction(): void {
    this._actions.shift();
  };

  setLastTarget(target: Game_Battler): void {
    this._lastTargetIndex = target ? (target as any).index() : 0;
  };

  forceAction(skillId: MZ.SkillID, targetIndex: number): void {
    this.clearActions();
    const action = new Game_Action(this, true);
    action.setSkill(skillId);
    if (targetIndex === -2) {
        action.setTarget(this._lastTargetIndex);
    } else if (targetIndex === -1) {
        action.decideRandomTarget();
    } else {
        action.setTarget(targetIndex);
    }
    this._actions.push(action);
  };

  useItem(item: MZ.DataConsumable): void {
    if (DataManager.isSkill(item)) {
        this.paySkillCost(item as MZ.DataSkill);
    } else if (DataManager.isItem(item)) {
        this.consumeItem(item as MZ.DataItem);
    }
  };

  consumeItem(item: MZ.DataItemBase): void {
    $gameParty.consumeItem(item);
  };

  gainHp(value: number): void {
    this._result.hpDamage = -value;
    this._result.hpAffected = true;
    this.setHp(this.hp + value);
  };

  gainMp(value: number): void {
    this._result.mpDamage = -value;
    this.setMp(this.mp + value);
  };

  gainTp(value: number): void {
    this._result.tpDamage = -value;
    this.setTp(this.tp + value);
  };

  gainSilentTp(value: number): void {
    this.setTp(this.tp + value);
  };

  initTp(): void {
    this.setTp(Math.randomInt(25));
  };

  clearTp(): void {
    this.setTp(0);
  };

  chargeTpByDamage(damageRate: number): void {
    const value = Math.floor(50 * damageRate * this.tcr);
    this.gainSilentTp(value);
  };

  regenerateHp(): void {
    const minRecover = -this.maxSlipDamage();
    const value = Math.max(Math.floor(this.mhp * this.hrg), minRecover);
    if (value !== 0) {
        this.gainHp(value);
    }
  };

  maxSlipDamage(): number {
    return $dataSystem.optSlipDeath ? this.hp : Math.max(this.hp - 1, 0);
  };

  regenerateMp(): void {
    const value = Math.floor(this.mmp * this.mrg);
    if (value !== 0) {
        this.gainMp(value);
    }
  };

  regenerateTp(): void {
    const value = Math.floor(100 * this.trg);
    this.gainSilentTp(value);
  };

  regenerateAll(): void {
    if (this.isAlive()) {
        this.regenerateHp();
        this.regenerateMp();
        this.regenerateTp();
    }
  };

  onBattleStart(advantageous?: boolean): void {
    this.setActionState("undecided");
    this.clearMotion();
    this.initTpbChargeTime(advantageous);
    this.initTpbTurn();
    if (!this.isPreserveTp()) {
        this.initTp();
    }
  };

  onAllActionsEnd(): void {
    this.clearResult();
    this.removeStatesAuto(1);
    this.removeBuffsAuto();
  };

  onTurnEnd(): void {
    this.clearResult();
    this.regenerateAll();
    this.updateStateTurns();
    this.updateBuffTurns();
    this.removeStatesAuto(2);
  };

  onBattleEnd(): void {
    this.clearResult();
    this.removeBattleStates();
    this.removeAllBuffs();
    this.clearActions();
    if (!this.isPreserveTp()) {
        this.clearTp();
    }
    this.appear();
  };

  onDamage(value: number): void {
    this.removeStatesByDamage();
    this.chargeTpByDamage(value / this.mhp);
  };

  setActionState(actionState: string): void {
    this._actionState = actionState;
    this.requestMotionRefresh();
  };

  isUndecided(): boolean {
    return this._actionState === "undecided";
  };

  isInputting(): boolean {
    return this._actionState === "inputting";
  };

  isWaiting(): boolean {
    return this._actionState === "waiting";
  };

  isActing(): boolean {
    return this._actionState === "acting";
  };

  isChanting(): boolean {
    if (this.isWaiting()) {
        return this._actions.some(action => action.isMagicSkill());
    }
    return false;
  };

  isGuardWaiting(): boolean {
    if (this.isWaiting()) {
        return this._actions.some(action => action.isGuard());
    }
    return false;
  };

  performActionStart(action: Game_Action): void {
    if (!action.isGuard()) {
        this.setActionState("acting");
    }
  };

  performAction(action: Game_Action): void {
    //
  };

  performActionEnd(): void {
    //
  };

  performDamage(): void {
    //
  };

  performMiss(): void {
    SoundManager.playMiss();
  };

  performRecovery(): void {
    SoundManager.playRecovery();
  };

  performEvasion(): void {
    SoundManager.playEvasion();
  };

  performMagicEvasion(): void {
    SoundManager.playMagicEvasion();
  };

  performCounter(): void {
    SoundManager.playEvasion();
  };

  performReflection(): void {
    SoundManager.playReflection();
  };

  performSubstitute(target: Game_Battler): void {
    //
  };

  performCollapse(): void {
    //
  };
}
