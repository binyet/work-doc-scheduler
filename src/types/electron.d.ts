/// <reference types="vite/client" />

// Electron API 的类型声明
export class ElectronApi {
  openFileSender: (file: any) => Promise<void>;
  getFilePath: (file: any) => Promise<string>;
  readDirectory: (dirPath: string) => Promise<{
    success: boolean;
    folders: Array<{ name: string; path: string; isDirectory: boolean }>;
    files: Array<{ name: string; path: string; isDirectory: boolean }>;
    path: string;
    error?: string;
  }>;
  openDirectoryDialog: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}
