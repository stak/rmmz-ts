import { Graphics } from '../dom';
import { ImageManager } from '../managers';
import { $gameMap } from '../managers';
import { Game_Event } from '.';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_CharacterBase
//
// The superclass of Game_Character. It handles basic information, such as
// coordinates and images, shared by all characters.

export class Game_CharacterBase {
  _x = 0
  _y = 0
  _realX = 0;
  _realY = 0;
  _moveSpeed: MZ.MoveSpeed = 4;
  _moveFrequency: MZ.MoveFrequency = 6;
  _opacity = 255;
  _blendMode: PIXI.BLEND_MODES = 0;
  _direction: MZ.MoveDirection = 2;
  _pattern = 1;
  _priorityType: MZ.EventPriorityType = 1;
  _tileId = 0;
  _characterName = "";
  _characterIndex = 0;
  _isObjectCharacter = false;
  _walkAnime = true;
  _stepAnime = false;
  _directionFix = false;
  _through = false;
  _transparent = false;
  _bushDepth = 0;
  _animationId: MZ.AnimationID = 0;
  _balloonId = 0;
  _animationPlaying = false;
  _balloonPlaying = false;
  _animationCount = 0;
  _stopCount = 0;
  _jumpCount = 0;
  _jumpPeak = 0;
  _movementSuccess = true;

  constructor() {
    this.initialize(...arguments);
  }

  get x(): number {
    return this._x;
  }
  get y(): number {
    return this._y;
  }

  initialize(..._: any): void {
    this.initMembers();
  };

  initMembers(): void {
    this._x = 0;
    this._y = 0;
    this._realX = 0;
    this._realY = 0;
    this._moveSpeed = 4;
    this._moveFrequency = 6;
    this._opacity = 255;
    this._blendMode = 0;
    this._direction = 2;
    this._pattern = 1;
    this._priorityType = 1;
    this._tileId = 0;
    this._characterName = "";
    this._characterIndex = 0;
    this._isObjectCharacter = false;
    this._walkAnime = true;
    this._stepAnime = false;
    this._directionFix = false;
    this._through = false;
    this._transparent = false;
    this._bushDepth = 0;
    this._animationId = 0;
    this._balloonId = 0;
    this._animationPlaying = false;
    this._balloonPlaying = false;
    this._animationCount = 0;
    this._stopCount = 0;
    this._jumpCount = 0;
    this._jumpPeak = 0;
    this._movementSuccess = true;
  };

  pos(x: number, y: number): boolean {
    return this._x === x && this._y === y;
  };

  posNt(x: number, y: number): boolean {
    // No through
    return this.pos(x, y) && !this.isThrough();
  };

  moveSpeed(): MZ.MoveSpeed {
    return this._moveSpeed;
  };

  setMoveSpeed(moveSpeed: MZ.MoveSpeed): void {
    this._moveSpeed = moveSpeed;
  };

  moveFrequency(): MZ.MoveFrequency {
    return this._moveFrequency;
  };

  setMoveFrequency(moveFrequency: MZ.MoveFrequency): void {
    this._moveFrequency = moveFrequency;
  };

  opacity(): number {
    return this._opacity;
  };

  setOpacity(opacity: number): void {
    this._opacity = opacity;
  };

  blendMode(): PIXI.BLEND_MODES {
    return this._blendMode;
  };

  setBlendMode(blendMode: PIXI.BLEND_MODES): void {
    this._blendMode = blendMode;
  };

  isNormalPriority(): boolean {
    return this._priorityType === 1;
  };

  setPriorityType(priorityType: MZ.EventPriorityType): void {
    this._priorityType = priorityType;
  };

  isMoving(): boolean {
    return this._realX !== this._x || this._realY !== this._y;
  };

  isJumping(): boolean {
    return this._jumpCount > 0;
  };

  jumpHeight(): number {
    return (
        (this._jumpPeak * this._jumpPeak -
            Math.pow(Math.abs(this._jumpCount - this._jumpPeak), 2)) /
        2
    );
  };

  isStopping(): boolean {
    return !this.isMoving() && !this.isJumping();
  };

