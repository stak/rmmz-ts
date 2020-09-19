import { BitmapFontLoader } from 'pixi.js';
import { Utils } from '../dom';
import { Bitmap } from '../pixi';

//-----------------------------------------------------------------------------
// ImageManager
//
// The static class that loads images, creates bitmap objects and retains them.

export class ImageManager {
  constructor() {
    throw new Error("This is a static class");
  }

  static iconWidth = 32;
  static iconHeight = 32;
  static faceWidth = 144;
  static faceHeight = 144;

  static _cache: {[key: string]: Bitmap} = {};
  static _system: {[key: string]: Bitmap} = {};
  static _emptyBitmap = new Bitmap(1, 1);

  static loadAnimation(filename: string): Bitmap {
    return this.loadBitmap("img/animations/", filename);
  };

  static loadBattleback1(filename: string): Bitmap {
    return this.loadBitmap("img/battlebacks1/", filename);
  };

  static loadBattleback2(filename: string): Bitmap {
    return this.loadBitmap("img/battlebacks2/", filename);
  };

  static loadEnemy(filename: string): Bitmap {
    return this.loadBitmap("img/enemies/", filename);
  };

  static loadCharacter(filename: string): Bitmap {
    return this.loadBitmap("img/characters/", filename);
  };

  static loadFace(filename: string): Bitmap {
    return this.loadBitmap("img/faces/", filename);
  };

  static loadParallax(filename: string): Bitmap {
    return this.loadBitmap("img/parallaxes/", filename);
  };

  static loadPicture(filename: string): Bitmap {
    return this.loadBitmap("img/pictures/", filename);
  };

  static loadSvActor(filename: string): Bitmap {
    return this.loadBitmap("img/sv_actors/", filename);
  };

  static loadSvEnemy(filename: string): Bitmap {
    return this.loadBitmap("img/sv_enemies/", filename);
  };

  static loadSystem(filename: string): Bitmap {
    return this.loadBitmap("img/system/", filename);
  };

  static loadTileset(filename: string): Bitmap {
    return this.loadBitmap("img/tilesets/", filename);
  };

  static loadTitle1(filename: string): Bitmap {
    return this.loadBitmap("img/titles1/", filename);
  };

  static loadTitle2(filename: string): Bitmap {
    return this.loadBitmap("img/titles2/", filename);
  };

  static loadBitmap(folder: string, filename: string): Bitmap {
    if (filename) {
        const url = folder + Utils.encodeURI(filename) + ".png";
        return this.loadBitmapFromUrl(url);
    } else {
        return this._emptyBitmap;
    }
  };

  static loadBitmapFromUrl(url: string): Bitmap {
    const cache = url.includes("/system/") ? this._system : this._cache;
    if (!cache[url]) {
        cache[url] = Bitmap.load(url);
    }
    return cache[url];
  };

  static clear(): void {
    const cache = this._cache;
    for (const url in cache) {
        cache[url].destroy();
    }
    this._cache = {};
  };

  static isReady(): boolean {
    for (const cache of [this._cache, this._system]) {
        for (const url in cache) {
            const bitmap = cache[url];
            if (bitmap.isError()) {
                this.throwLoadError(bitmap);
            }
            if (!bitmap.isReady()) {
                return false;
            }
        }
    }
    return true;
  };

  static throwLoadError(bitmap: Bitmap): void {
    const retry = bitmap.retry.bind(bitmap);
    throw ["LoadError", bitmap.url, retry];
  };

  static isObjectCharacter(filename: string): boolean {
    const sign = filename.match(/^[!$]+/);
    return !!sign && sign[0].includes("!");
  };

  static isBigCharacter(filename: string): boolean {
    const sign = filename.match(/^[!$]+/);
    return !!sign && sign[0].includes("$");
  };

  static isZeroParallax(filename: string): boolean {
    return filename.charAt(0) === "!";
  };
}
