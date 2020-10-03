import { Utils } from '../dom';
import { MZ } from '../MZ';

//-----------------------------------------------------------------------------
// FontManager
//
// The static class that loads font files.

export class FontManager {
  constructor() {
    throw new Error("This is a static class");
  }

  static _urls: {[key: string]: string} = {};
  static _states: {[key: string]: MZ.LoadingState} = {};

  static load(family: string, filename: string): void {
    if (this._states[family] !== "loaded") {
        if (filename) {
            const url = this.makeUrl(filename);
            this.startLoading(family, url);
        } else {
            this._urls[family] = "";
            this._states[family] = "loaded";
        }
    }
  };

  static isReady(): boolean {
    for (const family in this._states) {
        const state = this._states[family];
        if (state === "loading") {
            return false;
        }
        if (state === "error") {
            this.throwLoadError(family);
        }
    }
    return true;
  };

  static startLoading(family: string, url: string): void {
    const source = "url(" + url + ")";
    const font = new FontFace(family, source);
    this._urls[family] = url;
    this._states[family] = "loading";
    font.load()
        .then(() => {
            document.fonts.add(font);
            this._states[family] = "loaded";
            return 0;
        })
        .catch(() => {
            this._states[family] = "error";
        });
  };

  static throwLoadError(family: string): void {
    const url = this._urls[family];
    const retry = () => this.startLoading(family, url);
    throw ["LoadError", url, retry];
  };

  static makeUrl(filename: string): string {
    return "fonts/" + Utils.encodeURI(filename);
  };
}
