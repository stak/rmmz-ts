import { Graphics } from '../dom';
import { Sprite, ScreenSprite, ColorFilter, Rectangle } from '../pixi';
import { Sprite_Picture } from '.';
import { Sprite_Timer } from '.';
import { Sprite_Animation } from '.';
import { Sprite_AnimationMV } from '.';
import { $gameScreen, $gameTemp } from '../managers';
import { $dataAnimations } from '../managers';
import { AnimationRequest } from '../game/temp';
import { Game_Battler, Game_Character, Game_CharacterBase } from '../game';
import { MZ } from '../MZ';


//-----------------------------------------------------------------------------
// Spriteset_Base
//
// The superclass of Spriteset_Map and Spriteset_Battle.

export class Spriteset_Base extends Sprite {
  _animationSprites: Sprite_Animation[] | Sprite_AnimationMV[] = []
  _baseSprite?: Sprite
  _baseColorFilter?: ColorFilter
  _overallColorFilter?: ColorFilter
  _blackScreen?: ScreenSprite
  _pictureContainer?: Sprite
  _timerSprite?: Sprite_Timer
  _effectsContainer?: PIXI.Container

  constructor()
  constructor(thisClass: Constructable<Spriteset_Base>)
  constructor(arg?: any) {
    super(Sprite);
    if (typeof arg === "function" && arg === Spriteset_Base) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this.setFrame(0, 0, Graphics.width, Graphics.height);
    this.loadSystemImages();
    this.createLowerLayer();
    this.createUpperLayer();
    this._animationSprites = [];
  };

  destroy(options?: any): void {
    this.removeAllAnimations();
    super.destroy(options);
  };

  loadSystemImages(): void {
    //
  };

  createLowerLayer(): void {
    this.createBaseSprite();
    this.createBaseFilters();
  };

  createUpperLayer(): void {
    this.createPictures();
    this.createTimer();
    this.createOverallFilters();
  };

  update(): void {
    super.update();
    this.updateBaseFilters();
    this.updateOverallFilters();
    this.updatePosition();
    this.updateAnimations();
  };

  createBaseSprite(): void {
    this._baseSprite = new Sprite();
    this._blackScreen = new ScreenSprite();
    this._blackScreen.opacity = 255;
    this.addChild(this._baseSprite);
    this._baseSprite.addChild(this._blackScreen);
  };

  createBaseFilters(): void {
    this._baseSprite!.filters = [];
    this._baseColorFilter = new ColorFilter();
    this._baseSprite!.filters.push(this._baseColorFilter);
  };

  createPictures(): void {
    const rect = this.pictureContainerRect();
    this._pictureContainer = new Sprite();
    this._pictureContainer.setFrame(rect.x, rect.y, rect.width, rect.height);
    for (let i = 1; i <= $gameScreen.maxPictures(); i++) {
        this._pictureContainer.addChild(new Sprite_Picture(i));
    }
    this.addChild(this._pictureContainer);
  };

  pictureContainerRect(): Rectangle {
    return new Rectangle(0, 0, Graphics.width, Graphics.height);
  };

  createTimer(): void {
    this._timerSprite = new Sprite_Timer();
    this.addChild(this._timerSprite);
  };

  createOverallFilters(): void {
    this.filters = [];
    this._overallColorFilter = new ColorFilter();
    this.filters.push(this._overallColorFilter);
  };

  updateBaseFilters(): void {
    const filter = this._baseColorFilter!;
    filter.setColorTone($gameScreen.tone());
  };

  updateOverallFilters(): void {
    const filter = this._overallColorFilter!;
    filter.setBlendColor($gameScreen.flashColor());
    filter.setBrightness($gameScreen.brightness());
  };

  updatePosition(): void {
    const screen = $gameScreen;
    const scale = screen.zoomScale();
    this.scale.x = scale;
    this.scale.y = scale;
    this.x = Math.round(-screen.zoomX() * (scale - 1));
    this.y = Math.round(-screen.zoomY() * (scale - 1));
    this.x += Math.round(screen.shake());
  };

