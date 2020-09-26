import { Game_Interpreter } from '.';
import { Game_Vehicle } from '.';
import { Game_Event } from '.';
import { Game_CommonEvent } from '.';
import { Graphics } from '../dom';
import { AudioManager, ImageManager } from '../managers';
import { $gamePlayer, $gameSwitches, $gameSystem } from '../managers';
import { $dataMap, $dataCommonEvents, $dataTilesets } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

export class Game_Map {
  _interpreter: Game_Interpreter
  _mapId: MZ.MapID = 0;
  _tilesetId: MZ.TilesetID = 0;
  _events: Game_Event[] = [];
  _tileEvents: Game_Event[] = [];
  _commonEvents: Game_CommonEvent[] = [];
  _vehicles: Game_Vehicle[] = [];
  _displayX = 0;
  _displayY = 0;
  _needsRefresh = false;
  _nameDisplay = true;
  _scrollDirection: MZ.MoveDirection = 2;
  _scrollRest = 0;
  _scrollSpeed = 4;
  _parallaxName = "";
  _parallaxZero = false;
  _parallaxLoopX = false;
  _parallaxLoopY = false;
  _parallaxSx = 0;
  _parallaxSy = 0;
  _parallaxX = 0;
  _parallaxY = 0;
  _battleback1Name: string | null = null;
  _battleback2Name: string | null = null;

