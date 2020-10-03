import './prototype.js';
import * as Dom from './dom';
import * as PixiComponents from './pixi';
import * as Managers from './managers';
import * as Games from './game';
import * as Scenes from './scenes';
import * as Sprites from './sprites';
import * as Windows from './windows';

function toGlobal(module: {[key: string]: unknown}): void {
  for (let k of Object.keys(module)) {
    (global as any)[k] = module[k];
  }
}

[
  Dom,
  PixiComponents,
  Managers,
  Games,
  Scenes,
  Sprites,
  Windows
].map(toGlobal);
