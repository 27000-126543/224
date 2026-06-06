import { create } from 'zustand';
import type { Truck, PitZone, Incinerator, Turbine, FlueGasSystem, AshBin, WorkOrder } from '@/types';
import {
  generateInitialTrucks,
  generateInitialPitZones,
  generateInitialIncinerators,
  generateInitialTurbines,
  generateInitialFlueGasSystems,
  generateInitialAshBins,
  generateInitialWorkOrders,
  generateTruck,
  generateId
} from '@/utils/mock';
import { calculateOptimalPort, calculateBlendRatios } from '@/utils/calc';
import { useAlarmStore } from './useAlarmStore';

interface DeviceState {
  trucks: Truck[];
  pitZones: PitZone[];
  incinerators: Incinerator[];
  turbines: Turbine[];
  flueGasSystems: FlueGasSystem[];
  ashBins: AshBin[];
  workOrders: WorkOrder[];
  dispatchedTrucks: Set<string>;
  generatedWorkOrders: Set<string>;
  updateTruckPosition: (id: string, position: { x: number; z: number }) => void;
  updateTruckStatus: (id: string, status: Truck['status']) => void;
  addTruck: () => void;
  removeTruck: (id: string) => void;
  assignPortToTruck: (truckId: string, port: number) => void;
  updatePitZone: (id: number, data: Partial<PitZone>) => void;
  recalculateBlendRatios: () => void;
  updateIncinerator: (id: number, data: Partial<Incinerator>) => void;
  updateTurbine: (id: number, data: Partial<Turbine>) => void;
  updateFlueGasSystem: (id: number, data: Partial<FlueGasSystem>) => void;
  updateAshBin: (id: number, data: Partial<AshBin>) => void;
  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt' | 'status'>) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrder['status']) => void;
  simulateRealTimeData: () => void;
}

const portPositions = [
  { x: -15, z: 5 },
  { x: -9, z: 5 },
  { x: -3, z: 5 },
  { x: 3, z: 5 },
  { x: 9, z: 5 },
  { x: 15, z: 5 }
];

