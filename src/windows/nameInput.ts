import { Window_Selectable } from '.';
import { SoundManager } from '../managers';
import { $gameSystem } from '../managers';
import { Rectangle } from '../pixi';
import { Window_NameEdit } from '.';
import { Input } from '../dom';

//-----------------------------------------------------------------------------
// Window_NameInput
//
// The window for selecting text characters on the name input screen.

export class Window_NameInput extends Window_Selectable {
  _editWindow: Window_NameEdit | null = null
  _page = 0

  constructor(rect: Rectangle)
  constructor(thisClass: Constructable<Window_NameInput>)
  constructor(arg?: any) {
    super(Window_Selectable);
    if (typeof arg === "function" && arg === Window_NameInput) {
      return;
    }
    this.initialize(...arguments);
  }

  // prettier-ignore
  static readonly LATIN1 =
        [ "A","B","C","D","E",  "a","b","c","d","e",
          "F","G","H","I","J",  "f","g","h","i","j",
          "K","L","M","N","O",  "k","l","m","n","o",
          "P","Q","R","S","T",  "p","q","r","s","t",
          "U","V","W","X","Y",  "u","v","w","x","y",
          "Z","[","]","^","_",  "z","{","}","|","~",
          "0","1","2","3","4",  "!","#","$","%","&",
          "5","6","7","8","9",  "(",")","*","+","-",
          "/","=","@","<",">",  ":",";"," ","Page","OK" ];
  // prettier-ignore
  static readonly LATIN2 =
        [ "Á","É","Í","Ó","Ú",  "á","é","í","ó","ú",
          "À","È","Ì","Ò","Ù",  "à","è","ì","ò","ù",
          "Â","Ê","Î","Ô","Û",  "â","ê","î","ô","û",
          "Ä","Ë","Ï","Ö","Ü",  "ä","ë","ï","ö","ü",
          "Ā","Ē","Ī","Ō","Ū",  "ā","ē","ī","ō","ū",
          "Ã","Å","Æ","Ç","Ð",  "ã","å","æ","ç","ð",
          "Ñ","Õ","Ø","Š","Ŵ",  "ñ","õ","ø","š","ŵ",
          "Ý","Ŷ","Ÿ","Ž","Þ",  "ý","ÿ","ŷ","ž","þ",
          "Ĳ","Œ","ĳ","œ","ß",  "«","»"," ","Page","OK" ];
  // prettier-ignore
  static readonly RUSSIA =
        [ "А","Б","В","Г","Д",  "а","б","в","г","д",
          "Е","Ё","Ж","З","И",  "е","ё","ж","з","и",
          "Й","К","Л","М","Н",  "й","к","л","м","н",
          "О","П","Р","С","Т",  "о","п","р","с","т",
          "У","Ф","Х","Ц","Ч",  "у","ф","х","ц","ч",
          "Ш","Щ","Ъ","Ы","Ь",  "ш","щ","ъ","ы","ь",
          "Э","Ю","Я","^","_",  "э","ю","я","%","&",
          "0","1","2","3","4",  "(",")","*","+","-",
          "5","6","7","8","9",  ":",";"," ","","OK" ];
  // prettier-ignore
  static readonly JAPAN1 =
        [ "あ","い","う","え","お",  "が","ぎ","ぐ","げ","ご",
          "か","き","く","け","こ",  "ざ","じ","ず","ぜ","ぞ",
          "さ","し","す","せ","そ",  "だ","ぢ","づ","で","ど",
          "た","ち","つ","て","と",  "ば","び","ぶ","べ","ぼ",
          "な","に","ぬ","ね","の",  "ぱ","ぴ","ぷ","ぺ","ぽ",
          "は","ひ","ふ","へ","ほ",  "ぁ","ぃ","ぅ","ぇ","ぉ",
          "ま","み","む","め","も",  "っ","ゃ","ゅ","ょ","ゎ",
          "や","ゆ","よ","わ","ん",  "ー","～","・","＝","☆",
          "ら","り","る","れ","ろ",  "ゔ","を","　","カナ","決定" ];
  // prettier-ignore
  static readonly JAPAN2 =
        [ "ア","イ","ウ","エ","オ",  "ガ","ギ","グ","ゲ","ゴ",
          "カ","キ","ク","ケ","コ",  "ザ","ジ","ズ","ゼ","ゾ",
          "サ","シ","ス","セ","ソ",  "ダ","ヂ","ヅ","デ","ド",
          "タ","チ","ツ","テ","ト",  "バ","ビ","ブ","ベ","ボ",
          "ナ","ニ","ヌ","ネ","ノ",  "パ","ピ","プ","ペ","ポ",
          "ハ","ヒ","フ","ヘ","ホ",  "ァ","ィ","ゥ","ェ","ォ",
          "マ","ミ","ム","メ","モ",  "ッ","ャ","ュ","ョ","ヮ",
          "ヤ","ユ","ヨ","ワ","ン",  "ー","～","・","＝","☆",
          "ラ","リ","ル","レ","ロ",  "ヴ","ヲ","　","英数","決定" ];
  // prettier-ignore
  static readonly JAPAN3 =
        [ "Ａ","Ｂ","Ｃ","Ｄ","Ｅ",  "ａ","ｂ","ｃ","ｄ","ｅ",
          "Ｆ","Ｇ","Ｈ","Ｉ","Ｊ",  "ｆ","ｇ","ｈ","ｉ","ｊ",
          "Ｋ","Ｌ","Ｍ","Ｎ","Ｏ",  "ｋ","ｌ","ｍ","ｎ","ｏ",
          "Ｐ","Ｑ","Ｒ","Ｓ","Ｔ",  "ｐ","ｑ","ｒ","ｓ","ｔ",
          "Ｕ","Ｖ","Ｗ","Ｘ","Ｙ",  "ｕ","ｖ","ｗ","ｘ","ｙ",
          "Ｚ","［","］","＾","＿",  "ｚ","｛","｝","｜","～",
          "０","１","２","３","４",  "！","＃","＄","％","＆",
          "５","６","７","８","９",  "（","）","＊","＋","－",
          "／","＝","＠","＜","＞",  "：","；","　","かな","決定" ];

