import { Game_Picture } from '.';
import { $gameParty } from '../managers';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// Game_Screen
//
// The game object class for screen effect data, such as changes in color tone
// and flashes.

export class Game_Screen {
  _brightness = 255
  _fadeOutDuration = 0
  _fadeInDuration = 0
  _tone: MZ.RGBAColorArray = [0, 0, 0, 0]
  _toneTarget: MZ.RGBAColorArray = [0, 0, 0, 0]
  _toneDuration = 0
  _flashColor: MZ.RGBAColorArray = [0, 0, 0, 0]
  _flashDuration = 0
  _shakePower = 0;
  _shakeSpeed = 0;
  _shakeDuration = 0;
  _shakeDirection = 1;
  _shake = 0;
  _zoomX = 0;
  _zoomY = 0;
  _zoomScale = 1;
  _zoomScaleTarget = 1;
  _zoomDuration = 0;
  _weatherType = "none";
  _weatherPower = 0;
  _weatherPowerTarget = 0;
  _weatherDuration = 0;
  _pictures: (Game_Picture | null)[] = [];

  constructor()
  constructor(thisClass: Constructable<Game_Screen>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_Screen) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    this.clear();
  };

  clear(): void {
    this.clearFade();
    this.clearTone();
    this.clearFlash();
    this.clearShake();
    this.clearZoom();
    this.clearWeather();
    this.clearPictures();
  };

  onBattleStart(): void {
    this.clearFade();
    this.clearFlash();
    this.clearShake();
    this.clearZoom();
    this.eraseBattlePictures();
  };

  brightness(): number {
    return this._brightness;
  };

  tone(): MZ.RGBAColorArray {
    return this._tone;
  };

  flashColor(): MZ.RGBAColorArray {
    return this._flashColor;
  };

  shake(): number {
    return this._shake;
  };

  zoomX(): number {
    return this._zoomX;
  };

  zoomY(): number {
    return this._zoomY;
  };

  zoomScale(): number {
    return this._zoomScale;
  };

  weatherType(): string {
    return this._weatherType;
  };

  weatherPower(): number {
    return this._weatherPower;
  };

  picture(pictureId: MZ.ID): Game_Picture | null {
    const realPictureId = this.realPictureId(pictureId);
    return this._pictures[realPictureId];
  };

  realPictureId(pictureId: MZ.ID): MZ.ID {
    if ($gameParty.inBattle()) {
        return pictureId + this.maxPictures();
    } else {
        return pictureId;
    }
  };

  clearFade(): void {
    this._brightness = 255;
    this._fadeOutDuration = 0;
    this._fadeInDuration = 0;
  };

  clearTone(): void {
    this._tone = [0, 0, 0, 0];
    this._toneTarget = [0, 0, 0, 0];
    this._toneDuration = 0;
  };

  clearFlash(): void {
    this._flashColor = [0, 0, 0, 0];
    this._flashDuration = 0;
  };

  clearShake(): void {
    this._shakePower = 0;
    this._shakeSpeed = 0;
    this._shakeDuration = 0;
    this._shakeDirection = 1;
    this._shake = 0;
  };

  clearZoom(): void {
    this._zoomX = 0;
    this._zoomY = 0;
    this._zoomScale = 1;
    this._zoomScaleTarget = 1;
    this._zoomDuration = 0;
  };

  clearWeather(): void {
    this._weatherType = "none";
    this._weatherPower = 0;
    this._weatherPowerTarget = 0;
    this._weatherDuration = 0;
  };

  clearPictures(): void {
    this._pictures = [];
  };

  eraseBattlePictures(): void {
    this._pictures = this._pictures.slice(0, this.maxPictures() + 1);
  };

  maxPictures(): number {
    return 100;
  };

  startFadeOut(duration: number): void {
    this._fadeOutDuration = duration;
    this._fadeInDuration = 0;
  };

  startFadeIn(duration: number): void {
    this._fadeInDuration = duration;
    this._fadeOutDuration = 0;
  };

  startTint(tone: MZ.RGBAColorArray, duration: number): void {
    this._toneTarget = tone.clone() as MZ.RGBAColorArray;
    this._toneDuration = duration;
    if (this._toneDuration === 0) {
        this._tone = this._toneTarget.clone() as MZ.RGBAColorArray;
    }
  };

  startFlash(color: MZ.RGBAColorArray, duration: number): void {
    this._flashColor = color.clone() as MZ.RGBAColorArray;
    this._flashDuration = duration;
  };

  startShake(power: number, speed: number, duration: number): void {
    this._shakePower = power;
    this._shakeSpeed = speed;
    this._shakeDuration = duration;
  };

  startZoom(x: number, y: number, scale: number, duration: number): void {
    this._zoomX = x;
    this._zoomY = y;
    this._zoomScaleTarget = scale;
    this._zoomDuration = duration;
  };

  setZoom(x: number, y: number, scale: number): void {
    this._zoomX = x;
    this._zoomY = y;
    this._zoomScale = scale;
  };

  changeWeather(type: string, power: number, duration: number): void {
    if (type !== "none" || duration === 0) {
        this._weatherType = type;
    }
    this._weatherPowerTarget = type === "none" ? 0 : power;
    this._weatherDuration = duration;
    if (duration === 0) {
        this._weatherPower = this._weatherPowerTarget;
    }
  };

  update(): void {
    this.updateFadeOut();
    this.updateFadeIn();
    this.updateTone();
    this.updateFlash();
    this.updateShake();
    this.updateZoom();
    this.updateWeather();
    this.updatePictures();
  };

  updateFadeOut(): void {
    if (this._fadeOutDuration > 0) {
        const d = this._fadeOutDuration;
        this._brightness = (this._brightness * (d - 1)) / d;
        this._fadeOutDuration--;
    }
  };

  updateFadeIn(): void {
    if (this._fadeInDuration > 0) {
        const d = this._fadeInDuration;
        this._brightness = (this._brightness * (d - 1) + 255) / d;
        this._fadeInDuration--;
    }
  };

  updateTone(): void {
    if (this._toneDuration > 0) {
        const d = this._toneDuration;
        for (let i = 0; i < 4; i++) {
            this._tone[i] = (this._tone[i] * (d - 1) + this._toneTarget[i]) / d;
        }
        this._toneDuration--;
    }
  };

  updateFlash(): void {
    if (this._flashDuration > 0) {
        const d = this._flashDuration;
        this._flashColor[3] *= (d - 1) / d;
        this._flashDuration--;
    }
  };

  updateShake(): void {
    if (this._shakeDuration > 0 || this._shake !== 0) {
        const delta =
            (this._shakePower * this._shakeSpeed * this._shakeDirection) / 10;
        if (
            this._shakeDuration <= 1 &&
            this._shake * (this._shake + delta) < 0
        ) {
            this._shake = 0;
        } else {
            this._shake += delta;
        }
        if (this._shake > this._shakePower * 2) {
            this._shakeDirection = -1;
        }
        if (this._shake < -this._shakePower * 2) {
            this._shakeDirection = 1;
        }
        this._shakeDuration--;
    }
  };

  updateZoom(): void {
    if (this._zoomDuration > 0) {
        const d = this._zoomDuration;
        const t = this._zoomScaleTarget;
        this._zoomScale = (this._zoomScale * (d - 1) + t) / d;
        this._zoomDuration--;
    }
  };

  updateWeather(): void {
    if (this._weatherDuration > 0) {
        const d = this._weatherDuration;
        const t = this._weatherPowerTarget;
        this._weatherPower = (this._weatherPower * (d - 1) + t) / d;
        this._weatherDuration--;
        if (this._weatherDuration === 0 && this._weatherPowerTarget === 0) {
            this._weatherType = "none";
        }
    }
  };

  updatePictures(): void {
    for (const picture of this._pictures) {
        if (picture) {
            picture.update();
        }
    }
  };

  startFlashForDamage(): void {
    this.startFlash([255, 0, 0, 128], 8);
  };

  showPicture(
    pictureId: MZ.ID,
    name: string,
    origin: number,
    x: number,
    y: number,
    scaleX: number,
    scaleY: number,
    opacity: number,
    blendMode: number
  ): void {
    const realPictureId = this.realPictureId(pictureId);
    const picture = new Game_Picture();
    picture.show(name, origin, x, y, scaleX, scaleY, opacity, blendMode);
    this._pictures[realPictureId] = picture;
  };

  
  movePicture(
    pictureId: MZ.ID,
    name: string,
    origin: number,
    x: number,
    y: number,
    scaleX: number,
    scaleY: number,
    opacity: number,
    blendMode: number,
    duration: number,
    easingType?: number
  ) {
    const picture = this.picture(pictureId);
    if (picture) {
        picture.move(origin, x, y, scaleX, scaleY, opacity, blendMode,
                    duration, easingType);
    }
  };

  rotatePicture(pictureId: MZ.ID, speed: number): void {
    const picture = this.picture(pictureId);
    if (picture) {
        picture.rotate(speed);
    }
  };

  tintPicture(pictureId: MZ.ID, tone: MZ.RGBAColorArray, duration: number): void {
    const picture = this.picture(pictureId);
    if (picture) {
        picture.tint(tone, duration);
    }
  };

  erasePicture(pictureId: MZ.ID): void {
    const realPictureId = this.realPictureId(pictureId);
    this._pictures[realPictureId] = null;
  };
}
