<template>
  <el-dropdown ref="contextMenu" trigger="contextmenu" :visible="visible" @visible-change="handleMenuVisibleChange">
    <div
      class="context-menu-anchor"
      :style="{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '1px',
        height: '1px'
      }"
    ></div>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="completeEvent" divided>
          <el-icon><document-copy /></el-icon>
          <span>设置完成</span>
        </el-dropdown-item>
        <el-dropdown-item @click="deleteEvent" divided class="danger-item">
          <el-icon><delete /></el-icon>
          <span>删除文档</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
const visible = ref(true);
const position = ref({ x: 0, y: 0 });

function handleMenuVisibleChange(visible: boolean) {}

function completeEvent() {}

function deleteEvent() {}

// 调整菜单位置防止超出视口
function adjustMenuPosition(clickX: number, clickY: number, menuWidth = 200, menuHeight = 200) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  let adjustedX = clickX + scrollX;
  let adjustedY = clickY + scrollY;

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
  visible.value = true;
}

defineExpose({
  showContextMenu
});
</script>

<style scoped lang="scss">
.context-menu-anchor {
  pointer-events: none;
}

.danger-item {
  color: var(--el-color-danger);
}

.danger-item:hover {
  color: #fff;
  background-color: var(--el-color-danger);
}
</style>
