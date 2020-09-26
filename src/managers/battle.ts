import { AudioManager } from '.';
import { SoundManager } from '.';
import { SceneManager } from '.';
import { TextManager } from '.';
import { $gameMessage, $gameParty, $gameScreen, $gameSystem, $gameTroop } from '.';
import { $dataSystem } from '.';
import { Game_Action, Game_Actor, Game_Enemy, Game_Battler } from '../game';
import { Window_BattleLog } from '../windows'
import { Spriteset_Battle } from '../sprites';
import { Scene_Gameover } from '../scenes';
import { MZ } from '../MZ';

const BattlePhase = {
  Init: "",
  Start: "start",
  Turn: "turn",
  TurnEnd: "turnEnd",
  Input: "input",
  Action: "action",
  Aborting: "aborting",
  BattleEnd: "battleEnd",
} as const;
type BattlePhase = typeof BattlePhase[keyof typeof BattlePhase];

type BattleRewords = {
  gold?: number
  exp?: number
  items?: MZ.DataItemBase[]
};

type BattleEventCallback = (result: number) => void;

//-----------------------------------------------------------------------------
// BattleManager
//
// The static class that manages battle progress.

export class BattleManager {
  constructor() {
    throw new Error("This is a static class");
  }

  static _phase: BattlePhase
  static _canEscape: boolean
  static _canLose: boolean
  static _inputting: boolean
  static _battleTest: boolean
  static _eventCallback: BattleEventCallback | null
  static _preemptive: boolean
  static _surprise: boolean
  static _currentActor: Game_Actor | null
  static _actionForcedBattler: Game_Battler | null
  static _mapBgm: MZ.AudioParam | null
  static _mapBgs: MZ.AudioParam | null
  static _actionBattlers: Game_Battler[]
  static _subject: Game_Battler | null
  static _action: Game_Action | null
  static _targets: (Game_Battler | null)[]
  static _logWindow: Window_BattleLog | null
  static _spriteset: Spriteset_Battle | null
  static _escapeRatio: number
  static _escaped: boolean
  static _rewards: BattleRewords
  static _tpbNeedsPartyCommand: boolean


  static setup(troopId: number, canEscape: boolean, canLose: boolean): void {
    this.initMembers();
    this._canEscape = canEscape;
    this._canLose = canLose;
    $gameTroop.setup(troopId);
    $gameScreen.onBattleStart();
    this.makeEscapeRatio();
  };

  static initMembers(): void {
    this._phase = "";
    this._inputting = false;
    this._canEscape = false;
    this._canLose = false;
    this._battleTest = false;
    this._eventCallback = null;
    this._preemptive = false;
    this._surprise = false;
    this._currentActor = null;
    this._actionForcedBattler = null;
    this._mapBgm = null;
    this._mapBgs = null;
    this._actionBattlers = [];
    this._subject = null;
    this._action = null;
    this._targets = [];
    this._logWindow = null;
    this._spriteset = null;
    this._escapeRatio = 0;
    this._escaped = false;
    this._rewards = {};
    this._tpbNeedsPartyCommand = true;
  };

  static isTpb(): boolean {
    return $dataSystem.battleSystem >= 1;
  };

  static isActiveTpb(): boolean {
    return $dataSystem.battleSystem === 1;
  };

  static isBattleTest(): boolean {
    return this._battleTest;
  };

  static setBattleTest(battleTest: boolean): void {
    this._battleTest = battleTest;
  };

  static setEventCallback(callback: BattleEventCallback): void {
    this._eventCallback = callback;
  };

  static setLogWindow(logWindow: Window_BattleLog): void {
    this._logWindow = logWindow;
  };

  static setSpriteset(spriteset: Spriteset_Battle): void {
    this._spriteset = spriteset;
  };

  static onEncounter(): void {
    this._preemptive = Math.random() < this.ratePreemptive();
    this._surprise = Math.random() < this.rateSurprise() && !this._preemptive;
  };

  static ratePreemptive(): number {
    return $gameParty.ratePreemptive($gameTroop.agility());
  };

  static rateSurprise(): number {
    return $gameParty.rateSurprise($gameTroop.agility());
  };

  static saveBgmAndBgs(): void {
    this._mapBgm = AudioManager.saveBgm();
    this._mapBgs = AudioManager.saveBgs();
  };

  static playBattleBgm(): void {
    AudioManager.playBgm($gameSystem.battleBgm());
    AudioManager.stopBgs();
  };

  static playVictoryMe(): void {
    AudioManager.playMe($gameSystem.victoryMe());
  };

