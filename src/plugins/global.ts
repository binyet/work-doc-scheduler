import { App } from 'vue';
import mitt from 'mitt';
const $bus = mitt();
function globalInstall(Vue: App) {
  Vue.config.globalProperties.$bus = $bus;
}

export { globalInstall, $bus };
