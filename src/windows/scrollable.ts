import { Window_Base } from '.';
import { Rectangle, Point } from '../pixi';
import { Input, TouchInput } from '../dom';

//-----------------------------------------------------------------------------
// Window_Scrollable
//
// The window class with scroll functions.

export class Window_Scrollable extends Window_Base {
  _scrollX = 0
  _scrollY = 0
  _scrollBaseX = 0
  _scrollBaseY = 0
  _scrollTargetX = 0
  _scrollTargetY = 0
  _scrollDuration = 0
  _scrollAccelX = 0
  _scrollAccelY = 0
  _scrollTouching = false
  _scrollLastTouchX = 0
  _scrollLastTouchY = 0
  _scrollLastCursorVisible = false

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_Scrollable>)
  constructor(arg?: any) {
    super(Window_Base);
    if (typeof arg === "function" && arg === Window_Scrollable) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._scrollX = 0;
    this._scrollY = 0;
    this._scrollBaseX = 0;
    this._scrollBaseY = 0;
    this.clearScrollStatus();
  };

  clearScrollStatus(): void {
    this._scrollTargetX = 0;
    this._scrollTargetY = 0;
    this._scrollDuration = 0;
    this._scrollAccelX = 0;
    this._scrollAccelY = 0;
    this._scrollTouching = false;
    this._scrollLastTouchX = 0;
    this._scrollLastTouchY = 0;
    this._scrollLastCursorVisible = false;
  };

  scrollX(): number {
    return this._scrollX;
  };

  scrollY(): number {
    return this._scrollY;
  };

  scrollBaseX(): number {
    return this._scrollBaseX;
  };

  scrollBaseY(): number {
    return this._scrollBaseY;
  };

  scrollTo(x: number, y: number): void {
    const scrollX = x.clamp(0, this.maxScrollX());
    const scrollY = y.clamp(0, this.maxScrollY());
    if (this._scrollX !== scrollX || this._scrollY !== scrollY) {
        this._scrollX = scrollX;
        this._scrollY = scrollY;
        this.updateOrigin();
    }
  };

  scrollBy(x: number, y: number): void {
    this.scrollTo(this._scrollX + x, this._scrollY + y);
  };

  smoothScrollTo(x: number, y: number): void {
    this._scrollTargetX = x.clamp(0, this.maxScrollX());
    this._scrollTargetY = y.clamp(0, this.maxScrollY());
    this._scrollDuration = Input.keyRepeatInterval;
  };

  smoothScrollBy(x: number, y: number): void {
    if (this._scrollDuration === 0) {
        this._scrollTargetX = this.scrollX();
        this._scrollTargetY = this.scrollY();
    }
    this.smoothScrollTo(this._scrollTargetX + x, this._scrollTargetY + y);
  };

  setScrollAccel(x: number, y: number): void {
    this._scrollAccelX = x;
    this._scrollAccelY = y;
  };

  overallWidth(): number {
    return this.innerWidth;
  };

  overallHeight(): number {
    return this.innerHeight;
  };

  maxScrollX(): number {
    return Math.max(0, this.overallWidth() - this.innerWidth);
  };

  maxScrollY(): number {
    return Math.max(0, this.overallHeight() - this.innerHeight);
  };

  scrollBlockWidth(): number {
    return this.itemWidth();
  };

  scrollBlockHeight(): number {
    return this.itemHeight();
  };

  smoothScrollDown(n: number): void {
    this.smoothScrollBy(0, this.itemHeight() * n);
  };

  smoothScrollUp(n: number): void {
    this.smoothScrollBy(0, -this.itemHeight() * n);
  };

  update(): void {
    super.update();
    this.processWheelScroll();
    this.processTouchScroll();
    this.updateSmoothScroll();
    this.updateScrollAccel();
    this.updateArrows();
    this.updateOrigin();
  };

  processWheelScroll(): void {
    if (this.isWheelScrollEnabled() && this.isTouchedInsideFrame()) {
        const threshold = 20;
        if (TouchInput.wheelY >= threshold) {
            this.smoothScrollDown(1);
        }
        if (TouchInput.wheelY <= -threshold) {
            this.smoothScrollUp(1);
        }
    }
  };

  processTouchScroll(): void {
    if (this.isTouchScrollEnabled()) {
        if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
            this.onTouchScrollStart();
        }
        if (this._scrollTouching) {
            if (TouchInput.isReleased()) {
                this.onTouchScrollEnd();
            } else if (TouchInput.isMoved()) {
                this.onTouchScroll();
            }
        }
    }
  };

  isWheelScrollEnabled(): boolean {
    return this.isScrollEnabled();
  };

  isTouchScrollEnabled(): boolean {
    return this.isScrollEnabled();
  };

  isScrollEnabled(): boolean {
    return true;
  };

  isTouchedInsideFrame(): boolean {
    const touchPos = new Point(TouchInput.x, TouchInput.y);
    const localPos = this.worldTransform.applyInverse(touchPos);
    return this.innerRect.contains(localPos.x, localPos.y);
  };

  onTouchScrollStart(): void {
    this._scrollTouching = true;
    this._scrollLastTouchX = TouchInput.x;
    this._scrollLastTouchY = TouchInput.y;
    this._scrollLastCursorVisible = this.cursorVisible;
    this.setScrollAccel(0, 0);
  };

  onTouchScroll(): void {
    const accelX = this._scrollLastTouchX - TouchInput.x;
    const accelY = this._scrollLastTouchY - TouchInput.y;
    this.setScrollAccel(accelX, accelY);
    this._scrollLastTouchX = TouchInput.x;
    this._scrollLastTouchY = TouchInput.y;
    this.cursorVisible = false;
  };

  onTouchScrollEnd(): void {
    this._scrollTouching = false;
    this.cursorVisible = this._scrollLastCursorVisible;
  };

  updateSmoothScroll(): void {
    if (this._scrollDuration > 0) {
        const d = this._scrollDuration;
        const deltaX = (this._scrollTargetX - this._scrollX) / d;
        const deltaY = (this._scrollTargetY - this._scrollY) / d;
        this.scrollBy(deltaX, deltaY);
        this._scrollDuration--;
    }
  };

  updateScrollAccel(): void {
    if (this._scrollAccelX !== 0 || this._scrollAccelY !== 0) {
        this.scrollBy(this._scrollAccelX, this._scrollAccelY);
        this._scrollAccelX *= 0.92;
        this._scrollAccelY *= 0.92;
        if (Math.abs(this._scrollAccelX) < 1) {
            this._scrollAccelX = 0;
        }
        if (Math.abs(this._scrollAccelY) < 1) {
            this._scrollAccelY = 0;
        }
    }
  };

  updateArrows(): void {
    this.downArrowVisible = this._scrollY < this.maxScrollY();
    this.upArrowVisible = this._scrollY > 0;
  };

  updateOrigin(): void {
    const blockWidth = this.scrollBlockWidth() || 1;
    const blockHeight = this.scrollBlockHeight() || 1;
    const baseX = this._scrollX - (this._scrollX % blockWidth);
    const baseY = this._scrollY - (this._scrollY % blockHeight);
    if (baseX !== this._scrollBaseX || baseY !== this._scrollBaseY) {
        this.updateScrollBase(baseX, baseY);
        this.paint();
    }
    this.origin.x = this._scrollX % blockWidth;
    this.origin.y = this._scrollY % blockHeight;
  };

  updateScrollBase(baseX: number, baseY: number): void {
    const deltaX = baseX - this._scrollBaseX;
    const deltaY = baseY - this._scrollBaseY;
    this._scrollBaseX = baseX;
    this._scrollBaseY = baseY;
    this.moveCursorBy(-deltaX, -deltaY);
    this.moveInnerChildrenBy(-deltaX, -deltaY);
  };

  paint(): void {
    // to be overridden
  };
}