  static playDefeatMe(): void {
    AudioManager.playMe($gameSystem.defeatMe());
  };

  static replayBgmAndBgs(): void {
    if (this._mapBgm) {
        AudioManager.replayBgm(this._mapBgm);
    } else {
        AudioManager.stopBgm();
    }
    if (this._mapBgs) {
        AudioManager.replayBgs(this._mapBgs);
    }
  };

  static makeEscapeRatio(): void {
    this._escapeRatio = (0.5 * $gameParty.agility()) / $gameTroop.agility();
  };

  static update(timeActive: boolean): void {
    if (!this.isBusy() && !this.updateEvent()) {
        this.updatePhase(timeActive);
    }
    if (this.isTpb()) {
        this.updateTpbInput();
    }
  };

  static updatePhase(timeActive: boolean): void {
    switch (this._phase) {
        case "start":
            this.updateStart();
            break;
        case "turn":
            this.updateTurn(timeActive);
            break;
        case "action":
            this.updateAction();
            break;
        case "turnEnd":
            this.updateTurnEnd();
            break;
        case "battleEnd":
            this.updateBattleEnd();
            break;
    }
  };

  static updateEvent(): boolean {
    switch (this._phase) {
        case "start":
        case "turn":
        case "turnEnd":
            if (this.isActionForced()) {
                this.processForcedAction();
                return true;
            } else {
                return this.updateEventMain();
            }
    }
    return this.checkAbort();
  };

  static updateEventMain(): boolean {
    $gameTroop.updateInterpreter();
    $gameParty.requestMotionRefresh();
    if ($gameTroop.isEventRunning() || this.checkBattleEnd()) {
        return true;
    }
    $gameTroop.setupBattleEvent();
    if ($gameTroop.isEventRunning() || SceneManager.isSceneChanging()) {
        return true;
    }
    return false;
  };

  static isBusy(): boolean {
    return (
        $gameMessage.isBusy() ||
        this._spriteset.isBusy() ||
        this._logWindow.isBusy()
    );
  };

  static updateTpbInput(): void {
    if (this._inputting) {
        this.checkTpbInputClose();
    } else {
        this.checkTpbInputOpen();
    }
  };

  static checkTpbInputClose(): void {
    if (!this.isPartyTpbInputtable() || this.needsActorInputCancel()) {
        this.cancelActorInput();
        this._currentActor = null;
        this._inputting = false;
    }
  };

  static checkTpbInputOpen(): void {
    if (this.isPartyTpbInputtable()) {
        if (this._tpbNeedsPartyCommand) {
            this._inputting = true;
            this._tpbNeedsPartyCommand = false;
        } else {
            this.selectNextCommand();
        }
    }
  };

  static isPartyTpbInputtable(): boolean {
    return $gameParty.canInput() && this.isTpbMainPhase();
  };

  static needsActorInputCancel(): boolean {
    return !!this._currentActor && !this._currentActor.canInput();
  };

  static isTpbMainPhase(): boolean {
    return ["turn", "turnEnd", "action"].includes(this._phase);
  };

  static isInputting(): boolean {
    return this._inputting;
  };

  static isInTurn(): boolean {
    return this._phase === "turn";
  };

  static isTurnEnd(): boolean {
    return this._phase === "turnEnd";
  };

  static isAborting(): boolean {
    return this._phase === "aborting";
  };

  static isBattleEnd(): boolean {
    return this._phase === "battleEnd";
  };

  static canEscape(): boolean {
    return this._canEscape;
  };

  static canLose(): boolean {
    return this._canLose;
  };

  static isEscaped(): boolean {
    return this._escaped;
  };

  static actor(): Game_Actor | null {
    return this._currentActor;
  };

  static startBattle(): void {
    this._phase = "start";
    $gameSystem.onBattleStart();
    $gameParty.onBattleStart(this._preemptive);
    $gameTroop.onBattleStart(this._surprise);
    this.displayStartMessages();
  };

  static displayStartMessages(): void {
    for (const name of $gameTroop.enemyNames()) {
        $gameMessage.add(TextManager.emerge.format(name));
    }
    if (this._preemptive) {
        $gameMessage.add(TextManager.preemptive.format($gameParty.name()));
    } else if (this._surprise) {
        $gameMessage.add(TextManager.surprise.format($gameParty.name()));
    }
  };

  static startInput(): void {
    this._phase = "input";
    this._inputting = true;
    $gameParty.makeActions();
    $gameTroop.makeActions();
    this._currentActor = null;
    if (this._surprise || !$gameParty.canInput()) {
        this.startTurn();
    }
  };