  checkStop(threshold: number): boolean {
    return this._stopCount > threshold;
  };

  resetStopCount(): void {
    this._stopCount = 0;
  };

  realMoveSpeed(): MZ.MoveSpeed {
    return this._moveSpeed + (this.isDashing() ? 1 : 0) as MZ.MoveSpeed;
  };

  distancePerFrame(): number {
    return Math.pow(2, this.realMoveSpeed()) / 256;
  };

  isDashing(): boolean {
    return false;
  };

  isDebugThrough(): boolean {
    return false;
  };

  straighten(): void {
    if (this.hasWalkAnime() || this.hasStepAnime()) {
        this._pattern = 1;
    }
    this._animationCount = 0;
  };

  reverseDir(d: MZ.MoveDirection): MZ.MoveDirection {
    return 10 - d as MZ.MoveDirection;
  };

  canPass(x: number, y: number, d: MZ.MoveDirection): boolean {
    const x2 = $gameMap.roundXWithDirection(x, d);
    const y2 = $gameMap.roundYWithDirection(y, d);
    if (!$gameMap.isValid(x2, y2)) {
        return false;
    }
    if (this.isThrough() || this.isDebugThrough()) {
        return true;
    }
    if (!this.isMapPassable(x, y, d)) {
        return false;
    }
    if (this.isCollidedWithCharacters(x2, y2)) {
        return false;
    }
    return true;
  };

  canPassDiagonally(x: number, y: number, horz: MZ.MoveDirection, vert: MZ.MoveDirection): boolean {
    const x2 = $gameMap.roundXWithDirection(x, horz);
    const y2 = $gameMap.roundYWithDirection(y, vert);
    if (this.canPass(x, y, vert) && this.canPass(x, y2, horz)) {
        return true;
    }
    if (this.canPass(x, y, horz) && this.canPass(x2, y, vert)) {
        return true;
    }
    return false;
  };

  isMapPassable(x: number, y: number, d: MZ.MoveDirection): boolean {
    const x2 = $gameMap.roundXWithDirection(x, d);
    const y2 = $gameMap.roundYWithDirection(y, d);
    const d2 = this.reverseDir(d);
    return $gameMap.isPassable(x, y, d) && $gameMap.isPassable(x2, y2, d2);
  };

  isCollidedWithCharacters(x: number, y: number): boolean {
    return this.isCollidedWithEvents(x, y) || this.isCollidedWithVehicles(x, y);
  };

  isCollidedWithEvents(x: number, y: number): boolean {
    const events = $gameMap.eventsXyNt(x, y);
    return events.some((event: Game_Event) => event.isNormalPriority());
  };

  isCollidedWithVehicles(x: number, y: number): boolean {
    return $gameMap.boat().posNt(x, y) || $gameMap.ship().posNt(x, y);
  };

  setPosition(x: number, y: number): void {
    this._x = Math.round(x);
    this._y = Math.round(y);
    this._realX = x;
    this._realY = y;
  };

  copyPosition(character: Game_CharacterBase): void {
    this._x = character._x;
    this._y = character._y;
    this._realX = character._realX;
    this._realY = character._realY;
    this._direction = character._direction;
  };

  locate(x: number, y: number): void {
    this.setPosition(x, y);
    this.straighten();
    this.refreshBushDepth();
  };

  direction(): MZ.MoveDirection {
    return this._direction;
  };

  setDirection(d: MZ.MoveDirection): void {
    if (!this.isDirectionFixed() && d) {
        this._direction = d;
    }
    this.resetStopCount();
  };

  isTile(): boolean {
    return this._tileId > 0 && this._priorityType === 0;
  };

  isObjectCharacter(): boolean {
    return this._isObjectCharacter;
  };

  shiftY(): number {
    return this.isObjectCharacter() ? 0 : 6;
  };

  scrolledX(): number {
    return $gameMap.adjustX(this._realX);
  };

  scrolledY(): number {
    return $gameMap.adjustY(this._realY);
  };

  screenX(): number {
    const tw = $gameMap.tileWidth();
    return Math.floor(this.scrolledX() * tw + tw / 2);
  };

