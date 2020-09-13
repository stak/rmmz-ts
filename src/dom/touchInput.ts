import { Graphics } from './';

type TouchInputState = {
  triggered: boolean
  cancelled: boolean
  moved: boolean
  hovered: boolean
  released: boolean
  wheelX: number
  wheelY: number
};

//-----------------------------------------------------------------------------
/**
 * The static class that handles input data from the mouse and touchscreen.
 *
 * @namespace
 */
export class TouchInput {
  constructor() {
    throw new Error("This is a static class");
  }

  /**
  * Initializes the touch system.
  */
  static initialize(): void {
    this.clear();
    this._setupEventHandlers();
  };

  /**
  * The wait time of the pseudo key repeat in frames.
  *
  * @type number
  */
  static keyRepeatWait = 24;

  /**
  * The interval of the pseudo key repeat in frames.
  *
  * @type number
  */
  static keyRepeatInterval = 6;

  /**
  * The threshold number of pixels to treat as moved.
  *
  * @type number
  */
  static moveThreshold = 10;

  static _mousePressed: boolean
  static _screenPressed: boolean
  static _pressedTime: number
  static _clicked: boolean
  static _newState: TouchInputState
  static _currentState: TouchInputState
  static _x: number
  static _y: number
  static _triggerX: number
  static _triggerY: number
  static _moved: boolean
  static _date: number

  /**
  * Clears all the touch data.
  */
  static clear(): void {
    this._mousePressed = false;
    this._screenPressed = false;
    this._pressedTime = 0;
    this._clicked = false;
    this._newState = this._createNewState();
    this._currentState = this._createNewState();
    this._x = 0;
    this._y = 0;
    this._triggerX = 0;
    this._triggerY = 0;
    this._moved = false;
    this._date = 0;
  };

  /**
  * Updates the touch data.
  */
  static update(): void {
    this._currentState = this._newState;
    this._newState = this._createNewState();
    this._clicked = this._currentState.released && !this._moved;
    if (this.isPressed()) {
        this._pressedTime++;
    }
  };

  /**
  * Checks whether the mouse button or touchscreen has been pressed and
  * released at the same position.
  *
  * @returns {boolean} True if the mouse button or touchscreen is clicked.
  */
  static isClicked(): boolean {
    return this._clicked;
  };

  /**
  * Checks whether the mouse button or touchscreen is currently pressed down.
  *
  * @returns {boolean} True if the mouse button or touchscreen is pressed.
  */
  static isPressed(): boolean {
    return this._mousePressed || this._screenPressed;
  };

  /**
  * Checks whether the left mouse button or touchscreen is just pressed.
  *
  * @returns {boolean} True if the mouse button or touchscreen is triggered.
  */
  static isTriggered(): boolean {
    return this._currentState.triggered;
  };

  /**
  * Checks whether the left mouse button or touchscreen is just pressed
  * or a pseudo key repeat occurred.
  *
  * @returns {boolean} True if the mouse button or touchscreen is repeated.
  */
  static isRepeated(): boolean {
    return (
        this.isPressed() &&
        (this._currentState.triggered ||
            (this._pressedTime >= this.keyRepeatWait &&
                this._pressedTime % this.keyRepeatInterval === 0))
    );
  };

  /**
  * Checks whether the left mouse button or touchscreen is kept depressed.
  *
  * @returns {boolean} True if the left mouse button or touchscreen is long-pressed.
  */
  static isLongPressed(): boolean {
    return this.isPressed() && this._pressedTime >= this.keyRepeatWait;
  };

  /**
  * Checks whether the right mouse button is just pressed.
  *
  * @returns {boolean} True if the right mouse button is just pressed.
  */
  static isCancelled(): boolean {
    return this._currentState.cancelled;
  };

  /**
  * Checks whether the mouse or a finger on the touchscreen is moved.
  *
  * @returns {boolean} True if the mouse or a finger on the touchscreen is moved.
  */
  static isMoved(): boolean {
    return this._currentState.moved;
  };

  /**
  * Checks whether the mouse is moved without pressing a button.
  *
  * @returns {boolean} True if the mouse is hovered.
  */
  static isHovered(): boolean {
    return this._currentState.hovered;
  };

  /**
  * Checks whether the left mouse button or touchscreen is released.
  *
  * @returns {boolean} True if the mouse button or touchscreen is released.
  */
  static isReleased(): boolean {
    return this._currentState.released;
  };

  /**
  * The horizontal scroll amount.
  *
  * @readonly
  * @type number
  * @name TouchInput.wheelX
  */
  static get wheelX(): number {
    return this._currentState.wheelX;
  }

  /**
  * The vertical scroll amount.
  *
  * @readonly
  * @type number
  * @name TouchInput.wheelY
  */
  static get wheelY(): number {
    return this._currentState.wheelY;
  }

  /**
  * The x coordinate on the canvas area of the latest touch event.
  *
  * @readonly
  * @type number
  * @name TouchInput.x
  */
  static get x(): number {
    return this._x;
  }

  /**
  * The y coordinate on the canvas area of the latest touch event.
  *
  * @readonly
  * @type number
  * @name TouchInput.y
  */
  static get y(): number {
    return this._y;
  }

