import type { Truck, PitZone, Incinerator, Turbine, FlueGasSystem, AshBin, Alarm, WorkOrder, EmissionHistory, TemperatureHistory } from '@/types';

const wasteTypes = ['domestic', 'kitchen', 'industrial', 'recyclable'] as const;
const sources = ['东城区环卫站', '西城区垃圾转运站', '南山区工业园', '北湖区餐饮联盟', '高新区市政', '滨江新区物业'];
const platePrefixes = ['京A', '京B', '沪A', '粤B', '苏A', '浙C'];

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function generateTruck(): Truck {
  const plateNumber = `${platePrefixes[Math.floor(Math.random() * platePrefixes.length)]}·${Math.floor(Math.random() * 90000 + 10000)}`;
  const wasteType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
  const baseCalorific: Record<string, number> = {
    domestic: 1800,
    kitchen: 2200,
    industrial: 2800,
    recyclable: 1500
  };
  
  return {
    id: generateId(),
    plateNumber,
    source: sources[Math.floor(Math.random() * sources.length)],
    wasteType,
    weight: Math.floor(Math.random() * 10 + 8),
    calorificValue: baseCalorific[wasteType] + Math.floor(Math.random() * 400 - 200),
    status: 'waiting',
    arrivalTime: new Date(),
    position: { x: -25 + Math.random() * 5, z: 15 + Math.random() * 5 },
    assignedPort: undefined
  };
}

export function generateInitialTrucks(count: number = 5): Truck[] {
  return Array.from({ length: count }, (_, i) => {
    const truck = generateTruck();
    if (i === 0) {
      truck.status = 'approaching';
      truck.assignedPort = 1;
      truck.targetPosition = { x: -15, z: 5 };
    } else if (i === 1) {
      truck.status = 'discharging';
      truck.assignedPort = 2;
      truck.position = { x: -10, z: 0 };
    }
    return truck;
  });
}

export function generateInitialPitZones(): PitZone[] {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  
  return [
    { id: 1, name: 'A区', zoneName: '1#料区', height: 7.5, heightPercent: 75, fermentationDays: 8, calorificValue: 1950, averageCalorificValue: 1950, wasteType: 'domestic', color: colors[0], position: { x: -8, z: -5 }, blendRatio: 30, status: 'optimal', currentVolume: 1500, capacity: 2000 },
    { id: 2, name: 'B区', zoneName: '2#料区', height: 6.2, heightPercent: 62, fermentationDays: 5, calorificValue: 2300, averageCalorificValue: 2300, wasteType: 'kitchen', color: colors[1], position: { x: 0, z: -5 }, blendRatio: 25, status: 'high', currentVolume: 1240, capacity: 2000 },
    { id: 3, name: 'C区', zoneName: '3#料区', height: 8.1, heightPercent: 81, fermentationDays: 10, calorificValue: 1700, averageCalorificValue: 1700, wasteType: 'recyclable', color: colors[2], position: { x: 8, z: -5 }, blendRatio: 15, status: 'optimal', currentVolume: 1620, capacity: 2000 },
    { id: 4, name: 'D区', zoneName: '4#料区', height: 5.8, heightPercent: 58, fermentationDays: 7, calorificValue: 2600, averageCalorificValue: 2600, wasteType: 'industrial', color: colors[3], position: { x: -8, z: -12 }, blendRatio: 20, status: 'high', currentVolume: 1160, capacity: 2000 },
    { id: 5, name: 'E区', zoneName: '5#料区', height: 9.0, heightPercent: 90, fermentationDays: 12, calorificValue: 1850, averageCalorificValue: 1850, wasteType: 'domestic', color: colors[4], position: { x: 0, z: -12 }, blendRatio: 10, status: 'high', currentVolume: 1800, capacity: 2000 },
    { id: 6, name: 'F区', zoneName: '6#料区', height: 4.5, heightPercent: 45, fermentationDays: 3, calorificValue: 2100, averageCalorificValue: 2100, wasteType: 'kitchen', color: colors[5], position: { x: 8, z: -12 }, blendRatio: 0, status: 'low', currentVolume: 900, capacity: 2000 }
  ];
}

