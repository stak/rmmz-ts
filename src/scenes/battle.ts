import { Scene_Message } from '.';

import {
  Window_BattleActor,
  Window_BattleEnemy,
  Window_BattleLog,
  Window_BattleItem,
  Window_BattleStatus,
  Window_BattleSkill,
  Window_PartyCommand,
  Window_ActorCommand,
  Window_Help,
} from '../windows';
import {
  BattleManager,
  AudioManager,
  SceneManager,
  ConfigManager,
} from '../managers';
import { Graphics } from '../dom';
import { Spriteset_Battle, Sprite_Button } from '../sprites';
import { $gameMessage, $gameParty, $gameScreen, $gameTimer, $gameTroop } from '../managers';
import { Scene_Map, Scene_Title, Scene_Gameover } from '.';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Scene_Battle
//
// The scene class of the battle screen.

export class Scene_Battle extends Scene_Message {
  _statusWindow?: Window_BattleStatus
  _skillWindow?: Window_BattleSkill
  _itemWindow?: Window_BattleItem
  _actorWindow?: Window_BattleActor
  _enemyWindow?: Window_BattleEnemy
  _partyCommandWindow?: Window_PartyCommand
  _actorCommandWindow?: Window_ActorCommand
  _logWindow?: Window_BattleLog
  _helpWindow?: Window_Help
  _cancelButton?: Sprite_Button
  _spriteset?: Spriteset_Battle

