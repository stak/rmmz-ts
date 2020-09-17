import { AudioManager } from './';
import { StorageManager } from './';

type Config = {
  alwaysDash: boolean
  commandRemember: boolean
  touchUI: boolean
  bgmVolume: number
  bgsVolume: number
  meVolume: number
  seVolume: number
}

//-----------------------------------------------------------------------------
// ConfigManager
//
// The static class that manages the configuration data.

export class ConfigManager {
  constructor() {
    throw new Error("This is a static class");
  }

  static alwaysDash = false;
  static commandRemember = false;
  static touchUI = true;
  static _isLoaded = false;

  static get bgmVolume(): number {
    return AudioManager._bgmVolume;
  }
  static set bgmVolume(value: number) {
    AudioManager.bgmVolume = value;
  }

  static get bgsVolume(): number {
    return AudioManager.bgsVolume;
  }
  static set bgsVolume(value: number) {
    AudioManager.bgsVolume = value;
  }

  static get meVolume(): number {
    return AudioManager.meVolume;
  }
  static set meVolume(value: number) {
    AudioManager.meVolume = value;
  }

  static get seVolume(): number {
    return AudioManager.seVolume;
  }
  static set seVolume(value: number) {
    AudioManager.seVolume = value;
  }

  static load(): void {
    StorageManager.loadObject("config")
        .then((config: Config) => this.applyData(config || {}))
        .catch(() => 0)
        .then(() => {
            this._isLoaded = true;
            return 0;
        })
        .catch(() => 0);
  };

  static save(): void {
    StorageManager.saveObject("config", this.makeData());
  };

  static isLoaded(): boolean {
    return this._isLoaded;
  };

  static makeData(): Config {
    const config: Config = {
      alwaysDash: this.alwaysDash,
      commandRemember: this.commandRemember,
      touchUI: this.touchUI,
      bgmVolume: this.bgmVolume,
      bgsVolume: this.bgsVolume,
      meVolume: this.meVolume,
      seVolume: this.seVolume,
    }
    return config;
  };

  static applyData(config: Config): void {
    this.alwaysDash = this.readFlag(config, "alwaysDash", false);
    this.commandRemember = this.readFlag(config, "commandRemember", false);
    this.touchUI = this.readFlag(config, "touchUI", true);
    this.bgmVolume = this.readVolume(config, "bgmVolume");
    this.bgsVolume = this.readVolume(config, "bgsVolume");
    this.meVolume = this.readVolume(config, "meVolume");
    this.seVolume = this.readVolume(config, "seVolume");
  };

  static readFlag(config: Config, name: string, defaultValue: boolean): boolean {
    if (name in config) {
        return !!(config as any)[name];
    } else {
        return defaultValue;
    }
  };

  static readVolume(config: Config, name: string): number {
    if (name in config) {
        return Number((config as any)[name]).clamp(0, 100);
    } else {
        return 100;
    }
  }
}