import { Bitmap, Sprite } from '../pixi';
import { ImageManager } from '../managers';
import { $gameMap } from '../managers';
import { Game_Character, Game_CharacterBase } from '../game';

//-----------------------------------------------------------------------------
// Sprite_Character
//
// The sprite for displaying a character.

export class Sprite_Character extends Sprite {
  _character: Game_Character | null = null;
  _characterName?: string
  _characterIndex?: number
  _balloonDuration = 0;
  _tilesetId = 0;
  _tileId = 0;
  _upperBody: Sprite | null = null;
  _lowerBody: Sprite | null = null;
  _isBigCharacter = false
  _bushDepth = 0
  z = 0

  constructor(character: Game_Character)
  constructor(thisClass: Constructable<Sprite_Character>)
  constructor(arg?: any) {
    super(Sprite);
    if (typeof arg === "function" && arg === Sprite_Character) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void
  initialize(character?: Game_Character): void {
    super.initialize();
    this.initMembers();
    this.setCharacter(character!);
  };

  initMembers(): void {
    this.anchor.x = 0.5;
    this.anchor.y = 1;
    this._character = null;
    this._balloonDuration = 0;
    this._tilesetId = 0;
    this._upperBody = null;
    this._lowerBody = null;
  };

  setCharacter(character: Game_Character): void {
    this._character = character;
  };

  checkCharacter(character: Game_Character): boolean {
    return this._character === character;
  };

  update(): void {
    super.update();
    this.updateBitmap();
    this.updateFrame();
    this.updatePosition();
    this.updateOther();
    this.updateVisibility();
  };

  updateVisibility(): void {
    super.updateVisibility();
    if (this.isEmptyCharacter() || this._character!.isTransparent()) {
        this.visible = false;
    }
  };

  isTile(): boolean {
    return this._character!.isTile();
  };

  isObjectCharacter(): boolean {
    return this._character!.isObjectCharacter();
  };

  isEmptyCharacter(): boolean {
    return this._tileId === 0 && !this._characterName;
  };

  tilesetBitmap(tileId: number): Bitmap {
    const tileset = $gameMap.tileset();
    const setNumber = 5 + Math.floor(tileId / 256);
    return ImageManager.loadTileset(tileset.tilesetNames[setNumber]);
  };

  updateBitmap(): void {
    if (this.isImageChanged()) {
        this._tilesetId = $gameMap.tilesetId();
        this._tileId = this._character!.tileId();
        this._characterName = this._character!.characterName();
        this._characterIndex = this._character!.characterIndex();
        if (this._tileId > 0) {
            this.setTileBitmap();
        } else {
            this.setCharacterBitmap();
        }
    }
  };

  isImageChanged(): boolean {
    return (
        this._tilesetId !== $gameMap.tilesetId() ||
        this._tileId !== this._character!.tileId() ||
        this._characterName !== this._character!.characterName() ||
        this._characterIndex !== this._character!.characterIndex()
    );
  };

  setTileBitmap(): void {
    this.bitmap = this.tilesetBitmap(this._tileId);
  };

  setCharacterBitmap(): void {
    this.bitmap = ImageManager.loadCharacter(this._characterName!);
    this._isBigCharacter = ImageManager.isBigCharacter(this._characterName!);
  };

  updateFrame(): void {
    if (this._tileId > 0) {
        this.updateTileFrame();
    } else {
        this.updateCharacterFrame();
    }
  };

  updateTileFrame(): void {
    const tileId = this._tileId;
    const pw = this.patternWidth();
    const ph = this.patternHeight();
    const sx = ((Math.floor(tileId / 128) % 2) * 8 + (tileId % 8)) * pw;
    const sy = (Math.floor((tileId % 256) / 8) % 16) * ph;
    this.setFrame(sx, sy, pw, ph);
  };

  updateCharacterFrame(): void {
    const pw = this.patternWidth();
    const ph = this.patternHeight();
    const sx = (this.characterBlockX() + this.characterPatternX()) * pw;
    const sy = (this.characterBlockY() + this.characterPatternY()) * ph;
    this.updateHalfBodySprites();
    if (this._bushDepth > 0) {
        const d = this._bushDepth;
        this._upperBody!.setFrame(sx, sy, pw, ph - d);
        this._lowerBody!.setFrame(sx, sy + ph - d, pw, d);
        this.setFrame(sx, sy, 0, ph);
    } else {
        this.setFrame(sx, sy, pw, ph);
    }
  };

  characterBlockX(): number {
    if (this._isBigCharacter) {
        return 0;
    } else {
        const index = this._character!.characterIndex();
        return (index % 4) * 3;
    }
  };

  characterBlockY(): number {
    if (this._isBigCharacter) {
        return 0;
    } else {
        const index = this._character!.characterIndex();
        return Math.floor(index / 4) * 4;
    }
  };

  characterPatternX(): number {
    return this._character!.pattern();
  };

  characterPatternY(): number {
    return (this._character!.direction() - 2) / 2;
  };

  patternWidth(): number {
    if (this._tileId > 0) {
        return $gameMap.tileWidth();
    } else if (this._isBigCharacter) {
        return this.bitmap!.width / 3;
    } else {
        return this.bitmap!.width / 12;
    }
  };

  patternHeight(): number {
    if (this._tileId > 0) {
        return $gameMap.tileHeight();
    } else if (this._isBigCharacter) {
        return this.bitmap!.height / 4;
    } else {
        return this.bitmap!.height / 8;
    }
  };

  updateHalfBodySprites(): void {
    if (this._bushDepth > 0) {
        this.createHalfBodySprites();
        this._upperBody!.bitmap = this.bitmap;
        this._upperBody!.visible = true;
        this._upperBody!.y = -this._bushDepth;
        this._lowerBody!.bitmap = this.bitmap;
        this._lowerBody!.visible = true;
        this._upperBody!.setBlendColor(this.getBlendColor());
        this._lowerBody!.setBlendColor(this.getBlendColor());
        this._upperBody!.setColorTone(this.getColorTone());
        this._lowerBody!.setColorTone(this.getColorTone());
        this._upperBody!.blendMode = this.blendMode;
        this._lowerBody!.blendMode = this.blendMode;
    } else if (this._upperBody) {
        this._upperBody!.visible = false;
        this._lowerBody!.visible = false;
    }
  };

  createHalfBodySprites(): void {
    if (!this._upperBody) {
        this._upperBody = new Sprite();
        this._upperBody.anchor.x = 0.5;
        this._upperBody.anchor.y = 1;
        this.addChild(this._upperBody);
    }
    if (!this._lowerBody) {
        this._lowerBody = new Sprite();
        this._lowerBody.anchor.x = 0.5;
        this._lowerBody.anchor.y = 1;
        this._lowerBody.opacity = 128;
        this.addChild(this._lowerBody);
    }
  };

  updatePosition(): void {
    this.x = this._character!.screenX();
    this.y = this._character!.screenY();
    this.z = this._character!.screenZ();
  };

  updateOther(): void {
    this.opacity = this._character!.opacity();
    this.blendMode = this._character!.blendMode();
    this._bushDepth = this._character!.bushDepth();
  };
}
