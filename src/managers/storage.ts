import pako from 'pako';
import localforage from 'localforage';
import { JsonEx, Utils } from '../dom';
import { $dataSystem } from '.';


//-----------------------------------------------------------------------------
// StorageManager
//
// The static class that manages storage for saving game data.

export class StorageManager {
  constructor() {
    throw new Error("This is a static class");
  }

  static _forageKeys: Array<string> = [];
  static _forageKeysUpdated = false;

  static isLocalMode(): boolean {
    return Utils.isNwjs();
  };

  static saveObject(saveName: string, object: object): Promise<void> {
    return this.objectToJson(object)
        .then(json => this.jsonToZip(json))
        .then(zip => this.saveZip(saveName, zip));
  };

  static loadObject(saveName: string): Promise<object> {
    return this.loadZip(saveName)
        .then(zip => this.zipToJson(zip))
        .then(json => this.jsonToObject(json));
  };

  static objectToJson(object: object): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const json = JsonEx.stringify(object);
            resolve(json);
        } catch (e) {
            reject(e);
        }
    });
  };

  static jsonToObject(json: string): Promise<object> {
    return new Promise((resolve, reject) => {
        try {
            const object = JsonEx.parse(json);
            resolve(object);
        } catch (e) {
            reject(e);
        }
    });
  };

  static jsonToZip(json: string): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const zip = pako.deflate(json, { to: "string", level: 1 });
            if (zip.length >= 50000) {
                console.warn("Save data is too big.");
            }
            resolve(zip);
        } catch (e) {
            reject(e);
        }
    });
  };

  static zipToJson(zip: string | null): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            if (zip) {
                const json = pako.inflate(zip, { to: "string" });
                resolve(json);
            } else {
                resolve("null");
            }
        } catch (e) {
            reject(e);
        }
    });
  };

  static saveZip(saveName: string, zip: string): Promise<void> {
    if (this.isLocalMode()) {
        return this.saveToLocalFile(saveName, zip);
    } else {
        return this.saveToForage(saveName, zip);
    }
  };

  static loadZip(saveName: string): Promise<string | null> {
    if (this.isLocalMode()) {
        return this.loadFromLocalFile(saveName);
    } else {
        return this.loadFromForage(saveName);
    }
  };

  static exists(saveName: string): boolean {
    if (this.isLocalMode()) {
        return this.localFileExists(saveName);
    } else {
        return this.forageExists(saveName);
    }
  };

  static remove(saveName: string): void | Promise<void> {
    if (this.isLocalMode()) {
        return this.removeLocalFile(saveName);
    } else {
        return this.removeForage(saveName);
    }
  };

  static saveToLocalFile(saveName: string, zip: string): Promise<void> {
    const dirPath = this.fileDirectoryPath();
    const filePath = this.filePath(saveName);
    const backupFilePath = filePath + "_";
    return new Promise((resolve, reject) => {
        this.fsMkdir(dirPath);
        this.fsUnlink(backupFilePath);
        this.fsRename(filePath, backupFilePath);
        try {
            this.fsWriteFile(filePath, zip);
            this.fsUnlink(backupFilePath);
            resolve();
        } catch (e) {
            try {
                this.fsUnlink(filePath);
                this.fsRename(backupFilePath, filePath);
            } catch (e2) {
                //
            }
            reject(e);
        }
    });
  };

  static loadFromLocalFile(saveName: string): Promise<string> {
    const filePath = this.filePath(saveName);
    return new Promise((resolve, reject) => {
        const data = this.fsReadFile(filePath);
        if (data) {
            resolve(data);
        } else {
            reject(new Error("Savefile not found"));
        }
    });
  };

  static localFileExists(saveName: string): boolean {
    const fs = require("fs");
    return fs.existsSync(this.filePath(saveName));
  };

  static removeLocalFile(saveName: string): void {
    this.fsUnlink(this.filePath(saveName));
  };

  static saveToForage(saveName: string, zip: string): Promise<void> {
    const key = this.forageKey(saveName);
    const testKey = this.forageTestKey();
    setTimeout(() => localforage.removeItem(testKey));
    return localforage
        .setItem(testKey, zip)
        .then(() => localforage.setItem(key, zip))
        .then(() => this.updateForageKeys())
  };

  static loadFromForage(saveName: string): Promise<string | null> {
    const key = this.forageKey(saveName);
    return localforage.getItem(key);
  };

  static forageExists(saveName: string): boolean {
    const key = this.forageKey(saveName);
    return this._forageKeys.includes(key);
  };

  static removeForage(saveName: string): Promise<void> {
    const key = this.forageKey(saveName);
    return localforage.removeItem(key).then(() => this.updateForageKeys());
  };

  static updateForageKeys(): Promise<void> {
    this._forageKeysUpdated = false;
    return localforage.keys().then((keys: string[]) => {
        this._forageKeys = keys;
        this._forageKeysUpdated = true;
        // return 0;
    });
  };

  static forageKeysUpdated(): boolean {
    return this._forageKeysUpdated;
  };

  static fsMkdir(path: string): void {
    const fs = require("fs");
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
  };

  static fsRename(oldPath: string, newPath: string): void {
    const fs = require("fs");
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
    }
  };

  static fsUnlink(path: string): void {
    const fs = require("fs");
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
  };

  static fsReadFile(path: string): string | null {
    const fs = require("fs");
    if (fs.existsSync(path)) {
        return fs.readFileSync(path, { encoding: "utf8" });
    } else {
        return null;
    }
  };

  static fsWriteFile(path: string, data: string): void {
    const fs = require("fs");
    fs.writeFileSync(path, data);
  };

  static fileDirectoryPath(): string {
    const path = require("path");
    const base = path.dirname((process as any).mainModule.filename);
    return path.join(base, "save/");
  };

  static filePath(saveName: string): string {
    const dir = this.fileDirectoryPath();
    return dir + saveName + ".rmmzsave";
  };

  static forageKey(saveName: string): string {
    const gameId = $dataSystem.advanced.gameId;
    return "rmmzsave." + gameId + "." + saveName;
  };

  static forageTestKey(): string {
    return "rmmzsave.test";
  };
}
