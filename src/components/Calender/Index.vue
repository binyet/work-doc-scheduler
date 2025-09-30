<template>
  <div class="calendar-container" @drop="handlerFileDrop" @dragover="handlerFileDragOver">
    <FullCalendar ref="fullCalendarRef" :options="calendarOptions" />
    <context-menu ref="contextMenuRef"></context-menu>
  </div>
</template>

<script lang="ts" setup>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import zhCnLocale from '@fullcalendar/core/locales/zh-cn';
import { CalendarOptions, EventMountArg } from '@fullcalendar/core';
import { setDateChanged } from '@/mitt/dateChange';
import { useAppStoreWithOut } from '@/service/store/module/app';
import { $dayjs } from '@/plugins/global';
import ContextMenu from '@/components/ContextMenu/Index.vue';
import { Wds } from '@/service/store/model/FileInfo';
// 状态变量
const fullCalendarRef = ref<any>(null);

// Electron API 的类型声明
declare const window: Window & {
  electronAPI?: {
    getFilePath: (file: any) => Promise<string>;
  };
};
const electronAPI = ref<any>(null);
const currSelectDate = ref<DateClickArg | null>(null);
const dbHelper = await useAppStoreWithOut().getIndexedDb;
const contextMenuRef = ref<InstanceType<typeof ContextMenu>>();

let lastClickTime = 0;
let clickTimeout: any;

// 日历配置
const calendarOptions = reactive<CalendarOptions>({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'today',
    center: 'title',
    right: 'prevYearCustom,prevMonthCustom,nextMonthCustom,nextYearCustom'
  },
  // 自定义按钮
  customButtons: {
    prevYearCustom: {
      text: '上一年',
      click: async () => {
        fullCalendarRef.value.getApi().prevYear();
        await initDocData();
      }
    },
    prevMonthCustom: {
      text: '上月',
      click: async () => {
        fullCalendarRef.value.getApi().prev();
        await initDocData();
      }
    },
    nextMonthCustom: {
      text: '下月',
      click: async () => {
        fullCalendarRef.value.getApi().next();
        await initDocData();
      }
    },
    nextYearCustom: {
      text: '下一年',
      click: async () => {
        fullCalendarRef.value.getApi().nextYear();
        await initDocData();
      }
    }
  },
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  locale: zhCnLocale,
  eventClick: handleEventClick,
  eventDidMount: eventDidMount,
  // 启用外部元素拖放功能
  droppable: true,
  // 处理拖放事件
  drop: (info) => {
    console.log(info);
  },
  // 允许事件重叠
  eventOverlap: true,
  // 确保日历接收外部元素
  dropAccept: '.list-group-item, [data-event]',
  dateClick: dateClick
});

function dateClick(info: DateClickArg) {
  const dateStr = info.dateStr;
  const dayEl = info.dayEl;

  if (currSelectDate.value) {
    // 如果已经选中，则取消选中
    const prevDayEl = currSelectDate.value.dayEl;
    prevDayEl.style.backgroundColor = ''; // 清除背景色
  }
  if (currSelectDate.value?.dateStr === dateStr) {
    // 如果再次点击同一天，则取消选中
    currSelectDate.value = null;
    dayEl.style.backgroundColor = ''; // 清除背景色
    return;
  }
  currSelectDate.value = info; // 更新当前选中的日期信息
  dayEl.style.backgroundColor = 'rgba(76, 175, 80, 0.3)'; // 设置背景色
  setDateChanged(dateStr); // 触发日期更改事件
}
// 事件挂载处理 添加右键菜单
function eventDidMount(e: EventMountArg) {
  e.el.addEventListener('contextmenu', (event) => {
    console.log('右键菜单事件', e);
    event.preventDefault(); // 阻止默认右键菜单
    contextMenuRef.value?.showContextMenu(event.clientX, event.clientY); // 显示自定义右键菜单
  });
}

// 事件点击处理
async function handleEventClick(info: any) {
  const currentTime = new Date().getTime();
  const timeDiff = currentTime - lastClickTime;

  clearTimeout(clickTimeout);

  if (timeDiff < 300) {
    // 300ms内两次点击视为双击
    await handleEventDoubleClick(info);
  } else {
    clickTimeout = setTimeout(() => {
      handleEventSingleClick(info); // 单机处理
    }, 310);
  }

  lastClickTime = currentTime;
}

async function handleEventSingleClick(info: any) {}

async function handleEventDoubleClick(info: any) {
  await electronAPI.value.openFileSender(info.event.extendedProps.path); // 调用 Electron API 打开文件
}

