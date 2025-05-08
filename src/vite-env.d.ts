/// <reference types="vite/client" />

interface ImportMetaEnv {
  BASE_URL: string | undefined;
  readonly VITE_APP_TITLE: string;
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
declare module '*.vue' {
  import { Component } from 'vue';
  const component: Component;
  export default component;
}
