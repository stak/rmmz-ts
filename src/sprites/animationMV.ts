import { Sprite, ScreenSprite, Bitmap } from '../pixi';
import { AudioManager, ImageManager } from '../managers';
import { MZ } from '../MZ';


//-----------------------------------------------------------------------------
// Sprite_AnimationMV
//
// The sprite for displaying an old format animation.

export class Sprite_AnimationMV extends Sprite {
  _targets: Sprite[] = [];
  _cellSprites: Sprite[] = [];
  _animation: MZ.DataAnimationMV | null = null;
  _mirror = false;
  _delay = 0;
  _rate = 4;
  _duration = 0;
  _flashColor: MZ.RGBAColorArray = [0, 0, 0, 0];
  _flashDuration = 0;
  _screenFlashDuration = 0;
  _hidingDuration = 0;
  _hue1 = 0;
  _hue2 = 0;
  _bitmap1: Bitmap | null = null;
  _bitmap2: Bitmap | null = null;
  _screenFlashSprite: ScreenSprite | null = null;
  z = 8;

  constructor()
  constructor(thisClass: Constructable<Sprite_AnimationMV>)
  constructor(arg?: any) {
    super(Sprite);
    if (typeof arg === "function" && arg === Sprite_AnimationMV) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this.initMembers();
  };

  initMembers(): void {
    this._targets = [];
    this._animation = null;
    this._mirror = false;
    this._delay = 0;
    this._rate = 4;
    this._duration = 0;
    this._flashColor = [0, 0, 0, 0];
    this._flashDuration = 0;
    this._screenFlashDuration = 0;
    this._hidingDuration = 0;
    this._hue1 = 0;
    this._hue2 = 0;
    this._bitmap1 = null;
    this._bitmap2 = null;
    this._cellSprites = [];
    this._screenFlashSprite = null;
    this.z = 8;
  };

  // prettier-ignore
  setup(targets: Sprite[], animation: MZ.DataAnimationMV, mirror: boolean, delay: number) {
    this._targets = targets;
    this._animation = animation;
    this._mirror = mirror;
    this._delay = delay;
    if (this._animation) {
        this.setupRate();
        this.setupDuration();
        this.loadBitmaps();
        this.createCellSprites();
        this.createScreenFlashSprite();
    }
  };

  setupRate(): void {
    this._rate = 4;
  };

  setupDuration(): void {
    this._duration = this._animation!.frames.length * this._rate + 1;
  };

  update(): void {
    super.update();
    this.updateMain();
    this.updateFlash();
    this.updateScreenFlash();
    this.updateHiding();
  };

  updateFlash(): void {
    if (this._flashDuration > 0) {
        const d = this._flashDuration--;
        this._flashColor[3] *= (d - 1) / d;
        for (const target of this._targets) {
            target.setBlendColor(this._flashColor);
        }
    }
  };

  updateScreenFlash(): void {
    if (this._screenFlashDuration > 0) {
        const d = this._screenFlashDuration--;
        if (this._screenFlashSprite) {
            this._screenFlashSprite.x = -this.absoluteX();
            this._screenFlashSprite.y = -this.absoluteY();
            this._screenFlashSprite.opacity *= (d - 1) / d;
            this._screenFlashSprite.visible = this._screenFlashDuration > 0;
        }
    }
  };

  absoluteX(): number {
    let x = 0;
    let object = this;
    while (object) {
        x += object.x;
        object = object.parent as any;
    }
    return x;
  };

  absoluteY(): number {
    let y = 0;
    let object = this;
    while (object) {
        y += object.y;
        object = object.parent as any;
    }
    return y;
  };

  updateHiding(): void {
    if (this._hidingDuration > 0) {
        this._hidingDuration--;
        if (this._hidingDuration === 0) {
            for (const target of this._targets) {
                target.show();
            }
        }
    }
  };

  isPlaying(): boolean {
    return this._duration > 0;
  };

  loadBitmaps(): void {
    const name1 = this._animation!.animation1Name;
    const name2 = this._animation!.animation2Name;
    this._hue1 = this._animation!.animation1Hue;
    this._hue2 = this._animation!.animation2Hue;
    this._bitmap1 = ImageManager.loadAnimation(name1);
    this._bitmap2 = ImageManager.loadAnimation(name2);
  };

  isReady(): boolean {
    return (
        !!this._bitmap1 &&
        this._bitmap1.isReady() &&
        !!this._bitmap2 &&
        this._bitmap2.isReady()
    );
  };