  static inputtingAction(): Game_Action | null {
    return this._currentActor ? this._currentActor.inputtingAction() : null;
  };

  static selectNextCommand(): void {
    if (this._currentActor) {
        if (this._currentActor.selectNextCommand()) {
            return;
        }
        this.finishActorInput();
    }
    this.selectNextActor();
  };

  static selectNextActor(): void {
    this.changeCurrentActor(true);
    if (!this._currentActor) {
        if (this.isTpb()) {
            this.changeCurrentActor(true);
        } else {
            this.startTurn();
        }
    }
  };

  static selectPreviousCommand(): void {
    if (this._currentActor) {
        if (this._currentActor.selectPreviousCommand()) {
            return;
        }
        this.cancelActorInput();
    }
    this.selectPreviousActor();
  };

  static selectPreviousActor(): void {
    if (this.isTpb()) {
        this.changeCurrentActor(true);
        if (!this._currentActor) {
            this._inputting = $gameParty.canInput();
        }
    } else {
        this.changeCurrentActor(false);
    }
  };

  static changeCurrentActor(forward: boolean): void {
    const members = $gameParty.battleMembers();
    let actor = this._currentActor!;
    for (;;) {
        const currentIndex = members.indexOf(actor);
        actor = members[currentIndex + (forward ? 1 : -1)];
        if (!actor || actor.canInput()) {
            break;
        }
    }
    this._currentActor = actor ? actor : null;
    this.startActorInput();
  };

  static startActorInput(): void {
    if (this._currentActor) {
        this._currentActor.setActionState("inputting");
        this._inputting = true;
    }
  };

  static finishActorInput(): void {
    if (this._currentActor) {
        if (this.isTpb()) {
            this._currentActor.startTpbCasting();
        }
        this._currentActor.setActionState("waiting");
    }
  };

  static cancelActorInput(): void {
    if (this._currentActor) {
        this._currentActor.setActionState("undecided");
    }
  };

  static updateStart(): void {
    if (this.isTpb()) {
        this._phase = "turn";
    } else {
        this.startInput();
    }
  };

  static startTurn(): void {
    this._phase = "turn";
    $gameTroop.increaseTurn();
    $gameParty.requestMotionRefresh();
    if (!this.isTpb()) {
        this.makeActionOrders();
        this._logWindow.startTurn();
        this._inputting = false;
    }
  };

  static updateTurn(timeActive: boolean): void {
    $gameParty.requestMotionRefresh();
    if (this.isTpb() && timeActive) {
        this.updateTpb();
    }
    if (!this._subject) {
        this._subject = this.getNextSubject();
    }
    if (this._subject) {
        this.processTurn();
    } else if (!this.isTpb()) {
        this.endTurn();
    }
  };

  static updateTpb(): void {
    $gameParty.updateTpb();
    $gameTroop.updateTpb();
    this.updateAllTpbBattlers();
    this.checkTpbTurnEnd();
  };

  static updateAllTpbBattlers(): void {
    for (const battler of this.allBattleMembers()) {
        this.updateTpbBattler(battler);
    }
  };

  static updateTpbBattler(battler: Game_Battler): void {
    if (battler.isTpbTurnEnd()) {
        battler.onTurnEnd();
        battler.startTpbTurn();
        this.displayBattlerStatus(battler, false);
    } else if (battler.isTpbReady()) {
        battler.startTpbAction();
        this._actionBattlers.push(battler);
    } else if (battler.isTpbTimeout()) {
        battler.onTpbTimeout();
        this.displayBattlerStatus(battler, true);
    }
  };

  static checkTpbTurnEnd(): void {
    if ($gameTroop.isTpbTurnEnd()) {
        this.endTurn();
    }
  };

  static processTurn(): void {
    const subject = this._subject;
    const action = subject!.currentAction();
    if (action) {
        action.prepare();
        if (action.isValid()) {
            this.startAction();
        }
        subject!.removeCurrentAction();
    } else {
        this.endAction();
        this._subject = null;
    }
  };

  static endBattlerActions(battler: Game_Battler): void {
    battler.setActionState(this.isTpb() ? "undecided" : "done");
    battler.onAllActionsEnd();
    battler.clearTpbChargeTime();
    this.displayBattlerStatus(battler, true);
  };

  static endTurn(): void {
    this._phase = "turnEnd";
    this._preemptive = false;
    this._surprise = false;
    if (!this.isTpb()) {
        this.endAllBattlersTurn();
    }
  };

  static endAllBattlersTurn(): void {
    for (const battler of this.allBattleMembers()) {
        battler.onTurnEnd();
        this.displayBattlerStatus(battler, false);
    }
  };