  findTargetSprite(target: any): any {
    return null;
  };

  updateAnimations(): void {
    for (const sprite of this._animationSprites) {
        if (!sprite.isPlaying()) {
            this.removeAnimation(sprite);
        }
    }
    this.processAnimationRequests();
  };

  processAnimationRequests(): void {
    for (;;) {
        const request = $gameTemp.retrieveAnimation();
        if (request) {
            this.createAnimation(request);
        } else {
            break;
        }
    }
  };

  createAnimation(request: AnimationRequest): void {
    const animation = $dataAnimations[request.animationId];
    const targets = request.targets;
    const mirror = request.mirror;
    let delay = this.animationBaseDelay();
    const nextDelay = this.animationNextDelay();
    if (this.isAnimationForEach(animation)) {
        for (const target of targets) {
            this.createAnimationSprite([target], animation, mirror, delay);
            delay += nextDelay;
        }
    } else {
        this.createAnimationSprite(targets, animation, mirror, delay);
    }
  };

  // prettier-ignore
  createAnimationSprite(
    targets: Array<Game_Character | Game_Battler>,
    animation: MZ.DataAnimation | MZ.DataAnimationMV,
    mirror: boolean,
    delay: number
  ): void {
    const mv = this.isMVAnimation(animation);
    const sprite = new (mv ? Sprite_AnimationMV : Sprite_Animation)();
    const targetSprites = this.makeTargetSprites(targets);
    const baseDelay = this.animationBaseDelay();
    const previous = delay > baseDelay ? this.lastAnimationSprite() : null;
    if (this.animationShouldMirror(targets[0])) {
        mirror = !mirror;
    }
    (sprite as any).targetObjects = targets;
    sprite.setup(targetSprites, animation as any, mirror, delay, previous as any);
    this._effectsContainer!.addChild(sprite as PIXI.DisplayObject);
    this._animationSprites.push(sprite as any);
  };

  isMVAnimation(animation: MZ.DataAnimation | MZ.DataAnimationMV): boolean {
    return !!(animation as any).frames;
  };

  makeTargetSprites(targets: Array<Game_Character | Game_Battler>): Sprite[] {
    const targetSprites: Sprite[] = [];
    for (const target of targets) {
        const targetSprite = this.findTargetSprite(target);
        if (targetSprite) {
            targetSprites.push(targetSprite);
        }
    }
    return targetSprites;
  };

  lastAnimationSprite(): Sprite_Animation | Sprite_AnimationMV {
    return this._animationSprites[this._animationSprites.length - 1];
  };

  isAnimationForEach(animation: MZ.DataAnimation | MZ.DataAnimationMV): boolean {
    const mv = this.isMVAnimation(animation);
    return mv ? (animation as MZ.DataAnimationMV).position !== 3 :
                (animation as MZ.DataAnimation).displayType === 0;
  };

  animationBaseDelay(): number {
    return 8;
  };

  animationNextDelay(): number {
    return 12;
  };

  animationShouldMirror(target: Game_Character | Game_Battler): boolean {
    return target && (target as any).isActor && (target as any).isActor();
  };

  removeAnimation(sprite: Sprite_Animation | Sprite_AnimationMV): void {
    this._animationSprites.remove(sprite as any);
    this._effectsContainer!.removeChild(sprite as PIXI.DisplayObject);
    for (const target of (sprite as any).targetObjects) {
        if (target.endAnimation) {
            target.endAnimation();
        }
    }
    sprite.destroy();
  };

  removeAllAnimations(): void {
    for (const sprite of this._animationSprites) {
        this.removeAnimation(sprite);
    }
  };

  isAnimationPlaying(): boolean {
    return this._animationSprites.length > 0;
  };
}