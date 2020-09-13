import * as PIXI from 'pixi.js';
import { Utils } from './';
import { Video } from './';
import { FPSCounter } from './';

//-----------------------------------------------------------------------------
/**
 * The static class that carries out graphics processing.
 *
 * @namespace
 */
export class Graphics {
  constructor() {
    throw new Error("This is a static class");
  }

  static _width: number
  static _height: number
  static _defaultScale: number
  static _realScale: number
  static _errorPrinter: HTMLDivElement | null;
  static _tickHandler: ((deltaTime: number) => void) | null;
  static _canvas: HTMLCanvasElement | null;
  static _fpsCounter: FPSCounter | null;
  static _loadingSpinner: HTMLDivElement | null;
  static _stretchEnabled: boolean;
  static _app: PIXI.Application | null;
  static _effekseer: any;
  static _wasLoading: boolean;
  static frameCount: number;
  static boxWidth: number;
  static boxHeight: number;

  static FPSCounter = FPSCounter;

  /**
  * Initializes the graphics system.
  *
  * @returns {boolean} True if the graphics system is available.
  */
  static initialize(): boolean {
    this._width = 0;
    this._height = 0;
    this._defaultScale = 1;
    this._realScale = 1;
    this._errorPrinter = null;
    this._tickHandler = null;
    this._canvas = null;
    this._fpsCounter = null;
    this._loadingSpinner = null;
    this._stretchEnabled = this._defaultStretchMode();
    this._app = null;
    this._effekseer = null;
    this._wasLoading = false;

    /**
     * The total frame count of the game screen.
     *
     * @type number
     * @name Graphics.frameCount
     */
    this.frameCount = 0;

    /**
     * The width of the window display area.
     *
     * @type number
     * @name Graphics.boxWidth
     */
    this.boxWidth = this._width;

    /**
     * The height of the window display area.
     *
     * @type number
     * @name Graphics.boxHeight
     */
    this.boxHeight = this._height;

    this._updateRealScale();
    this._createAllElements();
    this._disableContextMenu();
    this._setupEventHandlers();
    this._createPixiApp();
    this._createEffekseerContext();

    return !!this._app;
  };

  /**
  * The PIXI.Application object.
  *
  * @readonly
  * @type PIXI.Application
  * @name Graphics.app
  */
  static get app(): PIXI.Application | null {
    return this._app;
  }

  /**
  * The context object of Effekseer.
  *
  * @readonly
  * @type EffekseerContext
  * @name Graphics.effekseer
  */
  static get effekseer(): any {
    return this._effekseer;
  }

  /**
  * Register a handler for tick events.
  *
  * @param {function} handler - The listener function to be added for updates.
  */
  static setTickHandler(handler: (deltaTime: number) => void): void {
    this._tickHandler = handler;
  };

  /**
  * Starts the game loop.
  */
  static startGameLoop(): void {
    if (this._app) {
        this._app.start();
    }
  };

  /**
  * Stops the game loop.
  */
  static stopGameLoop(): void {
    if (this._app) {
        this._app.stop();
    }
  };

  /**
  * Sets the stage to be rendered.
  *
  * @param {Stage} stage - The stage object to be rendered.
  */
  static setStage(stage: PIXI.Container): void {
    if (this._app) {
        this._app.stage = stage;
    }
  };

  /**
  * Shows the loading spinner.
  */
  static startLoading(): void {
    if (!document.getElementById("loadingSpinner")) {
        document.body.appendChild(this._loadingSpinner!);
    }
  };

  /**
  * Erases the loading spinner.
  *
  * @returns {boolean} True if the loading spinner was active.
  */
  static endLoading(): boolean {
    if (document.getElementById("loadingSpinner")) {
        document.body.removeChild(this._loadingSpinner!);
        return true;
    } else {
        return false;
    }
  };

  /**
  * Displays the error text to the screen.
  *
  * @param {string} name - The name of the error.
  * @param {string} message - The message of the error.
  * @param {Error} [error] - The error object.
  */
  static printError(name: string, message: string, error: Error | null = null): void {
    if (!this._errorPrinter) {
        this._createErrorPrinter();
    }
    this._errorPrinter!.innerHTML = this._makeErrorHtml(name, message/* , error */);
    this._wasLoading = this.endLoading();
    this._applyCanvasFilter();
  };

  /**
  * Displays a button to try to reload resources.
  *
  * @param {function} retry - The callback function to be called when the button
  *                           is pressed.
  */
  static showRetryButton(retry: () => void): void {
    const button = document.createElement("button");
    button.id = "retryButton";
    button.innerHTML = "Retry";
    // [Note] stopPropagation() is required for iOS Safari.
    button.ontouchstart = e => e.stopPropagation();
    button.onclick = () => {
        Graphics.eraseError();
        retry();
    };
    this._errorPrinter!.appendChild(button);
    button.focus();
  };

