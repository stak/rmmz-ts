import { Graphics } from '../dom';
import { Spriteset_Base } from '.';
import { Sprite_Character } from '.';
import { Sprite_Destination } from '.';
import { Sprite_Balloon } from '.';
import { Game_Character } from '../game';
import { Sprite, TilingSprite, Tilemap, Weather } from '../pixi';
import { ImageManager } from '../managers';
import { $gameMap, $gamePlayer, $gameScreen, $gameTemp } from '../managers';
import { MZ } from '../MZ';
import { BalloonRequest } from '../game/temp';

//-----------------------------------------------------------------------------
// Spriteset_Map
//
// The set of sprites on the map screen.

export class Spriteset_Map extends Spriteset_Base {
  _balloonSprites?: Sprite_Balloon[]
  _characterSprites?: Sprite_Character[]
  _parallax?: TilingSprite
  _tileset?: MZ.DataTileset
  _tilemap?: Tilemap
  _shadowSprite?: Sprite
  _destinationSprite?: Sprite_Destination
  _weather?: Weather
  _parallaxName?: string

  constructor()
  constructor(thisClass: Constructable<Spriteset_Map>)
  constructor(arg?: any) {
    super(Spriteset_Base);
    if (typeof arg === "function" && arg === Spriteset_Map) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this._balloonSprites = [];
  };

  destroy(options?: any): void {
    this.removeAllBalloons();
    super.destroy(options);
  };

  loadSystemImages(): void {
    super.loadSystemImages();
    ImageManager.loadSystem("Balloon");
    ImageManager.loadSystem("Shadow1");
  };

  createLowerLayer(): void {
    super.createLowerLayer();
    this.createParallax();
    this.createTilemap();
    this.createCharacters();
    this.createShadow();
    this.createDestination();
    this.createWeather();
  };

  update(): void {
    super.update();
    this.updateTileset();
    this.updateParallax();
    this.updateTilemap();
    this.updateShadow();
    this.updateWeather();
    this.updateAnimations();
    this.updateBalloons();
  };

  hideCharacters(): void {
    for (const sprite of this._characterSprites!) {
        if (!sprite.isTile() && !sprite.isObjectCharacter()) {
            sprite.hide();
        }
    }
  };

  createParallax(): void {
    this._parallax = new TilingSprite();
    this._parallax.move(0, 0, Graphics.width, Graphics.height);
    this._baseSprite!.addChild(this._parallax);
  };

  createTilemap(): void {
    const tilemap = new Tilemap();
    // FIX: property name was wrong, add "_"
    tilemap._tileWidth = $gameMap.tileWidth();
    tilemap._tileHeight = $gameMap.tileHeight();
    tilemap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
    tilemap.horizontalWrap = $gameMap.isLoopHorizontal();
    tilemap.verticalWrap = $gameMap.isLoopVertical();
    this._baseSprite!.addChild(tilemap);
    this._effectsContainer = tilemap;
    this._tilemap = tilemap;
    this.loadTileset();
  };

  loadTileset(): void {
    this._tileset = $gameMap.tileset();
    if (this._tileset) {
        const bitmaps = [];
        const tilesetNames = this._tileset.tilesetNames;
        for (const name of tilesetNames) {
            bitmaps.push(ImageManager.loadTileset(name));
        }
        this._tilemap!.setBitmaps(bitmaps);
        this._tilemap!.flags = $gameMap.tilesetFlags();
    }
  };

  createCharacters(): void {
    this._characterSprites = [];
    for (const event of $gameMap.events()) {
        this._characterSprites.push(new Sprite_Character(event));
    }
    for (const vehicle of $gameMap.vehicles()) {
        this._characterSprites.push(new Sprite_Character(vehicle));
    }
    for (const follower of $gamePlayer.followers().reverseData()) {
        this._characterSprites.push(new Sprite_Character(follower));
    }
    this._characterSprites.push(new Sprite_Character($gamePlayer));
    for (const sprite of this._characterSprites) {
        this._tilemap!.addChild(sprite);
    }
  };

  createShadow(): void {
    this._shadowSprite = new Sprite();
    this._shadowSprite.bitmap = ImageManager.loadSystem("Shadow1");
    this._shadowSprite.anchor.x = 0.5;
    this._shadowSprite.anchor.y = 1;
    (this._shadowSprite as any).z = 6;
    this._tilemap!.addChild(this._shadowSprite);
  };

  createDestination(): void {
    this._destinationSprite = new Sprite_Destination();
    (this._destinationSprite as any).z = 9;
    this._tilemap!.addChild(this._destinationSprite);
  };

  createWeather(): void {
    this._weather = new Weather();
    this.addChild(this._weather);
  };

  updateTileset(): void {
    if (this._tileset !== $gameMap.tileset()) {
        this.loadTileset();
    }
  };

  updateParallax(): void {
    if (this._parallaxName !== $gameMap.parallaxName()) {
        this._parallaxName = $gameMap.parallaxName();
        this._parallax!.bitmap = ImageManager.loadParallax(this._parallaxName);
    }
    if (this._parallax!.bitmap) {
        this._parallax!.origin.x = $gameMap.parallaxOx();
        this._parallax!.origin.y = $gameMap.parallaxOy();
    }
  };

  updateTilemap(): void {
    this._tilemap!.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
    this._tilemap!.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
  };

  updateShadow(): void {
    const airship = $gameMap.airship();
    this._shadowSprite!.x = airship.shadowX();
    this._shadowSprite!.y = airship.shadowY();
    this._shadowSprite!.opacity = airship.shadowOpacity();
  };

  updateWeather(): void {
    this._weather!.type = $gameScreen.weatherType();
    this._weather!.power = $gameScreen.weatherPower();
    this._weather!.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
    this._weather!.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
  };

  updateBalloons(): void {
    for (const sprite of this._balloonSprites!) {
        if (!sprite.isPlaying()) {
            this.removeBalloon(sprite);
        }
    }
    this.processBalloonRequests();
  };

  processBalloonRequests(): void {
    for (;;) {
        const request = $gameTemp.retrieveBalloon();
        if (request) {
            this.createBalloon(request);
        } else {
            break;
        }
    }
  };

  createBalloon(request: BalloonRequest): void {
    const targetSprite = this.findTargetSprite(request.target);
    if (targetSprite) {
        const sprite = new Sprite_Balloon();
        (sprite as any).targetObject = request.target;
        sprite.setup(targetSprite, request.balloonId);
        this._effectsContainer!.addChild(sprite);
        this._balloonSprites!.push(sprite);
    }
  };

  removeBalloon(sprite: Sprite_Balloon): void {
    this._balloonSprites!.remove(sprite);
    this._effectsContainer!.removeChild(sprite);
    if ((sprite as any).targetObject.endBalloon) {
        (sprite as any).targetObject.endBalloon();
    }
    sprite.destroy();
  };

  removeAllBalloons(): void {
    for (const sprite of this._balloonSprites!) {
        this.removeBalloon(sprite);
    }
  };

  findTargetSprite(target: Game_Character): Sprite_Character | undefined {
    return this._characterSprites!.find(sprite => sprite.checkCharacter(target));
  };

  animationBaseDelay(): number {
    return 0;
  };
}