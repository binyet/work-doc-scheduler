import { App } from 'vue';
import mitt from 'mitt';
import dayjs from 'dayjs';
const $bus = mitt();
const $dayjs = dayjs;
function globalInstall(Vue: App) {
  Vue.config.globalProperties.$bus = $bus;
  Vue.config.globalProperties.$dayjs = $dayjs;
}

export { globalInstall, $bus, $dayjs };
