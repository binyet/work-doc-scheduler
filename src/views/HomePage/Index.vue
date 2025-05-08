<template>
  <div class="home">
    <div style="flex: 2.5; height: 100%">
      <Calender></Calender>
    </div>
    <div style="flex: 1; height: 100%">
      <WorkDocContainer></WorkDocContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import Calender from '@/components/Calender/Index.vue';
import WorkDocContainer from '@/components/WorkDocContainer/Index.vue';
</script>
<style scoped lang="scss">
.home {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