  initialize(rect?: Rectangle): void {
    super.initialize(rect);
    this._editWindow = null;
    this._page = 0;
    this._index = 0;
  };

  setEditWindow(editWindow: Window_NameEdit): void {
    this._editWindow = editWindow;
    this.refresh();
    this.updateCursor();
    this.activate();
  };

  table(): string[][] {
    if ($gameSystem.isJapanese()) {
        return [
            Window_NameInput.JAPAN1,
            Window_NameInput.JAPAN2,
            Window_NameInput.JAPAN3
        ];
    } else if ($gameSystem.isRussian()) {
        return [Window_NameInput.RUSSIA];
    } else {
        return [Window_NameInput.LATIN1, Window_NameInput.LATIN2];
    }
  };

  maxCols(): number {
    return 10;
  };

  maxItems(): number {
    return 90;
  };

  itemWidth(): number {
    return Math.floor((this.innerWidth - this.groupSpacing()) / 10);
  };

  groupSpacing(): number {
    return 24;
  };

  character(): string {
    return this._index < 88 ? this.table()[this._page][this._index] : "";
  };

  isPageChange(): boolean {
    return this._index === 88;
  };

  isOk(): boolean {
    return this._index === 89;
  };

  itemRect(index: number): Rectangle {
    const itemWidth = this.itemWidth();
    const itemHeight = this.itemHeight();
    const colSpacing = this.colSpacing();
    const rowSpacing = this.rowSpacing();
    const groupSpacing = this.groupSpacing();
    const col = index % 10;
    const group = Math.floor(col / 5);
    const x = col * itemWidth + group * groupSpacing + colSpacing / 2;
    const y = Math.floor(index / 10) * itemHeight + rowSpacing / 2;
    const width = itemWidth - colSpacing;
    const height = itemHeight - rowSpacing;
    return new Rectangle(x, y, width, height);
  };

  drawItem(index: number): void {
    const table = this.table();
    const character = table[this._page][index];
    const rect = this.itemLineRect(index);
    this.drawText(character, rect.x, rect.y, rect.width, "center");
  };

  updateCursor(): void {
    const rect = this.itemRect(this._index);
    this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
  };

  isCursorMovable(): boolean {
    return this.active;
  };

  cursorDown(wrap: boolean): void {
    if (this._index < 80 || wrap) {
        this._index = (this._index + 10) % 90;
    }
  };

  cursorUp(wrap: boolean): void {
    if (this._index >= 10 || wrap) {
        this._index = (this._index + 80) % 90;
    }
  };

  cursorRight(wrap: boolean): void {
    if (this._index % 10 < 9) {
        this._index++;
    } else if (wrap) {
        this._index -= 9;
    }
  };

  cursorLeft(wrap: boolean): void {
    if (this._index % 10 > 0) {
        this._index--;
    } else if (wrap) {
        this._index += 9;
    }
  };

  cursorPagedown(): void {
    this._page = (this._page + 1) % this.table().length;
    this.refresh();
  };

  cursorPageup(): void {
    this._page = (this._page + this.table().length - 1) % this.table().length;
    this.refresh();
  };

  processCursorMove(): void {
    const lastPage = this._page;
    super.processCursorMove();
    this.updateCursor();
    if (this._page !== lastPage) {
        this.playCursorSound();
    }
  };

  processHandling(): void {
    if (this.isOpen() && this.active) {
        if (Input.isTriggered("shift")) {
            this.processJump();
        }
        if (Input.isRepeated("cancel")) {
            this.processBack();
        }
        if (Input.isRepeated("ok")) {
            this.processOk();
        }
    }
  };

  isCancelEnabled(): boolean {
    return true;
  };

  processCancel(): void {
    this.processBack();
  };

  processJump(): void {
    if (this._index !== 89) {
        this._index = 89;
        this.playCursorSound();
    }
  };

  processBack(): void {
    if (this._editWindow!.back()) {
        SoundManager.playCancel();
    }
  };

  processOk(): void {
    if (this.character()) {
        this.onNameAdd();
    } else if (this.isPageChange()) {
        this.playOkSound();
        this.cursorPagedown();
    } else if (this.isOk()) {
        this.onNameOk();
    }
  };

  onNameAdd(): void {
    if (this._editWindow!.add(this.character())) {
        this.playOkSound();
    } else {
        this.playBuzzerSound();
    }
  };

  onNameOk(): void {
    if (this._editWindow!.name() === "") {
        if (this._editWindow!.restoreDefault()) {
            this.playOkSound();
        } else {
            this.playBuzzerSound();
        }
    } else {
        this.playOkSound();
        this.callOkHandler();
    }
  };
}
