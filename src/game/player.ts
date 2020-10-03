import { Graphics, Input, TouchInput } from '../dom';
import { Game_Character } from '.';
import { Game_Followers } from '.';
import { Game_Vehicle } from '.';
import { BattleManager, ConfigManager } from '../managers';
import { $gameMap, $gameMessage, $gameParty, $gameSystem, $gameTemp } from '../managers';
import { $dataSystem, $dataTroops } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Player
//
// The game object class for the player. It contains event starting
// determinants and map scrolling functions.

export class Game_Player extends Game_Character {
  _vehicleType = "walk";
  _vehicleGettingOn = false;
  _vehicleGettingOff = false;
  _dashing = false;
  _needsMapReload = false;
  _transferring = false;
  _newMapId: MZ.MapID = 0;
  _newX = 0;
  _newY = 0;
  _newDirection: MZ.MoveDirection | 0 = 0;
  _fadeType = 0;
  _followers = new Game_Followers();
  _encounterCount = 0;

  constructor()
  constructor(thisClass: Constructable<Game_Player>)
  constructor(arg?: any) {
    super(Game_Character);
    if (typeof arg === "function" && arg === Game_Player) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this.setTransparent($dataSystem.optTransparent);
  }

  initMembers(): void {
    super.initMembers();
    this._vehicleType = "walk";
    this._vehicleGettingOn = false;
    this._vehicleGettingOff = false;
    this._dashing = false;
    this._needsMapReload = false;
    this._transferring = false;
    this._newMapId = 0;
    this._newX = 0;
    this._newY = 0;
    this._newDirection = 0;
    this._fadeType = 0;
    this._followers = new Game_Followers();
    this._encounterCount = 0;
  }

  clearTransferInfo(): void {
    this._transferring = false;
    this._newMapId = 0;
    this._newX = 0;
    this._newY = 0;
    this._newDirection = 0;
  }

  followers(): Game_Followers {
    return this._followers;
  }

  refresh(): void {
    const actor = $gameParty.leader();
    const characterName = actor ? actor.characterName() : "";
    const characterIndex = actor ? actor.characterIndex() : 0;
    this.setImage(characterName, characterIndex);
    this._followers.refresh();
  }

  isStopping(): boolean {
    if (this._vehicleGettingOn || this._vehicleGettingOff) {
        return false;
    }
    return super.isStopping();
  }

  reserveTransfer(mapId: MZ.MapID, x: number, y: number, d?: MZ.MoveDirection, fadeType?: number): void {
    this._transferring = true;
    this._newMapId = mapId;
    this._newX = x;
    this._newY = y;
    this._newDirection = d as any;
    this._fadeType = fadeType as any;
  }

  setupForNewGame(): void {
    const mapId = $dataSystem.startMapId;
    const x = $dataSystem.startX;
    const y = $dataSystem.startY;
    this.reserveTransfer(mapId, x, y, 2, 0);
  }

  requestMapReload(): void {
    this._needsMapReload = true;
  }

  isTransferring(): boolean {
    return this._transferring;
  }

  newMapId(): MZ.MapID {
    return this._newMapId;
  }

  fadeType(): number {
    return this._fadeType;
  }

  performTransfer(): void {
    if (this.isTransferring()) {
        this.setDirection(this._newDirection as MZ.MoveDirection);
        if (this._newMapId !== $gameMap.mapId() || this._needsMapReload) {
            $gameMap.setup(this._newMapId);
            this._needsMapReload = false;
        }
        this.locate(this._newX, this._newY);
        this.refresh();
        this.clearTransferInfo();
    }
  };

  isMapPassable(x: number, y: number, d: MZ.MoveDirection): boolean {
    const vehicle = this.vehicle();
    if (vehicle) {
        return vehicle.isMapPassable(x, y, d);
    } else {
        return super.isMapPassable(x, y, d);
    }
  };

  vehicle(): Game_Vehicle | null {
    return $gameMap.vehicle(this._vehicleType);
  };

  isInBoat(): boolean {
    return this._vehicleType === "boat";
  };

  isInShip(): boolean {
    return this._vehicleType === "ship";
  };

  isInAirship(): boolean {
    return this._vehicleType === "airship";
  };

  isInVehicle(): boolean {
    return this.isInBoat() || this.isInShip() || this.isInAirship();
  };

  isNormal(): boolean {
    return this._vehicleType === "walk" && !this.isMoveRouteForcing();
  };

  isDashing(): boolean {
    return this._dashing;
  };

  isDebugThrough(): boolean {
    return Input.isPressed("control") && $gameTemp.isPlaytest();
  };

  isCollided(x: number, y: number): boolean {
    if (this.isThrough()) {
        return false;
    } else {
        return this.pos(x, y) || this._followers.isSomeoneCollided(x, y);
    }
  };

