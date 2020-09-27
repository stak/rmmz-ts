import { Sprite, Point, Rectangle } from '../pixi';
import { TouchInput } from '../dom';

//-----------------------------------------------------------------------------
// Sprite_Clickable
//
// The sprite class with click handling functions.

export class Sprite_Clickable extends Sprite {
  _pressed = false
  _hovered = false

  constructor()
  constructor(thisClass: Constructable<Sprite_Clickable>)
  constructor(arg?: any) {
    super(Sprite);
    if (typeof arg === "function" && arg === Sprite_Clickable) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
    this._pressed = false;
    this._hovered = false;
  };

  update(): void {
    super.update();
    this.processTouch();
  };

  processTouch(): void {
    if (this.isClickEnabled()) {
        if (this.isBeingTouched()) {
            if (!this._hovered && TouchInput.isHovered()) {
                this._hovered = true;
                this.onMouseEnter();
            }
            if (TouchInput.isTriggered()) {
                this._pressed = true;
                this.onPress();
            }
        } else {
            if (this._hovered) {
                this.onMouseExit();
            }
            this._pressed = false;
            this._hovered = false;
        }
        if (this._pressed && TouchInput.isReleased()) {
            this._pressed = false;
            this.onClick();
        }
    } else {
        this._pressed = false;
        this._hovered = false;
    }
  };

  isPressed(): boolean {
    return this._pressed;
  };

  isClickEnabled(): boolean {
    return this.worldVisible;
  };

  isBeingTouched(): boolean {
    const touchPos = new Point(TouchInput.x, TouchInput.y);
    const localPos = this.worldTransform.applyInverse(touchPos);
    return this.hitTest(localPos.x, localPos.y);
  };

  hitTest(x: number, y: number): boolean {
    const rect = new Rectangle(
        -this.anchor.x * this.width,
        -this.anchor.y * this.height,
        this.width,
        this.height
    );
    return rect.contains(x, y);
  };

  onMouseEnter(): void {
    //
  };

  onMouseExit(): void {
    //
  };

  onPress(): void {
    //
  };

  onClick(): void {
    //
  };
}
