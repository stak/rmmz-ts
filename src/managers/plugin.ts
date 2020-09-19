import { Utils } from '../dom';

type PluginParams = {[key: string]: any};
type Plugin = {
  name: string
  description: string
  status: boolean
  parameters: PluginParams
};

type _HTMLScriptElement = HTMLScriptElement & {
  _url: string
}

//-----------------------------------------------------------------------------
// PluginManager
//
// The static class that manages the plugins.

export class PluginManager {
  constructor() {
    throw new Error("This is a static class");
  }

  static _scripts: Array<string> = [];
  static _errorUrls: Array<string> = [];
  static _parameters: {[key: string]: PluginParams} = {};
  static _commands: {[key: string]: (...args: Array<any>) => void} = {};

  static setup(plugins: Array<Plugin>): void {
    for (const plugin of plugins) {
        if (plugin.status && !this._scripts.includes(plugin.name)) {
            this.setParameters(plugin.name, plugin.parameters);
            this.loadScript(plugin.name);
            this._scripts.push(plugin.name);
        }
    }
  };

  static parameters(name: string): PluginParams {
    return this._parameters[name.toLowerCase()] || {};
  };

  static setParameters(name: string, parameters: PluginParams): void {
    this._parameters[name.toLowerCase()] = parameters;
  };

  static loadScript(filename: string): void {
    const url = this.makeUrl(filename);
    const script = document.createElement("script") as _HTMLScriptElement;
    script.type = "text/javascript";
    script.src = url;
    script.async = false;
    script.defer = true;
    script.onerror = this.onError.bind(this) as OnErrorEventHandler;
    script._url = url;
    document.body.appendChild(script);
  };

  static onError(e: Event): void {
    this._errorUrls.push((e.target as _HTMLScriptElement)._url);
  };

  static makeUrl(filename: string): string {
    return "js/plugins/" + Utils.encodeURI(filename) + ".js";
  };

  static checkErrors(): void {
    const url = this._errorUrls.shift();
    if (url) {
        this.throwLoadError(url);
    }
  };

  static throwLoadError(url: string): void {
    throw new Error("Failed to load: " + url);
  };

  static registerCommand(pluginName: string, commandName: string, func: (...args: Array<any>) => void): void {
    const key = pluginName + ":" + commandName;
    this._commands[key] = func;
  };

  static callCommand(self: any, pluginName: string, commandName: string, args: Array<any>): void {
    const key = pluginName + ":" + commandName;
    const func = this._commands[key];
    if (typeof func === "function") {
        func.bind(self)(args);
    }
  };
}
