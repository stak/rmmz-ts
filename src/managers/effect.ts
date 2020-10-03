import { Graphics, Utils } from '../dom';

//-----------------------------------------------------------------------------
// EffectManager
//
// The static class that loads Effekseer effects.

export class EffectManager {
  constructor() {
    throw new Error("This is a static class");
  }

  // TODO: typing effekseer
  static _cache: {[key: string]: any} = {};
  static _errorUrls: Array<string> = [];

  static load(filename: string): any {
    if (filename) {
        const url = this.makeUrl(filename);
        const cache = this._cache;
        if (!cache[url] && Graphics.effekseer) {
            this.startLoading(url);
        }
        return cache[url];
    } else {
        return null;
    }
  };

  static startLoading(url: string): void {
    const onLoad = () => this.onLoad(url);
    const onError = () => this.onError(url);
    const effect = Graphics.effekseer.loadEffect(url, 1, onLoad, onError);
    this._cache[url] = effect;
    return effect;
  };

  static clear(): void {
    for (const url in this._cache) {
        const effect = this._cache[url];
        Graphics.effekseer.releaseEffect(effect);
    }
    this._cache = {};
  };

  static onLoad(url: string): void {
    //
  };

  static onError(url: string): void {
    this._errorUrls.push(url);
  };

  static makeUrl(filename: string): string {
    return "effects/" + Utils.encodeURI(filename) + ".efkefc";
  };

  static checkErrors(): void {
    const url = this._errorUrls.shift();
    if (url) {
        this.throwLoadError(url);
    }
  };

  static throwLoadError(url: string): void {
    const retry = () => this.startLoading(url);
    throw ["LoadError", url, retry];
  };

  static isReady(): boolean {
    this.checkErrors();
    for (const url in this._cache) {
        const effect = this._cache[url];
        if (!effect.isLoaded) {
            return false;
        }
    }
    return true;
  };
}