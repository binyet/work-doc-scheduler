import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/main.css';
import '@/design/index.scss';
import 'element-plus/dist/index.css';
import { globalInstall, setupElementPlusIcon } from '@/plugins/global';
import { setupStore } from '@/service/store';
import { useAppStoreWithOut } from '@/service/store/module/app';

async function startup() {
  const app = createApp(App);

  app.use(router);
  app.use(globalInstall);
  setupStore(app);
  setupElementPlusIcon(app);
  await useAppStoreWithOut().InitIndexedDb();

  app.mount('#app').$nextTick(() => {
    // Use contextBridge
    window.ipcRenderer?.on('main-process-message', (_event, message) => {
      console.log(message);
    });
  });
}

startup();
