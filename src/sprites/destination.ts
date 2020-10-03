import { Sprite, Bitmap } from '../pixi';
import { $gameMap, $gameTemp } from '../managers';

//-----------------------------------------------------------------------------
// Sprite_Destination
//
// The sprite for displaying the destination place of the touch input.

export class Sprite_Destination extends Sprite {
  _frameCount = 0

  constructor()
  constructor(thisClass: Constructable<Sprite_Destination>)
  constructor(arg?: any) {
    super(Sprite);
    if (typeof arg === "function" && arg === Sprite_Destination) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this.createBitmap();
    this._frameCount = 0;
  };

  destroy(options?: any): void {
    if (this.bitmap) {
        this.bitmap.destroy();
    }
    super.destroy(options);
  };

  update(): void {
    super.update();
    if ($gameTemp.isDestinationValid()) {
        this.updatePosition();
        this.updateAnimation();
        this.visible = true;
    } else {
        this._frameCount = 0;
        this.visible = false;
    }
  };

  createBitmap(): void {
    const tileWidth = $gameMap.tileWidth();
    const tileHeight = $gameMap.tileHeight();
    this.bitmap = new Bitmap(tileWidth, tileHeight);
    this.bitmap.fillAll("white");
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.blendMode = 1;
  };

  updatePosition(): void {
    const tileWidth = $gameMap.tileWidth();
    const tileHeight = $gameMap.tileHeight();
    const x = $gameTemp.destinationX()!;
    const y = $gameTemp.destinationY()!;
    this.x = ($gameMap.adjustX(x) + 0.5) * tileWidth;
    this.y = ($gameMap.adjustY(y) + 0.5) * tileHeight;
  };

  updateAnimation(): void {
    this._frameCount++;
    this._frameCount %= 20;
    this.opacity = (20 - this._frameCount) * 6;
    this.scale.x = 1 + this._frameCount / 20;
    this.scale.y = this.scale.x;
  };
}