  screenY(): number {
    const th = $gameMap.tileHeight();
    return Math.floor(
        this.scrolledY() * th + th - this.shiftY() - this.jumpHeight()
    );
  };

  screenZ(): number {
    return this._priorityType * 2 + 1;
  };

  isNearTheScreen(): boolean {
    const gw = Graphics.width;
    const gh = Graphics.height;
    const tw = $gameMap.tileWidth();
    const th = $gameMap.tileHeight();
    const px = this.scrolledX() * tw + tw / 2 - gw / 2;
    const py = this.scrolledY() * th + th / 2 - gh / 2;
    return px >= -gw && px <= gw && py >= -gh && py <= gh;
  };

  update(): void {
    if (this.isStopping()) {
        this.updateStop();
    }
    if (this.isJumping()) {
        this.updateJump();
    } else if (this.isMoving()) {
        this.updateMove();
    }
    this.updateAnimation();
  };

  updateStop(): void {
    this._stopCount++;
  };

  updateJump(): void {
    this._jumpCount--;
    this._realX =
        (this._realX * this._jumpCount + this._x) / (this._jumpCount + 1.0);
    this._realY =
        (this._realY * this._jumpCount + this._y) / (this._jumpCount + 1.0);
    this.refreshBushDepth();
    if (this._jumpCount === 0) {
        this._realX = this._x = $gameMap.roundX(this._x);
        this._realY = this._y = $gameMap.roundY(this._y);
    }
  };

  updateMove(): void {
    if (this._x < this._realX) {
        this._realX = Math.max(this._realX - this.distancePerFrame(), this._x);
    }
    if (this._x > this._realX) {
        this._realX = Math.min(this._realX + this.distancePerFrame(), this._x);
    }
    if (this._y < this._realY) {
        this._realY = Math.max(this._realY - this.distancePerFrame(), this._y);
    }
    if (this._y > this._realY) {
        this._realY = Math.min(this._realY + this.distancePerFrame(), this._y);
    }
    if (!this.isMoving()) {
        this.refreshBushDepth();
    }
  };

  updateAnimation(): void {
    this.updateAnimationCount();
    if (this._animationCount >= this.animationWait()) {
        this.updatePattern();
        this._animationCount = 0;
    }
  };

  animationWait(): number {
    return (9 - this.realMoveSpeed()) * 3;
  };

  updateAnimationCount(): void {
    if (this.isMoving() && this.hasWalkAnime()) {
        this._animationCount += 1.5;
    } else if (this.hasStepAnime() || !this.isOriginalPattern()) {
        this._animationCount++;
    }
  };

  updatePattern(): void {
    if (!this.hasStepAnime() && this._stopCount > 0) {
        this.resetPattern();
    } else {
        this._pattern = (this._pattern + 1) % this.maxPattern();
    }
  };

  maxPattern(): number {
    return 4;
  };

  pattern(): number {
    return this._pattern < 3 ? this._pattern : 1;
  };

  setPattern(pattern: number): void {
    this._pattern = pattern;
  };

  isOriginalPattern(): boolean {
    return this.pattern() === 1;
  };

  resetPattern(): void {
    this.setPattern(1);
  };

  refreshBushDepth(): void {
    if (
        this.isNormalPriority() &&
        !this.isObjectCharacter() &&
        this.isOnBush() &&
        !this.isJumping()
    ) {
        if (!this.isMoving()) {
            this._bushDepth = 12;
        }
    } else {
        this._bushDepth = 0;
    }
  };

  isOnLadder(): boolean {
    return $gameMap.isLadder(this._x, this._y);
  };

  isOnBush(): boolean {
    return $gameMap.isBush(this._x, this._y);
  };

  terrainTag(): number {
    return $gameMap.terrainTag(this._x, this._y);
  };

  regionId(): number {
    return $gameMap.regionId(this._x, this._y);
  };

  increaseSteps(): void {
    if (this.isOnLadder()) {
        this.setDirection(8);
    }
    this.resetStopCount();
    this.refreshBushDepth();
  };

  tileId(): number {
    return this._tileId;
  };

  characterName(): string {
    return this._characterName;
  };

  characterIndex(): number {
    return this._characterIndex;
  };

