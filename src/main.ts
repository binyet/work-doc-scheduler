import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/main.css';
import '@/design/index.scss';
import { globalInstall } from './plugins/global';
import { setupStore } from './service/store';

async function startup() {
  const app = createApp(App);

  app.use(router);
  app.use(globalInstall);
  setupStore(app);
  app.mount('#app').$nextTick(() => {
    // Use contextBridge
    window.ipcRenderer?.on('main-process-message', (_event, message) => {
      console.log(message);
    });
  });
}

startup();
