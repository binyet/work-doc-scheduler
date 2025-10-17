import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';


const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { dialog } = require('electron')

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;
let fs: any = require('fs');

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, // 推荐设置为false
      contextIsolation: true, // 必须为true才能使用contextBridge
      sandbox: false, // 根据需求设置
      webSecurity: false // 如果需要处理本地文件协议
    }
  });

  

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  // 开发模式下打开DevTools检查错误
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('open-file', (event: any, args: any) => {
  shell
    .openPath(args[0])
    .then(() => {
      console.log('open file success', args[0]);
    })
    .catch((error) => {
      console.error('open file error', args[0]);
    });
});

ipcMain.handle('open-directory-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.on('read-directory', async (event: any, args: string) => {   
  try {
    let dirPath = args[0];
    const items = await fs.readdir(dirPath, {withFileTypes: true});
    const folders = items.filter((p: any)=>p.isDirectory()).map((item: any) => ({
        name: item.name,
        path: path.join(dirPath, item.name),
        isDirectory: true
      }));
          const files = items
      .filter((item: any) => item.isFile())
      .map((item: any) => ({
        name: item.name,
        path: path.join(dirPath, item.name),
        isDirectory: false
      }))

    return {
      success: true,
      folders,
      files,
      path: dirPath
    }
  } catch (error) {
    return {
      success: false,
      path: args[0]
    }
  }
})

app.whenReady().then(createWindow);