  /**
  * The time of the last input in milliseconds.
  *
  * @readonly
  * @type number
  * @name TouchInput.date
  */
  static get date(): number {
    return this._date;
  }

  static _createNewState(): TouchInputState {
    return {
        triggered: false,
        cancelled: false,
        moved: false,
        hovered: false,
        released: false,
        wheelX: 0,
        wheelY: 0
    };
  };

  static _setupEventHandlers(): void {
    const pf = { passive: false };
    document.addEventListener("mousedown", this._onMouseDown.bind(this));
    document.addEventListener("mousemove", this._onMouseMove.bind(this));
    document.addEventListener("mouseup", this._onMouseUp.bind(this));
    document.addEventListener("wheel", this._onWheel.bind(this), pf);
    document.addEventListener("touchstart", this._onTouchStart.bind(this), pf);
    document.addEventListener("touchmove", this._onTouchMove.bind(this), pf);
    document.addEventListener("touchend", this._onTouchEnd.bind(this));
    document.addEventListener("touchcancel", this._onTouchCancel.bind(this));
    window.addEventListener("blur", this._onLostFocus.bind(this));
  };

  static _onMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
        this._onLeftButtonDown(event);
    } else if (event.button === 1) {
        this._onMiddleButtonDown(event);
    } else if (event.button === 2) {
        this._onRightButtonDown(event);
    }
  };

  static _onLeftButtonDown(event: MouseEvent): void {
    const x = Graphics.pageToCanvasX(event.pageX);
    const y = Graphics.pageToCanvasY(event.pageY);
    if (Graphics.isInsideCanvas(x, y)) {
        this._mousePressed = true;
        this._pressedTime = 0;
        this._onTrigger(x, y);
    }
  };

  static _onMiddleButtonDown(event: MouseEvent): void {
    //
  };

  static _onRightButtonDown(event: MouseEvent): void {
    const x = Graphics.pageToCanvasX(event.pageX);
    const y = Graphics.pageToCanvasY(event.pageY);
    if (Graphics.isInsideCanvas(x, y)) {
        this._onCancel(x, y);
    }
  };

  static _onMouseMove(event: MouseEvent): void {
    const x = Graphics.pageToCanvasX(event.pageX);
    const y = Graphics.pageToCanvasY(event.pageY);
    if (this._mousePressed) {
        this._onMove(x, y);
    } else if (Graphics.isInsideCanvas(x, y)) {
        this._onHover(x, y);
    }
  };

  static _onMouseUp(event: MouseEvent): void {
    if (event.button === 0) {
        const x = Graphics.pageToCanvasX(event.pageX);
        const y = Graphics.pageToCanvasY(event.pageY);
        this._mousePressed = false;
        this._onRelease(x, y);
    }
  };

  static _onWheel(event: WheelEvent): void {
    this._newState.wheelX += event.deltaX;
    this._newState.wheelY += event.deltaY;
    event.preventDefault();
  };

  static _onTouchStart(event: TouchEvent): void {
    for (const touch of event.changedTouches) {
        const x = Graphics.pageToCanvasX(touch.pageX);
        const y = Graphics.pageToCanvasY(touch.pageY);
        if (Graphics.isInsideCanvas(x, y)) {
            this._screenPressed = true;
            this._pressedTime = 0;
            if (event.touches.length >= 2) {
                this._onCancel(x, y);
            } else {
                this._onTrigger(x, y);
            }
            event.preventDefault();
        }
    }
    if (window.cordova || window.navigator.standalone) {
        event.preventDefault();
    }
  };

  static _onTouchMove(event: TouchEvent): void {
    for (const touch of event.changedTouches) {
        const x = Graphics.pageToCanvasX(touch.pageX);
        const y = Graphics.pageToCanvasY(touch.pageY);
        this._onMove(x, y);
    }
  };

  static _onTouchEnd(event: TouchEvent): void {
    for (const touch of event.changedTouches) {
        const x = Graphics.pageToCanvasX(touch.pageX);
        const y = Graphics.pageToCanvasY(touch.pageY);
        this._screenPressed = false;
        this._onRelease(x, y);
    }
  };

  static _onTouchCancel(event: TouchEvent): void {
    this._screenPressed = false;
  };

  static _onLostFocus(): void {
    this.clear();
  };

  static _onTrigger(x: number, y: number): void {
    this._newState.triggered = true;
    this._x = x;
    this._y = y;
    this._triggerX = x;
    this._triggerY = y;
    this._moved = false;
    this._date = Date.now();
  };

  static _onCancel(x: number, y: number): void {
    this._newState.cancelled = true;
    this._x = x;
    this._y = y;
  };

  static _onMove(x: number, y: number): void {
    const dx = Math.abs(x - this._triggerX);
    const dy = Math.abs(y - this._triggerY);
    if (dx > this.moveThreshold || dy > this.moveThreshold) {
        this._moved = true;
    }
    if (this._moved) {
        this._newState.moved = true;
        this._x = x;
        this._y = y;
    }
  };

  static _onHover(x: number, y: number): void {
    this._newState.hovered = true;
    this._x = x;
    this._y = y;
  };

  static _onRelease(x: number, y: number): void {
    this._newState.released = true;
    this._x = x;
    this._y = y;
  };
}
