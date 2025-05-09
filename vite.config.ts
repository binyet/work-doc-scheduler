import { defineConfig } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron/simple';
import vue from '@vitejs/plugin-vue';
import ViteAutoImport from 'unplugin-auto-import/vite';

import Components from 'unplugin-vue-components/vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
// https://vitejs.dev/config/
export default defineConfig({
  define: {
    process: {} // 防止 Vite 移除 process
  },
  plugins: [
    vue(),

    ViteAutoImport({
      imports: ['vue', 'vue-router', 'vue-i18n'],
      dirs: ['./src/utils'],
      dts: './src/auto-imports.d.ts',
      resolvers: []
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: (i) => `__tla_${i}`
    }),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts'
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts')
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer:
        process.env.NODE_ENV === 'test'
          ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
            undefined
          : {}
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
