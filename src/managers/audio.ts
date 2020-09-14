import { WebAudio, Graphics, Utils } from '../dom';

type AudioParams = {
  name: string
  volume: number
  pitch: number
  pan?: number
  pos?: number
}

//-----------------------------------------------------------------------------
// AudioManager
//
// The static class that handles BGM, BGS, ME and SE.

export class AudioManager {
  constructor() {
    throw new Error("This is a static class");
  }

  static _bgmVolume = 100;
  static _bgsVolume = 100;
  static _meVolume = 100;
  static _seVolume = 100;
  static _currentBgm: AudioParams | null = null;
  static _currentBgs: AudioParams | null = null;
  static _currentMe: AudioParams | null = null;
  static _bgmBuffer = null;
  static _bgsBuffer = null;
  static _meBuffer = null;
  static _seBuffers = [];
  static _staticBuffers = [];
  static _replayFadeTime = 0.5;
  static _path = "audio/";

  static get bgmVolume(): number {
    return this._bgmVolume;
  }
  static set bgmVolume(value: number) {
    this._bgmVolume = value;
    this.updateBgmParameters(this._currentBgm);
  }

  static get bgsVolume(): number {
    return this._bgsVolume;
  }
  static set bgsVolume(value: number) {
    this._bgsVolume = value;
    this.updateBgsParameters(this._currentBgs);
  }

  static get meVolume(): number {
    return this._meVolume;
  }
  static set meVolume(value: number) {
    this._meVolume = value;
    this.updateMeParameters(this._currentMe);
  }

  static get seVolume(): number {
    return this._seVolume;
  }
  static set seVolume(value: number) {
    this._seVolume = value;
  }

  static playBgm(bgm: AudioParams, pos: number): void {
    if (this.isCurrentBgm(bgm)) {
        this.updateBgmParameters(bgm);
    } else {
        this.stopBgm();
        if (bgm.name) {
            this._bgmBuffer = this.createBuffer("bgm/", bgm.name);
            this.updateBgmParameters(bgm);
            if (!this._meBuffer) {
                this._bgmBuffer.play(true, pos || 0);
            }
        }
    }
    this.updateCurrentBgm(bgm, pos);
  };

  static replayBgm(bgm: AudioParams): void {
    if (this.isCurrentBgm(bgm)) {
        this.updateBgmParameters(bgm);
    } else {
        this.playBgm(bgm, bgm.pos);
        if (this._bgmBuffer) {
            this._bgmBuffer.fadeIn(this._replayFadeTime);
        }
    }
  };

  static isCurrentBgm(bgm: AudioParams): boolean {
    return !!(
        this._currentBgm &&
        this._bgmBuffer &&
        this._currentBgm.name === bgm.name
    );
  };

  static updateBgmParameters(bgm: AudioParams): void {
    this.updateBufferParameters(this._bgmBuffer, this._bgmVolume, bgm);
  };

  static updateCurrentBgm(bgm: AudioParams, pos: number): void {
    this._currentBgm = {
        name: bgm.name,
        volume: bgm.volume,
        pitch: bgm.pitch,
        pan: bgm.pan,
        pos: pos
    };
  };

  static stopBgm(): void {
    if (this._bgmBuffer) {
        this._bgmBuffer.destroy();
        this._bgmBuffer = null;
        this._currentBgm = null;
    }
  };

  static fadeOutBgm(duration: number): void {
    if (this._bgmBuffer && this._currentBgm) {
        this._bgmBuffer.fadeOut(duration);
        this._currentBgm = null;
    }
  };

  static fadeInBgm(duration: number): void {
    if (this._bgmBuffer && this._currentBgm) {
        this._bgmBuffer.fadeIn(duration);
    }
  };

  static playBgs(bgs: AudioParams, pos: number): void {
    if (this.isCurrentBgs(bgs)) {
        this.updateBgsParameters(bgs);
    } else {
        this.stopBgs();
        if (bgs.name) {
            this._bgsBuffer = this.createBuffer("bgs/", bgs.name);
            this.updateBgsParameters(bgs);
            this._bgsBuffer.play(true, pos || 0);
        }
    }
    this.updateCurrentBgs(bgs, pos);
  };

  static replayBgs(bgs: AudioParams): void {
    if (this.isCurrentBgs(bgs)) {
        this.updateBgsParameters(bgs);
    } else {
        this.playBgs(bgs, bgs.pos);
        if (this._bgsBuffer) {
            this._bgsBuffer.fadeIn(this._replayFadeTime);
        }
    }
  };

  static isCurrentBgs(bgs: AudioParams): boolean {
    return !!(
        this._currentBgs &&
        this._bgsBuffer &&
        this._currentBgs.name === bgs.name
    );
  };

  static updateBgsParameters(bgs: AudioParams): void {
    this.updateBufferParameters(this._bgsBuffer, this._bgsVolume, bgs);
  };

  static updateCurrentBgs(bgs: AudioParams, pos: number): void {
    this._currentBgs = {
        name: bgs.name,
        volume: bgs.volume,
        pitch: bgs.pitch,
        pan: bgs.pan,
        pos: pos
    };
  };

  static stopBgs(): void {
    if (this._bgsBuffer) {
        this._bgsBuffer.destroy();
        this._bgsBuffer = null;
        this._currentBgs = null;
    }
  };

  static fadeOutBgs(duration: number): void {
    if (this._bgsBuffer && this._currentBgs) {
        this._bgsBuffer.fadeOut(duration);
        this._currentBgs = null;
    }
  };

