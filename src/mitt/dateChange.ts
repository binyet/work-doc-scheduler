import { $bus } from '@/plugins/global';
import { EventBusType } from './EventBus';
import { useAppStoreWithOut } from '@/service/store/module/app';

export function setDateChanged(lastChangeDate: string) {
  useAppStoreWithOut().setCurrDate(lastChangeDate);
  $bus.emit(EventBusType.DateChanged, lastChangeDate);
}

export function getDateChanged(callback: (lastChangeDate: string) => void) {
  $bus.on(EventBusType.DateChanged, () => {
    callback(useAppStoreWithOut().getCurrDate!);
  });
}
