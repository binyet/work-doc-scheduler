import { defineStore } from 'pinia';
import { store } from '@/service/store';
import { IIndexedDb, IndexedDB } from '@/service/db/indexedDb';
import { Wds } from '../model/FileInfo';

interface AppState {
  currDate: string | null;
  indexedDB: IIndexedDb | null;
}
const useAppStore = defineStore('app-store', {
  state: (): AppState => ({
    currDate: null,
    indexedDB: null
  }),
  getters: {
    getCurrDate(): string | null {
      return this.currDate;
    },
    async getIndexedDb(): Promise<IIndexedDb | null> {
      return this.indexedDB;
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
    }
  }
});

export function useAppStoreWithOut() {
  return useAppStore(store);
}
