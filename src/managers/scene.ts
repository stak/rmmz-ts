import { Input, TouchInput, WebAudio, Video, Graphics, Utils } from '../dom';
import { Bitmap } from '../pixi';
import { Scene_Base } from '../scenes';
import { ImageManager } from '.';
import { EffectManager } from '.';
import { AudioManager } from '.';
import { PluginManager } from '.';

export type LoadError = ["LoadError", string, () => void]

type _PromiseRejectionEvent = PromiseRejectionEvent & {
  message: string
  lineno: undefined
  filename: undefined
}

//-----------------------------------------------------------------------------
// SceneManager
//
// The static class that manages scene transitions.

export class SceneManager {
  constructor() {
    throw new Error("This is a static class");
  }

  static _scene: Scene_Base | null = null;
  static _nextScene: Scene_Base | null = null;
  static _stack: Array<Function> = [];
  static _exiting = false;
  static _previousScene: Scene_Base | null = null;
  static _previousClass: Function | null = null;
  static _backgroundBitmap: Bitmap | null = null;
  static _smoothDeltaTime = 1;
  static _elapsedTime = 0;

  static run(sceneClass: Scene_Base): void {
    try {
        this.initialize();
        this.goto(sceneClass);
        Graphics.startGameLoop();
    } catch (e) {
        this.catchException(e);
    }
  };

  static initialize(): void {
    this.checkBrowser();
    this.checkPluginErrors();
    this.initGraphics();
    this.initAudio();
    this.initVideo();
    this.initInput();
    this.setupEventHandlers();
  };

  static checkBrowser(): void {
    if (!Utils.canUseWebGL()) {
        throw new Error("Your browser does not support WebGL.");
    }
    if (!Utils.canUseWebAudioAPI()) {
        throw new Error("Your browser does not support Web Audio API.");
    }
    if (!Utils.canUseCssFontLoading()) {
        throw new Error("Your browser does not support CSS Font Loading.");
    }
    if (!Utils.canUseIndexedDB()) {
        throw new Error("Your browser does not support IndexedDB.");
    }
  };

  static checkPluginErrors(): void {
    PluginManager.checkErrors();
  };

  static initGraphics(): void {
    if (!Graphics.initialize()) {
        throw new Error("Failed to initialize graphics.");
    }
    Graphics.setTickHandler(this.update.bind(this));
  };

  static initAudio(): void {
    WebAudio.initialize();
  };

  static initVideo(): void {
    Video.initialize(Graphics.width, Graphics.height);
  };

  static initInput(): void {
    Input.initialize();
    TouchInput.initialize();
  };

  static setupEventHandlers(): void {
    window.addEventListener("error", this.onError.bind(this));
    window.addEventListener("unhandledrejection", this.onReject.bind(this) as (this: Window, ev: PromiseRejectionEvent) => any);
    window.addEventListener("unload", this.onUnload.bind(this));
    document.addEventListener("keydown", this.onKeyDown.bind(this));
  };

  static update(deltaTime: number): void {
    try {
        const n = this.determineRepeatNumber(deltaTime);
        for (let i = 0; i < n; i++) {
            this.updateMain();
        }
    } catch (e) {
        this.catchException(e);
    }
  };

  static determineRepeatNumber(deltaTime: number): number {
    // [Note] We consider environments where the refresh rate is higher than
    //   60Hz, but ignore sudden irregular deltaTime.
    this._smoothDeltaTime *= 0.8;
    this._smoothDeltaTime += Math.min(deltaTime, 2) * 0.2;
    if (this._smoothDeltaTime >= 0.9) {
        this._elapsedTime = 0;
        return Math.round(this._smoothDeltaTime);
    } else {
        this._elapsedTime += deltaTime;
        if (this._elapsedTime >= 1) {
            this._elapsedTime -= 1;
            return 1;
        }
        return 0;
    }
  };

  static terminate(): void {
    window.close();
  };

  static onError(event: ErrorEvent | _PromiseRejectionEvent): void {
    console.error(event.message);
    console.error(event.filename, event.lineno);
    try {
        this.stop();
        Graphics.printError("Error", event.message, event);
        AudioManager.stopAll();
    } catch (e) {
        //
    }
  };

  static onReject(event: _PromiseRejectionEvent): void {
    // Catch uncaught exception in Promise
    event.message = event.reason;
    this.onError(event);
  };

  static onUnload(): void {
    ImageManager.clear();
    EffectManager.clear();
    AudioManager.stopAll();
  };

  static onKeyDown(event: KeyboardEvent): void {
    if (!event.ctrlKey && !event.altKey) {
        switch (event.keyCode) {
            case 116: // F5
                this.reloadGame();
                break;
            case 119: // F8
                this.showDevTools();
                break;
        }
    }
  };

