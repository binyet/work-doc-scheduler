<template>
  <div class="home">
    <div style="flex: 2.5; height: 100%">
      <Calender ref="calenderRef"></Calender>
    </div>
    <div style="width: 20px;cursor: pointer;height: 100%;align-items: center;justify-content: center;display: flex;" @click="changeExpand">
      <el-icon>
        <ArrowLeft v-if="!isExpand"/>
        <ArrowRight v-else></ArrowRight>
      </el-icon>
    </div>
    <div style="flex: 1; height: 100%;" v-show="isExpand">
      <WorkDocContainer></WorkDocContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import Calender from '@/components/Calender/Index.vue';
import WorkDocContainer from '@/components/WorkDocContainer/Index.vue';
import { setMainSiderExpandChange } from '@/mitt/appGlobalChange';

const isExpand = ref(true);
const calenderRef = ref<InstanceType<typeof Calender>>();
function changeExpand(){
  isExpand.value = !isExpand.value;
  nextTick(()=>{
      setMainSiderExpandChange(isExpand.value);
  })
}
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