  createCellSprites(): void {
    this._cellSprites = [];
    for (let i = 0; i < 16; i++) {
        const sprite = new Sprite();
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        this._cellSprites.push(sprite);
        this.addChild(sprite);
    }
  };

  createScreenFlashSprite(): void {
    this._screenFlashSprite = new ScreenSprite();
    this.addChild(this._screenFlashSprite);
  };

  updateMain(): void {
    if (this.isPlaying() && this.isReady()) {
        if (this._delay > 0) {
            this._delay--;
        } else {
            this._duration--;
            this.updatePosition();
            if (this._duration % this._rate === 0) {
                this.updateFrame();
            }
            if (this._duration <= 0) {
                this.onEnd();
            }
        }
    }
  };

  updatePosition(): void {
    if (this._animation!.position === 3) {
        this.x = this.parent.width / 2;
        this.y = this.parent.height / 2;
    } else if (this._targets.length > 0) {
        const target = this._targets[0];
        const parent = target.parent;
        const grandparent = parent ? parent.parent : null;
        this.x = target.x;
        this.y = target.y;
        if (this.parent === grandparent) {
            this.x += parent.x;
            this.y += parent.y;
        }
        if (this._animation!.position === 0) {
            this.y -= target.height;
        } else if (this._animation!.position === 1) {
            this.y -= target.height / 2;
        }
    }
  };

  updateFrame(): void {
    if (this._duration > 0) {
        const frameIndex = this.currentFrameIndex();
        this.updateAllCellSprites(this._animation!.frames[frameIndex]);
        for (const timing of this._animation!.timings) {
            if (timing.frame === frameIndex) {
                this.processTimingData(timing);
            }
        }
    }
  };

  currentFrameIndex(): number {
    return (
        this._animation!.frames.length -
        Math.floor((this._duration + this._rate - 1) / this._rate)
    );
  };

  updateAllCellSprites(frame: number[][]): void {
    if (this._targets.length > 0) {
        for (let i = 0; i < this._cellSprites.length; i++) {
            const sprite = this._cellSprites[i];
            if (i < frame.length) {
                this.updateCellSprite(sprite, frame[i]);
            } else {
                sprite.visible = false;
            }
        }
    }
  };

  updateCellSprite(sprite: Sprite, cell: number[]): void {
    const pattern = cell[0];
    if (pattern >= 0) {
        const sx = (pattern % 5) * 192;
        const sy = Math.floor((pattern % 100) / 5) * 192;
        const mirror = this._mirror;
        sprite.bitmap = pattern < 100 ? this._bitmap1 : this._bitmap2;
        sprite.setHue(pattern < 100 ? this._hue1 : this._hue2);
        sprite.setFrame(sx, sy, 192, 192);
        sprite.x = cell[1];
        sprite.y = cell[2];
        sprite.rotation = (cell[4] * Math.PI) / 180;
        sprite.scale.x = cell[3] / 100;

        if (cell[5]) {
            sprite.scale.x *= -1;
        }
        if (mirror) {
            sprite.x *= -1;
            sprite.rotation *= -1;
            sprite.scale.x *= -1;
        }

        sprite.scale.y = cell[3] / 100;
        sprite.opacity = cell[6];
        sprite.blendMode = cell[7];
        sprite.visible = true;
    } else {
        sprite.visible = false;
    }
  };

  processTimingData(timing: MZ.MVTiming): void {
    const duration = timing.flashDuration * this._rate;
    switch (timing.flashScope) {
        case 1:
            this.startFlash(timing.flashColor, duration);
            break;
        case 2:
            this.startScreenFlash(timing.flashColor, duration);
            break;
        case 3:
            this.startHiding(duration);
            break;
    }
    if (timing.se) {
        AudioManager.playSe(timing.se);
    }
  };

  startFlash(color: MZ.RGBAColorArray, duration: number): void {
    this._flashColor = color.clone() as MZ.RGBAColorArray;
    this._flashDuration = duration;
  };

  startScreenFlash(color: MZ.RGBAColorArray, duration: number): void {
    this._screenFlashDuration = duration;
    if (this._screenFlashSprite) {
        this._screenFlashSprite.setColor(color[0], color[1], color[2]);
        this._screenFlashSprite.opacity = color[3];
    }
  };

  startHiding(duration: number): void {
    this._hidingDuration = duration;
    for (const target of this._targets) {
        target.hide();
    }
  };

  onEnd(): void {
    this._flashDuration = 0;
    this._screenFlashDuration = 0;
    this._hidingDuration = 0;
    for (const target of this._targets) {
        target.setBlendColor([0, 0, 0, 0]);
        target.show();
    }
  };
}