export function generateInitialIncinerators(): Incinerator[] {
  return [
    {
      id: 1, name: '1#焚烧炉',
      furnaceTemperature: 950, oxygenContent: 8.5, steamFlow: 65,
      feedRate: 85, damperOpening: 70, runningHours: 6520,
      status: 'normal', position: { x: -12, y: 0, z: 5 }
    },
    {
      id: 2, name: '2#焚烧炉',
      furnaceTemperature: 980, oxygenContent: 7.2, steamFlow: 72,
      feedRate: 92, damperOpening: 75, runningHours: 7850,
      status: 'normal', position: { x: 0, y: 0, z: 5 }
    },
    {
      id: 3, name: '3#焚烧炉',
      furnaceTemperature: 1020, oxygenContent: 5.5, steamFlow: 58,
      feedRate: 70, damperOpening: 85, runningHours: 8200,
      status: 'alarm', position: { x: 12, y: 0, z: 5 }
    }
  ];
}

export function generateInitialTurbines(): Turbine[] {
  return [
    {
      id: 1, name: '1#汽轮发电机组',
      vibration: 2.8, powerOutput: 25, rpm: 3000, loadPercent: 85,
      runningHours: 6400, status: 'normal', position: { x: 0, y: 0, z: 18 }
    }
  ];
}

export function generateInitialFlueGasSystems(): FlueGasSystem[] {
  return [
    {
      id: 1,
      name: '1#烟气净化系统',
      emission: { so2: 25, nox: 80, particulate: 8, timestamp: new Date() },
      desulfurizationRunning: true,
      denitrificationRunning: true,
      sprayActive: false,
      status: 'normal',
      position: { x: 20, y: 0, z: 0 }
    },
    {
      id: 2,
      name: '2#烟气净化系统',
      emission: { so2: 35, nox: 120, particulate: 12, timestamp: new Date() },
      desulfurizationRunning: true,
      denitrificationRunning: true,
      sprayActive: false,
      status: 'normal',
      position: { x: 25, y: 0, z: 0 }
    }
  ];
}

export function generateInitialAshBins(): AshBin[] {
  return [
    { id: 1, name: '1#灰渣仓', capacity: 500, currentLevel: 320, fillPercent: 64, status: 'normal', position: { x: -20, y: 0, z: 15 } },
    { id: 2, name: '2#灰渣仓', capacity: 500, currentLevel: 460, fillPercent: 92, status: 'warning', position: { x: -20, y: 0, z: 22 } }
  ];
}

export function generateInitialAlarms(): Alarm[] {
  return [
    {
      id: generateId(),
      type: 'temperature',
      deviceId: 'incinerator-3',
      deviceName: '3#焚烧炉',
      deviceType: 'incinerator',
      level: 'critical',
      message: '炉膛温度超限: 1020℃，已自动降低给料量',
      timestamp: new Date(Date.now() - 300000),
      resolved: false
    },
    {
      id: generateId(),
      type: 'oxygen',
      deviceId: 'incinerator-3',
      deviceName: '3#焚烧炉',
      deviceType: 'incinerator',
      level: 'warning',
      message: '含氧量偏低: 5.5%，已增大风门开度',
      timestamp: new Date(Date.now() - 250000),
      resolved: false
    },
    {
      id: generateId(),
      type: 'capacity',
      deviceId: 'ashbin-2',
      deviceName: '2#灰渣仓',
      deviceType: 'ashBin',
      level: 'warning',
      message: '仓位接近满仓: 92%，已调度运输车',
      timestamp: new Date(Date.now() - 600000),
      resolved: false
    },
    {
      id: generateId(),
      type: 'lifetime',
      deviceId: 'incinerator-3',
      deviceName: '3#焚烧炉',
      deviceType: 'incinerator',
      level: 'info',
      message: '运行时长超过8000小时，请安排大修',
      timestamp: new Date(Date.now() - 3600000),
      resolved: false
    }
  ];
}

export function generateInitialWorkOrders(): WorkOrder[] {
  return [
    {
      id: generateId(),
      deviceId: 'incinerator-3',
      deviceName: '3#焚烧炉',
      type: 'overhaul',
      priority: 'high',
      description: '运行超8000小时，需进行全面检修，包括炉衬检查、受热面清灰、密封件更换',
      parts: ['耐高温炉衬砖', '密封垫片组', '热电偶', '压力传感器'],
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000)
    }
  ];
}

export function generateEmissionHistory(count: number = 20): EmissionHistory[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(now - (count - i) * 60000),
    so2: 20 + Math.random() * 30,
    nox: 60 + Math.random() * 50,
    particulate: 5 + Math.random() * 10
  }));
}

export function generateTemperatureHistory(count: number = 20): TemperatureHistory[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(now - (count - i) * 60000),
    temperature: 900 + Math.random() * 150,
    oxygen: 6 + Math.random() * 5
  }));
}