  static displayBattlerStatus(battler: Game_Battler, current: boolean): void {
    this._logWindow.displayAutoAffectedStatus(battler);
    if (current) {
        this._logWindow.displayCurrentState(battler);
    }
    this._logWindow.displayRegeneration(battler);
  };

  static updateTurnEnd(): void {
    if (this.isTpb()) {
        this.startTurn();
    } else {
        this.startInput();
    }
  };

  static getNextSubject(): Game_Battler | null {
    for (;;) {
        const battler = this._actionBattlers.shift();
        if (!battler) {
            return null;
        }
        if ((battler as Game_Actor | Game_Enemy).isBattleMember() && battler.isAlive()) {
            return battler;
        }
    }
  };

  static allBattleMembers(): Game_Battler[] {
    return ($gameParty.battleMembers() as Game_Battler[]).concat($gameTroop.members());
  };

  static makeActionOrders(): void {
    const battlers = [];
    if (!this._surprise) {
        battlers.push(...$gameParty.battleMembers());
    }
    if (!this._preemptive) {
        battlers.push(...$gameTroop.members());
    }
    for (const battler of battlers) {
        battler.makeSpeed();
    }
    battlers.sort((a, b) => b.speed() - a.speed());
    this._actionBattlers = battlers;
  };

  static startAction(): void {
    const subject = this._subject;
    const action = subject!.currentAction();
    const targets = action.makeTargets();
    this._phase = "action";
    this._action = action;
    this._targets = targets;
    subject!.useItem(action.item());
    this._action.applyGlobal();
    this._logWindow.startAction(subject, action, targets);
  };

  static updateAction(): void {
    const target = this._targets.shift();
    if (target) {
        this.invokeAction(this._subject!, target);
    } else {
        this.endAction();
    }
  };

  static endAction(): void {
    this._logWindow.endAction(this._subject);
    this._phase = "turn";
    if (this._subject!.numActions() === 0) {
        this.endBattlerActions(this._subject!);
        this._subject = null;
    }
  };

  static invokeAction(subject: Game_Battler, target: Game_Battler): void {
    this._logWindow.push("pushBaseLine");
    if (Math.random() < this._action!.itemCnt(target)) {
        this.invokeCounterAttack(subject, target);
    } else if (Math.random() < this._action!.itemMrf(target)) {
        this.invokeMagicReflection(subject, target);
    } else {
        this.invokeNormalAction(subject, target);
    }
    subject.setLastTarget(target);
    this._logWindow.push("popBaseLine");
  };

  static invokeNormalAction(subject: Game_Battler, target: Game_Battler): void {
    const realTarget = this.applySubstitute(target);
    this._action!.apply(realTarget);
    this._logWindow.displayActionResults(subject, realTarget);
  };

  static invokeCounterAttack(subject: Game_Battler, target: Game_Battler): void {
    const action = new Game_Action(target);
    action.setAttack();
    action.apply(subject);
    this._logWindow.displayCounter(target);
    this._logWindow.displayActionResults(target, subject);
  };

  static invokeMagicReflection(subject: Game_Battler, target: Game_Battler): void {
    this._action!._reflectionTarget = target;
    this._logWindow.displayReflection(target);
    this._action!.apply(subject);
    this._logWindow.displayActionResults(target, subject);
  };

  static applySubstitute(target: Game_Battler): Game_Battler {
    if (this.checkSubstitute(target)) {
        const substitute = (target as Game_Actor | Game_Enemy).friendsUnit().substituteBattler();
        if (substitute && target !== substitute) {
            this._logWindow.displaySubstitute(substitute, target);
            return substitute;
        }
    }
    return target;
  };

  static checkSubstitute(target: Game_Battler): boolean {
    return target.isDying() && !this._action!.isCertainHit();
  };

  static isActionForced(): boolean {
    return !!this._actionForcedBattler;
  };

  static forceAction(battler: Game_Battler): void {
    this._actionForcedBattler = battler;
    this._actionBattlers.remove(battler);
  };

  static processForcedAction(): void {
    if (this._actionForcedBattler) {
        if (this._subject) {
            this.endBattlerActions(this._subject);
        }
        this._subject = this._actionForcedBattler;
        this._actionForcedBattler = null;
        this.startAction();
        this._subject.removeCurrentAction();
    }
  };

  static abort(): void {
    this._phase = "aborting";
  };

  static checkBattleEnd(): boolean {
    if (this._phase) {
        if (this.checkAbort()) {
            return true;
        } else if ($gameParty.isAllDead()) {
            this.processDefeat();
            return true;
        } else if ($gameTroop.isAllDead()) {
            this.processVictory();
            return true;
        }
    }
    return false;
  };

