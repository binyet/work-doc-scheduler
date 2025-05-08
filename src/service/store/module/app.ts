import { defineStore } from 'pinia';
import { store } from '@/service/store';
import { IIndexedDb, IndexedDB } from '@/service/db/indexedDb';

interface AppState {
  currDate: String | null;
  indexedDB: IIndexedDb | null;
}
const useAppStore = defineStore('app-store', {
  state: (): AppState => ({
    currDate: null,
    indexedDB: null
  }),
  getters: {
    getCurrDate(): String | null {
      return this.currDate;
    },
    getIndexedDb(): IIndexedDb | null {
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
      }
      return this.indexedDB;
    }
  },
  actions: {
    setCurrDate(date: String) {
      this.currDate = date;
    },
    setIndexedDb(indexedDB: IndexedDB) {
      this.indexedDB = indexedDB;
    }
  }
});

export function useAppStoreWithOut() {
  return useAppStore(store);
}
