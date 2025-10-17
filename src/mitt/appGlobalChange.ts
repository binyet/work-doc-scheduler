import { $bus } from '@/plugins/global';
import { EventBusType } from './EventBus';
import { useAppStoreWithOut } from '@/service/store/module/app';

export function setMainSiderExpandChange(isExpand: boolean) {
  $bus.emit(EventBusType.MainSiderExpandChange, isExpand);
}

export function getMainSiderExpandChange(callback: (isExpand: boolean) => void) {
  $bus.on(EventBusType.MainSiderExpandChange, () => {
    callback(useAppStoreWithOut().getMainSiderIsExpand);
  });
}