// 为文件创建日历事件标记
function createEventForFile(file: Wds.FileInfo) {
  if (!file.ddlDate) {
    return;
  }
  // 创建一个新事件
  const newEvent = {
    id: file.id,
    title: file.name,
    start: file.ddlDate,
    path: file.path,
    allDay: true,
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
    // 添加自定义属性以标识这是一个文件事件
    extendedProps: {
      isFileEvent: true,
      fileType: 'docx'
    }
  };

  // 添加事件到日历
  if (fullCalendarRef.value) {
    const calendarApi = fullCalendarRef.value.getApi();
    calendarApi.addEvent(newEvent);
  }
}

// 根据坐标获取日期单元格
function getDateCellFromPoint(x: number, y: number): { element: HTMLElement; date: Date } | null {
  if (!fullCalendarRef.value) return null;

  const calendarApi = fullCalendarRef.value.getApi();
  const calendarEl = calendarApi.el;

  // 获取所有日期单元格
  const dateCells = calendarEl.querySelectorAll('.fc-daygrid-day');

  // 遍历所有日期单元格，找到包含点击坐标的单元格
  for (let i = 0; i < dateCells.length; i++) {
    const cell = dateCells[i] as HTMLElement;
    const rect = cell.getBoundingClientRect();

    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      // 从单元格的 data-date 属性获取日期
      const dateStr = cell.getAttribute('data-date');
      if (dateStr) {
        return {
          element: cell,
          date: new Date(dateStr)
        };
      }
    }
  }

  return null;
}

const handlerFileDrop = async (e: DragEvent) => {
  // 阻止默认行为，但不阻止事件传播
  // 这样 FullCalendar 的 drop 处理程序仍然可以接收到事件
  e.preventDefault();
  console.log(e);

  // 检查是否有文件被拖放
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    let needAddFiles: Wds.FileInfo[] = [];
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const file = e.dataTransfer.files[i];
      const cellInfo = getDateCellFromPoint(e.clientX, e.clientY);
      const path = (await electronAPI.value.getFilePath(file)) || '路径不可用';
      // createEventForFile(path, file.name, cellInfo?.date);
      let event = new Wds.FileInfo({
        title: file.name,
        name: file.name,
        size: file.size,
        type: file.type,
        path: path,
        lastModified: file.lastModified,
        ddlDate: $dayjs(cellInfo?.date).format('YYYY-MM-DD')
      });
      needAddFiles.push(event);
    }
    await saveData(needAddFiles);
  }
};
async function saveData(files: Wds.FileInfo[]): Promise<void> {
  await useAppStoreWithOut().saveFileInfo(files);
  await initDocData(files.map((p) => p.ddlDate!)); // 重新加载数据
}
const handlerFileDragOver = function (e: any) {
  e.preventDefault();
  e.stopPropagation();
};

// 设置全局拖拽事件处理
onMounted(async () => {
  electronAPI.value = window.electronAPI;
  if (!electronAPI.value) {
    console.error('electronAPI未正确加载，请检查预加载脚本配置');
  }

  await initDocData();

  (window as any).fullCalendar = fullCalendarRef.value;
});

async function initDocData(searchDates: string[] = []) {
  let files: Wds.FileInfo[] | undefined = [];
  if (searchDates.length === 0) {
    var startDate = $dayjs(new Date(fullCalendarRef.value.getApi().currentData.viewApi.currentStart)).format('YYYY-MM-DD');
    var endDate = $dayjs(new Date(fullCalendarRef.value.getApi().currentData.viewApi.currentEnd)).format('YYYY-MM-DD');
    files = await dbHelper?.query<Wds.FileInfo>('wds', {
      filter: (p: any) => p.ddlDate >= startDate && p.ddlDate <= endDate
    });
  } else {
    files = await dbHelper?.query<Wds.FileInfo>('wds', {
      filter: (p: any) => searchDates.includes(p.ddlDate)
    });
  }

  files?.forEach((file) => {
    const event = fullCalendarRef.value.getApi()?.getEventById(file.id);
    event?.remove();
    createEventForFile(file);
  });
}
</script>

<style scoped>
.calendar-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  position: relative;
}
.selected-day {
  background-color: #4caf50 !important;
  opacity: 0.5;
}
.drop-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border-left: 4px solid #4285f4;
}

:deep(.fc) {
  z-index: 2;
}

:deep(.fc-event) {
  cursor: pointer;
}

:deep(.fc-day) {
  transition: background-color 0.2s;
}

:deep(.fc-day:hover) {
  background-color: rgba(66, 133, 244, 0.1);
}

/* 确保日历单元格可以接收拖放 */
:deep(.fc-daygrid-day) {
  position: relative;
}

:deep(.fc-daygrid-day-frame) {
  min-height: 80px; /* 确保日期单元格有足够的高度 */
}
</style>
