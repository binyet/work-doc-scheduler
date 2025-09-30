<template>
  <div class="container" ref="containerRef" :class="{ 'drag-enter': dragEnter }" @dragover="handleDragOver" @dragenter="handleDragEnter" @drop="handleFileDrop" @dragleave="handleDragLeave">
    <VueDraggable v-model="currDatas" :animation="150" item-key="path" @start="dragging = true" @end="dragging = false">
      <div
        v-for="(item, index) in currDatas"
        :key="index"
        class="list-group-item"
        v-on:dblclick="handleDblClick(item)"
        @contextmenu="
          (e) => {
            showItemContextMenu(e, item);
          }
        "
      >
        <span :data-event="JSON.stringify(item)" class="list-group-item-span">{{ item.name }}</span>
      </div>
    </VueDraggable>
    <context-menu ref="contextMenuRef"></context-menu>
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';

import { Draggable } from '@fullcalendar/interaction';
import { getDateChanged } from '@/mitt/dateChange';
import { useAppStoreWithOut } from '@/service/store/module/app';
import { Wds } from '@/service/store/model/FileInfo';
import ContextMenu from '@/components/ContextMenu/Index.vue';

// Electron API 的类型声明
declare const window: Window & {
  electronAPI?: {
    getFilePath: (file: any) => Promise<string>;
  };
};
const electronAPI = ref<any>(null);
const dragging = ref(false);

const containerRef = ref<HTMLElement | null>(null);

const currDatas = ref<Array<Wds.FileInfo>>([]);

const dragEnter = ref(false);

const dbHelper = await useAppStoreWithOut().getIndexedDb;

const contextMenuRef = ref<InstanceType<typeof ContextMenu>>();

function handleDragOver(event: DragEvent) {
  event.preventDefault();
}

function handleDragEnter() {
  dragEnter.value = true;
}

function handleDragLeave(e: any) {
  dragEnter.value = false;
}

async function handleFileDrop(e: DragEvent) {
  e.preventDefault();
  dragEnter.value = false;
  // Handle file drop logic here

  // 获取上传的文件,files是一个数组,可能同时存在一次拖拽多个文件的情况
  const files = e.dataTransfer?.files as FileList;

  let needAddFiles: Wds.FileInfo[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // 通过 electronAPI 获取路径
    const path = (await electronAPI.value.getFilePath(file)) || '路径不可用';
    if (file.size / 1024 / 1024 > 10) {
      console.log('文件不能大于10M。');
      continue;
    }
    var event = new Wds.FileInfo({
      title: file.name,
      name: file.name,
      size: file.size,
      type: file.type,
      path: path,
      lastModified: file.lastModified,
      ddlDate: useAppStoreWithOut().getCurrDate
    });
    needAddFiles.push(event);
  }

  await saveData(needAddFiles);
}

async function saveData(files: Wds.FileInfo[]): Promise<void> {
  await useAppStoreWithOut().saveFileInfo(files);
  await initData();
}

onMounted(async () => {
  electronAPI.value = window.electronAPI;
  if (!electronAPI.value) {
    console.error('electronAPI未正确加载，请检查预加载脚本配置');
  }

  new Draggable(containerRef.value!, {
    itemSelector: '.list-group-item-span',
    eventData: (event) => {
      return JSON.parse(event.dataset.event!);
    }
  });
});

getDateChanged(async (lastDate: any) => {
  await initData();
  // 在这里处理接收到的日期数据
  // 例如，更新组件的状态或执行其他操作
});

async function initData(): Promise<void> {
  currDatas.value = await dbHelper?.query('wds', {
    filter: (p: any) => p.ddlDate == useAppStoreWithOut().getCurrDate
  })!;
}

async function handleDblClick(item: any) {
  await electronAPI.value.openFileSender(item.path);
}

function showItemContextMenu(e: any, item: any) {
  contextMenuRef.value?.setCurrSelectedInfo(item); // 设置当前选中的文件信息
  e.preventDefault(); // 阻止默认右键菜单
  contextMenuRef.value?.showContextMenu(e.clientX, e.clientY); // 显示自定义右键菜单
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
