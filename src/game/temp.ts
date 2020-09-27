import { Game_Battler, Game_CharacterBase } from '.';
import { Utils } from '../dom';
import { $gameParty } from '../managers';
import { $dataCommonEvents, $dataAnimations } from '../managers';
import { MZ } from '../MZ';

interface AnimationRequest {
  targets: (Game_CharacterBase | Game_Battler)[],
  animationId: MZ.AnimationID,
  mirror: boolean
}

interface BalloonRequest {
  target: Game_CharacterBase,
  balloonId: MZ.ID
}

type LastActionArray = [
  lastUsedSkillId: MZ.SkillID,
  lastUsedItemId: MZ.ItemID,
  lastSubjectActorId: MZ.ActorID,
  lastSubjectEnemyIndex: MZ.ID,
  lastTargetActorId: MZ.ActorID,
  lastTargetEnemyIndex: MZ.ID
]

//-----------------------------------------------------------------------------
// Game_Temp
//
// The game object class for temporary data that is not included in save data.

export class Game_Temp {
  _isPlaytest = false;
  _destinationX: number | null = null;
  _destinationY: number | null = null;
  _touchTarget: Game_Battler | null = null;
  _touchState = "";
  _needsBattleRefresh = false;
  _commonEventQueue: MZ.CommonEventID[] = [];
  _animationQueue: AnimationRequest[] = [];
  _balloonQueue: BalloonRequest[] = [];
  _lastActionData: LastActionArray = [0, 0, 0, 0, 0, 0];
  
  constructor()
  constructor(thisClass: Constructable<Game_Temp>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_Temp) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this._isPlaytest = Utils.isOptionValid("test");
    this._destinationX = null;
    this._destinationY = null;
    this._touchTarget = null;
    this._touchState = "";
    this._needsBattleRefresh = false;
    this._commonEventQueue = [];
    this._animationQueue = [];
    this._balloonQueue = [];
    this._lastActionData = [0, 0, 0, 0, 0, 0];
  };

  isPlaytest(): boolean {
    return this._isPlaytest;
  };

  setDestination(x: number, y: number): void {
    this._destinationX = x;
    this._destinationY = y;
  };

  clearDestination(): void {
    this._destinationX = null;
    this._destinationY = null;
  };

  isDestinationValid(): boolean {
    return this._destinationX !== null;
  };

  destinationX(): number | null {
    return this._destinationX;
  };

  destinationY(): number | null {
    return this._destinationY;
  };

  setTouchState(target: Game_Battler, state: string): void {
    this._touchTarget = target;
    this._touchState = state;
  };

  clearTouchState(): void {
    this._touchTarget = null;
    this._touchState = "";
  };

  touchTarget(): Game_Battler | null {
    return this._touchTarget;
  };

  touchState(): string {
    return this._touchState;
  };

  requestBattleRefresh(): void {
    if ($gameParty.inBattle()) {
        this._needsBattleRefresh = true;
    }
  };

  clearBattleRefreshRequest(): void {
    this._needsBattleRefresh = false;
  };

  isBattleRefreshRequested(): boolean {
    return this._needsBattleRefresh;
  };

  reserveCommonEvent(commonEventId: MZ.CommonEventID): void {
    this._commonEventQueue.push(commonEventId);
  };

  retrieveCommonEvent(): MZ.DataCommonEvent {
    return $dataCommonEvents[this._commonEventQueue.shift()!];
  };

  isCommonEventReserved(): boolean {
    return this._commonEventQueue.length > 0;
  };

  requestAnimation(targets: (Game_CharacterBase | Game_Battler)[], animationId: MZ.AnimationID, mirror: boolean = false): void {
    if ($dataAnimations[animationId]) {
        const request: AnimationRequest = {
            targets: targets,
            animationId: animationId,
            mirror: mirror
        };
        this._animationQueue.push(request);
        for (const target of targets) {
            if ((target as any).startAnimation) {
                (target as any).startAnimation();
            }
        }
    }
  };

  retrieveAnimation(): AnimationRequest {
    return this._animationQueue.shift()!;
  };

  requestBalloon(target: Game_CharacterBase, balloonId: MZ.ID): void {
    const request: BalloonRequest = {
      target: target,
      balloonId: balloonId
    };
    this._balloonQueue.push(request);
    if (target.startBalloon) {
        target.startBalloon();
    }
  };

  retrieveBalloon(): BalloonRequest {
    return this._balloonQueue.shift()!;
  };

  lastActionData(type: number): number {
    return this._lastActionData[type] || 0;
  };

  setLastActionData(type: number, value: number): void {
    this._lastActionData[type] = value;
  };

  setLastUsedSkillId(skillID: MZ.SkillID): void {
    this.setLastActionData(0, skillID);
  };

  setLastUsedItemId(itemID: MZ.ItemID): void {
    this.setLastActionData(1, itemID);
  };

  setLastSubjectActorId(actorID: MZ.ActorID): void {
    this.setLastActionData(2, actorID);
  };

  setLastSubjectEnemyIndex(enemyIndex: MZ.ID): void {
    this.setLastActionData(3, enemyIndex);
  };

  setLastTargetActorId(actorID: MZ.ActorID): void {
    this.setLastActionData(4, actorID);
  };

  setLastTargetEnemyIndex(enemyIndex: MZ.ID): void {
    this.setLastActionData(5, enemyIndex);
  };
}