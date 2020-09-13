interface Constructable<T> {
  new(...args: any) : T;
}

interface Window {
  effekseer: any
  cordova?: object
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