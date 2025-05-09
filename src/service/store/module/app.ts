import { defineStore } from 'pinia';
import { store } from '@/service/store';
import { IIndexedDb, IndexedDB } from '@/service/db/indexedDb';

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
    }
  }
});

export function useAppStoreWithOut() {
  return useAppStore(store);
}
