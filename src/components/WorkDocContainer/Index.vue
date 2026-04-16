<template>
  <div class="container" ref="containerRef" :class="{ 'drag-enter': dragEnter }" @dragover="handleDragOver" @dragenter="handleDragEnter" @drop="handleFileDrop" @dragleave="handleDragLeave">
    <VueDraggable v-model="currDatas" :animation="150" item-key="path" @start="dragging = true" @end="dragging = false">
      <div
        v-for="(item, index) in currDatas"
        :key="index"
        class="list-group-item"
        draggable="true"
        v-on:dblclick="handleDblClick(item)"
        @contextmenu="
          (e) => {
            showItemContextMenu(e, item);
          }
        "
        :class="{ 'dragging': isDragging === item.id }"
      >
        <span :data-event="JSON.stringify(item)" class="list-group-item-span">{{ item.name }}</span>
      </div>
    </VueDraggable>
    <context-menu ref="contextMenuRef">
      <template #dropdown>
        <el-dropdown-item @click="openFileLocation">
          <el-icon><folder-opened /></el-icon>
          <span>打开文件位置</span>
        </el-dropdown-item>
        <el-dropdown-item @click="copyFileToFolder">
          <el-icon><document-copy /></el-icon>
          <span>复制到文件夹</span>
        </el-dropdown-item>
        <el-dropdown-item @click="moveFileToFolder">
          <el-icon><folder /></el-icon>
          <span>移动到文件夹</span>
        </el-dropdown-item>
        <el-dropdown-item @click="saveFileAs">
          <el-icon><download /></el-icon>
          <span>另存为</span>
        </el-dropdown-item>
      </template>
    </context-menu>
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import { Draggable } from '@fullcalendar/interaction';
import { getDateChanged } from '@/mitt/dateChange';
import { useAppStoreWithOut } from '@/service/store/module/app';
import { Wds } from '@/service/store/model/FileInfo';
import ContextMenu from '@/components/ContextMenu/Index.vue';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';

const dragging = ref(false);

const containerRef = ref<HTMLElement | null>(null);

const currDatas = ref<Array<Wds.FileInfo>>([]);

const dragEnter = ref(false);

const dbHelper = await useAppStoreWithOut().getIndexedDb;

const contextMenuRef = ref<InstanceType<typeof ContextMenu>>();

const appStore = useAppStoreWithOut();

const isDragging = ref<number | null>(null);

const currRightClickFile = ref<Wds.FileInfo | null>(null);

async function saveFileAs() {
  if (!currRightClickFile.value?.path) return;
  
  try {
    const options = {
      title: '另存为',
      buttonLabel: '保存',
      properties: ['openDirectory']
    };
    
    const result = await appStore.electronApi?.openDirectoryDialog(options);
    if (result && typeof result === 'string') {
      const destDir = result;
      const fileName = currRightClickFile.value.name || 'file';
      const destPath = `${destDir}/${fileName}`;
      
      await appStore.electronApi?.copyFile(currRightClickFile.value.path, destPath);
      ElMessage.success('文件保存成功');
    }
  } catch (error) {
    console.error('保存文件失败:', error);
    ElMessage.error('文件保存失败');
  }
}

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

  const files = e.dataTransfer?.files as FileList;

  let needAddFiles: Wds.FileInfo[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = (await appStore.electronApi?.getFilePath(file)) || '路径不可用';
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

async function openFileLocation() {
  if (currRightClickFile.value?.path) {
    await appStore.electronApi?.showItemInFolder(currRightClickFile.value.path);
  }
}

async function copyFileToFolder() {
  if (!currRightClickFile.value?.path) return;
  
  try {
    const options = {
      title: '选择目标文件夹',
      buttonLabel: '选择文件夹',
      properties: ['openDirectory']
    };
    
    const result = await appStore.electronApi?.openDirectoryDialog(options);
    if (result && typeof result === 'string') {
      const destDir = result;
      const fileName = currRightClickFile.value.name || 'file';
      const destPath = `${destDir}/${fileName}`;
      
      await appStore.electronApi?.copyFile(currRightClickFile.value.path, destPath);
      ElMessage.success('文件复制成功');
    }
  } catch (error) {
    console.error('复制文件失败:', error);
    ElMessage.error('文件复制失败');
  }
}

async function moveFileToFolder() {
  if (!currRightClickFile.value?.path) return;
  
  try {
    const options = {
      title: '选择目标文件夹',
      buttonLabel: '选择文件夹',
      properties: ['openDirectory']
    };
    
    const result = await appStore.electronApi?.openDirectoryDialog(options);
    if (result && typeof result === 'string') {
      const destDir = result;
      const fileName = currRightClickFile.value.name || 'file';
      const destPath = `${destDir}/${fileName}`;
      
      await appStore.electronApi?.moveFile(currRightClickFile.value.path, destPath);
      
      // 更新数据库中的文件路径
      currRightClickFile.value.path = destPath;
      await useAppStoreWithOut().updateFileInfo(currRightClickFile.value);
      
      ElMessage.success('文件移动成功');
      await initData(); // 刷新列表
    }
  } catch (error) {
    console.error('移动文件失败:', error);
    ElMessage.error('文件移动失败');
  }
}

onMounted(async () => {
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
  await appStore.electronApi?.openFileSender(item.path);
}

function showItemContextMenu(e: any, item: any) {
  e.preventDefault(); // 阻止默认右键菜单
  currRightClickFile.value = item;
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
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &.dragging {
    opacity: 0.5;
    background-color: #e3f2fd;
    border: 1px dashed #2196f3;
    transform: scale(0.98);
  }
}

.drag-enter {
  border: 1px solid #45a3ff;
  background-color: #e3f2fd;
}
</style>