  centerX(): number {
    return (Graphics.width / $gameMap.tileWidth() - 1) / 2.0;
  };

  centerY(): number {
    return (Graphics.height / $gameMap.tileHeight() - 1) / 2.0;
  };

  center(x: number, y: number): void {
    return $gameMap.setDisplayPos(x - this.centerX(), y - this.centerY());
  };

  locate(x: number, y: number): void {
    super.locate(x, y);
    this.center(x, y);
    this.makeEncounterCount();
    if (this.isInVehicle()) {
        this.vehicle()!.refresh();
    }
    this._followers.synchronize(x, y, this.direction());
  };

  increaseSteps(): void {
    super.increaseSteps();
    if (this.isNormal()) {
        $gameParty.increaseSteps();
    }
  };

  makeEncounterCount(): void {
    const n = $gameMap.encounterStep();
    this._encounterCount = Math.randomInt(n) + Math.randomInt(n) + 1;
  };

  makeEncounterTroopId(): MZ.TroopID {
    const encounterList = [];
    let weightSum = 0;
    for (const encounter of $gameMap.encounterList()) {
        if (this.meetsEncounterConditions(encounter)) {
            encounterList.push(encounter);
            weightSum += encounter.weight;
        }
    }
    if (weightSum > 0) {
        let value = Math.randomInt(weightSum);
        for (const encounter of encounterList) {
            value -= encounter.weight;
            if (value < 0) {
                return encounter.troopId;
            }
        }
    }
    return 0;
  };

  meetsEncounterConditions(encounter: MZ.MapEncount): boolean {
    return (
        encounter.regionSet.length === 0 ||
        encounter.regionSet.includes(this.regionId())
    );
  };

