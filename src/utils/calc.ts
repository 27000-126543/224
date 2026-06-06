import type { Truck, PitZone, BlendingRatio } from '@/types';

export function calculateOptimalPort(truck: Truck, zones: PitZone[]): number {
  const targetCalorificMin = 1800;
  const targetCalorificMax = 2200;
  const truckCV = truck.calorificValue;

  let bestPort = 1;
  let bestScore = -Infinity;

  zones.forEach((zone, index) => {
    const port = index + 1;
    const avgCV = (zone.calorificValue * zone.height + truckCV * truck.weight) / (zone.height + truck.weight / 10);
    
    let score = 0;
    if (avgCV >= targetCalorificMin && avgCV <= targetCalorificMax) {
      score += 100;
    } else {
      score -= Math.abs(avgCV - (targetCalorificMin + targetCalorificMax) / 2);
    }
    
    if (zone.height < 8) {
      score += 50;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestPort = port;
    }
  });

  return bestPort;
}

export function calculateBlendRatios(zones: PitZone[]): PitZone[] {
  const targetCV = 2000;
  const totalWeight = zones.reduce((sum, z) => sum + z.height, 0);
  
  let remainingRatio = 100;
  const sortedZones = [...zones].sort((a, b) => {
    const aPriority = a.fermentationDays >= 7 && a.fermentationDays <= 10 ? 1 : 0;
    const bPriority = b.fermentationDays >= 7 && b.fermentationDays <= 10 ? 1 : 0;
    return bPriority - aPriority;
  });

  return zones.map(zone => {
    const cvDiff = Math.abs(zone.calorificValue - targetCV);
    let baseRatio = Math.max(0, 30 - cvDiff / 50);
    
    if (zone.fermentationDays >= 7 && zone.fermentationDays <= 10) {
      baseRatio *= 1.3;
    }
    
    const zoneInSorted = sortedZones.find(z => z.id === zone.id);
    const sortedIndex = sortedZones.indexOf(zoneInSorted!);
    baseRatio *= (1 - sortedIndex * 0.1);
    
    return { ...zone, blendRatio: Math.round(baseRatio) };
  });
}

export function calculateBlendingRatio(zones: PitZone[]): BlendingRatio {
  const highHeatZones = zones.filter(z => z.averageCalorificValue >= 2000);
  const mediumHeatZones = zones.filter(z => z.averageCalorificValue >= 1500 && z.averageCalorificValue < 2000);
  const lowHeatZones = zones.filter(z => z.averageCalorificValue < 1500);
  
  const totalVolume = zones.reduce((sum, z) => sum + z.currentVolume, 0);
  const highVolume = highHeatZones.reduce((sum, z) => sum + z.currentVolume, 0);
  const mediumVolume = mediumHeatZones.reduce((sum, z) => sum + z.currentVolume, 0);
  const lowVolume = lowHeatZones.reduce((sum, z) => sum + z.currentVolume, 0);
  
  return {
    highHeat: Math.round((highVolume / totalVolume) * 100) || 35,
    mediumHeat: Math.round((mediumVolume / totalVolume) * 100) || 40,
    lowHeat: Math.round((lowVolume / totalVolume) * 100) || 25
  };
}

export function getWasteTypeName(type: string): string {
  const names: Record<string, string> = {
    domestic: '生活垃圾',
    kitchen: '厨余垃圾',
    industrial: '工业垃圾',
    recyclable: '可回收垃圾'
  };
  return names[type] || type;
}

export function getStatusName(status: string): string {
  const names: Record<string, string> = {
    waiting: '等待中',
    approaching: '前往卸料口',
    discharging: '卸料中',
    leaving: '离场',
    normal: '正常',
    warning: '预警',
    alarm: '报警',
    full: '已满'
  };
  return names[status] || status;
}

export function getRoleName(role: string): string {
  const names: Record<string, string> = {
    director: '厂长',
    manager: '部长',
    epa: '环保局'
  };
  return names[role] || role;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
