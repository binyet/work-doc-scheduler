"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  process,
  getFilePath: (file) => {
    return electron.webUtils.getPathForFile(file);
  },
  openFileSender(path) {
    return electron.ipcRenderer.send("open-file", [path]);
  },
  openDirectoryDialog: (options = {}) => electron.ipcRenderer.invoke("open-directory-dialog", options),
  copyFile: (sourcePath, destPath) => electron.ipcRenderer.invoke("copy-file", sourcePath, destPath),
  moveFile: (sourcePath, destPath) => electron.ipcRenderer.invoke("move-file", sourcePath, destPath)
});
