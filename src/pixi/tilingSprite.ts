import * as PIXI from 'pixi.js';
import { Rectangle } from '.';
import { Point } from '.';
import { Bitmap } from '.';

//-----------------------------------------------------------------------------
/**
 * The sprite object for a tiling image.
 *
 * @class
 * @extends PIXI.TilingSprite
 * @param {Bitmap} bitmap - The image for the tiling sprite.
 */
export class TilingSprite extends PIXI.TilingSprite {
  static _emptyBaseTexture = new PIXI.BaseTexture(undefined, {
    width: 1,
    height: 1
  });

  _bitmap?: Bitmap
  _width = 0
  _height = 0
  _frame = new Rectangle()
  origin = new Point()

  constructor(bitmap?: Bitmap)
  constructor(thisClass: Constructable<TilingSprite>)
  constructor(arg?: any) {
    super(new PIXI.Texture(TilingSprite._emptyBaseTexture));
    if (typeof arg === "function" && arg === TilingSprite) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(bitmap?: Bitmap): void {
    if (!TilingSprite._emptyBaseTexture) {
        TilingSprite._emptyBaseTexture = new PIXI.BaseTexture();
        TilingSprite._emptyBaseTexture.setSize(1, 1);
    }
    const frame = new Rectangle();
    const texture = new PIXI.Texture(TilingSprite._emptyBaseTexture, frame);
    // dup with constructor super()
    PIXI.TilingSprite.call(this, texture);
    this._bitmap = bitmap;
    this._width = 0;
    this._height = 0;
    this._frame = frame;

    /**
     * The origin point of the tiling sprite for scrolling.
     *
     * @type Point
     */
    this.origin = new Point();

    this._onBitmapChange();
  };

  

  /**
  * The image for the tiling sprite.
  *
  * @type Bitmap
  * @name TilingSprite#bitmap
  */
  get bitmap(): Bitmap {
    return this._bitmap!;
  }
  set bitmap(value: Bitmap) {
    if (this._bitmap !== value) {
        this._bitmap = value;
        this._onBitmapChange();
    }
  }

  /**
  * The opacity of the tiling sprite (0 to 255).
  *
  * @type number
  * @name TilingSprite#opacity
  */
  get opacity(): number {
    return this.alpha * 255;
  }
  set opacity(value: number) {
    this.alpha = value.clamp(0, 255) / 255;
  }

  /**
  * Destroys the tiling sprite.
  */
  destroy(): void {
    const options = { children: true, texture: true };
    super.destroy(options);
  };

  /**
  * Updates the tiling sprite for each frame.
  */
  update(): void {
    for (const child of this.children) {
        if ((child as any).update) {
            (child as any).update();
        }
    }
  };

  /**
  * Sets the x, y, width, and height all at once.
  *
  * @param {number} x - The x coordinate of the tiling sprite.
  * @param {number} y - The y coordinate of the tiling sprite.
  * @param {number} width - The width of the tiling sprite.
  * @param {number} height - The height of the tiling sprite.
  */
  move(x: number, y: number, width: number, height: number): void {
    this.x = x || 0;
    this.y = y || 0;
    this._width = width || 0;
    this._height = height || 0;
  };

  /**
  * Specifies the region of the image that the tiling sprite will use.
  *
  * @param {number} x - The x coordinate of the frame.
  * @param {number} y - The y coordinate of the frame.
  * @param {number} width - The width of the frame.
  * @param {number} height - The height of the frame.
  */
  setFrame(x: number, y: number, width: number, height: number): void {
    this._frame.x = x;
    this._frame.y = y;
    this._frame.width = width;
    this._frame.height = height;
    this._refresh();
  };

  /**
  * Updates the transform on all children of this container for rendering.
  */
  updateTransform(): void {
    this.tilePosition.x = Math.round(-this.origin.x);
    this.tilePosition.y = Math.round(-this.origin.y);
    super.updateTransform();
  };

  _onBitmapChange(): void {
    if (this._bitmap) {
        this._bitmap.addLoadListener(this._onBitmapLoad.bind(this));
    } else {
        this.texture.frame = new Rectangle();
    }
  };

  _onBitmapLoad(): void {
    this.texture.baseTexture = this._bitmap!.baseTexture!;
    this._refresh();
  };

  _refresh(): void {
    const texture = this.texture;
    const frame = this._frame.clone();
    if (frame.width === 0 && frame.height === 0 && this._bitmap) {
        frame.width = this._bitmap.width;
        frame.height = this._bitmap.height;
    }
    if (texture) {
        if (texture.baseTexture) {
            try {
                texture.frame = frame;
            } catch (e) {
                texture.frame = new Rectangle();
            }
        }
        // FIX: PIXI.Texture._updateID is protected
        // texture._updateID++;
        texture.updateUvs();
    }
  };
}