import { App } from 'vue';
import mitt from 'mitt';
import dayjs from 'dayjs';
import * as icon from '@element-plus/icons-vue';

const $bus = mitt();
const $dayjs = dayjs;

function setupElementPlusIcon(app: App<Element>) {
  Object.keys(icon).forEach((key) => {
    app.component(key, icon[key as keyof typeof icon]);
  });
}

function globalInstall(Vue: App) {
  Vue.config.globalProperties.$bus = $bus;
  Vue.config.globalProperties.$dayjs = $dayjs;
}

export { globalInstall, setupElementPlusIcon, $bus, $dayjs };