  constructor()
  constructor(thisClass: Constructable<Scene_Battle>)
  constructor(arg?: any) {
    super(Scene_Message);
    if (typeof arg === "function" && arg === Scene_Battle) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  create(): void {
    super.create();
    this.createDisplayObjects();
  };

  start(): void {
    super.start();
    BattleManager.playBattleBgm();
    BattleManager.startBattle();
    this._statusWindow!.refresh();
    this.startFadeIn(this.fadeSpeed(), false);
  };

  update(): void {
    const active = this.isActive();
    $gameTimer.update(active);
    $gameScreen.update();
    this.updateVisibility();
    if (active && !this.isBusy()) {
        this.updateBattleProcess();
    }
    super.update();
  };

  updateVisibility(): void {
    this.updateLogWindowVisibility();
    this.updateStatusWindowVisibility();
    this.updateInputWindowVisibility();
    this.updateCancelButton();
  };

  updateBattleProcess(): void {
    BattleManager.update(this.isTimeActive());
  };

  isTimeActive(): boolean {
    if (BattleManager.isActiveTpb()) {
        return !this._skillWindow!.active && !this._itemWindow!.active;
    } else {
        return !this.isAnyInputWindowActive();
    }
  };

  isAnyInputWindowActive(): boolean {
    return (
        this._partyCommandWindow!.active ||
        this._actorCommandWindow!.active ||
        this._skillWindow!.active ||
        this._itemWindow!.active ||
        this._actorWindow!.active ||
        this._enemyWindow!.active
    );
  };

  changeInputWindow(): void {
    this.hideSubInputWindows();
    if (BattleManager.isInputting()) {
        if (BattleManager.actor()) {
            this.startActorCommandSelection();
        } else {
            this.startPartyCommandSelection();
        }
    } else {
        this.endCommandSelection();
    }
  };

  stop(): void {
    super.stop();
    if (this.needsSlowFadeOut()) {
        this.startFadeOut(this.slowFadeSpeed(), false);
    } else {
        this.startFadeOut(this.fadeSpeed(), false);
    }
    this._statusWindow!.close();
    this._partyCommandWindow!.close();
    this._actorCommandWindow!.close();
  };

  terminate(): void {
    super.terminate();
    $gameParty.onBattleEnd();
    $gameTroop.onBattleEnd();
    AudioManager.stopMe();
    if (this.shouldAutosave()) {
        this.requestAutosave();
    }
  };

  shouldAutosave(): boolean {
    return SceneManager.isNextScene(Scene_Map);
  };

  needsSlowFadeOut(): boolean {
    return (
        SceneManager.isNextScene(Scene_Title) ||
        SceneManager.isNextScene(Scene_Gameover)
    );
  };

  updateLogWindowVisibility(): void {
    this._logWindow!.visible = !this._helpWindow!.visible;
  };

  updateStatusWindowVisibility(): void {
    if ($gameMessage.isBusy()) {
        this._statusWindow!.close();
    } else if (this.shouldOpenStatusWindow()) {
        this._statusWindow!.open();
    }
    this.updateStatusWindowPosition();
  };

  shouldOpenStatusWindow(): boolean {
    return (
        this.isActive() &&
        !this.isMessageWindowClosing() &&
        !BattleManager.isBattleEnd()
    );
  };

  updateStatusWindowPosition(): void {
    const statusWindow = this._statusWindow!;
    const targetX = this.statusWindowX();
    if (statusWindow.x < targetX) {
        statusWindow.x = Math.min(statusWindow.x + 16, targetX);
    }
    if (statusWindow.x > targetX) {
        statusWindow.x = Math.max(statusWindow.x - 16, targetX);
    }
  };

  statusWindowX(): number {
    if (this.isAnyInputWindowActive()) {
        return this.statusWindowRect().x;
    } else {
        return this._partyCommandWindow!.width / 2;
    }
  };

  updateInputWindowVisibility(): void {
    if ($gameMessage.isBusy()) {
        this.closeCommandWindows();
        this.hideSubInputWindows();
    } else if (this.needsInputWindowChange()) {
        this.changeInputWindow();
    }
  };

  needsInputWindowChange(): boolean {
    const windowActive = this.isAnyInputWindowActive();
    const inputting = BattleManager.isInputting();
    if (windowActive && inputting) {
        return this._actorCommandWindow!.actor() !== BattleManager.actor();
    }
    return windowActive !== inputting;
  };

  updateCancelButton(): void {
    if (this._cancelButton) {
        this._cancelButton.visible =
            this.isAnyInputWindowActive() && !this._partyCommandWindow!.active;
    }
  };

  createDisplayObjects(): void {
    this.createSpriteset();
    this.createWindowLayer();
    this.createAllWindows();
    this.createButtons();
    BattleManager.setLogWindow(this._logWindow!);
    BattleManager.setSpriteset(this._spriteset!);
    this._logWindow!.setSpriteset(this._spriteset!);
  };

  createSpriteset(): void {
    this._spriteset = new Spriteset_Battle();
    this.addChild(this._spriteset);
  };

  createAllWindows(): void {
    this.createLogWindow();
    this.createStatusWindow();
    this.createPartyCommandWindow();
    this.createActorCommandWindow();
    this.createHelpWindow();
    this.createSkillWindow();
    this.createItemWindow();
    this.createActorWindow();
    this.createEnemyWindow();
    super.createAllWindows();
  };

  createLogWindow(): void {
    const rect = this.logWindowRect();
    this._logWindow = new Window_BattleLog(rect);
    this.addWindow(this._logWindow);
  };

  logWindowRect(): Rectangle {
    const wx = 0;
    const wy = 0;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(10, false);
    return new Rectangle(wx, wy, ww, wh);
  };

  createStatusWindow(): void {
    const rect = this.statusWindowRect();
    const statusWindow = new Window_BattleStatus(rect);
    this.addWindow(statusWindow);
    this._statusWindow = statusWindow;
  };

  statusWindowRect(): Rectangle {
    const extra = 10;
    const ww = Graphics.boxWidth - 192;
    const wh = this.windowAreaHeight() + extra;
    const wx = this.isRightInputMode() ? 0 : Graphics.boxWidth - ww;
    const wy = Graphics.boxHeight - wh + extra - 4;
    return new Rectangle(wx, wy, ww, wh);
  };

  createPartyCommandWindow(): void {
    const rect = this.partyCommandWindowRect();
    const commandWindow = new Window_PartyCommand(rect);
    commandWindow.setHandler("fight", this.commandFight.bind(this));
    commandWindow.setHandler("escape", this.commandEscape.bind(this));
    commandWindow.deselect();
    this.addWindow(commandWindow);
    this._partyCommandWindow = commandWindow;
  };

  partyCommandWindowRect(): Rectangle {
    const ww = 192;
    const wh = this.windowAreaHeight();
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
  };

  createActorCommandWindow(): void {
    const rect = this.actorCommandWindowRect();
    const commandWindow = new Window_ActorCommand(rect);
    commandWindow.y = Graphics.boxHeight - commandWindow.height;
    commandWindow.setHandler("attack", this.commandAttack.bind(this));
    commandWindow.setHandler("skill", this.commandSkill.bind(this));
    commandWindow.setHandler("guard", this.commandGuard.bind(this));
    commandWindow.setHandler("item", this.commandItem.bind(this));
    commandWindow.setHandler("cancel", this.commandCancel.bind(this));
    this.addWindow(commandWindow);
    this._actorCommandWindow = commandWindow;
  };

  actorCommandWindowRect(): Rectangle {
    const ww = 192;
    const wh = this.windowAreaHeight();
    const wx = this.isRightInputMode() ? Graphics.boxWidth - ww : 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
  };

  createHelpWindow(): void {
    const rect = this.helpWindowRect();
    this._helpWindow = new Window_Help(rect);
    this._helpWindow.hide();
    this.addWindow(this._helpWindow);
  };

  helpWindowRect(): Rectangle {
    const wx = 0;
    const wy = this.helpAreaTop();
    const ww = Graphics.boxWidth;
    const wh = this.helpAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
  };

  createSkillWindow(): void {
    const rect = this.skillWindowRect();
    this._skillWindow = new Window_BattleSkill(rect);
    this._skillWindow.setHelpWindow(this._helpWindow!);
    this._skillWindow.setHandler("ok", this.onSkillOk.bind(this));
    this._skillWindow.setHandler("cancel", this.onSkillCancel.bind(this));
    this.addWindow(this._skillWindow);
  };

  skillWindowRect(): Rectangle {
    const ww = Graphics.boxWidth;
    const wh = this.windowAreaHeight();
    const wx = 0;
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
  };

  createItemWindow(): void {
    const rect = this.itemWindowRect();
    this._itemWindow = new Window_BattleItem(rect);
    this._itemWindow.setHelpWindow(this._helpWindow!);
    this._itemWindow.setHandler("ok", this.onItemOk.bind(this));
    this._itemWindow.setHandler("cancel", this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
  };

  itemWindowRect(): Rectangle {
    return this.skillWindowRect();
  };

  createActorWindow(): void {
    const rect = this.actorWindowRect();
    this._actorWindow = new Window_BattleActor(rect);
    this._actorWindow.setHandler("ok", this.onActorOk.bind(this));
    this._actorWindow.setHandler("cancel", this.onActorCancel.bind(this));
    this.addWindow(this._actorWindow);
  };

  actorWindowRect(): Rectangle {
    return this.statusWindowRect();
  };

  createEnemyWindow(): void {
    const rect = this.enemyWindowRect();
    this._enemyWindow = new Window_BattleEnemy(rect);
    this._enemyWindow.setHandler("ok", this.onEnemyOk.bind(this));
    this._enemyWindow.setHandler("cancel", this.onEnemyCancel.bind(this));
    this.addWindow(this._enemyWindow);
  };

  enemyWindowRect(): Rectangle {
    const wx = this._statusWindow!.x;
    const ww = this._statusWindow!.width;
    const wh = this.windowAreaHeight();
    const wy = Graphics.boxHeight - wh;
    return new Rectangle(wx, wy, ww, wh);
  };

  helpAreaTop(): number {
    return 0;
  };

  helpAreaBottom(): number {
    return this.helpAreaTop() + this.helpAreaHeight();
  };

  helpAreaHeight(): number {
    return this.calcWindowHeight(2, false);
  };

  buttonAreaTop(): number {
    return this.helpAreaBottom();
  };

  windowAreaHeight(): number {
    return this.calcWindowHeight(4, true);
  };

  createButtons(): void {
    if (ConfigManager.touchUI) {
        this.createCancelButton();
    }
  };

  createCancelButton(): void {
    this._cancelButton = new Sprite_Button("cancel");
    this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
    this._cancelButton.y = this.buttonY();
    this.addWindow(this._cancelButton);
  };

  closeCommandWindows(): void {
    this._partyCommandWindow!.deactivate();
    this._actorCommandWindow!.deactivate();
    this._partyCommandWindow!.close();
    this._actorCommandWindow!.close();
  };

  hideSubInputWindows(): void {
    this._actorWindow!.deactivate();
    this._enemyWindow!.deactivate();
    this._skillWindow!.deactivate();
    this._itemWindow!.deactivate();
    this._actorWindow!.hide();
    this._enemyWindow!.hide();
    this._skillWindow!.hide();
    this._itemWindow!.hide();
  };

  startPartyCommandSelection(): void {
    this._statusWindow!.deselect();
    this._statusWindow!.show();
    this._statusWindow!.open();
    this._actorCommandWindow!.setup(null);
    this._actorCommandWindow!.close();
    this._partyCommandWindow!.setup();
  };

  commandFight(): void {
    this.selectNextCommand();
  };

  commandEscape(): void {
    BattleManager.processEscape();
    this.changeInputWindow();
  };

  startActorCommandSelection(): void {
    this._statusWindow!.show();
    this._statusWindow!.selectActor(BattleManager.actor()!);
    this._partyCommandWindow!.close();
    this._actorCommandWindow!.show();
    this._actorCommandWindow!.setup(BattleManager.actor());
  };

  commandAttack(): void {
    const action = BattleManager.inputtingAction();
    action!.setAttack();
    this.onSelectAction();
  };

  commandSkill(): void {
    this._skillWindow!.setActor(BattleManager.actor());
    this._skillWindow!.setStypeId(this._actorCommandWindow!.currentExt());
    this._skillWindow!.refresh();
    this._skillWindow!.show();
    this._skillWindow!.activate();
    this._statusWindow!.hide();
    this._actorCommandWindow!.hide();
  };

  commandGuard(): void {
    const action = BattleManager.inputtingAction();
    action!.setGuard();
    this.onSelectAction();
  };

  commandItem(): void {
    this._itemWindow!.refresh();
    this._itemWindow!.show();
    this._itemWindow!.activate();
    this._statusWindow!.hide();
    this._actorCommandWindow!.hide();
  };

  commandCancel(): void {
    this.selectPreviousCommand();
  };

  selectNextCommand(): void {
    BattleManager.selectNextCommand();
    this.changeInputWindow();
  };

  selectPreviousCommand(): void {
    BattleManager.selectPreviousCommand();
    this.changeInputWindow();
  };

  startActorSelection(): void {
    this._actorWindow!.refresh();
    this._actorWindow!.show();
    this._actorWindow!.activate();
  };

  onActorOk(): void {
    const action = BattleManager.inputtingAction();
    action!.setTarget(this._actorWindow!.index());
    this.hideSubInputWindows();
    this.selectNextCommand();
  };

  onActorCancel(): void {
    this._actorWindow!.hide();
    switch (this._actorCommandWindow!.currentSymbol()) {
        case "skill":
            this._skillWindow!.show();
            this._skillWindow!.activate();
            break;
        case "item":
            this._itemWindow!.show();
            this._itemWindow!.activate();
            break;
    }
  };

  startEnemySelection(): void {
    this._enemyWindow!.refresh();
    this._enemyWindow!.show();
    this._enemyWindow!.select(0);
    this._enemyWindow!.activate();
    this._statusWindow!.hide();
  };

  onEnemyOk(): void {
    const action = BattleManager.inputtingAction();
    action!.setTarget(this._enemyWindow!.enemyIndex());
    this.hideSubInputWindows();
    this.selectNextCommand();
  };

  onEnemyCancel(): void {
    this._enemyWindow!.hide();
    switch (this._actorCommandWindow!.currentSymbol()) {
        case "attack":
            this._statusWindow!.show();
            this._actorCommandWindow!.activate();
            break;
        case "skill":
            this._skillWindow!.show();
            this._skillWindow!.activate();
            break;
        case "item":
            this._itemWindow!.show();
            this._itemWindow!.activate();
            break;
    }
  };

  onSkillOk(): void {
    const skill = this._skillWindow!.item()!;
    const action = BattleManager.inputtingAction();
    action!.setSkill(skill.id);
    BattleManager.actor()!.setLastBattleSkill(skill);
    this.onSelectAction();
  };

  onSkillCancel(): void {
    this._skillWindow!.hide();
    this._statusWindow!.show();
    this._actorCommandWindow!.show();
    this._actorCommandWindow!.activate();
  };

  onItemOk(): void {
    const item = this._itemWindow!.item()!;
    const action = BattleManager.inputtingAction();
    action!.setItem(item.id);
    $gameParty.setLastItem(item);
    this.onSelectAction();
  };

  onItemCancel(): void {
    this._itemWindow!.hide();
    this._statusWindow!.show();
    this._actorCommandWindow!.show();
    this._actorCommandWindow!.activate();
  };

  onSelectAction(): void {
    const action = BattleManager.inputtingAction()!;
    if (!action.needsSelection()) {
        this.selectNextCommand();
    } else if (action.isForOpponent()) {
        this.startEnemySelection();
    } else {
        this.startActorSelection();
    }
  };

  endCommandSelection(): void {
    this.closeCommandWindows();
    this.hideSubInputWindows();
    this._statusWindow!.deselect();
    this._statusWindow!.show();
  };
}