  static fadeInBgs(duration: number): void {
    if (this._bgsBuffer && this._currentBgs) {
        this._bgsBuffer.fadeIn(duration);
    }
  };

  static playMe(me: AudioParams): void {
    this.stopMe();
    if (me.name) {
        if (this._bgmBuffer && this._currentBgm) {
            this._currentBgm.pos = this._bgmBuffer.seek();
            this._bgmBuffer.stop();
        }
        this._meBuffer = this.createBuffer("me/", me.name);
        this.updateMeParameters(me);
        this._meBuffer.play(false);
        this._meBuffer.addStopListener(this.stopMe.bind(this));
    }
  };

  static updateMeParameters(me: AudioParams): void {
    this.updateBufferParameters(this._meBuffer, this._meVolume, me);
  };

  static fadeOutMe(duration: number): void {
    if (this._meBuffer) {
        this._meBuffer.fadeOut(duration);
    }
  };

  static stopMe(): void {
    if (this._meBuffer) {
        this._meBuffer.destroy();
        this._meBuffer = null;
        if (
            this._bgmBuffer &&
            this._currentBgm &&
            !this._bgmBuffer.isPlaying()
        ) {
            this._bgmBuffer.play(true, this._currentBgm.pos);
            this._bgmBuffer.fadeIn(this._replayFadeTime);
        }
    }
  };

  static playSe(se: AudioParams): void {
    if (se.name) {
        // [Note] Do not play the same sound in the same frame.
        const latestBuffers = this._seBuffers.filter(
            buffer => buffer.frameCount === Graphics.frameCount
        );
        if (latestBuffers.find(buffer => buffer.name === se.name)) {
            return;
        }
        const buffer = this.createBuffer("se/", se.name);
        this.updateSeParameters(buffer, se);
        buffer.play(false);
        this._seBuffers.push(buffer);
        this.cleanupSe();
    }
  };

  static updateSeParameters(buffer: WebAudio, se: AudioParams): void {
    this.updateBufferParameters(buffer, this._seVolume, se);
  };

  static cleanupSe(): void {
    for (const buffer of this._seBuffers) {
        if (!buffer.isPlaying()) {
            buffer.destroy();
        }
    }
    this._seBuffers = this._seBuffers.filter(buffer => buffer.isPlaying());
  };

  static stopSe(): void {
    for (const buffer of this._seBuffers) {
        buffer.destroy();
    }
    this._seBuffers = [];
  };

  static playStaticSe(se: AudioParams): void {
    if (se.name) {
        this.loadStaticSe(se);
        for (const buffer of this._staticBuffers) {
            if (buffer.name === se.name) {
                buffer.stop();
                this.updateSeParameters(buffer, se);
                buffer.play(false);
                break;
            }
        }
    }
  };

  static loadStaticSe(se: AudioParams): void {
    if (se.name && !this.isStaticSe(se)) {
        const buffer = this.createBuffer("se/", se.name);
        this._staticBuffers.push(buffer);
    }
  };

  static isStaticSe(se: AudioParams): boolean {
    for (const buffer of this._staticBuffers) {
        if (buffer.name === se.name) {
            return true;
        }
    }
    return false;
  };

  static stopAll(): void {
    this.stopMe();
    this.stopBgm();
    this.stopBgs();
    this.stopSe();
  };

  static saveBgm(): AudioParams {
    if (this._currentBgm) {
        const bgm = this._currentBgm;
        return {
            name: bgm.name,
            volume: bgm.volume,
            pitch: bgm.pitch,
            pan: bgm.pan,
            pos: this._bgmBuffer ? this._bgmBuffer.seek() : 0
        };
    } else {
        return this.makeEmptyAudioObject();
    }
  };

  static saveBgs(): AudioParams {
    if (this._currentBgs) {
        const bgs = this._currentBgs;
        return {
            name: bgs.name,
            volume: bgs.volume,
            pitch: bgs.pitch,
            pan: bgs.pan,
            pos: this._bgsBuffer ? this._bgsBuffer.seek() : 0
        };
    } else {
        return this.makeEmptyAudioObject();
    }
  };

  static makeEmptyAudioObject(): AudioParams {
    return { name: "", volume: 0, pitch: 0 };
  };

  static createBuffer(folder: string, name: string): WebAudio {
    const ext = this.audioFileExt();
    const url = this._path + folder + Utils.encodeURI(name) + ext;
    const buffer = new WebAudio(url);
    buffer.name = name;
    buffer.frameCount = Graphics.frameCount;
    return buffer;
  };

  static updateBufferParameters(buffer: WebAudio, configVolume, audio): void {
    if (buffer && audio) {
        buffer.volume = (configVolume * (audio.volume || 0)) / 10000;
        buffer.pitch = (audio.pitch || 0) / 100;
        buffer.pan = (audio.pan || 0) / 100;
    }
  };

  static audioFileExt(): string {
    return ".ogg";
  };

  static checkErrors(): void {
    const buffers = [this._bgmBuffer, this._bgsBuffer, this._meBuffer];
    buffers.push(...this._seBuffers);
    buffers.push(...this._staticBuffers);
    for (const buffer of buffers) {
        if (buffer && buffer.isError()) {
            this.throwLoadError(buffer);
        }
    }
  };

  static throwLoadError(webAudio: WebAudio): void {
    const retry = webAudio.retry.bind(webAudio);
    throw ["LoadError", webAudio.url, retry];
  };
}