  /**
  * Erases the loading error text.
  */
  static eraseError(): void {
    if (this._errorPrinter) {
        this._errorPrinter.innerHTML = this._makeErrorHtml();
        if (this._wasLoading) {
            this.startLoading();
        }
    }
    this._clearCanvasFilter();
  };

  /**
  * Converts an x coordinate on the page to the corresponding
  * x coordinate on the canvas area.
  *
  * @param {number} x - The x coordinate on the page to be converted.
  * @returns {number} The x coordinate on the canvas area.
  */
  static pageToCanvasX(x: number): number {
    if (this._canvas) {
        const left = this._canvas.offsetLeft;
        return Math.round((x - left) / this._realScale);
    } else {
        return 0;
    }
  };

  /**
  * Converts a y coordinate on the page to the corresponding
  * y coordinate on the canvas area.
  *
  * @param {number} y - The y coordinate on the page to be converted.
  * @returns {number} The y coordinate on the canvas area.
  */
  static pageToCanvasY(y: number): number {
    if (this._canvas) {
        const top = this._canvas.offsetTop;
        return Math.round((y - top) / this._realScale);
    } else {
        return 0;
    }
  };

  /**
  * Checks whether the specified point is inside the game canvas area.
  *
  * @param {number} x - The x coordinate on the canvas area.
  * @param {number} y - The y coordinate on the canvas area.
  * @returns {boolean} True if the specified point is inside the game canvas area.
  */
  static isInsideCanvas(x: number, y: number): boolean {
    return x >= 0 && x < this._width && y >= 0 && y < this._height;
  };

  /**
  * Shows the game screen.
  */
  static showScreen(): void {
    this._canvas!.style.opacity = '1';
  };

  /**
  * Hides the game screen.
  */
  static hideScreen(): void {
    this._canvas!.style.opacity = '0';
  };

  /**
  * Changes the size of the game screen.
  *
  * @param {number} width - The width of the game screen.
  * @param {number} height - The height of the game screen.
  */
  static resize(width: number, height: number): void {
    this._width = width;
    this._height = height;
    this._updateAllElements();
  };

  /**
  * The width of the game screen.
  *
  * @type number
  * @name Graphics.width
  */
  static get width(): number {
    return this._width;
  }
  static set width(value: number) {
    if (this._width !== value) {
        this._width = value;
        this._updateAllElements();
    }
  }

  /**
  * The height of the game screen.
  *
  * @type number
  * @name Graphics.height
  */
  static get height(): number {
    return this._height;
  }
  static set height(value: number) {
    if (this._height !== value) {
      this._height = value;
      this._updateAllElements();
    }
  }

  /**
  * The default zoom scale of the game screen.
  *
  * @type number
  * @name Graphics.defaultScale
  */
  static get defaultScale(): number {
    return this._defaultScale;
  }
  static set defaultScale(value: number) {
    if (this._defaultScale !== value) {
        this._defaultScale = value;
        this._updateAllElements();
    }
  }

  static _createAllElements(): void {
    this._createErrorPrinter();
    this._createCanvas();
    this._createLoadingSpinner();
    this._createFPSCounter();
  };

  static _updateAllElements(): void {
    this._updateRealScale();
    this._updateErrorPrinter();
    this._updateCanvas();
    this._updateVideo();
  };

  static _onTick(deltaTime: number): void {
    this._fpsCounter!.startTick();
    if (this._tickHandler) {
        this._tickHandler(deltaTime);
    }
    if (this._canRender()) {
        this._app!.render();
    }
    this._fpsCounter!.endTick();
  };

  static _canRender(): boolean {
    return !!this._app!.stage;
  };

  static _updateRealScale(): void {
    if (this._stretchEnabled && this._width > 0 && this._height > 0) {
        const h = this._stretchWidth() / this._width;
        const v = this._stretchHeight() / this._height;
        this._realScale = Math.min(h, v);
        window.scrollTo(0, 0);
    } else {
        this._realScale = this._defaultScale;
    }
  };

  static _stretchWidth(): number {
    if (Utils.isMobileDevice()) {
        return document.documentElement.clientWidth;
    } else {
        return window.innerWidth;
    }
  };

  static _stretchHeight(): number {
    if (Utils.isMobileDevice()) {
        // [Note] Mobile browsers often have special operations at the top and
        //   bottom of the screen.
        const rate = Utils.isLocal() ? 1.0 : 0.9;
        return document.documentElement.clientHeight * rate;
    } else {
        return window.innerHeight;
    }
  };

  static _makeErrorHtml(name: string = '', message: string = '' /*, error*/): string {
    const nameDiv = document.createElement("div");
    const messageDiv = document.createElement("div");
    nameDiv.id = "errorName";
    messageDiv.id = "errorMessage";
    nameDiv.innerHTML = Utils.escapeHtml(name || "");
    messageDiv.innerHTML = Utils.escapeHtml(message || "");
    return nameDiv.outerHTML + messageDiv.outerHTML;
  };

  static _defaultStretchMode(): boolean {
    return Utils.isNwjs() || Utils.isMobileDevice();
  };

