import { useState } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Download,
  TrendingUp,
  Zap,
  Wind,
  Flame,
  AlertTriangle,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';
import { exportDailyReport, generateDailyReportData } from '@/utils/excel';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useAlarmStore } from '@/store/useAlarmStore';
import { cn } from '@/lib/utils';

export default function ReportExport() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  
  const { incinerators, turbines, flueGasSystems, trucks, workOrders } = useDeviceStore();
  const { alarms } = useAlarmStore();

  const todayData = {
    date: selectedDate,
    totalPowerGeneration: turbines.reduce((sum, t) => sum + t.powerOutput, 0) * 24,
    avgPower: turbines.reduce((sum, t) => sum + t.powerOutput, 0) / turbines.length,
    totalWasteProcessed: trucks.reduce((sum, t) => sum + t.weight, 0),
    avgTemperature: incinerators.reduce((sum, i) => sum + i.furnaceTemperature, 0) / incinerators.length,
    avgSO2: flueGasSystems.reduce((sum, f) => sum + f.emission.so2, 0) / flueGasSystems.length,
    avgNOx: flueGasSystems.reduce((sum, f) => sum + f.emission.nox, 0) / flueGasSystems.length,
    avgParticulate: flueGasSystems.reduce((sum, f) => sum + f.emission.particulate, 0) / flueGasSystems.length,
    totalAlarms: alarms.length,
    unresolvedAlarms: alarms.filter(a => !a.resolved).length,
    workOrdersCompleted: workOrders.filter(w => w.status === 'completed').length,
    workOrdersPending: workOrders.filter(w => w.status === 'pending').length,
    truckCount: trucks.length,
    incineratorEfficiency: 92.5,
    availability: 98.3
  };

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const reportData = generateDailyReportData(selectedDate);
      exportDailyReport(reportData);
      setGenerateSuccess(true);
      setTimeout(() => setGenerateSuccess(false), 3000);
    } catch (error) {
      console.error('导出失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const stats = [
    { label: '预计发电量', value: todayData.totalPowerGeneration.toFixed(1), unit: 'MWh', icon: Zap, color: 'cyan' },
    { label: '垃圾处理量', value: todayData.totalWasteProcessed, unit: '吨', icon: TrendingUp, color: 'green' },
    { label: '平均炉温', value: todayData.avgTemperature.toFixed(0), unit: '℃', icon: Flame, color: 'red' },
    { label: '报警次数', value: todayData.totalAlarms, unit: '次', icon: AlertTriangle, color: 'yellow' }
  ];

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-tech text-2xl font-bold text-white">运营报表管理</h1>
          <p className="text-gray-400 mt-1">导出每日运营数据Excel报表，支持历史数据查询</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-bg rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className={cn('p-3 rounded-lg',
                  stat.color === 'cyan' ? 'bg-cyan-500/10' :
                  stat.color === 'green' ? 'bg-green-500/10' :
                  stat.color === 'red' ? 'bg-red-500/10' :
                  'bg-yellow-500/10'
                )}>
                  <Icon className={cn('w-6 h-6',
                    stat.color === 'cyan' ? 'text-cyan-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    stat.color === 'red' ? 'text-red-400' :
                    'text-yellow-400'
                  )} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="font-tech text-2xl font-bold text-white">
                    {stat.value}
                    <span className="text-sm font-normal text-gray-400 ml-1">{stat.unit}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* 左侧：报表预览 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="card-bg rounded-xl border border-gray-700 flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-medium text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                报表预览
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white rounded-lg p-8 text-gray-800 max-w-4xl mx-auto shadow-lg">
                {/* 报表标题 */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">垃圾焚烧发电厂运营日报</h2>
                  <p className="text-gray-500 mt-2">报表日期：{selectedDate}</p>
                </div>

                {/* 发电数据 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">一、发电数据</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-600 w-1/3">总发电量</td>
                        <td className="py-2 font-medium">{todayData.totalPowerGeneration.toFixed(2)} MWh</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">平均负荷</td>
                        <td className="py-2 font-medium">{todayData.avgPower.toFixed(2)} MW</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">设备可用率</td>
                        <td className="py-2 font-medium text-green-600">{todayData.availability}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 垃圾处理 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">二、垃圾处理</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-600 w-1/3">进厂垃圾总量</td>
                        <td className="py-2 font-medium">{todayData.totalWasteProcessed} 吨</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">进厂车辆数</td>
                        <td className="py-2 font-medium">{todayData.truckCount} 辆</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">平均炉温</td>
                        <td className="py-2 font-medium">{todayData.avgTemperature.toFixed(1)} ℃</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">焚烧效率</td>
                        <td className="py-2 font-medium text-green-600">{todayData.incineratorEfficiency}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 环保排放 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">三、环保排放</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-600 border-b">
                        <th className="py-2 text-left">污染物</th>
                        <th className="py-2 text-left">日均值 (mg/m³)</th>
                        <th className="py-2 text-left">排放标准</th>
                        <th className="py-2 text-left">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2">SO₂</td>
                        <td className="py-2 font-medium">{todayData.avgSO2.toFixed(2)}</td>
                        <td className="py-2 text-gray-500">≤80</td>
                        <td className="py-2">
                          <span className={todayData.avgSO2 <= 80 ? 'text-green-600' : 'text-red-600'}>
                            {todayData.avgSO2 <= 80 ? '达标' : '超标'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2">NOx</td>
                        <td className="py-2 font-medium">{todayData.avgNOx.toFixed(2)}</td>
                        <td className="py-2 text-gray-500">≤250</td>
                        <td className="py-2">
                          <span className={todayData.avgNOx <= 250 ? 'text-green-600' : 'text-red-600'}>
                            {todayData.avgNOx <= 250 ? '达标' : '超标'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2">颗粒物</td>
                        <td className="py-2 font-medium">{todayData.avgParticulate.toFixed(2)}</td>
                        <td className="py-2 text-gray-500">≤18</td>
                        <td className="py-2">
                          <span className={todayData.avgParticulate <= 18 ? 'text-green-600' : 'text-red-600'}>
                            {todayData.avgParticulate <= 18 ? '达标' : '超标'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 设备异常 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">四、设备异常统计</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-600 w-1/3">报警总数</td>
                        <td className="py-2 font-medium">{todayData.totalAlarms} 次</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">未处理报警</td>
                        <td className="py-2 font-medium">
                          <span className={todayData.unresolvedAlarms > 0 ? 'text-red-600' : 'text-green-600'}>
                            {todayData.unresolvedAlarms} 次
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">待处理工单</td>
                        <td className="py-2 font-medium">{todayData.workOrdersPending} 单</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">已完成工单</td>
                        <td className="py-2 font-medium text-green-600">{todayData.workOrdersCompleted} 单</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 底部签名 */}
                <div className="mt-8 pt-4 border-t flex justify-between text-sm text-gray-500">
                  <span>生成时间：{new Date().toLocaleString()}</span>
                  <span>系统自动生成</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：导出操作 */}
        <div className="w-80 flex flex-col gap-4">
          <div className="card-bg rounded-xl p-6 border border-gray-700">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-400" />
              导出报表
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">选择日期</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">报表类型</label>
                <select className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500">
                  <option value="daily">运营日报</option>
                  <option value="weekly">运营周报</option>
                  <option value="monthly">运营月报</option>
                  <option value="environmental">环保专项报表</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">导出格式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2.5 px-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel
                  </button>
                  <button className="py-2.5 px-4 bg-gray-700 border border-gray-600 text-gray-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={isGenerating}
                className={cn(
                  'w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all',
                  isGenerating
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : generateSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30'
                )}
              >
                {isGenerating ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    生成中...
                  </>
                ) : generateSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    导出成功
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    导出Excel报表
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 历史报表 */}
          <div className="card-bg rounded-xl p-6 border border-gray-700 flex-1 overflow-hidden flex flex-col">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              历史报表
            </h3>
            <div className="space-y-2 overflow-y-auto flex-1">
              {[
                { date: '2025-01-19', name: '运营日报', size: '2.3 MB' },
                { date: '2025-01-18', name: '运营日报', size: '2.1 MB' },
                { date: '2025-01-17', name: '运营日报', size: '2.4 MB' },
                { date: '2025-01-16', name: '环保专项报表', size: '1.8 MB' },
                { date: '2025-01-15', name: '运营日报', size: '2.2 MB' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-black/30 rounded-lg flex items-center justify-between hover:bg-black/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm text-white">{item.date}</p>
                      <p className="text-xs text-gray-500">{item.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{item.size}</span>
                    <Download className="w-4 h-4 text-gray-400 hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
