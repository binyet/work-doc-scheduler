<template>
  <div class="container" ref="containerRef" :class="{ 'drag-enter': dragEnter }" @dragover="handleDragOver" @dragenter="handleDragEnter" @drop="handleFileDrop" @dragleave="handleDragLeave">
    <VueDraggable v-model="currDatas" :animation="150" item-key="path" @start="dragging = true" @end="dragging = false">
      <div v-for="(item, index) in currDatas" :key="index" class="list-group-item">
        <span :data-event="JSON.stringify(item)" class="list-group-item-span">{{ item.name }}</span>
      </div>
    </VueDraggable>
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';

import { Draggable } from '@fullcalendar/interaction';
import { getDateChanged } from '@/mitt/dateChange';
import { useAppStoreWithOut } from '@/service/store/module/app';

// Electron API 的类型声明
declare const window: Window & {
  electronAPI?: {
    getFilePath: (file: any) => Promise<string>;
  };
};
const electronAPI = ref<any>(null);
const dragging = ref(false);

const containerRef = ref<HTMLElement | null>(null);

const currDatas = ref<Array<any>>([]);

const dragEnter = ref(false);

const dbHelper = await useAppStoreWithOut().getIndexedDb;

function handleDragOver(event: DragEvent) {
  event.preventDefault();
}

function handleDragEnter() {
  dragEnter.value = true;
}

function handleDragLeave(e: any) {
  dragEnter.value = false;
  console.log('dragLeave', e);
}

async function handleFileDrop(e: DragEvent) {
  e.preventDefault();
  dragEnter.value = false;
  // Handle file drop logic here

  // 获取上传的文件,files是一个数组,可能同时存在一次拖拽多个文件的情况
  const files = e.dataTransfer?.files as FileList;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // 通过 electronAPI 获取路径
    const path = (await electronAPI.value.getFilePath(file)) || '路径不可用';
    if (file.size / 1024 / 1024 > 10) {
      console.log('文件不能大于10M。');
      continue;
    }
    var event = {
      title: file.name,
      name: file.name,
      size: file.size,
      type: file.type,
      path: path,
      lastModified: file.lastModified,
      ddlDate: useAppStoreWithOut().getCurrDate
    };
    // Object.assign(event, { id: path, title: file.name, ddlDate: useAppStoreWithOut().getCurrDate });
    currDatas.value.push(event);
  }

  await saveData();
}

async function saveData(): Promise<void> {
  var dbDatas = await dbHelper?.query('wds', {
    filter: (p: any) => p.ddlDate == useAppStoreWithOut().getCurrDate
  })!;
  var needAddFileInfos: any[] = [];
  currDatas?.value.forEach((item) => {
    if (dbDatas.findIndex((p: any) => p.path == item.path) < 0) {
      needAddFileInfos.push(item);
    }
  });
  if (needAddFileInfos.length > 0) {
    await dbHelper?.bulkAdd('wds', needAddFileInfos as any);
  }
}

onMounted(async () => {
  electronAPI.value = window.electronAPI;
  if (!electronAPI.value) {
    console.error('electronAPI未正确加载，请检查预加载脚本配置');
  }

  new Draggable(containerRef.value!, {
    itemSelector: '.list-group-item-span',
    eventData: (event) => {
      console.log('eventData', event);
      return JSON.parse(event.dataset.event!);
    }
  });
});

getDateChanged(async (lastDate: any) => {
  await initData();
  console.log('接收到的日期数据:', lastDate);
  // 在这里处理接收到的日期数据
  // 例如，更新组件的状态或执行其他操作
});

async function initData(): Promise<void> {
  currDatas.value = await dbHelper?.query('wds', {
    filter: (p: any) => p.ddlDate == useAppStoreWithOut().getCurrDate
  })!;
  console.log(currDatas.value);
}
await initData();
</script>

<style scoped lang="scss">
.container {
  padding-top: 30px;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.list-group-item {
  cursor: pointer;
  position: relative;
  display: block;
  padding: 0.75rem 1.25rem;
  margin-bottom: -1px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.drag-enter {
  border: 1px solid #45a3ff;
}
</style>
