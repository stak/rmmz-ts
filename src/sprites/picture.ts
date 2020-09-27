import { Sprite_Clickable } from '.';
import { Game_Picture } from '../game';
import { ImageManager } from '../managers';
import { $gameScreen } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Sprite_Picture
//
// The sprite for displaying a picture.

export class Sprite_Picture extends Sprite_Clickable {
  _pictureId = 0
  _pictureName = ""

  constructor(pictureId: MZ.ID)
  constructor(thisClass: Constructable<Sprite_Picture>)
  constructor(arg?: any) {
    super(Sprite_Clickable);
    if (typeof arg === "function" && arg === Sprite_Picture) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(pictureId?: MZ.ID): void {
    super.initialize();
    this._pictureId = pictureId!;
    this._pictureName = "";
    this.update();
  };

  picture(): Game_Picture {
    return $gameScreen.picture(this._pictureId)!;
  };

  update(): void {
    super.update();
    this.updateBitmap();
    if (this.visible) {
        this.updateOrigin();
        this.updatePosition();
        this.updateScale();
        this.updateTone();
        this.updateOther();
    }
  };

  updateBitmap(): void {
    const picture = this.picture();
    if (picture) {
        const pictureName = picture.name();
        if (this._pictureName !== pictureName) {
            this._pictureName = pictureName;
            this.loadBitmap();
        }
        this.visible = true;
    } else {
        this._pictureName = "";
        this.bitmap = null;
        this.visible = false;
    }
  };

  updateOrigin(): void {
    const picture = this.picture();
    if (picture.origin() === 0) {
        this.anchor.x = 0;
        this.anchor.y = 0;
    } else {
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
    }
  };

  updatePosition(): void {
    const picture = this.picture();
    this.x = Math.round(picture.x());
    this.y = Math.round(picture.y());
  };

  updateScale(): void {
    const picture = this.picture();
    this.scale.x = picture.scaleX() / 100;
    this.scale.y = picture.scaleY() / 100;
  };

  updateTone(): void {
    const picture = this.picture();
    if (picture.tone()) {
        this.setColorTone(picture.tone());
    } else {
        this.setColorTone([0, 0, 0, 0]);
    }
  };

  updateOther(): void {
    const picture = this.picture();
    this.opacity = picture.opacity();
    this.blendMode = picture.blendMode();
    this.rotation = (picture.angle() * Math.PI) / 180;
  };

  loadBitmap(): void {
    this.bitmap = ImageManager.loadPicture(this._pictureName);
  };
}
