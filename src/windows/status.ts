import { Window_StatusBase } from '.';
import { ColorManager, TextManager } from '../managers';
import { Rectangle } from '../pixi';
import { Game_Actor } from '../game';

//-----------------------------------------------------------------------------
// Window_Status
//
// The window for displaying full status on the status screen.

export class Window_Status extends Window_StatusBase {
  _actor: Game_Actor | null = null

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_Status>)
  constructor(arg?: any) {
    super(Window_StatusBase);
    if (typeof arg === "function" && arg === Window_Status) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._actor = null;
    this.refresh();
    this.activate();
  };

  setActor(actor: Game_Actor): void {
    if (this._actor !== actor) {
        this._actor = actor;
        this.refresh();
    }
  };

  refresh(): void {
    super.refresh();
    if (this._actor) {
        this.drawBlock1();
        this.drawBlock2();
    }
  };

  drawBlock1(): void {
    const y = this.block1Y();
    this.drawActorName(this._actor!, 6, y, 168);
    this.drawActorClass(this._actor!, 192, y, 168);
    this.drawActorNickname(this._actor!, 432, y, 270);
  };

  block1Y(): number {
    return 0;
  };

  drawBlock2(): void {
    const y = this.block2Y();
    this.drawActorFace(this._actor!, 12, y);
    this.drawBasicInfo(204, y);
    this.drawExpInfo(456, y);
  };

  block2Y(): number {
    const lineHeight = this.lineHeight();
    const min = lineHeight;
    const max = this.innerHeight - lineHeight * 4;
    return Math.floor((lineHeight * 1.4).clamp(min, max));
  };

  drawBasicInfo(x: number, y: number): void {
    const lineHeight = this.lineHeight();
    this.drawActorLevel(this._actor!, x, y + lineHeight * 0);
    this.drawActorIcons(this._actor!, x, y + lineHeight * 1);
    this.placeBasicGauges(this._actor!, x, y + lineHeight * 2);
  };

  drawExpInfo(x: number, y: number): void {
    const lineHeight = this.lineHeight();
    const expTotal = TextManager.expTotal.format(TextManager.exp);
    const expNext = TextManager.expNext.format(TextManager.level);
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(expTotal, x, y + lineHeight * 0, 270);
    this.drawText(expNext, x, y + lineHeight * 2, 270);
    this.resetTextColor();
    this.drawText(this.expTotalValue(), x, y + lineHeight * 1, 270, "right");
    this.drawText(this.expNextValue(), x, y + lineHeight * 3, 270, "right");
  };

  expTotalValue(): string {
    if (this._actor!.isMaxLevel()) {
        return "-------";
    } else {
        return String(this._actor!.currentExp());
    }
  };

  expNextValue(): string {
    if (this._actor!.isMaxLevel()) {
        return "-------";
    } else {
        return String(this._actor!.nextRequiredExp());
    }
  };
}
