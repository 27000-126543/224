import * as XLSX from 'xlsx';
import type { DailyReport } from '@/types';
import { formatDate } from './calc';

export function exportDailyReport(report: DailyReport) {
  const dateStr = formatDate(report.date);
  
  const data = [
    ['垃圾焚烧发电厂运营日报'],
    [`日期: ${dateStr}`],
    [],
    ['一、生产运营数据'],
    ['指标', '数值', '单位'],
    ['垃圾处理总量', report.totalWasteProcessed, '吨'],
    ['发电总量', report.totalPowerGenerated, 'MWh'],
    ['进厂垃圾车数量', report.truckCount, '辆'],
    [],
    ['二、环保排放指标（日均）'],
    ['指标', '数值', '单位', '标准限值', '是否达标'],
    ['SO₂', report.avgEmission.so2.toFixed(2), 'mg/m³', '80', report.avgEmission.so2 <= 80 ? '是' : '否'],
    ['NOx', report.avgEmission.nox.toFixed(2), 'mg/m³', '250', report.avgEmission.nox <= 250 ? '是' : '否'],
    ['颗粒物', report.avgEmission.particulate.toFixed(2), 'mg/m³', '18', report.avgEmission.particulate <= 18 ? '是' : '否'],
    [],
    ['三、设备异常统计'],
    ['类型', '数量'],
    ['信息提示', report.alarmCount.info, '次'],
    ['预警报警', report.alarmCount.warning, '次'],
    ['严重报警', report.alarmCount.critical, '次'],
    ['设备异常', report.deviceExceptionCount, '次'],
    [],
    ['四、备注'],
    ['本报表由系统自动生成，数据真实有效。']
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '运营日报');
  
  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 }
  ];
  
  XLSX.writeFile(wb, `垃圾焚烧发电厂运营日报_${dateStr}.xlsx`);
}

export function generateDailyReportData(dateStr: string): DailyReport {
  return {
    date: new Date(dateStr),
    totalWasteProcessed: Math.floor(Math.random() * 500 + 1000),
    totalPowerGenerated: Math.floor(Math.random() * 200 + 500),
    avgEmission: {
      so2: 20 + Math.random() * 20,
      nox: 70 + Math.random() * 40,
      particulate: 6 + Math.random() * 8
    },
    alarmCount: {
      info: Math.floor(Math.random() * 3),
      warning: Math.floor(Math.random() * 5),
      critical: Math.floor(Math.random() * 2)
    },
    deviceExceptionCount: Math.floor(Math.random() * 3),
    truckCount: Math.floor(Math.random() * 30 + 50)
  };
}
