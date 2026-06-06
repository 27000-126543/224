export type UserRole = 'director' | 'manager' | 'epa';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  faceData?: string;
  lastLogin?: Date;
}

export type WasteType = 'domestic' | 'kitchen' | 'industrial' | 'recyclable';
export type TruckStatus = 'waiting' | 'approaching' | 'discharging' | 'leaving';

export type DeviceType = 'incinerator' | 'turbine' | 'flueGas' | 'ashBin' | 'truck' | 'pit' | 'boiler';

export interface Truck {
  id: string;
  plateNumber: string;
  source: string;
  wasteType: WasteType;
  weight: number;
  calorificValue: number;
  status: TruckStatus;
  assignedPort?: number;
  arrivalTime: Date;
  position: { x: number; z: number };
  targetPosition?: { x: number; z: number };
}

export type PitZoneStatus = 'optimal' | 'high' | 'low';

export interface PitZone {
  id: number;
  name: string;
  zoneName: string;
  height: number;
  heightPercent: number;
  fermentationDays: number;
  calorificValue: number;
  averageCalorificValue: number;
  wasteType: WasteType;
  color: string;
  position: { x: number; z: number };
  blendRatio: number;
  status: PitZoneStatus;
  currentVolume: number;
  capacity: number;
}

export type DeviceStatus = 'normal' | 'warning' | 'alarm';

export interface Incinerator {
  id: number;
  name: string;
  furnaceTemperature: number;
  oxygenContent: number;
  steamFlow: number;
  feedRate: number;
  damperOpening: number;
  runningHours: number;
  status: DeviceStatus;
  position: { x: number; y: number; z: number };
}

export interface Turbine {
  id: number;
  name: string;
  vibration: number;
  powerOutput: number;
  rpm: number;
  loadPercent: number;
  runningHours: number;
  status: DeviceStatus;
  position: { x: number; y: number; z: number };
}

export interface FlueGasEmission {
  so2: number;
  nox: number;
  particulate: number;
  timestamp: Date;
}

export interface FlueGasSystem {
  id: number;
  emission: FlueGasEmission;
  desulfurizationRunning: boolean;
  denitrificationRunning: boolean;
  sprayActive: boolean;
  status: DeviceStatus;
  position: { x: number; y: number; z: number };
}

export type AshBinStatus = 'normal' | 'warning' | 'full';

export interface AshBin {
  id: number;
  name: string;
  capacity: number;
  currentLevel: number;
  fillPercent: number;
  status: AshBinStatus;
  dispatchTruck?: string;
  position: { x: number; y: number; z: number };
}

export type AlarmType = 'temperature' | 'oxygen' | 'vibration' | 'emission' | 'capacity' | 'lifetime';
export type AlarmLevel = 'info' | 'warning' | 'critical';

export interface Alarm {
  id: string;
  type: AlarmType;
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  level: AlarmLevel;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export type WorkOrderType = 'repair' | 'overhaul' | 'maintenance';
export type WorkOrderStatus = 'pending' | 'in-progress' | 'completed';

export interface WorkOrder {
  id: string;
  deviceId: string;
  deviceName: string;
  type: WorkOrderType;
  description: string;
  parts: string[];
  status: WorkOrderStatus;
  createdAt: Date;
  completedAt?: Date;
}

export interface DailyReport {
  date: Date;
  totalWasteProcessed: number;
  totalPowerGenerated: number;
  avgEmission: { so2: number; nox: number; particulate: number };
  alarmCount: { info: number; warning: number; critical: number };
  deviceExceptionCount: number;
  truckCount: number;
}

export interface BlendingRatio {
  highHeat: number;
  mediumHeat: number;
  lowHeat: number;
}

export interface EmissionHistory {
  timestamp: Date;
  so2: number;
  nox: number;
  particulate: number;
}

export interface TemperatureHistory {
  timestamp: Date;
  temperature: number;
  oxygen: number;
}