export const useDeviceStore = create<DeviceState>((set, get) => ({
  trucks: generateInitialTrucks(5).map((t, i) => ({
    ...t,
    status: i < 2 ? 'approaching' : t.status,
    assignedPort: i < 2 ? i + 1 : undefined,
    targetPosition: i < 2 ? portPositions[i] : undefined
  })),
  pitZones: calculateBlendRatios(generateInitialPitZones()),
  incinerators: generateInitialIncinerators(),
  turbines: generateInitialTurbines(),
  flueGasSystems: generateInitialFlueGasSystems(),
  ashBins: generateInitialAshBins(),
  workOrders: generateInitialWorkOrders(),
  dispatchedTrucks: new Set(),
  generatedWorkOrders: new Set(),

  updateTruckPosition: (id, position) =>
    set((state) => ({
      trucks: state.trucks.map((t) => (t.id === id ? { ...t, position } : t))
    })),

  updateTruckStatus: (id, status) =>
    set((state) => ({
      trucks: state.trucks.map((t) => (t.id === id ? { ...t, status } : t))
    })),

  addTruck: () => {
    const newTruck = generateTruck();
    const zones = get().pitZones;
    const optimalPort = calculateOptimalPort(newTruck, zones);
    newTruck.assignedPort = optimalPort;
    newTruck.status = 'approaching';
    newTruck.targetPosition = portPositions[optimalPort - 1];
    set((state) => ({ trucks: [...state.trucks, newTruck] }));
    
    useAlarmStore.getState().addAlarm(
      'system',
      newTruck.id,
      newTruck.plateNumber,
      'truck',
      'info',
      'Vehicle ' + newTruck.plateNumber + ' scheduled to port ' + optimalPort
    );
  },

  removeTruck: (id) =>
    set((state) => ({
      trucks: state.trucks.filter((t) => t.id !== id)
    })),

  assignPortToTruck: (truckId, port) =>
    set((state) => ({
      trucks: state.trucks.map((t) =>
        t.id === truckId ? { ...t, assignedPort: port, targetPosition: portPositions[port - 1] } : t
      )
    })),

  updatePitZone: (id, data) =>
    set((state) => ({
      pitZones: state.pitZones.map((z) => (z.id === id ? { ...z, ...data } : z))
    })),

  recalculateBlendRatios: () =>
    set((state) => ({
      pitZones: calculateBlendRatios(state.pitZones)
    })),

  updateIncinerator: (id, data) =>
    set((state) => ({
      incinerators: state.incinerators.map((i) => (i.id === id ? { ...i, ...data } : i))
    })),

  updateTurbine: (id, data) =>
    set((state) => ({
      turbines: state.turbines.map((t) => (t.id === id ? { ...t, ...data } : t))
    })),

  updateFlueGasSystem: (id, data) =>
    set((state) => ({
      flueGasSystems: state.flueGasSystems.map((f) => (f.id === id ? { ...f, ...data } : f))
    })),

  updateAshBin: (id, data) =>
    set((state) => ({
      ashBins: state.ashBins.map((a) => (a.id === id ? { ...a, ...data } : a))
    })),

  addWorkOrder: (order) =>
    set((state) => ({
      workOrders: [
        ...state.workOrders,
        { ...order, id: generateId(), status: 'pending', createdAt: new Date() }
      ]
    })),

  updateWorkOrderStatus: (id, status) =>
    set((state) => ({
      workOrders: state.workOrders.map((o) =>
        o.id === id
          ? { ...o, status, completedAt: status === 'completed' ? new Date() : undefined }
          : o
      )
    })),

  simulateRealTimeData: () => {
    const state = get();
    const { addAlarm } = useAlarmStore.getState();

    set({
      incinerators: state.incinerators.map((inc) => {
        let temp = inc.furnaceTemperature + (Math.random() - 0.5) * 15;
        let oxygen = inc.oxygenContent + (Math.random() - 0.5) * 0.8;
        let steam = inc.steamFlow + (Math.random() - 0.5) * 2;
        let feedRate = inc.feedRate;
        let damper = inc.damperOpening;
        let status: Incinerator['status'] = 'normal';

        if (temp > 1050) temp = 1050;
        if (temp < 850) temp = 850;
        if (oxygen > 12) oxygen = 12;
        if (oxygen < 4) oxygen = 4;

        if (temp > 1000 || oxygen < 6) {
          status = 'alarm';
          if (temp > 1000) {
            feedRate = Math.max(50, feedRate - 3);
            const alarmKey = inc.id + '-temperature-critical';
            if (!get().generatedWorkOrders.has(alarmKey)) {
              addAlarm('temperature', inc.id.toString(), inc.name, 'incinerator', 'critical',
                inc.name + ' furnace temperature over limit: ' + temp.toFixed(0) + 'C, feed rate reduced');
              set(s => ({ generatedWorkOrders: new Set([...s.generatedWorkOrders, alarmKey]) }));
            }
          }
          if (oxygen < 6) {
            damper = Math.min(100, damper + 2);
            const alarmKey = inc.id + '-oxygen-warning';
            if (!get().generatedWorkOrders.has(alarmKey)) {
              addAlarm('oxygen', inc.id.toString(), inc.name, 'incinerator', 'warning',
                inc.name + ' oxygen low: ' + oxygen.toFixed(1) + '%, damper opening increased');
              set(s => ({ generatedWorkOrders: new Set([...s.generatedWorkOrders, alarmKey]) }));
            }
          }
        } else if (temp > 980 || oxygen < 7) {
          status = 'warning';
        }

        const newRunningHours = inc.runningHours + 2 / 3600;
        const workOrderKey = 'overhaul-' + inc.id;
        if (newRunningHours > 8000 && !get().generatedWorkOrders.has(workOrderKey)) {
          get().addWorkOrder({
            deviceId: inc.id.toString(),
            deviceName: inc.name,
            type: 'overhaul',
            priority: 'high',
            description: inc.name + ' has run over 8000 hours, schedule overhaul',
            parts: ['炉衬砖', '密封件', '热电偶']
          });
          addAlarm('lifetime', inc.id.toString(), inc.name, 'incinerator', 'warning',
            inc.name + ' has run over 8000 hours, please schedule overhaul and prepare spare parts');
          set(s => ({ generatedWorkOrders: new Set([...s.generatedWorkOrders, workOrderKey]) }));
        }

        return { ...inc, furnaceTemperature: Math.round(temp * 10) / 10, oxygenContent: Math.round(oxygen * 10) / 10, steamFlow: Math.round(steam * 10) / 10, feedRate, damperOpening: damper, status, runningHours: newRunningHours };
      }),

      turbines: state.turbines.map((tur) => {
        let vibration = tur.vibration + (Math.random() - 0.5) * 0.4;
        let power = tur.powerOutput + (Math.random() - 0.5) * 1.5;
        let load = tur.loadPercent + (Math.random() - 0.5) * 2;
        let status: Turbine['status'] = 'normal';

        if (vibration > 5) {
          status = 'alarm';
          load = Math.max(30, load - 8);
          const alarmKey = tur.id + '-vibration-critical';
          if (!get().generatedWorkOrders.has(alarmKey)) {
            addAlarm('vibration', tur.id.toString(), tur.name, 'turbine', 'critical',
              tur.name + ' vibration over limit: ' + vibration.toFixed(1) + 'mm/s, load reduced');
            get().addWorkOrder({
              deviceId: tur.id.toString(),
              deviceName: tur.name,
              type: 'repair',
              priority: 'high',
              description: tur.name + ' vibration over limit, please inspect and repair',
              parts: ['轴承', '密封圈', '润滑油']
            });
            set(s => ({ generatedWorkOrders: new Set([...s.generatedWorkOrders, alarmKey]) }));
          }
        } else if (vibration > 4) {
          status = 'warning';
        }

        if (vibration > 7) vibration = 7;
        if (vibration < 1) vibration = 1;
        if (load > 100) load = 100;
        if (load < 0) load = 0;

        return { ...tur, vibration: Math.round(vibration * 10) / 10, powerOutput: Math.round(power * 10) / 10, loadPercent: Math.round(load), status, runningHours: tur.runningHours + 2 / 3600 };
      }),

      flueGasSystems: state.flueGasSystems.map((fg) => {
        let so2 = fg.emission.so2 + (Math.random() - 0.5) * 8;
        let nox = fg.emission.nox + (Math.random() - 0.5) * 12;
        let particulate = fg.emission.particulate + (Math.random() - 0.5) * 2;
        let status: FlueGasSystem['status'] = 'normal';
        let desulfurizationRunning = fg.desulfurizationRunning;
        let denitrificationRunning = fg.denitrificationRunning;

        if (so2 > 100) so2 = 100;
        if (so2 < 10) so2 = 10;
        if (nox > 300) nox = 300;
        if (nox < 40) nox = 40;
        if (particulate > 25) particulate = 25;
        if (particulate < 3) particulate = 3;

        if (so2 > 80 || nox > 250 || particulate > 18) {
          status = 'alarm';
          desulfurizationRunning = true;
          denitrificationRunning = true;
          const alarmKey = fg.id + '-emission-critical';
          if (!get().generatedWorkOrders.has(alarmKey)) {
            addAlarm('emission', fg.id.toString(), fg.name, 'flueGas', 'critical',
              fg.name + ' emission over limit, desulfurization/denitrification activated, EPA notified');
            set(s => ({ generatedWorkOrders: new Set([...s.generatedWorkOrders, alarmKey]) }));
          }
        } else if (so2 > 60 || nox > 200 || particulate > 14) {
          status = 'warning';
          desulfurizationRunning = true;
          denitrificationRunning = true;
        } else {
          desulfurizationRunning = false;
          denitrificationRunning = false;
        }

        return {
          ...fg,
          emission: { so2: Math.round(so2 * 10) / 10, nox: Math.round(nox * 10) / 10, particulate: Math.round(particulate * 10) / 10, timestamp: new Date() },
          status,
          desulfurizationRunning,
          denitrificationRunning,
          sprayActive: desulfurizationRunning || denitrificationRunning
        };
      }),

      ashBins: state.ashBins.map((ab) => {
        let level = ab.currentLevel + (Math.random() > 0.8 ? 1 : 0);
        let fillPercent = (level / ab.capacity) * 100;
        let status: AshBin['status'] = 'normal';

        if (fillPercent >= 95) {
          status = 'full';
          const alarmKey = ab.id + '-full-critical';
          if (!get().dispatchedTrucks.has(alarmKey)) {
            addAlarm('capacity', ab.id.toString(), ab.name, 'ashBin', 'critical',
              ab.name + ' is full, please dispatch transport trucks urgently');
            set(s => ({ dispatchedTrucks: new Set([...s.dispatchedTrucks, alarmKey]) }));
          }
        } else if (fillPercent >= 85) {
          status = 'warning';
          const alarmKey = ab.id + '-warning';
          if (!get().dispatchedTrucks.has(alarmKey)) {
            addAlarm('capacity', ab.id.toString(), ab.name, 'ashBin', 'warning',
              ab.name + ' nearly full (' + Math.round(fillPercent) + '%), transport trucks dispatched');
            set(s => ({ dispatchedTrucks: new Set([...s.dispatchedTrucks, alarmKey]) }));
          }
        }

        return { ...ab, currentLevel: level, fillPercent: Math.round(fillPercent), status };
      }),

      trucks: state.trucks.map((truck) => {
        if (truck.status === 'approaching' && truck.targetPosition) {
          const dx = truck.targetPosition.x - truck.position.x;
          const dz = truck.targetPosition.z - truck.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          if (dist < 0.3) {
            return { ...truck, status: 'discharging' as const, position: { ...truck.targetPosition } };
          }
          
          return truck;
        }
        
        if (truck.status === 'discharging') {
          if (Math.random() > 0.98) {
            return {
              ...truck,
              status: 'leaving' as const,
              targetPosition: { x: -25, z: 25 }
            };
          }
        }
        
        if (truck.status === 'leaving' && truck.targetPosition) {
          const dx = truck.targetPosition.x - truck.position.x;
          const dz = truck.targetPosition.z - truck.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          if (dist < 1) {
            setTimeout(() => {
              get().removeTruck(truck.id);
            }, 1000);
          }
        }
        
        return truck;
      })
    });
  }
}));
