import { Window_StatusBase } from '.';
import { Game_Actor } from '../game';
import { ColorManager, TextManager, ImageManager } from '../managers';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Window_EquipStatus
//
// The window for displaying parameter changes on the equipment screen.

export class Window_EquipStatus extends Window_StatusBase {
  _actor: Game_Actor | null = null
  _tempActor: Game_Actor | null = null

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_EquipStatus>)
  constructor(arg?: any) {
    super(Window_StatusBase);
    if (typeof arg === "function" && arg === Window_EquipStatus) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._actor = null;
    this._tempActor = null;
    this.refresh();
  };

  setActor(actor: Game_Actor): void {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
  };

  colSpacing(): number {
    return 0;
  };

  refresh(): void {
    this.contents.clear();
    if (this._actor) {
        const nameRect = this.itemLineRect(0);
        this.drawActorName(this._actor, nameRect.x, 0, nameRect.width);
        this.drawActorFace(this._actor, nameRect.x, nameRect.height);
        this.drawAllParams();
    }
  };

  setTempActor(tempActor: Game_Actor | null): void {
    if (this._tempActor !== tempActor) {
        this._tempActor = tempActor;
        this.refresh();
    }
  };

  drawAllParams(): void {
    for (let i = 0; i < 6; i++) {
        const x = this.itemPadding();
        const y = this.paramY(i);
        this.drawItem(x, y, 2 + i);
    }
  };

  drawItem(...arg: any): void
  drawItem(x: number, y: number, paramId: number): void {
    const paramX = this.paramX();
    const paramWidth = this.paramWidth();
    const rightArrowWidth = this.rightArrowWidth();
    this.drawParamName(x, y, paramId);
    if (this._actor) {
        this.drawCurrentParam(paramX, y, paramId);
    }
    this.drawRightArrow(paramX + paramWidth, y);
    if (this._tempActor) {
        this.drawNewParam(paramX + paramWidth + rightArrowWidth, y, paramId);
    }
  };

  drawParamName(x: number, y: number, paramId: number): void {
    const width = this.paramX() - this.itemPadding() * 2;
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.param(paramId), x, y, width);
  };

  drawCurrentParam(x: number, y: number, paramId: number): void {
    const paramWidth = this.paramWidth();
    this.resetTextColor();
    this.drawText(String(this._actor!.param(paramId)), x, y, paramWidth, "right");
  };

  drawRightArrow(x: number, y: number): void {
    const rightArrowWidth = this.rightArrowWidth();
    this.changeTextColor(ColorManager.systemColor());
    this.drawText("\u2192", x, y, rightArrowWidth, "center");
  };

  drawNewParam(x: number, y: number, paramId: number): void {
    const paramWidth = this.paramWidth();
    const newValue = this._tempActor!.param(paramId);
    const diffvalue = newValue - this._actor!.param(paramId);
    this.changeTextColor(ColorManager.paramchangeTextColor(diffvalue));
    this.drawText(String(newValue), x, y, paramWidth, "right");
  };

  rightArrowWidth(): number {
    return 32;
  };

  paramWidth(): number {
    return 48;
  };

  paramX(): number {
    const itemPadding = this.itemPadding();
    const rightArrowWidth = this.rightArrowWidth();
    const paramWidth = this.paramWidth();
    return this.innerWidth - itemPadding - paramWidth * 2 - rightArrowWidth;
  };

  paramY(index: number): number {
    const faceHeight = ImageManager.faceHeight;
    return faceHeight + Math.floor(this.lineHeight() * (index + 1.5));
  };
}
