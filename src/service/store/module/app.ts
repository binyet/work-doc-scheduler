import { defineStore } from 'pinia';
import { store } from '@/service/store';
import { IIndexedDb, IndexedDB } from '@/service/db/indexedDb';
import { Wds } from '../model/FileInfo';
import { ElectronApi } from '@/types/electron';

interface AppState {
  currDate: string | null;
  indexedDB: IIndexedDb | null;
  mainSiderIsExpand: boolean;
  electronApi: ElectronApi | null;
}
const useAppStore = defineStore('app-store', {
  state: (): AppState => ({
    currDate: null,
    indexedDB: null,
    mainSiderIsExpand: true,
    electronApi: null
  }),
  getters: {
    getCurrDate(): string | null {
      return this.currDate;
    },
    async getIndexedDb(): Promise<IIndexedDb | null> {
      return this.indexedDB;
    },
    getMainSiderIsExpand(): boolean {
      return this.mainSiderIsExpand;
    },
    getEleectronApi(): ElectronApi | null {
      return this.electronApi;
    }
  },
  actions: {
    setCurrDate(date: string) {
      this.currDate = date;
    },
    async InitIndexedDb() {
      if (!this.indexedDB) {
        this.indexedDB = new IndexedDB({
          name: 'wdsDB',
          version: 1,
          stores: [
            {
              name: 'wds',
              options: {
                keyPath: 'id',
                autoIncrement: true
              }
            }
          ]
        });
        await this.indexedDB.initDB([
          {
            name: 'wds',
            options: {
              keyPath: 'id',
              autoIncrement: true
            }
          }
        ]);
      }
    },
    async saveFileInfo(files: Wds.FileInfo[]) {
      var ddlDatas = files.map((p) => p.ddlDate);
      var dbDatas = await this.indexedDB?.query('wds', {
        filter: (p: any) => ddlDatas.includes(p.ddlDate)
      })!;
      var needAddFileInfos: any[] = [];
      files.forEach((item) => {
        if (dbDatas.findIndex((p: any) => p.path == item.path && p.ddlDate == item.ddlDate) < 0) {
          needAddFileInfos.push(item);
        }
      });
      if (needAddFileInfos.length > 0) {
        await this.indexedDB?.bulkAdd('wds', needAddFileInfos as any);
      }
    },
    async updateFileInfo(file: Wds.FileInfo) {
      await this.indexedDB?.put('wds', file);
    },
    async deleteFileInfoById(id: number) {
      await this.indexedDB?.delete('wds', id);
    },
    initElectronApi() {
      this.electronApi = window.electronAPI;
      if (!this.electronApi) {
        console.error('electronAPI未正确加载，请检查预加载脚本配置');
      }
    }
  }
});

export function useAppStoreWithOut() {
  return useAppStore(store);
}