  constructor() 
  constructor(thisClass: Constructable<Game_Map>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_Map) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this._interpreter = new Game_Interpreter();
    this._mapId = 0;
    this._tilesetId = 0;
    this._events = [];
    this._commonEvents = [];
    this._vehicles = [];
    this._displayX = 0;
    this._displayY = 0;
    this._nameDisplay = true;
    this._scrollDirection = 2;
    this._scrollRest = 0;
    this._scrollSpeed = 4;
    this._parallaxName = "";
    this._parallaxZero = false;
    this._parallaxLoopX = false;
    this._parallaxLoopY = false;
    this._parallaxSx = 0;
    this._parallaxSy = 0;
    this._parallaxX = 0;
    this._parallaxY = 0;
    this._battleback1Name = null;
    this._battleback2Name = null;
    this.createVehicles();
  };

  setup(mapId: MZ.MapID): void {
    if (!$dataMap) {
        throw new Error("The map data is not available");
    }
    this._mapId = mapId;
    this._tilesetId = $dataMap.tilesetId;
    this._displayX = 0;
    this._displayY = 0;
    this.refereshVehicles();
    this.setupEvents();
    this.setupScroll();
    this.setupParallax();
    this.setupBattleback();
    this._needsRefresh = false;
  };

  isEventRunning(): boolean {
    return this._interpreter.isRunning() || this.isAnyEventStarting();
  };

  tileWidth(): number {
    return 48;
  };

  tileHeight(): number {
    return 48;
  };

  mapId(): MZ.MapID {
    return this._mapId;
  };

  tilesetId(): MZ.TilesetID {
    return this._tilesetId;
  };

  displayX(): number {
    return this._displayX;
  };

  displayY(): number {
    return this._displayY;
  };

  parallaxName(): string {
    return this._parallaxName;
  };

  battleback1Name(): string | null {
    return this._battleback1Name;
  };

  battleback2Name(): string | null {
    return this._battleback2Name;
  };

  requestRefresh(): void {
    this._needsRefresh = true;
  };

  isNameDisplayEnabled(): boolean {
    return this._nameDisplay;
  };

  disableNameDisplay(): void {
    this._nameDisplay = false;
  };

  enableNameDisplay(): void {
    this._nameDisplay = true;
  };

  createVehicles(): void {
    this._vehicles = [];
    this._vehicles[0] = new Game_Vehicle("boat");
    this._vehicles[1] = new Game_Vehicle("ship");
    this._vehicles[2] = new Game_Vehicle("airship");
  };

  refereshVehicles(): void {
    for (const vehicle of this._vehicles) {
        vehicle.refresh();
    }
  };

  vehicles(): Game_Vehicle[] {
    return this._vehicles;
  };

  vehicle(type: number | string): Game_Vehicle | null {
    if (type === 0 || type === "boat") {
        return this.boat();
    } else if (type === 1 || type === "ship") {
        return this.ship();
    } else if (type === 2 || type === "airship") {
        return this.airship();
    } else {
        return null;
    }
  };

  boat(): Game_Vehicle {
    return this._vehicles[0];
  };

  ship(): Game_Vehicle {
    return this._vehicles[1];
  };

  airship(): Game_Vehicle {
    return this._vehicles[2];
  };

  setupEvents(): void {
    this._events = [];
    this._commonEvents = [];
    for (const event of $dataMap.events.filter(event => !!event)) {
        this._events[event!.id] = new Game_Event(this._mapId, event!.id);
    }
    for (const commonEvent of this.parallelCommonEvents()) {
        this._commonEvents.push(new Game_CommonEvent(commonEvent.id));
    }
    this.refreshTileEvents();
  };

  events(): Game_Event[] {
    return this._events.filter(event => !!event);
  };

  event(eventId: MZ.ID): Game_Event {
    return this._events[eventId];
  };

  eraseEvent(eventId: MZ.ID): void {
    this._events[eventId].erase();
  };

  autorunCommonEvents(): MZ.DataCommonEvent[] {
    return $dataCommonEvents.filter(
        commonEvent => commonEvent && commonEvent.trigger === 1
    );
  };

  parallelCommonEvents(): MZ.DataCommonEvent[] {
    return $dataCommonEvents.filter(
        commonEvent => commonEvent && commonEvent.trigger === 2
    );
  };

  setupScroll(): void {
    this._scrollDirection = 2;
    this._scrollRest = 0;
    this._scrollSpeed = 4;
  };

  setupParallax(): void {
    this._parallaxName = $dataMap.parallaxName || "";
    this._parallaxZero = ImageManager.isZeroParallax(this._parallaxName);
    this._parallaxLoopX = $dataMap.parallaxLoopX;
    this._parallaxLoopY = $dataMap.parallaxLoopY;
    this._parallaxSx = $dataMap.parallaxSx;
    this._parallaxSy = $dataMap.parallaxSy;
    this._parallaxX = 0;
    this._parallaxY = 0;
  };

  setupBattleback(): void {
    if ($dataMap.specifyBattleback) {
        this._battleback1Name = $dataMap.battleback1Name;
        this._battleback2Name = $dataMap.battleback2Name;
    } else {
        this._battleback1Name = null;
        this._battleback2Name = null;
    }
  };

  setDisplayPos(x: number, y: number): void {
    if (this.isLoopHorizontal()) {
        this._displayX = x.mod(this.width());
        this._parallaxX = x;
    } else {
        const endX = this.width() - this.screenTileX();
        this._displayX = endX < 0 ? endX / 2 : x.clamp(0, endX);
        this._parallaxX = this._displayX;
    }
    if (this.isLoopVertical()) {
        this._displayY = y.mod(this.height());
        this._parallaxY = y;
    } else {
        const endY = this.height() - this.screenTileY();
        this._displayY = endY < 0 ? endY / 2 : y.clamp(0, endY);
        this._parallaxY = this._displayY;
    }
  };

  parallaxOx(): number {
    if (this._parallaxZero) {
        return this._parallaxX * this.tileWidth();
    } else if (this._parallaxLoopX) {
        return (this._parallaxX * this.tileWidth()) / 2;
    } else {
        return 0;
    }
  };

  parallaxOy(): number {
    if (this._parallaxZero) {
        return this._parallaxY * this.tileHeight();
    } else if (this._parallaxLoopY) {
        return (this._parallaxY * this.tileHeight()) / 2;
    } else {
        return 0;
    }
  };

  tileset(): MZ.DataTileset {
    return $dataTilesets[this._tilesetId];
  };

  tilesetFlags(): MZ.TileSetFlag[] {
    const tileset = this.tileset();
    if (tileset) {
        return tileset.flags;
    } else {
        return [];
    }
  };

  displayName(): string {
    return $dataMap.displayName;
  };

  width(): number {
    return $dataMap.width;
  };

  height(): number {
    return $dataMap.height;
  };

  data(): number[] {
    return $dataMap.data;
  };

  isLoopHorizontal(): boolean {
    return $dataMap.scrollType === 2 || $dataMap.scrollType === 3;
  };

  isLoopVertical(): boolean {
    return $dataMap.scrollType === 1 || $dataMap.scrollType === 3;
  };

  isDashDisabled(): boolean {
    return $dataMap.disableDashing;
  };

  encounterList(): MZ.MapEncount[] {
    return $dataMap.encounterList;
  };

  encounterStep(): number {
    return $dataMap.encounterStep;
  };

  isOverworld(): boolean {
    return this.tileset() && this.tileset().mode === 0;
  };

  screenTileX(): number {
    return Graphics.width / this.tileWidth();
  };

  screenTileY(): number {
    return Graphics.height / this.tileHeight();
  };

  adjustX(x: number): number {
    if (
        this.isLoopHorizontal() &&
        x < this._displayX - (this.width() - this.screenTileX()) / 2
    ) {
        return x - this._displayX + $dataMap.width;
    } else {
        return x - this._displayX;
    }
  };

  adjustY(y: number): number {
    if (
        this.isLoopVertical() &&
        y < this._displayY - (this.height() - this.screenTileY()) / 2
    ) {
        return y - this._displayY + $dataMap.height;
    } else {
        return y - this._displayY;
    }
  };

  roundX(x: number): number {
    return this.isLoopHorizontal() ? x.mod(this.width()) : x;
  };

  roundY(y: number): number {
    return this.isLoopVertical() ? y.mod(this.height()) : y;
  };

  xWithDirection(x: number, d: MZ.MoveDirection): number {
    return x + (d === 6 ? 1 : d === 4 ? -1 : 0);
  };

  yWithDirection(y: number, d: MZ.MoveDirection): number {
    return y + (d === 2 ? 1 : d === 8 ? -1 : 0);
  };

  roundXWithDirection(x: number, d: MZ.MoveDirection): number {
    return this.roundX(x + (d === 6 ? 1 : d === 4 ? -1 : 0));
  };

  roundYWithDirection(y: number, d: MZ.MoveDirection): number {
    return this.roundY(y + (d === 2 ? 1 : d === 8 ? -1 : 0));
  };

  deltaX(x1: number, x2: number): number {
    let result = x1 - x2;
    if (this.isLoopHorizontal() && Math.abs(result) > this.width() / 2) {
        if (result < 0) {
            result += this.width();
        } else {
            result -= this.width();
        }
    }
    return result;
  };

  deltaY(y1: number, y2: number): number {
    let result = y1 - y2;
    if (this.isLoopVertical() && Math.abs(result) > this.height() / 2) {
        if (result < 0) {
            result += this.height();
        } else {
            result -= this.height();
        }
    }
    return result;
  };

  distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(this.deltaX(x1, x2)) + Math.abs(this.deltaY(y1, y2));
  };

  canvasToMapX(x: number): number {
    const tileWidth = this.tileWidth();
    const originX = this._displayX * tileWidth;
    const mapX = Math.floor((originX + x) / tileWidth);
    return this.roundX(mapX);
  };

  canvasToMapY(y: number): number {
    const tileHeight = this.tileHeight();
    const originY = this._displayY * tileHeight;
    const mapY = Math.floor((originY + y) / tileHeight);
    return this.roundY(mapY);
  };

  autoplay(): void {
    if ($dataMap.autoplayBgm) {
        if ($gamePlayer.isInVehicle()) {
            $gameSystem.saveWalkingBgm2();
        } else {
            AudioManager.playBgm($dataMap.bgm);
        }
    }
    if ($dataMap.autoplayBgs) {
        AudioManager.playBgs($dataMap.bgs);
    }
  };

  refreshIfNeeded(): void {
    if (this._needsRefresh) {
        this.refresh();
    }
  };

  refresh(): void {
    for (const event of this.events()) {
        event.refresh();
    }
    for (const commonEvent of this._commonEvents) {
        commonEvent.refresh();
    }
    this.refreshTileEvents();
    this._needsRefresh = false;
  };

  refreshTileEvents(): void {
    this._tileEvents = this.events().filter(event => event.isTile());
  };

  eventsXy(x: number, y: number): Game_Event[] {
    return this.events().filter(event => event.pos(x, y));
  };

  eventsXyNt(x: number, y: number): Game_Event[] {
    return this.events().filter(event => event.posNt(x, y));
  };

  tileEventsXy(x: number, y: number): Game_Event[] {
    return this._tileEvents.filter(event => event.posNt(x, y));
  };

  eventIdXy(x: number, y: number): MZ.ID {
    const list = this.eventsXy(x, y);
    return list.length === 0 ? 0 : list[0].eventId();
  };

  scrollDown(distance: number): void {
    if (this.isLoopVertical()) {
        this._displayY += distance;
        this._displayY %= $dataMap.height;
        if (this._parallaxLoopY) {
            this._parallaxY += distance;
        }
    } else if (this.height() >= this.screenTileY()) {
        const lastY = this._displayY;
        this._displayY = Math.min(
            this._displayY + distance,
            this.height() - this.screenTileY()
        );
        this._parallaxY += this._displayY - lastY;
    }
  };

  scrollLeft(distance: number): void {
    if (this.isLoopHorizontal()) {
        this._displayX += $dataMap.width - distance;
        this._displayX %= $dataMap.width;
        if (this._parallaxLoopX) {
            this._parallaxX -= distance;
        }
    } else if (this.width() >= this.screenTileX()) {
        const lastX = this._displayX;
        this._displayX = Math.max(this._displayX - distance, 0);
        this._parallaxX += this._displayX - lastX;
    }
  };

  scrollRight(distance: number): void {
    if (this.isLoopHorizontal()) {
        this._displayX += distance;
        this._displayX %= $dataMap.width;
        if (this._parallaxLoopX) {
            this._parallaxX += distance;
        }
    } else if (this.width() >= this.screenTileX()) {
        const lastX = this._displayX;
        this._displayX = Math.min(
            this._displayX + distance,
            this.width() - this.screenTileX()
        );
        this._parallaxX += this._displayX - lastX;
    }
  };

  scrollUp(distance: number): void {
    if (this.isLoopVertical()) {
        this._displayY += $dataMap.height - distance;
        this._displayY %= $dataMap.height;
        if (this._parallaxLoopY) {
            this._parallaxY -= distance;
        }
    } else if (this.height() >= this.screenTileY()) {
        const lastY = this._displayY;
        this._displayY = Math.max(this._displayY - distance, 0);
        this._parallaxY += this._displayY - lastY;
    }
  };

  isValid(x: number, y: number): boolean {
    return x >= 0 && x < this.width() && y >= 0 && y < this.height();
  };

  checkPassage(x: number, y: number, bit: number): boolean {
    const flags = this.tilesetFlags();
    const tiles = this.allTiles(x, y);
    for (const tile of tiles) {
        const flag = flags[tile];
        if ((flag & 0x10) !== 0) {
            // [*] No effect on passage
            continue;
        }
        if ((flag & bit) === 0) {
            // [o] Passable
            return true;
        }
        if ((flag & bit) === bit) {
            // [x] Impassable
            return false;
        }
    }
    return false;
  };

  tileId(x: number, y: number, z: number): number {
    const width = $dataMap.width;
    const height = $dataMap.height;
    return $dataMap.data[(z * height + y) * width + x] || 0;
  };

  layeredTiles(x: number, y: number): number[] {
    const tiles = [];
    for (let i = 0; i < 4; i++) {
        tiles.push(this.tileId(x, y, 3 - i));
    }
    return tiles;
  };

  allTiles(x: number, y: number): number[] {
    const tiles = this.tileEventsXy(x, y).map(event => event.tileId());
    return tiles.concat(this.layeredTiles(x, y));
  };

  autotileType(x: number, y: number, z: number): number {
    const tileId = this.tileId(x, y, z);
    return tileId >= 2048 ? Math.floor((tileId - 2048) / 48) : -1;
  };

  isPassable(x: number, y: number, d: MZ.MoveDirection): boolean {
    return this.checkPassage(x, y, (1 << (d / 2 - 1)) & 0x0f);
  };

  isBoatPassable(x: number, y: number): boolean {
    return this.checkPassage(x, y, 0x0200);
  };

  isShipPassable(x: number, y: number): boolean {
    return this.checkPassage(x, y, 0x0400);
  };

  isAirshipLandOk(x: number, y: number): boolean {
    return this.checkPassage(x, y, 0x0800) && this.checkPassage(x, y, 0x0f);
  };

  checkLayeredTilesFlags(x: number, y: number, bit: number): boolean {
    const flags = this.tilesetFlags();
    return this.layeredTiles(x, y).some(tileId => (flags[tileId] & bit) !== 0);
  };

  isLadder(x: number, y: number): boolean {
    return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x20);
  };

  isBush(x: number, y: number): boolean {
    return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x40);
  };

  isCounter(x: number, y: number): boolean {
    return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x80);
  };

  isDamageFloor(x: number, y: number): boolean {
    return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x100);
  };

  terrainTag(x: number, y: number): number {
    if (this.isValid(x, y)) {
        const flags = this.tilesetFlags();
        const tiles = this.layeredTiles(x, y);
        for (const tile of tiles) {
            const tag = flags[tile] >> 12;
            if (tag > 0) {
                return tag;
            }
        }
    }
    return 0;
  };

  regionId(x: number, y: number): number {
    return this.isValid(x, y) ? this.tileId(x, y, 5) : 0;
  };

  startScroll(direction: MZ.MoveDirection, distance: number, speed: number): void {
    this._scrollDirection = direction;
    this._scrollRest = distance;
    this._scrollSpeed = speed;
  };

  isScrolling(): boolean {
    return this._scrollRest > 0;
  };

  update(sceneActive: boolean): void {
    this.refreshIfNeeded();
    if (sceneActive) {
        this.updateInterpreter();
    }
    this.updateScroll();
    this.updateEvents();
    this.updateVehicles();
    this.updateParallax();
  };

  updateScroll(): void {
    if (this.isScrolling()) {
        const lastX = this._displayX;
        const lastY = this._displayY;
        this.doScroll(this._scrollDirection, this.scrollDistance());
        if (this._displayX === lastX && this._displayY === lastY) {
            this._scrollRest = 0;
        } else {
            this._scrollRest -= this.scrollDistance();
        }
    }
  };

  scrollDistance(): number {
    return Math.pow(2, this._scrollSpeed) / 256;
  };

  doScroll(direction: MZ.MoveDirection, distance: number): void {
    switch (direction) {
        case 2:
            this.scrollDown(distance);
            break;
        case 4:
            this.scrollLeft(distance);
            break;
        case 6:
            this.scrollRight(distance);
            break;
        case 8:
            this.scrollUp(distance);
            break;
    }
  };

  updateEvents(): void {
    for (const event of this.events()) {
        event.update();
    }
    for (const commonEvent of this._commonEvents) {
        commonEvent.update();
    }
  };

  updateVehicles(): void {
    for (const vehicle of this._vehicles) {
        vehicle.update();
    }
  };

  updateParallax(): void {
    if (this._parallaxLoopX) {
        this._parallaxX += this._parallaxSx / this.tileWidth() / 2;
    }
    if (this._parallaxLoopY) {
        this._parallaxY += this._parallaxSy / this.tileHeight() / 2;
    }
  };

  changeTileset(tilesetId: MZ.TilesetID): void {
    this._tilesetId = tilesetId;
    this.refresh();
  };

  changeBattleback(battleback1Name: string, battleback2Name: string): void {
    this._battleback1Name = battleback1Name;
    this._battleback2Name = battleback2Name;
  };

  changeParallax(name: string, loopX: boolean, loopY: boolean, sx: number, sy: number): void {
    this._parallaxName = name;
    this._parallaxZero = ImageManager.isZeroParallax(this._parallaxName);
    if (this._parallaxLoopX && !loopX) {
        this._parallaxX = 0;
    }
    if (this._parallaxLoopY && !loopY) {
        this._parallaxY = 0;
    }
    this._parallaxLoopX = loopX;
    this._parallaxLoopY = loopY;
    this._parallaxSx = sx;
    this._parallaxSy = sy;
  };

  updateInterpreter(): void {
    for (;;) {
        this._interpreter.update();
        if (this._interpreter.isRunning()) {
            return;
        }
        if (this._interpreter.eventId() > 0) {
            this.unlockEvent(this._interpreter.eventId());
            this._interpreter.clear();
        }
        if (!this.setupStartingEvent()) {
            return;
        }
    }
  };

  unlockEvent(eventId: MZ.ID): void {
    if (this._events[eventId]) {
        this._events[eventId].unlock();
    }
  };

  setupStartingEvent(): boolean {
    this.refreshIfNeeded();
    if (this._interpreter.setupReservedCommonEvent()) {
        return true;
    }
    if (this.setupTestEvent()) {
        return true;
    }
    if (this.setupStartingMapEvent()) {
        return true;
    }
    if (this.setupAutorunCommonEvent()) {
        return true;
    }
    return false;
  };

  setupTestEvent(): boolean {
    if (window.$testEvent) {
        this._interpreter.setup(window.$testEvent, 0);
        window.$testEvent = null;
        return true;
    }
    return false;
  };

  setupStartingMapEvent(): boolean {
    for (const event of this.events()) {
        if (event.isStarting()) {
            event.clearStartingFlag();
            this._interpreter.setup(event.list(), event.eventId());
            return true;
        }
    }
    return false;
  };

  setupAutorunCommonEvent(): boolean {
    for (const commonEvent of this.autorunCommonEvents()) {
        if ($gameSwitches.value(commonEvent.switchId)) {
            this._interpreter.setup(commonEvent.list);
            return true;
        }
    }
    return false;
  };

  isAnyEventStarting(): boolean {
    return this.events().some(event => event.isStarting());
  };
}
