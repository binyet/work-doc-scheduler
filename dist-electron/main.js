"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const node_module = require("node:module");
const node_url = require("node:url");
const path = require("node:path");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
const require$1 = node_module.createRequire(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href);
const __dirname$1 = path.dirname(node_url.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href));
const { dialog } = require$1("electron");
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let fs = require$1("fs");
function createWindow() {
  win = new electron.BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.js"),
      nodeIntegration: true,
      // 推荐设置为false
      contextIsolation: true,
      // 必须为true才能使用contextBridge
      sandbox: false,
      // 根据需求设置
      webSecurity: false
      // 如果需要处理本地文件协议
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.webContents.on("devtools-opened", () => {
    win.webContents.executeJavaScript(
      `
      if (window.chrome && chrome.autofillPrivate) {
        // 避免自动填充API调用
      }
    `
    ).catch(() => {
    });
  });
  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools();
  }
}
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
    win = null;
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.ipcMain.on("open-file", (event, args) => {
  electron.shell.openPath(args[0]).then(() => {
    console.log("open file success", args[0]);
  }).catch((error) => {
    console.error("open file error", args[0]);
  });
});
electron.ipcMain.handle("open-directory-dialog", async (event, options = {}) => {
  const dialogOptions = {
    properties: ["openDirectory", "createDirectory"]
  };
  if (options.defaultPath) {
    dialogOptions.defaultPath = options.defaultPath;
  }
  if (options.title) {
    dialogOptions.title = options.title;
  }
  const result = await dialog.showOpenDialog(dialogOptions);
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});
electron.ipcMain.handle("copy-file", async (event, sourcePath, destPath) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(sourcePath, destPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
});
electron.ipcMain.handle("move-file", async (event, sourcePath, destPath) => {
  return new Promise((resolve, reject) => {
    fs.rename(sourcePath, destPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
});
electron.app.whenReady().then(createWindow);
exports.MAIN_DIST = MAIN_DIST;
exports.RENDERER_DIST = RENDERER_DIST;
exports.VITE_DEV_SERVER_URL = VITE_DEV_SERVER_URL;