  static checkAbort(): boolean {
    if ($gameParty.isEmpty() || this.isAborting()) {
        this.processAbort();
    }
    return false;
  };

  static processVictory(): void {
    $gameParty.removeBattleStates();
    $gameParty.performVictory();
    this.playVictoryMe();
    this.replayBgmAndBgs();
    this.makeRewards();
    this.displayVictoryMessage();
    this.displayRewards();
    this.gainRewards();
    this.endBattle(0);
  };

  static processEscape(): boolean {
    $gameParty.performEscape();
    SoundManager.playEscape();
    const success = this._preemptive || Math.random() < this._escapeRatio;
    if (success) {
        this.onEscapeSuccess();
    } else {
        this.onEscapeFailure();
    }
    return success;
  };

  static onEscapeSuccess(): void {
    this.displayEscapeSuccessMessage();
    this._escaped = true;
    this.processAbort();
  };

  static onEscapeFailure(): void {
    $gameParty.onEscapeFailure();
    this.displayEscapeFailureMessage();
    this._escapeRatio += 0.1;
    if (!this.isTpb()) {
        this.startTurn();
    }
  };

  static processAbort(): void {
    $gameParty.removeBattleStates();
    this._logWindow.clear();
    this.replayBgmAndBgs();
    this.endBattle(1);
  };

  static processDefeat(): void {
    this.displayDefeatMessage();
    this.playDefeatMe();
    if (this._canLose) {
        this.replayBgmAndBgs();
    } else {
        AudioManager.stopBgm();
    }
    this.endBattle(2);
  };

  static endBattle(result: number): void {
    this._phase = "battleEnd";
    this.cancelActorInput();
    this._inputting = false;
    if (this._eventCallback) {
        this._eventCallback(result);
    }
    if (result === 0) {
        $gameSystem.onBattleWin();
    } else if (this._escaped) {
        $gameSystem.onBattleEscape();
    }
  };

  static updateBattleEnd(): void {
    if (this.isBattleTest()) {
        AudioManager.stopBgm();
        SceneManager.exit();
    } else if (!this._escaped && $gameParty.isAllDead()) {
        if (this._canLose) {
            $gameParty.reviveBattleMembers();
            SceneManager.pop();
        } else {
            SceneManager.goto(Scene_Gameover);
        }
    } else {
        SceneManager.pop();
    }
    this._phase = "";
  };

  static makeRewards(): void {
    this._rewards = {
        gold: $gameTroop.goldTotal(),
        exp: $gameTroop.expTotal(),
        items: $gameTroop.makeDropItems()
    };
  };

  static displayVictoryMessage(): void {
    $gameMessage.add(TextManager.victory.format($gameParty.name()));
  };

  static displayDefeatMessage(): void {
    $gameMessage.add(TextManager.defeat.format($gameParty.name()));
  };

  static displayEscapeSuccessMessage(): void {
    $gameMessage.add(TextManager.escapeStart.format($gameParty.name()));
  };

  static displayEscapeFailureMessage(): void {
    $gameMessage.add(TextManager.escapeStart.format($gameParty.name()));
    $gameMessage.add("\\." + TextManager.escapeFailure);
  };

  static displayRewards(): void {
    this.displayExp();
    this.displayGold();
    this.displayDropItems();
  };

  static displayExp(): void {
    const exp = this._rewards.exp;
    if (exp! > 0) {
        const text = TextManager.obtainExp.format(exp, TextManager.exp);
        $gameMessage.add("\\." + text);
    }
  };

  static displayGold(): void {
    const gold = this._rewards.gold;
    if (gold! > 0) {
        $gameMessage.add("\\." + TextManager.obtainGold.format(gold));
    }
  };

  static displayDropItems(): void {
    const items = this._rewards.items;
    if (items!.length > 0) {
        $gameMessage.newPage();
        for (const item of items!) {
            $gameMessage.add(TextManager.obtainItem.format((item as any).name));
        }
    }
  };

  static gainRewards(): void {
    this.gainExp();
    this.gainGold();
    this.gainDropItems();
  };

  static gainExp(): void {
    const exp = this._rewards.exp;
    for (const actor of $gameParty.allMembers()) {
        actor.gainExp(exp!);
    }
  };

  static gainGold(): void {
    $gameParty.gainGold(this._rewards.gold!);
  };

  static gainDropItems(): void {
    const items = this._rewards.items;
    for (const item of items!) {
        $gameParty.gainItem(item, 1);
    }
  };
}
