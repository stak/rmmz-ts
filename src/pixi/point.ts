import * as PIXI from 'pixi.js';

//-----------------------------------------------------------------------------
/**
 * The point class.
 *
 * @class
 * @extends PIXI.Point
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 */
export class Point extends PIXI.Point {
  
  constructor(x?: number, y?: number)
  constructor(thisClass: Constructable<Point>)
  constructor(arg?: any) {
    super(...arguments);
    if (typeof arg === "function" && arg === Point) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(x?: number, y?: number): void {
    // dup with constructor super()
    PIXI.Point.call(this, x, y);
  };
}