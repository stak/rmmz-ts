import { Sprite, Bitmap } from '../pixi';
import { ColorManager } from '../managers';
import { $gameSystem } from '../managers';
import { Game_Battler, Game_Actor, Game_Enemy } from '../game';

//-----------------------------------------------------------------------------
// Sprite_Name
//
// The sprite for displaying a status gauge.

export class Sprite_Name extends Sprite {
  _battler: Game_Battler | null = null;
  _name = "";
  _textColor = "";

  constructor()
  constructor(thisClass: Constructable<Sprite_Name>)
  constructor(arg?: any) {
    super(Sprite);
    if (typeof arg === "function" && arg === Sprite_Name) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this.initMembers();
    this.createBitmap();
  };

  initMembers(): void {
    this._battler = null;
    this._name = "";
    this._textColor = "";
  };

  destroy(options?: any): void {
    this.bitmap!.destroy();
    super.destroy(options);
  };

  createBitmap(): void {
    const width = this.bitmapWidth();
    const height = this.bitmapHeight();
    this.bitmap = new Bitmap(width, height);
  };

  bitmapWidth(): number {
    return 128;
  };

  bitmapHeight(): number {
    return 24;
  };

  fontFace(): string {
    return $gameSystem.mainFontFace();
  };

  fontSize(): number {
    return $gameSystem.mainFontSize();
  };

  setup(battler: Game_Battler): void {
    this._battler = battler;
    this.updateBitmap();
  };

  update(): void {
    super.update();
    this.updateBitmap();
  };

  updateBitmap(): void {
    const name = this.name();
    const color = this.textColor();
    if (name !== this._name || color !== this._textColor) {
        this._name = name;
        this._textColor = color;
        this.redraw();
    }
  };

  // @ts-ignore conflict with PIXI.Sprite
  name(): string {
    return this._battler ? (this._battler as Game_Actor | Game_Enemy).name() : "";
  };

  textColor(): string {
    return ColorManager.hpColor(this._battler!);
  };

  outlineColor(): string {
    return ColorManager.outlineColor();
  };

  outlineWidth(): number {
    return 3;
  };

  redraw(): void {
    const name = this.name();
    const width = this.bitmapWidth();
    const height = this.bitmapHeight();
    this.setupFont();
    this.bitmap!.clear();
    this.bitmap!.drawText(name, 0, 0, width, height, "left");
  };

  setupFont(): void {
    this.bitmap!.fontFace = this.fontFace();
    this.bitmap!.fontSize = this.fontSize();
    this.bitmap!.textColor = this.textColor();
    this.bitmap!.outlineColor = this.outlineColor();
    this.bitmap!.outlineWidth = this.outlineWidth();
  };
}