  static reloadGame(): void {
    if (Utils.isNwjs()) {
        window.chrome.runtime.reload();
    }
  };

  static showDevTools(): void {
    if (Utils.isNwjs() && Utils.isOptionValid("test")) {
        nw.Window.get().showDevTools();
    }
  };

  static catchException(e: Error | LoadError): void {
    if (e instanceof Error) {
        this.catchNormalError(e);
    } else if (e instanceof Array && e[0] === "LoadError") {
        this.catchLoadError(e);
    } else {
        this.catchUnknownError(e);
    }
    this.stop();
  };

  static catchNormalError(e: Error): void {
    Graphics.printError(e.name, e.message, e);
    AudioManager.stopAll();
    console.error(e.stack);
  };

  static catchLoadError(e: LoadError): void {
    const url = e[1];
    const retry = e[2];
    Graphics.printError("Failed to load", url);
    if (retry) {
        Graphics.showRetryButton(() => {
            retry();
            SceneManager.resume();
        });
    } else {
        AudioManager.stopAll();
    }
  };

  static catchUnknownError(e: any): void {
    Graphics.printError("UnknownError", String(e));
    AudioManager.stopAll();
  };

  static updateMain(): void {
    this.updateFrameCount();
    this.updateInputData();
    this.updateEffekseer();
    this.changeScene();
    this.updateScene();
  };

  static updateFrameCount(): void {
    Graphics.frameCount++;
  };

  static updateInputData(): void {
    Input.update();
    TouchInput.update();
  };

  static updateEffekseer(): void {
    if (Graphics.effekseer) {
        Graphics.effekseer.update();
    }
  };

  static changeScene(): void {
    if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
        if (this._scene) {
            this._scene.terminate();
            this.onSceneTerminate();
        }
        this._scene = this._nextScene;
        this._nextScene = null;
        if (this._scene) {
            this._scene.create();
            this.onSceneCreate();
        }
        if (this._exiting) {
            this.terminate();
        }
    }
  };

  static updateScene(): void {
    if (this._scene) {
        if (this._scene.isStarted()) {
            if (this.isGameActive()) {
                this._scene.update();
            }
        } else if (this._scene.isReady()) {
            this.onBeforeSceneStart();
            this._scene.start();
            this.onSceneStart();
        }
    }
  };

  static isGameActive(): boolean {
    // [Note] We use "window.top" to support an iframe.
    try {
        return window.top.document.hasFocus();
    } catch (e) {
        // SecurityError
        return true;
    }
  };

  static onSceneTerminate(): void {
    this._previousScene = this._scene;
    this._previousClass = this._scene.constructor;
    Graphics.setStage(null);
  };

  static onSceneCreate(): void {
    Graphics.startLoading();
  };

  static onBeforeSceneStart(): void {
    if (this._previousScene) {
        this._previousScene.destroy();
        this._previousScene = null;
    }
    if (Graphics.effekseer) {
        Graphics.effekseer.stopAll();
    }
  };

  static onSceneStart(): void {
    Graphics.endLoading();
    Graphics.setStage(this._scene);
  };

  static isSceneChanging(): boolean {
    return this._exiting || !!this._nextScene;
  };

  static isCurrentSceneBusy(): boolean {
    return this._scene && this._scene.isBusy();
  };

  static isNextScene(sceneClass: Scene_Base): boolean {
    return this._nextScene && this._nextScene.constructor === sceneClass;
  };

  static isPreviousScene(sceneClass: Scene_Base): boolean {
    return this._previousClass === sceneClass;
  };

  static goto(sceneClass: Scene_Base): void {
    if (sceneClass) {
        this._nextScene = new sceneClass();
    }
    if (this._scene) {
        this._scene.stop();
    }
  };

  static push(sceneClass: Scene_Base): void {
    this._stack.push(this._scene.constructor);
    this.goto(sceneClass);
  };

  static pop(): void {
    if (this._stack.length > 0) {
        this.goto(this._stack.pop());
    } else {
        this.exit();
    }
  };

  static exit(): void {
    this.goto(null);
    this._exiting = true;
  };

  static clearStack(): void {
    this._stack = [];
  };

  static stop(): void {
    Graphics.stopGameLoop();
  };

  static prepareNextScene(): void {
    this._nextScene.prepare(...arguments);
  };

  static snap(): Bitmap {
    return Bitmap.snap(this._scene);
  };

  static snapForBackground(): void {
    if (this._backgroundBitmap) {
        this._backgroundBitmap.destroy();
    }
    this._backgroundBitmap = this.snap();
  };

  static backgroundBitmap(): Bitmap {
    return this._backgroundBitmap;
  };

  static resume(): void {
    TouchInput.update();
    Graphics.startGameLoop();
  };
}
