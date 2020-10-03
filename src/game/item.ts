import { DataManager } from '../managers';
import { $dataArmors, $dataItems, $dataSkills, $dataWeapons } from '../managers';
import { MZ } from '../MZ';

const ItemDataClass = {
  Null: "",
  Item: "item",
  Skill: "skill",
  Weapon: "weapon",
  Armor: "armor",
} as const;
type ItemDataClass = typeof ItemDataClass[keyof typeof ItemDataClass]


//-----------------------------------------------------------------------------
// Game_Item
//
// The game object class for handling skills, items, weapons, and armor. It is
// required because save data should not include the database object itself.

export class Game_Item {
  constructor(item?: MZ.DataItemBase)
  constructor(thisClass: Constructable<Game_Item>)
  constructor(arg?: any) {
    if (typeof arg === "function" && arg === Game_Item) {
      return;
    }
    this.initialize(...arguments);
  }

  _dataClass: ItemDataClass = ItemDataClass.Null
  _itemId: number = 0

  initialize(item?: MZ.DataItemBase): void {
    this._dataClass = "";
    this._itemId = 0;
    if (item) {
        this.setObject(item);
    }
  }

  isSkill(): boolean {
    return this._dataClass === "skill";
  }

  isItem(): boolean {
    return this._dataClass === "item";
  }

  isUsableItem(): boolean {
    return this.isSkill() || this.isItem();
  }

  isWeapon(): boolean {
    return this._dataClass === "weapon";
  }

  isArmor(): boolean {
    return this._dataClass === "armor";
  }

  isEquipItem(): boolean {
    return this.isWeapon() || this.isArmor();
  }

  isNull(): boolean {
    return this._dataClass === "";
  }

  itemId(): MZ.ID {
    return this._itemId;
  }

  object(): MZ.DataItemBase | null {
    if (this.isSkill()) {
        return $dataSkills[this._itemId];
    } else if (this.isItem()) {
        return $dataItems[this._itemId];
    } else if (this.isWeapon()) {
        return $dataWeapons[this._itemId];
    } else if (this.isArmor()) {
        return $dataArmors[this._itemId];
    } else {
        return null;
    }
  }

  setObject(item: MZ.DataItemBase | null): void {
    if (DataManager.isSkill(item)) {
        this._dataClass = "skill";
    } else if (DataManager.isItem(item)) {
        this._dataClass = "item";
    } else if (DataManager.isWeapon(item)) {
        this._dataClass = "weapon";
    } else if (DataManager.isArmor(item)) {
        this._dataClass = "armor";
    } else {
        this._dataClass = "";
    }
    this._itemId = item ? (item as any).id : 0;
  }

  setEquip(isWeapon: boolean, itemId: MZ.ID): void {
    this._dataClass = isWeapon ? "weapon" : "armor";
    this._itemId = itemId;
  }
}
