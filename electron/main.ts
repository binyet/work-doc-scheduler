import { app, BrowserWindow, ipcMain, shell, dialog, nativeImage } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fs = require('fs');

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
  // 移除可能导致自动填充错误的调试功能
  win.webContents.on('devtools-opened', () => {
    win!.webContents
      .executeJavaScript(
        `
      if (window.chrome && chrome.autofillPrivate) {
        // 避免自动填充API调用
      }
    `
      )
      .catch(() => {});
  });

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

ipcMain.on('start-drag-file', (event: any, filePath: string) => {
  console.log('收到拖拽请求:', filePath);
  
  if (!filePath) {
    console.error('文件路径为空');
    return;
  }
  
  if (!fs.existsSync(filePath)) {
    console.error('文件不存在:', filePath);
    return;
  }
  
  try {
    console.log('准备启动拖拽，文件路径:', filePath);
    
    // 创建一个简单的图标
    const dragIcon = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAK0lEQVR4AWP4//8/AzWAiSTVgA0wCkbj0QwGQxXQmAaQkYQxQGQyAAAt8xv7v6H8tQAAAABJRU5ErkJggg=='
    );
    
    console.log('调用 event.sender.startDrag');
    
    // 直接使用原始文件路径进行拖拽
    event.sender.startDrag({
      file: filePath,
      icon: dragIcon,
      copy: true
    });
    
    console.log('拖拽已启动');
  } catch (error) {
    console.error('拖拽失败:', error);
    console.error('错误详情:', (error as Error).stack);
  }
});

ipcMain.handle('open-directory-dialog', async (event: any, options = {}) => {
  // 如果有默认路径，且路径存在，则设置默认路径
  const dialogOptions: any = {
    properties: ['openDirectory', 'createDirectory']
  };
  if (options.defaultPath) {
    dialogOptions.defaultPath = options.defaultPath;
  }
  // 添加标题
  if (options.title) {
    dialogOptions.title = options.title;
  }
  const result = await dialog.showOpenDialog(dialogOptions);

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('copy-file', async (event: any, sourcePath: string, destPath: string) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(sourcePath, destPath, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
});

ipcMain.handle('move-file', async (event: any, sourcePath: string, destPath: string) => {
  return new Promise((resolve, reject) => {
    fs.rename(sourcePath, destPath, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
});

ipcMain.handle('check-file-exists', async (event: any, filePath: string) => {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err:any) => {
      resolve(!err);
    });
  });
});

ipcMain.handle('delete-file', async (event: any, filePath: string) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err:any) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
});

ipcMain.handle('show-item-in-folder', async (event: any, filePath: string) => {
  shell.showItemInFolder(filePath);
  return true;
});

ipcMain.handle('get-desktop-path', async () => {
  return app.getPath('desktop');
});

app.whenReady().then(createWindow);