  static _createErrorPrinter(): void {
    this._errorPrinter = document.createElement("div");
    this._errorPrinter.id = "errorPrinter";
    this._errorPrinter.innerHTML = this._makeErrorHtml();
    document.body.appendChild(this._errorPrinter);
  };

  static _updateErrorPrinter(): void {
    const width = 640 * this._realScale;
    const height = 100 * this._realScale;
    this._errorPrinter!.style.width = width + "px";
    this._errorPrinter!.style.height = height + "px";
  };

  static _createCanvas(): void {
    this._canvas = document.createElement("canvas");
    this._canvas.id = "gameCanvas";
    this._updateCanvas();
    document.body.appendChild(this._canvas);
  };

  static _updateCanvas(): void {
    this._canvas!.width = this._width;
    this._canvas!.height = this._height;
    this._canvas!.style.zIndex = '1';
    this._centerElement(this._canvas!);
  };

  static _updateVideo(): void {
    const width = this._width * this._realScale;
    const height = this._height * this._realScale;
    Video.resize(width, height);
  };

  static _createLoadingSpinner(): void {
    const loadingSpinner = document.createElement("div");
    const loadingSpinnerImage = document.createElement("div");
    loadingSpinner.id = "loadingSpinner";
    loadingSpinnerImage.id = "loadingSpinnerImage";
    loadingSpinner.appendChild(loadingSpinnerImage);
    this._loadingSpinner = loadingSpinner;
  };

  static _createFPSCounter(): void {
    this._fpsCounter = new Graphics.FPSCounter();
  };

  static _centerElement(element: HTMLCanvasElement): void {
    const width = element.width * this._realScale;
    const height = element.height * this._realScale;
    element.style.position = "absolute";
    element.style.margin = "auto";
    element.style.top = '0';
    element.style.left = '0';
    element.style.right = '0';
    element.style.bottom = '0';
    element.style.width = width + "px";
    element.style.height = height + "px";
  };

  static _disableContextMenu(): void {
    const elements = document.body.getElementsByTagName("*");
    const oncontextmenu = () => false;
    for (const element of elements) {
        (element as HTMLElement).oncontextmenu = oncontextmenu;
    }
  };

  static _applyCanvasFilter(): void {
    if (this._canvas) {
        this._canvas.style.opacity = '0.5';
        this._canvas.style.filter = "blur(8px)";
        this._canvas.style.webkitFilter = "blur(8px)";
    }
  };

  static _clearCanvasFilter(): void {
    if (this._canvas) {
        this._canvas.style.opacity = '1';
        this._canvas.style.filter = "";
        this._canvas.style.webkitFilter = "";
    }
  };

  static _setupEventHandlers(): void {
    window.addEventListener("resize", this._onWindowResize.bind(this));
    document.addEventListener("keydown", this._onKeyDown.bind(this));
  };

  static _onWindowResize(): void {
    this._updateAllElements();
  };

  static _onKeyDown(event: KeyboardEvent) {
    if (!event.ctrlKey && !event.altKey) {
        switch (event.keyCode) {
            case 113: // F2
                event.preventDefault();
                this._switchFPSCounter();
                break;
            case 114: // F3
                event.preventDefault();
                this._switchStretchMode();
                break;
            case 115: // F4
                event.preventDefault();
                this._switchFullScreen();
                break;
        }
    }
  };

  static _switchFPSCounter(): void {
    this._fpsCounter!.switchMode();
  };

  static _switchStretchMode(): void {
    this._stretchEnabled = !this._stretchEnabled;
    this._updateAllElements();
  };

  static _switchFullScreen(): void {
    if (this._isFullScreen()) {
        this._cancelFullScreen();
    } else {
        this._requestFullScreen();
    }
  };

  static _isFullScreen(): boolean {
    return !!(
        document.fullScreenElement ||
        document.mozFullScreen ||
        document.webkitFullscreenElement
    );
  };

  static _requestFullScreen(): void {
    const element = document.body;
    if (element.requestFullScreen) {
        element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen((Element as any).ALLOW_KEYBOARD_INPUT);
    }
  };

  static _cancelFullScreen(): void {
    if (document.cancelFullScreen) {
        document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
  };

  static _createPixiApp(): void {
    try {
        this._setupPixi();
        this._app = new PIXI.Application({
            view: this._canvas!,
            autoStart: false
        });
        this._app.ticker.remove(this._app.render, this._app);
        this._app.ticker.add(this._onTick, this);
    } catch (e) {
        this._app = null;
    }
  };

  static _setupPixi(): void {
    PIXI.utils.skipHello();
    PIXI.settings.GC_MAX_IDLE = 600;
  };

  static _createEffekseerContext(): void {
    if (this._app && window.effekseer) {
        try {
            this._effekseer = window.effekseer.createContext();
            if (this._effekseer) {
                this._effekseer.init(this._app.renderer.gl);
            }
        } catch (e) {
            this._app = null;
        }
    }
  };
}
