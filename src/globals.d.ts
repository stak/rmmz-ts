// prototype extended by rmmz
interface Array<T> {
  clone(): Array<T>
  contains(element: T): boolean
  equals(array: Array<T>): boolean
  remove(element: T): Array<T>
}
interface Math {
  randomInt(max: number): number
}
interface Number { 
  clamp(min: number, max: number): number
  mod(n: number): number
  padZero(length: number): string
}
interface String {
  contains(string: string): boolean
  format(...args: Array<any>): string
  padZero(length: number): string
}


interface Constructable<T> {
  new(...args: Array<any>) : T;
}

interface Window {
  effekseer: any
  cordova?: object
  chrome?: any
  AudioContext?: Constructable<AudioContext>
  webkitAudioContext?: Constructable<AudioContext>
  mozIndexedDB?: IDBFactory
  webkitIndexedDB?: IDBFactory
}

interface Document {
  readonly fullScreenElement?: Element | null;
  readonly mozFullScreen?: Element | null;
  readonly webkitFullscreenElement?: Element | null;
  readonly cancelFullScreen?: () => Promise<void>;
  readonly mozCancelFullScreen?: () => Promise<void>;
  readonly webkitCancelFullScreen?: () => Promise<void>;
}

interface HTMLElement {
  readonly requestFullScreen?: () => Promise<void>;
  readonly mozRequestFullScreen?: () => Promise<void>;
  readonly webkitRequestFullScreen?: (flag?: number) => Promise<void>;
}

interface Navigator {
  readonly standalone?: boolean
}

declare const VorbisDecoder: any