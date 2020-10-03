import { Window_Base } from '.';
import { Input, TouchInput } from '../dom';
import { DataManager, TextManager, SoundManager } from '../managers';
import { $gameTemp } from '../managers';
import { $dataAnimations } from '../managers';
import { Rectangle } from '../pixi';
import { Spriteset_Battle } from '../sprites';
import { Game_Battler, Game_Action, Game_Actor, Game_Enemy } from '../game';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Window_BattleLog
//
// The window for displaying battle progress. No frame is displayed, but it is
// handled as a window for convenience.

export class Window_BattleLog extends Window_Base {
  _lines: string[] = [];
  _methods: Array<{ name: string, params: {}}> = [];
  _waitCount = 0;
  _waitMode = "";
  _baseLineStack: number[] = [];
  _spriteset: Spriteset_Battle | null = null;

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_BattleLog>)
  constructor(arg?: any) {
    super(Window_Base);
    if (typeof arg === "function" && arg === Window_BattleLog) {
      return;
    }
    this.initialize(...arguments);
  }
    
  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this.opacity = 0;
    this._lines = [];
    this._methods = [];
    this._waitCount = 0;
    this._waitMode = "";
    this._baseLineStack = [];
    this._spriteset = null;
    this.refresh();
  };

  setSpriteset(spriteset: Spriteset_Battle): void {
    this._spriteset = spriteset;
  };

  maxLines(): number {
    return 10;
  };

  numLines(): number {
    return this._lines.length;
  };

  messageSpeed(): number {
    return 16;
  };

  isBusy(): boolean {
    return this._waitCount > 0 || !!this._waitMode || this._methods.length > 0;
  };

  update(): void {
    if (!this.updateWait()) {
        this.callNextMethod();
    }
  };

  updateWait(): boolean {
    return this.updateWaitCount() || this.updateWaitMode();
  };

  updateWaitCount(): boolean {
    if (this._waitCount > 0) {
        this._waitCount -= this.isFastForward() ? 3 : 1;
        if (this._waitCount < 0) {
            this._waitCount = 0;
        }
        return true;
    }
    return false;
  };

  updateWaitMode(): boolean {
    let waiting = false;
    switch (this._waitMode) {
        case "effect":
            waiting = this._spriteset!.isEffecting();
            break;
        case "movement":
            waiting = this._spriteset!.isAnyoneMoving();
            break;
    }
    if (!waiting) {
        this._waitMode = "";
    }
    return waiting;
  };

  setWaitMode(waitMode: string): void {
    this._waitMode = waitMode;
  };

  callNextMethod(): void {
    if (this._methods.length > 0) {
        const method = this._methods.shift()!;
        if (method.name && (this as any)[method.name]) {
            (this as any)[method.name].apply(this, method.params);
        } else {
            throw new Error("Method not found: " + method.name);
        }
    }
  };

  isFastForward(): boolean {
    return (
        Input.isLongPressed("ok") ||
        Input.isPressed("shift") ||
        TouchInput.isLongPressed()
    );
  };

  push(methodName: string, ...params: any): void {
    const methodArgs = Array.prototype.slice.call(arguments, 1);
    this._methods.push({ name: methodName, params: methodArgs });
  };

  clear(): void {
    this._lines = [];
    this._baseLineStack = [];
    this.refresh();
  };

  wait(): void {
    this._waitCount = this.messageSpeed();
  };

  waitForEffect(): void {
    this.setWaitMode("effect");
  };

  waitForMovement(): void {
    this.setWaitMode("movement");
  };

  addText(text: string): void {
    this._lines.push(text);
    this.refresh();
    this.wait();
  };

  pushBaseLine(): void {
    this._baseLineStack.push(this._lines.length);
  };

  popBaseLine(): void {
    const baseLine = this._baseLineStack.pop()!;
    while (this._lines.length > baseLine) {
        this._lines.pop();
    }
  };

  waitForNewLine(): void {
    let baseLine = 0;
    if (this._baseLineStack.length > 0) {
        baseLine = this._baseLineStack[this._baseLineStack.length - 1];
    }
    if (this._lines.length > baseLine) {
        this.wait();
    }
  };

  popupDamage(target: Game_Battler): void {
    if (target.shouldPopupDamage()) {
        target.startDamagePopup();
    }
  };

  performActionStart(subject: Game_Battler, action: Game_Action): void {
    subject.performActionStart(action);
  };

  performAction(subject: Game_Battler, action: Game_Action): void {
    subject.performAction(action);
  };

  performActionEnd(subject: Game_Battler): void {
    subject.performActionEnd();
  };

  performDamage(target: Game_Battler): void {
    target.performDamage();
  };

  performMiss(target: Game_Battler): void {
    target.performMiss();
  };

  performRecovery(target: Game_Battler): void {
    target.performRecovery();
  };

  performEvasion(target: Game_Battler): void {
    target.performEvasion();
  };

  performMagicEvasion(target: Game_Battler): void {
    target.performMagicEvasion();
  };

  performCounter(target: Game_Battler): void {
    target.performCounter();
  };

  performReflection(target: Game_Battler): void {
    target.performReflection();
  };

  performSubstitute(substitute: Game_Battler, target: Game_Battler): void {
    substitute.performSubstitute(target);
  };

  performCollapse(target: Game_Battler): void {
    target.performCollapse();
  };

  showAnimation(subject: Game_Battler, targets: Game_Battler[], animationId: MZ.AnimationID): void {
    if (animationId < 0) {
        this.showAttackAnimation(subject, targets);
    } else {
        this.showNormalAnimation(targets, animationId);
    }
  };

  showAttackAnimation(subject: Game_Battler, targets: Game_Battler[]): void {
    if (subject.isActor()) {
        this.showActorAttackAnimation(subject as Game_Actor, targets);
    } else {
        this.showEnemyAttackAnimation(subject as Game_Enemy, targets);
    }
  };

  showActorAttackAnimation(subject: Game_Actor, targets: Game_Battler[]): void {
    this.showNormalAnimation(targets, subject.attackAnimationId1(), false);
    this.showNormalAnimation(targets, subject.attackAnimationId2(), true);
  };

  showEnemyAttackAnimation(subject: Game_Enemy, targets: Game_Battler[]) {
    SoundManager.playEnemyAttack();
  };

  showNormalAnimation(targets: Game_Battler[], animationId: MZ.AnimationID, mirror?: boolean) {
    const animation = $dataAnimations[animationId];
    if (animation) {
        $gameTemp.requestAnimation(targets, animationId, mirror);
    }
  };

  refresh(): void {
    this.drawBackground();
    this.contents.clear();
    for (let i = 0; i < this._lines.length; i++) {
        this.drawLineText(i);
    }
  };

  drawBackground(): void {
    const rect = this.backRect();
    const color = this.backColor();
    this.contentsBack.clear();
    this.contentsBack.paintOpacity = this.backPaintOpacity();
    this.contentsBack.fillRect(rect.x, rect.y, rect.width, rect.height, color);
    this.contentsBack.paintOpacity = 255;
  };

  backRect(): Rectangle {
    const height = this.numLines() * this.itemHeight();
    return new Rectangle(0, 0, this.innerWidth, height);
  };

  lineRect(index: number): Rectangle {
    const itemHeight = this.itemHeight();
    const padding = this.itemPadding();
    const x = padding;
    const y = index * itemHeight;
    const width = this.innerWidth - padding * 2;
    const height = itemHeight;
    return new Rectangle(x, y, width, height);
  };

  backColor(): string {
    return "#000000";
  };

  backPaintOpacity(): number {
    return 64;
  };

  drawLineText(index: number): void {
    const rect = this.lineRect(index);
    this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
    this.drawTextEx(this._lines[index], rect.x, rect.y, rect.width);
  };

  startTurn(): void {
    this.push("wait");
  };

  startAction(subject: Game_Battler, action: Game_Action, targets: Game_Battler[]): void {
    const item = action.item();
    this.push("performActionStart", subject, action);
    this.push("waitForMovement");
    this.push("performAction", subject, action);
    this.push("showAnimation", subject, targets.clone(), item.animationId);
    this.displayAction(subject, item);
  };

  endAction(subject: Game_Battler): void {
    this.push("waitForNewLine");
    this.push("clear");
    this.push("performActionEnd", subject);
  };

  displayCurrentState(subject: Game_Battler): void {
    const stateText = subject.mostImportantStateText();
    if (stateText) {
        this.push("addText", stateText.format((subject as Game_Actor | Game_Enemy).name()));
        this.push("wait");
        this.push("clear");
    }
  };

  displayRegeneration(subject: Game_Battler): void {
    this.push("popupDamage", subject);
  };

  displayAction(subject: Game_Battler, item: MZ.DataItemBase): void {
    const numMethods = this._methods.length;
    if (DataManager.isSkill(item)) {
        this.displayItemMessage((item as MZ.DataSkill).message1, subject, item);
        this.displayItemMessage((item as MZ.DataSkill).message2, subject, item);
    } else {
        this.displayItemMessage(TextManager.useItem, subject, item);
    }
    if (this._methods.length === numMethods) {
        this.push("wait");
    }
  };

  displayItemMessage(fmt: string, subject: Game_Battler, item: MZ.DataItemBase): void {
    if (fmt) {
        this.push("addText", fmt.format((subject as Game_Actor | Game_Enemy).name(), item.name));
    }
  };

  displayCounter(target: Game_Battler): void {
    this.push("performCounter", target);
    this.push("addText", TextManager.counterAttack.format((target as Game_Actor | Game_Enemy).name()));
  };

  displayReflection(target: Game_Battler): void {
    this.push("performReflection", target);
    this.push("addText", TextManager.magicReflection.format((target as Game_Actor | Game_Enemy).name()));
  };

  displaySubstitute(substitute: Game_Battler, target: Game_Battler): void {
    const substName = (substitute as Game_Actor | Game_Enemy).name();
    const text = TextManager.substitute.format(substName, (target as Game_Actor | Game_Enemy).name());
    this.push("performSubstitute", substitute, target);
    this.push("addText", text);
  };

  displayActionResults(subject: Game_Battler, target: Game_Battler): void {
    if (target.result().used) {
        this.push("pushBaseLine");
        this.displayCritical(target);
        this.push("popupDamage", target);
        this.push("popupDamage", subject);
        this.displayDamage(target);
        this.displayAffectedStatus(target);
        this.displayFailure(target);
        this.push("waitForNewLine");
        this.push("popBaseLine");
    }
  };

  displayFailure(target: Game_Battler): void {
    if (target.result().isHit() && !target.result().success) {
        this.push("addText", TextManager.actionFailure.format((target as Game_Actor | Game_Enemy).name()));
    }
  };

  displayCritical(target: Game_Battler): void {
    if (target.result().critical) {
        if (target.isActor()) {
            this.push("addText", TextManager.criticalToActor);
        } else {
            this.push("addText", TextManager.criticalToEnemy);
        }
    }
  };

  displayDamage(target: Game_Battler): void {
    if (target.result().missed) {
        this.displayMiss(target);
    } else if (target.result().evaded) {
        this.displayEvasion(target);
    } else {
        this.displayHpDamage(target);
        this.displayMpDamage(target);
        this.displayTpDamage(target);
    }
  };

  displayMiss(target: Game_Battler): void {
    let fmt;
    if (target.result().physical) {
        const isActor = target.isActor();
        fmt = isActor ? TextManager.actorNoHit : TextManager.enemyNoHit;
        this.push("performMiss", target);
    } else {
        fmt = TextManager.actionFailure;
    }
    this.push("addText", fmt.format((target as Game_Actor | Game_Enemy).name()));
  };

  displayEvasion(target: Game_Battler): void {
    let fmt;
    if (target.result().physical) {
        fmt = TextManager.evasion;
        this.push("performEvasion", target);
    } else {
        fmt = TextManager.magicEvasion;
        this.push("performMagicEvasion", target);
    }
    this.push("addText", fmt.format((target as Game_Actor | Game_Enemy).name()));
  };

  displayHpDamage(target: Game_Battler): void {
    if (target.result().hpAffected) {
        if (target.result().hpDamage > 0 && !target.result().drain) {
            this.push("performDamage", target);
        }
        if (target.result().hpDamage < 0) {
            this.push("performRecovery", target);
        }
        this.push("addText", this.makeHpDamageText(target));
    }
  };

  displayMpDamage(target: Game_Battler): void {
    if (target.isAlive() && target.result().mpDamage !== 0) {
        if (target.result().mpDamage < 0) {
            this.push("performRecovery", target);
        }
        this.push("addText", this.makeMpDamageText(target));
    }
  };

  displayTpDamage(target: Game_Battler): void {
    if (target.isAlive() && target.result().tpDamage !== 0) {
        if (target.result().tpDamage < 0) {
            this.push("performRecovery", target);
        }
        this.push("addText", this.makeTpDamageText(target));
    }
  };

  displayAffectedStatus(target: Game_Battler): void {
    if (target.result().isStatusAffected()) {
        this.push("pushBaseLine");
        this.displayChangedStates(target);
        this.displayChangedBuffs(target);
        this.push("waitForNewLine");
        this.push("popBaseLine");
    }
  };

  displayAutoAffectedStatus(target: Game_Battler): void {
    if (target.result().isStatusAffected()) {
        // FIX: displayAffectedStatus expects 1 argument
        this.displayAffectedStatus(target);
        this.push("clear");
    }
  };

  displayChangedStates(target: Game_Battler): void {
    this.displayAddedStates(target);
    this.displayRemovedStates(target);
  };

  displayAddedStates(target: Game_Battler): void {
    const result = target.result();
    const states = result.addedStateObjects();
    for (const state of states) {
        const stateText = target.isActor() ? state.message1 : state.message2;
        if (state.id === target.deathStateId()) {
            this.push("performCollapse", target);
        }
        if (stateText) {
            this.push("popBaseLine");
            this.push("pushBaseLine");
            this.push("addText", stateText.format((target as Game_Actor | Game_Enemy).name()));
            this.push("waitForEffect");
        }
    }
  };

  displayRemovedStates(target: Game_Battler): void {
    const result = target.result();
    const states = result.removedStateObjects();
    for (const state of states) {
        if (state.message4) {
            this.push("popBaseLine");
            this.push("pushBaseLine");
            this.push("addText", state.message4.format((target as Game_Actor | Game_Enemy).name()));
        }
    }
  };

  displayChangedBuffs(target: Game_Battler): void {
    const result = target.result();
    this.displayBuffs(target, result.addedBuffs, TextManager.buffAdd);
    this.displayBuffs(target, result.addedDebuffs, TextManager.debuffAdd);
    this.displayBuffs(target, result.removedBuffs, TextManager.buffRemove);
  };

  displayBuffs(target: Game_Battler, buffs: number[], fmt: string): void {
    for (const paramId of buffs) {
        const text = fmt.format((target as Game_Actor | Game_Enemy).name(), TextManager.param(paramId));
        this.push("popBaseLine");
        this.push("pushBaseLine");
        this.push("addText", text);
    }
  };

  makeHpDamageText(target: Game_Battler): string {
    const result = target.result();
    const damage = result.hpDamage;
    const isActor = target.isActor();
    let fmt;
    if (damage > 0 && result.drain) {
        fmt = isActor ? TextManager.actorDrain : TextManager.enemyDrain;
        return fmt.format((target as Game_Actor | Game_Enemy).name(), TextManager.hp, damage);
    } else if (damage > 0) {
        fmt = isActor ? TextManager.actorDamage : TextManager.enemyDamage;
        return fmt.format((target as Game_Actor | Game_Enemy).name(), damage);
    } else if (damage < 0) {
        fmt = isActor ? TextManager.actorRecovery : TextManager.enemyRecovery;
        return fmt.format((target as Game_Actor | Game_Enemy).name(), TextManager.hp, -damage);
    } else {
        fmt = isActor ? TextManager.actorNoDamage : TextManager.enemyNoDamage;
        return fmt.format((target as Game_Actor | Game_Enemy).name());
    }
  };

  makeMpDamageText(target: Game_Battler): string {
    const result = target.result();
    const damage = result.mpDamage;
    const isActor = target.isActor();
    let fmt;
    if (damage > 0 && result.drain) {
        fmt = isActor ? TextManager.actorDrain : TextManager.enemyDrain;
        return fmt.format((target as Game_Actor | Game_Enemy).name(), TextManager.mp, damage);
    } else if (damage > 0) {
        fmt = isActor ? TextManager.actorLoss : TextManager.enemyLoss;
        return fmt.format((target as Game_Actor | Game_Enemy).name(), TextManager.mp, damage);
    } else if (damage < 0) {
        fmt = isActor ? TextManager.actorRecovery : TextManager.enemyRecovery;
        return fmt.format((target as Game_Actor | Game_Enemy).name(), TextManager.mp, -damage);
    } else {
        return "";
    }
  };

  makeTpDamageText(target: Game_Battler): string {
    const result = target.result();
    const damage = result.tpDamage;
    const isActor = target.isActor();
    let fmt;
    if (damage > 0) {
        fmt = isActor ? TextManager.actorLoss : TextManager.enemyLoss;
        return fmt.format((target as Game_Actor | Game_Enemy).name(), TextManager.tp, damage);
    } else if (damage < 0) {
        fmt = isActor ? TextManager.actorGain : TextManager.enemyGain;
        return fmt.format((target as Game_Actor | Game_Enemy).name(), TextManager.tp, -damage);
    } else {
        return "";
    }
  };
}
