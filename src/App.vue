<script setup lang="ts">
import { $dayjs } from './plugins/global';
import { useAppStoreWithOut } from './service/store/module/app';

useAppStoreWithOut().setCurrDate($dayjs(new Date()).format('YYYY年MM月DD日'));
</script>

<template>
  <div id="main">
    <Suspense>
      <template #default>
        <RouterView></RouterView>
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
