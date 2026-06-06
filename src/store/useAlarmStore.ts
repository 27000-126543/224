import { create } from 'zustand';
import type { Alarm, AlarmType, AlarmLevel, DeviceType } from '@/types';
import { generateInitialAlarms, generateId } from '@/utils/mock';

interface AlarmState {
  alarms: Alarm[];
  addAlarm: (type: AlarmType, deviceId: string, deviceName: string, deviceType: DeviceType, level: AlarmLevel, message: string) => void;
  resolveAlarm: (id: string) => void;
  getActiveAlarms: () => Alarm[];
  getUnresolvedCount: () => { info: number; warning: number; critical: number };
}

export const useAlarmStore = create<AlarmState>((set, get) => ({
  alarms: generateInitialAlarms(),

  addAlarm: (type, deviceId, deviceName, deviceType, level, message) => {
    const newAlarm: Alarm = {
      id: generateId(),
      type,
      deviceId,
      deviceName,
      deviceType,
      level,
      message,
      timestamp: new Date(),
      resolved: false
    };
    set((state) => ({ alarms: [newAlarm, ...state.alarms] }));
  },

  resolveAlarm: (id) =>
    set((state) => ({
      alarms: state.alarms.map((a) =>
        a.id === id ? { ...a, resolved: true, resolvedAt: new Date() } : a
      )
    })),

  getActiveAlarms: () => get().alarms.filter((a) => !a.resolved),

  getUnresolvedCount: () => {
    const active = get().alarms.filter((a) => !a.resolved);
    return {
      info: active.filter((a) => a.level === 'info').length,
      warning: active.filter((a) => a.level === 'warning').length,
      critical: active.filter((a) => a.level === 'critical').length
    };
  }
}));
