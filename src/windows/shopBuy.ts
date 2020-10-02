import { Window_Selectable, Window_ShopStatus } from './';
import { $gameParty } from '../managers';
import { $dataWeapons, $dataArmors, $dataItems } from '../managers';
import { Rectangle } from '../pixi';
import { MZ } from '../MZ';

type GoodsParam = [
  itemKind: 0 | 1 | 2,
  itemId: MZ.DataID,
  isUniqPrice: number | boolean,
  price: number,
];

//-----------------------------------------------------------------------------
// Window_ShopBuy
//
// The window for selecting an item to buy on the shop screen.

export class Window_ShopBuy extends Window_Selectable {
  _money = 0
  _shopGoods?: GoodsParam[]
  _data?: MZ.DataItemBase[]
  _price?: number[]
  _statusWindow?: Window_ShopStatus

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_ShopBuy>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_ShopBuy) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._money = 0;
  };

  setupGoods(shopGoods: GoodsParam[]): void {
    this._shopGoods = shopGoods;
    this.refresh();
    this.select(0);
  };

  maxItems(): number {
    return this._data ? this._data.length : 1;
  };

  item(): MZ.DataItemBase | null {
    return this.itemAt(this.index());
  };

  itemAt(index: number): MZ.DataItemBase | null {
    return this._data && index >= 0 ? this._data[index] : null;
  };

  setMoney(money: number): void {
    this._money = money;
    this.refresh();
  };

  isCurrentItemEnabled(): boolean {
    return this.isEnabled(this._data![this.index()]);
  };

  price(item: MZ.DataItemBase): number {
    return this._price![(this._data as MZ.DataItemBase[]).indexOf(item)] || 0;
  };

  isEnabled(item: MZ.DataItemBase | null): boolean {
    return (
        !!item && this.price(item) <= this._money && !$gameParty.hasMaxItems(item)
    );
  };

  refresh(): void {
    this.makeItemList();
    super.refresh();
  };

  makeItemList(): void {
    this._data = [];
    this._price = [];
    for (const goods of this._shopGoods!) {
        const item = this.goodsToItem(goods);
        if (item) {
            this._data.push(item);
            this._price.push(goods[2] === 0 ? (item as any).price : goods[3]);
        }
    }
  };

  goodsToItem(goods: GoodsParam): MZ.DataItemBase | null {
    switch (goods[0]) {
        case 0:
            return $dataItems[goods[1]];
        case 1:
            return $dataWeapons[goods[1]];
        case 2:
            return $dataArmors[goods[1]];
        default:
            return null;
    }
  };

  drawItem(index: number): void {
    const item = this.itemAt(index);
    const price = this.price(item!);
    const rect = this.itemLineRect(index);
    const priceWidth = this.priceWidth();
    const priceX = rect.x + rect.width - priceWidth;
    const nameWidth = rect.width - priceWidth;
    this.changePaintOpacity(this.isEnabled(item));
    this.drawItemName(item, rect.x, rect.y, nameWidth);
    this.drawText(String(price), priceX, rect.y, priceWidth, "right");
    this.changePaintOpacity(true);
  };

  priceWidth(): number {
    return 96;
  };

  setStatusWindow(statusWindow: Window_ShopStatus): void {
    this._statusWindow = statusWindow;
    this.callUpdateHelp();
  };

  updateHelp(): void {
    this.setHelpWindowItem(this.item());
    if (this._statusWindow) {
        this._statusWindow.setItem(this.item());
    }
  };
}