  setImage(characterName: string, characterIndex: number): void {
    this._tileId = 0;
    this._characterName = characterName;
    this._characterIndex = characterIndex;
    this._isObjectCharacter = ImageManager.isObjectCharacter(characterName);
  };

  setTileImage(tileId: number): void {
    this._tileId = tileId;
    this._characterName = "";
    this._characterIndex = 0;
    this._isObjectCharacter = true;
  };

  checkEventTriggerTouchFront(d: MZ.MoveDirection): void {
    const x2 = $gameMap.roundXWithDirection(this._x, d);
    const y2 = $gameMap.roundYWithDirection(this._y, d);
    this.checkEventTriggerTouch(x2, y2);
  };

  checkEventTriggerTouch(x: number, y: number): boolean {
    return false;
  };

  isMovementSucceeded(x?: number, y?: number): boolean {
    return this._movementSuccess;
  };

  setMovementSuccess(success: boolean): void {
    this._movementSuccess = success;
  };

  moveStraight(d: MZ.MoveDirection): void {
    this.setMovementSuccess(this.canPass(this._x, this._y, d));
    if (this.isMovementSucceeded()) {
        this.setDirection(d);
        this._x = $gameMap.roundXWithDirection(this._x, d);
        this._y = $gameMap.roundYWithDirection(this._y, d);
        this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
        this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
        this.increaseSteps();
    } else {
        this.setDirection(d);
        this.checkEventTriggerTouchFront(d);
    }
  };

  moveDiagonally(horz: MZ.MoveDirection, vert: MZ.MoveDirection): void {
    this.setMovementSuccess(
        this.canPassDiagonally(this._x, this._y, horz, vert)
    );
    if (this.isMovementSucceeded()) {
        this._x = $gameMap.roundXWithDirection(this._x, horz);
        this._y = $gameMap.roundYWithDirection(this._y, vert);
        this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(horz));
        this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(vert));
        this.increaseSteps();
    }
    if (this._direction === this.reverseDir(horz)) {
        this.setDirection(horz);
    }
    if (this._direction === this.reverseDir(vert)) {
        this.setDirection(vert);
    }
  };

  jump(xPlus: number, yPlus: number): void {
    if (Math.abs(xPlus) > Math.abs(yPlus)) {
        if (xPlus !== 0) {
            this.setDirection(xPlus < 0 ? 4 : 6);
        }
    } else {
        if (yPlus !== 0) {
            this.setDirection(yPlus < 0 ? 8 : 2);
        }
    }
    this._x += xPlus;
    this._y += yPlus;
    const distance = Math.round(Math.sqrt(xPlus * xPlus + yPlus * yPlus));
    this._jumpPeak = 10 + distance - this._moveSpeed;
    this._jumpCount = this._jumpPeak * 2;
    this.resetStopCount();
    this.straighten();
  };

  hasWalkAnime(): boolean {
    return this._walkAnime;
  };

  setWalkAnime(walkAnime: boolean): void {
    this._walkAnime = walkAnime;
  };

  hasStepAnime(): boolean {
    return this._stepAnime;
  };

  setStepAnime(stepAnime: boolean): void {
    this._stepAnime = stepAnime;
  };

  isDirectionFixed(): boolean {
    return this._directionFix;
  };

  setDirectionFix(directionFix: boolean): void {
    this._directionFix = directionFix;
  };

  isThrough(): boolean {
    return this._through;
  };

  setThrough(through: boolean): void {
    this._through = through;
  };

  isTransparent(): boolean {
    return this._transparent;
  };

  bushDepth(): number {
    return this._bushDepth;
  };

  setTransparent(transparent: boolean): void {
    this._transparent = transparent;
  };

  startAnimation(): void {
    this._animationPlaying = true;
  };

  startBalloon(): void {
    this._balloonPlaying = true;
  };

  isAnimationPlaying(): boolean {
    return this._animationPlaying;
  };

  isBalloonPlaying(): boolean {
    return this._balloonPlaying;
  };

  endAnimation(): void {
    this._animationPlaying = false;
  };

  endBalloon(): void {
    this._balloonPlaying = false;
  };
}
