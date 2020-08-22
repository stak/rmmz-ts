import * as Cores from './core';
import * as Windows from './windows';

function assignToGlobal(module) {
  for (let k of Object.keys(module)) {
    global[k] = module[k];
  }
}

assignToGlobal(Cores);
assignToGlobal(Windows);