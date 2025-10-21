/// <reference types="vite/client" />

// Electron API 的类型声明
export class ElectronApi {
  openFileSender: (file: any) => Promise<void>;
  getFilePath: (file: any) => Promise<string>;
  openDirectoryDialog: (options = {}) => Promise<string | null>;
  copyFile: (sourcePath: string, destPath: string) => Promise<any>;
  moveFile: (sourcePath: string, destPath: string) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}
