import { defineStore } from 'pinia';
import { store } from '@/service/store';

interface AppState {
  currDate: String | null;
}
const useAppStore = defineStore('app-store', {
  state: (): AppState => ({
    currDate: null
  }),
  getters: {
    getCurrDate(state: AppState): String | null {
      return state.currDate;
    }
  },
  actions: {
    setCurrDate(date: String) {
      this.currDate = date;
    }
  }
});

export function useAppStoreWithOut() {
  return useAppStore(store);
}
