import * as PIXI from 'pixi.js';

//-----------------------------------------------------------------------------
/**
 * The root object of the display tree.
 *
 * @class
 * @extends PIXI.Container
 */
export class Stage extends PIXI.Container {
  constructor()
  constructor(thisClass: Constructable<Stage>)
  constructor(arg?: any) {
    super();
    if (typeof arg === "function" && arg === Stage) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    // dup with constructor super()
    PIXI.Container.call(this);
  };

  /**
  * Destroys the stage.
  */
  destroy(): void {
    const options = { children: true, texture: true };
    super.destroy(options);
  };
}