  executeEncounter(): boolean {
    if (!$gameMap.isEventRunning() && this._encounterCount <= 0) {
        this.makeEncounterCount();
        const troopId = this.makeEncounterTroopId();
        if ($dataTroops[troopId]) {
            BattleManager.setup(troopId, true, false);
            BattleManager.onEncounter();
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
  };

  startMapEvent(x: number, y: number, triggers: MZ.EventTrigger[], normal: boolean): void {
    if (!$gameMap.isEventRunning()) {
        for (const event of $gameMap.eventsXy(x, y)) {
            if (
                event.isTriggerIn(triggers) &&
                event.isNormalPriority() === normal
            ) {
                event.start();
            }
        }
    }
  };

  moveByInput(): void {
    if (!this.isMoving() && this.canMove()) {
        let direction = this.getInputDirection();
        if (direction > 0) {
            $gameTemp.clearDestination();
        } else if ($gameTemp.isDestinationValid()) {
            const x = $gameTemp.destinationX();
            const y = $gameTemp.destinationY();
            direction = this.findDirectionTo(x, y);
        }
        if (direction > 0) {
            this.executeMove(direction);
        }
    }
  };

  canMove(): boolean {
    if ($gameMap.isEventRunning() || $gameMessage.isBusy()) {
        return false;
    }
    if (this.isMoveRouteForcing() || this.areFollowersGathering()) {
        return false;
    }
    if (this._vehicleGettingOn || this._vehicleGettingOff) {
        return false;
    }
    if (this.isInVehicle() && !this.vehicle()!.canMove()) {
        return false;
    }
    return true;
  };

  getInputDirection(): MZ.MoveDirection {
    return Input.dir4;
  };

  executeMove(direction: MZ.MoveDirection): void {
    this.moveStraight(direction);
  };

  update(sceneActive?: boolean): void {
    const lastScrolledX = this.scrolledX();
    const lastScrolledY = this.scrolledY();
    const wasMoving = this.isMoving();
    this.updateDashing();
    if (sceneActive) {
        this.moveByInput();
    }
    super.update();
    this.updateScroll(lastScrolledX, lastScrolledY);
    this.updateVehicle();
    if (!this.isMoving()) {
        this.updateNonmoving(wasMoving, sceneActive!);
    }
    this._followers.update();
  };

  updateDashing(): void {
    if (this.isMoving()) {
        return;
    }
    if (this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled()) {
        this._dashing =
            this.isDashButtonPressed() || $gameTemp.isDestinationValid();
    } else {
        this._dashing = false;
    }
  };

  isDashButtonPressed(): boolean {
    const shift = Input.isPressed("shift");
    if (ConfigManager.alwaysDash) {
        return !shift;
    } else {
        return shift;
    }
  };

  updateScroll(lastScrolledX: number, lastScrolledY: number): void {
    const x1 = lastScrolledX;
    const y1 = lastScrolledY;
    const x2 = this.scrolledX();
    const y2 = this.scrolledY();
    if (y2 > y1 && y2 > this.centerY()) {
        $gameMap.scrollDown(y2 - y1);
    }
    if (x2 < x1 && x2 < this.centerX()) {
        $gameMap.scrollLeft(x1 - x2);
    }
    if (x2 > x1 && x2 > this.centerX()) {
        $gameMap.scrollRight(x2 - x1);
    }
    if (y2 < y1 && y2 < this.centerY()) {
        $gameMap.scrollUp(y1 - y2);
    }
  };

  updateVehicle(): void {
    if (this.isInVehicle() && !this.areFollowersGathering()) {
        if (this._vehicleGettingOn) {
            this.updateVehicleGetOn();
        } else if (this._vehicleGettingOff) {
            this.updateVehicleGetOff();
        } else {
            this.vehicle()!.syncWithPlayer();
        }
    }
  };

  updateVehicleGetOn(): void {
    if (!this.areFollowersGathering() && !this.isMoving()) {
        this.setDirection(this.vehicle()!.direction());
        this.setMoveSpeed(this.vehicle()!.moveSpeed());
        this._vehicleGettingOn = false;
        this.setTransparent(true);
        if (this.isInAirship()) {
            this.setThrough(true);
        }
        this.vehicle()!.getOn();
    }
  };

  updateVehicleGetOff(): void {
    if (!this.areFollowersGathering() && this.vehicle()!.isLowest()) {
        this._vehicleGettingOff = false;
        this._vehicleType = "walk";
        this.setTransparent(false);
    }
  };

  updateNonmoving(wasMoving: boolean, sceneActive: boolean): void {
    if (!$gameMap.isEventRunning()) {
        if (wasMoving) {
            $gameParty.onPlayerWalk();
            this.checkEventTriggerHere([1, 2]);
            if ($gameMap.setupStartingEvent()) {
                return;
            }
        }
        if (sceneActive && this.triggerAction()) {
            return;
        }
        if (wasMoving) {
            this.updateEncounterCount();
        } else {
            $gameTemp.clearDestination();
        }
    }
  };

  triggerAction(): boolean {
    if (this.canMove()) {
        if (this.triggerButtonAction()) {
            return true;
        }
        if (this.triggerTouchAction()) {
            return true;
        }
    }
    return false;
  };

  triggerButtonAction(): boolean {
    if (Input.isTriggered("ok")) {
        if (this.getOnOffVehicle()) {
            return true;
        }
        this.checkEventTriggerHere([0]);
        if ($gameMap.setupStartingEvent()) {
            return true;
        }
        this.checkEventTriggerThere([0, 1, 2]);
        if ($gameMap.setupStartingEvent()) {
            return true;
        }
    }
    return false;
  };

  triggerTouchAction(): boolean {
    if ($gameTemp.isDestinationValid()) {
        const direction = this.direction();
        const x1 = this.x;
        const y1 = this.y;
        const x2 = $gameMap.roundXWithDirection(x1, direction);
        const y2 = $gameMap.roundYWithDirection(y1, direction);
        const x3 = $gameMap.roundXWithDirection(x2, direction);
        const y3 = $gameMap.roundYWithDirection(y2, direction);
        const destX = $gameTemp.destinationX();
        const destY = $gameTemp.destinationY();
        if (destX === x1 && destY === y1) {
            return this.triggerTouchActionD1(x1, y1);
        } else if (destX === x2 && destY === y2) {
            return this.triggerTouchActionD2(x2, y2);
        } else if (destX === x3 && destY === y3) {
            return this.triggerTouchActionD3(x2, y2);
        }
    }
    return false;
  };

  triggerTouchActionD1(x1: number, y1: number): boolean {
    if ($gameMap.airship().pos(x1, y1)) {
        if (TouchInput.isTriggered() && this.getOnOffVehicle()) {
            return true;
        }
    }
    this.checkEventTriggerHere([0]);
    return $gameMap.setupStartingEvent();
  };

  triggerTouchActionD2(x2: number, y2: number): boolean {
    if ($gameMap.boat().pos(x2, y2) || $gameMap.ship().pos(x2, y2)) {
        if (TouchInput.isTriggered() && this.getOnVehicle()) {
            return true;
        }
    }
    if (this.isInBoat() || this.isInShip()) {
        if (TouchInput.isTriggered() && this.getOffVehicle()) {
            return true;
        }
    }
    this.checkEventTriggerThere([0, 1, 2]);
    return $gameMap.setupStartingEvent();
  };

  triggerTouchActionD3(x2: number, y2: number): boolean {
    if ($gameMap.isCounter(x2, y2)) {
        this.checkEventTriggerThere([0, 1, 2]);
    }
    return $gameMap.setupStartingEvent();
  };

  updateEncounterCount(): void {
    if (this.canEncounter()) {
        this._encounterCount -= this.encounterProgressValue();
    }
  };

  canEncounter(): boolean {
    return (
        !$gameParty.hasEncounterNone() &&
        $gameSystem.isEncounterEnabled() &&
        !this.isInAirship() &&
        !this.isMoveRouteForcing() &&
        !this.isDebugThrough()
    );
  };

  encounterProgressValue(): number {
    let value = $gameMap.isBush(this.x, this.y) ? 2 : 1;
    if ($gameParty.hasEncounterHalf()) {
        value *= 0.5;
    }
    if (this.isInShip()) {
        value *= 0.5;
    }
    return value;
  };

  checkEventTriggerHere(triggers: MZ.EventTrigger[]): void {
    if (this.canStartLocalEvents()) {
        this.startMapEvent(this.x, this.y, triggers, false);
    }
  };

  checkEventTriggerThere(triggers: MZ.EventTrigger[]): void {
    if (this.canStartLocalEvents()) {
        const direction = this.direction();
        const x1 = this.x;
        const y1 = this.y;
        const x2 = $gameMap.roundXWithDirection(x1, direction);
        const y2 = $gameMap.roundYWithDirection(y1, direction);
        this.startMapEvent(x2, y2, triggers, true);
        if (!$gameMap.isAnyEventStarting() && $gameMap.isCounter(x2, y2)) {
            const x3 = $gameMap.roundXWithDirection(x2, direction);
            const y3 = $gameMap.roundYWithDirection(y2, direction);
            this.startMapEvent(x3, y3, triggers, true);
        }
    }
  };

  checkEventTriggerTouch(x: number, y: number): any {
    if (this.canStartLocalEvents()) {
        this.startMapEvent(x, y, [1, 2], true);
    }
  };

  canStartLocalEvents(): boolean {
    return !this.isInAirship();
  };

  getOnOffVehicle(): boolean {
    if (this.isInVehicle()) {
        return this.getOffVehicle();
    } else {
        return this.getOnVehicle();
    }
  };

  getOnVehicle(): boolean {
    const direction = this.direction();
    const x1 = this.x;
    const y1 = this.y;
    const x2 = $gameMap.roundXWithDirection(x1, direction);
    const y2 = $gameMap.roundYWithDirection(y1, direction);
    if ($gameMap.airship().pos(x1, y1)) {
        this._vehicleType = "airship";
    } else if ($gameMap.ship().pos(x2, y2)) {
        this._vehicleType = "ship";
    } else if ($gameMap.boat().pos(x2, y2)) {
        this._vehicleType = "boat";
    }
    if (this.isInVehicle()) {
        this._vehicleGettingOn = true;
        if (!this.isInAirship()) {
            this.forceMoveForward();
        }
        this.gatherFollowers();
    }
    return this._vehicleGettingOn;
  };

  getOffVehicle(): boolean {
    if (this.vehicle()!.isLandOk(this.x, this.y, this.direction())) {
        if (this.isInAirship()) {
            this.setDirection(2);
        }
        this._followers.synchronize(this.x, this.y, this.direction());
        this.vehicle()!.getOff();
        if (!this.isInAirship()) {
            this.forceMoveForward();
            this.setTransparent(false);
        }
        this._vehicleGettingOff = true;
        this.setMoveSpeed(4);
        this.setThrough(false);
        this.makeEncounterCount();
        this.gatherFollowers();
    }
    return this._vehicleGettingOff;
  };

  forceMoveForward(): void {
    this.setThrough(true);
    this.moveForward();
    this.setThrough(false);
  };

  isOnDamageFloor(): boolean {
    return $gameMap.isDamageFloor(this.x, this.y) && !this.isInAirship();
  };

  moveStraight(d: MZ.MoveDirection): void {
    if (this.canPass(this.x, this.y, d)) {
        this._followers.updateMove();
    }
    super.moveStraight(d);
  };

  moveDiagonally(horz: MZ.MoveDirection, vert: MZ.MoveDirection): void {
    if (this.canPassDiagonally(this.x, this.y, horz, vert)) {
        this._followers.updateMove();
    }
    super.moveDiagonally(horz, vert);
  };

  jump(xPlus: number, yPlus: number): void {
    super.jump(xPlus, yPlus);
    this._followers.jumpAll();
  };

  showFollowers(): void {
    this._followers.show();
  };

  hideFollowers(): void {
    this._followers.hide();
  };

  gatherFollowers(): void {
    this._followers.gather();
  };

  areFollowersGathering(): boolean {
    return this._followers.areGathering();
  };

  areFollowersGathered(): boolean {
    return this._followers.areGathered();
  };
}
