<template>
  <RouterView>
    <template #default="{ Component }">
      <Transition>
        <keep-alive>
          <component :is="Component"></component>
        </keep-alive>
      </Transition>
    </template>
  </RouterView>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss"></style>
