import { $dataStates } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_ActionResult
//
// The game object class for a result of a battle action. For convinience, all
// member variables in this class are public.

export class Game_ActionResult {
  used = false;
  missed = false;
  evaded = false;
  physical = false;
  drain = false;
  critical = false;
  success = false;
  hpAffected = false;
  hpDamage = 0;
  mpDamage = 0;
  tpDamage = 0;
  addedStates: MZ.StateID[] = [];
  removedStates: MZ.StateID[] = [];
  addedBuffs: number[] = [];
  addedDebuffs: number[] = [];
  removedBuffs: number[] = [];

  constructor()
  constructor(thisClass: Constructable<Game_ActionResult>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_ActionResult) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this.clear();
  };

  clear(): void {
    this.used = false;
    this.missed = false;
    this.evaded = false;
    this.physical = false;
    this.drain = false;
    this.critical = false;
    this.success = false;
    this.hpAffected = false;
    this.hpDamage = 0;
    this.mpDamage = 0;
    this.tpDamage = 0;
    this.addedStates = [];
    this.removedStates = [];
    this.addedBuffs = [];
    this.addedDebuffs = [];
    this.removedBuffs = [];
  };

  addedStateObjects(): MZ.DataState[] {
    return this.addedStates.map(id => $dataStates[id]);
  };

  removedStateObjects(): MZ.DataState[] {
    return this.removedStates.map(id => $dataStates[id]);
  };

  isStatusAffected(): boolean {
    return (
        this.addedStates.length > 0 ||
        this.removedStates.length > 0 ||
        this.addedBuffs.length > 0 ||
        this.addedDebuffs.length > 0 ||
        this.removedBuffs.length > 0
    );
  };

  isHit(): boolean {
    return this.used && !this.missed && !this.evaded;
  };

  isStateAdded(stateId: MZ.StateID): boolean {
    return this.addedStates.includes(stateId);
  };

  pushAddedState(stateId: MZ.StateID): void {
    if (!this.isStateAdded(stateId)) {
        this.addedStates.push(stateId);
    }
  };

  isStateRemoved(stateId: MZ.StateID): boolean {
    return this.removedStates.includes(stateId);
  };

  pushRemovedState(stateId: MZ.StateID): void {
    if (!this.isStateRemoved(stateId)) {
        this.removedStates.push(stateId);
    }
  };

  isBuffAdded(paramId: number): boolean {
    return this.addedBuffs.includes(paramId);
  };

  pushAddedBuff(paramId: number): void {
    if (!this.isBuffAdded(paramId)) {
        this.addedBuffs.push(paramId);
    }
  };

  isDebuffAdded(paramId: number): boolean {
    return this.addedDebuffs.includes(paramId);
  };

  pushAddedDebuff(paramId: number): void {
    if (!this.isDebuffAdded(paramId)) {
        this.addedDebuffs.push(paramId);
    }
  };

  isBuffRemoved(paramId: number): boolean {
    return this.removedBuffs.includes(paramId);
  };

  pushRemovedBuff(paramId: number): void {
    if (!this.isBuffRemoved(paramId)) {
        this.removedBuffs.push(paramId);
    }
  };
}