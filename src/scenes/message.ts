import { Scene_Base } from '.';
import { Graphics } from '../dom';
import {
  Window_Message,
  Window_Gold,
  Window_ScrollText,
  Window_NumberInput,
  Window_EventItem,
  Window_NameBox,
  Window_ChoiceList,
} from '../windows';
import { Rectangle } from '../pixi';

//-----------------------------------------------------------------------------
// Scene_Message
//
// The superclass of Scene_Map and Scene_Battle.

export class Scene_Message extends Scene_Base {
  _messageWindow?: Window_Message
  _scrollTextWindow?: Window_ScrollText
  _goldWindow?: Window_Gold
  _nameBoxWindow?: Window_NameBox
  _choiceListWindow?: Window_ChoiceList
  _numberInputWindow?: Window_NumberInput
  _eventItemWindow?: Window_EventItem

  constructor()
  constructor(thisClass: Constructable<Scene_Message>)
  constructor(arg?: any) {
    super(Scene_Base);
    if (typeof arg === "function" && arg === Scene_Message) {
      return;
    }
    this.initialize(...arguments);
  }

  initialize(..._: any): void {
    super.initialize();
  };

  isMessageWindowClosing(): boolean {
    return this._messageWindow!.isClosing();
  };

  createAllWindows(): void {
    this.createMessageWindow();
    this.createScrollTextWindow();
    this.createGoldWindow();
    this.createNameBoxWindow();
    this.createChoiceListWindow();
    this.createNumberInputWindow();
    this.createEventItemWindow();
    this.associateWindows();
  };

  createMessageWindow(): void {
    const rect = this.messageWindowRect();
    this._messageWindow = new Window_Message(rect);
    this.addWindow(this._messageWindow);
  };

  messageWindowRect(): Rectangle {
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, false) + 8;
    const wx = (Graphics.boxWidth - ww) / 2;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
  };

  createScrollTextWindow(): void {
    const rect = this.scrollTextWindowRect();
    this._scrollTextWindow = new Window_ScrollText(rect);
    this.addWindow(this._scrollTextWindow);
  };

  scrollTextWindowRect(): Rectangle {
    const wx = 0;
    const wy = 0;
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight;
    return new Rectangle(wx, wy, ww, wh);
  };

  createGoldWindow(): void {
    const rect = this.goldWindowRect();
    this._goldWindow = new Window_Gold(rect);
    this._goldWindow.openness = 0;
    this.addWindow(this._goldWindow);
  };

  goldWindowRect(): Rectangle {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(1, true);
    const wx = Graphics.boxWidth - ww;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
  };

  createNameBoxWindow(): void {
    this._nameBoxWindow = new Window_NameBox();
    this.addWindow(this._nameBoxWindow);
  };

  createChoiceListWindow(): void {
    this._choiceListWindow = new Window_ChoiceList();
    this.addWindow(this._choiceListWindow);
  };

  createNumberInputWindow(): void {
    this._numberInputWindow = new Window_NumberInput();
    this.addWindow(this._numberInputWindow);
  };

  createEventItemWindow(): void {
    const rect = this.eventItemWindowRect();
    this._eventItemWindow = new Window_EventItem(rect);
    this.addWindow(this._eventItemWindow);
  };

  eventItemWindowRect(): Rectangle {
    const wx = 0;
    const wy = 0;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, true);
    return new Rectangle(wx, wy, ww, wh);
  };

  associateWindows(): void {
    const messageWindow = this._messageWindow!;
    messageWindow.setGoldWindow(this._goldWindow!);
    messageWindow.setNameBoxWindow(this._nameBoxWindow!);
    messageWindow.setChoiceListWindow(this._choiceListWindow!);
    messageWindow.setNumberInputWindow(this._numberInputWindow!);
    messageWindow.setEventItemWindow(this._eventItemWindow!);
    this._nameBoxWindow!.setMessageWindow(messageWindow);
    this._choiceListWindow!.setMessageWindow(messageWindow);
    this._numberInputWindow!.setMessageWindow(messageWindow);
    this._eventItemWindow!.setMessageWindow(messageWindow);
  };
}
