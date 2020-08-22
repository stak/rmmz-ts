import './prototype.js';
import * as Dom from './dom';
import * as PixiComponents from './pixi';
import * as Windows from './windows';

function assignToGlobal(module) {
  for (let k of Object.keys(module)) {
    global[k] = module[k];
  }
}

assignToGlobal(Dom);
assignToGlobal(PixiComponents);
assignToGlobal(Windows);