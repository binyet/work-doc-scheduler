<template>
  <el-dropdown ref="contextMenuRef" popper-class="wds-context-menu-popper" trigger="contextmenu" @visible-change="handleMenuVisibleChange">
    <div
      :style="{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '1px',
        height: '1px'
      }"
    ></div>

    <template #dropdown>
      <slot name="dropdown"></slot>
    </template>
    
  </el-dropdown>
</template>

<script setup lang="ts">
import { ElDropdown } from 'element-plus';

const contextMenuRef = ref<InstanceType<typeof ElDropdown>>();

const position = ref({ x: 0, y: 0 });

function handleMenuVisibleChange(visible: boolean) {}

function completeEvent() {}

function deleteEvent() {}

// 调整菜单位置防止超出视口
function adjustMenuPosition(clickX: number, clickY: number, menuWidth = 100, menuHeight = 50) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  let adjustedX = clickX + scrollX + 50;
  let adjustedY = clickY + scrollY - 25;

  // 水平方向检测
  if (clickX + menuWidth > viewportWidth) {
    adjustedX = scrollX + viewportWidth - menuWidth - 5;
  }

  // 垂直方向检测
  if (clickY + menuHeight > viewportHeight) {
    adjustedY = scrollY + viewportHeight - menuHeight - 5;
  }

  // 确保不会小于0
  adjustedX = Math.max(scrollX + 5, adjustedX);
  adjustedY = Math.max(scrollY + 5, adjustedY);

  return {
    x: adjustedX - scrollX, // 转换为相对于视口的坐标
    y: adjustedY - scrollY
  };
}

function showContextMenu(x: number, y: number) {
  position.value = adjustMenuPosition(x, y);
  contextMenuRef.value?.handleOpen();
}

defineExpose({
  showContextMenu,
});
</script>

<style scoped lang="scss">
.wds-context-menu {
  background-color: white;
  border: 1px solid #ccc;
}
</style>
