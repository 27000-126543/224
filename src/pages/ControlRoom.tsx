import { useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  Truck,
  Flame,
  Wind,
  Clock,
  Thermometer,
  Droplets,
  Gauge,
  AlertTriangle,
  Plus
} from 'lucide-react';
import Scene from '@/scene/Scene';
import StatCard from '@/components/panels/StatCard';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useAlarmStore } from '@/store/useAlarmStore';
import { getWasteTypeName, getStatusName } from '@/utils/calc';

export default function ControlRoom() {
  const {
    trucks,
    incinerators,
    turbines,
    flueGasSystems,
    ashBins,
    pitZones,
    workOrders,
    simulateRealTimeData,
    addTruck
  } = useDeviceStore();

  const { getUnresolvedCount, alarms } = useAlarmStore();
  const alarmCounts = getUnresolvedCount();

  useEffect(() => {
    const interval = setInterval(() => {
      simulateRealTimeData();
    }, 2000);
    return () => clearInterval(interval);
  }, [simulateRealTimeData]);

  const totalPower = turbines.reduce((sum, t) => sum + t.powerOutput, 0);
  const totalWasteProcessed = incinerators.reduce((sum, i) => sum + i.feedRate, 0);
  const avgTemp = incinerators.reduce((sum, i) => sum + i.furnaceTemperature, 0) / incinerators.length;
  const activeTrucks = trucks.filter(t => t.status !== 'leaving').length;
  const pendingWorkOrders = workOrders.filter(w => w.status === 'pending').length;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* 顶部统计卡片 */}
      <div className="p-4 pb-2">
        <div className="grid grid-cols-6 gap-4">
          <StatCard
            title="实时发电量"
            value={totalPower.toFixed(1)}
            unit="MW"
            icon={<Zap className="w-6 h-6 text-cyan-400" />}
            trend="up"
            trendValue="2.3%"
            color="cyan"
          />
          <StatCard
            title="垃圾处理量"
            value={Math.round(totalWasteProcessed)}
            unit="t/h"
            icon={<TrendingUp className="w-6 h-6 text-green-400" />}
            trend="up"
            trendValue="5.1%"
            color="green"
          />
          <StatCard
            title="在厂车辆"
            value={activeTrucks}
            unit="辆"
            icon={<Truck className="w-6 h-6 text-yellow-400" />}
            color="yellow"
          />
          <StatCard
            title="平均炉温"
            value={avgTemp.toFixed(0)}
            unit="℃"
            icon={<Thermometer className="w-6 h-6 text-red-400" />}
            color="red"
          />
          <StatCard
            title="待处理报警"
            value={alarmCounts.warning + alarmCounts.critical}
            unit="条"
            icon={<AlertTriangle className="w-6 h-6 text-orange-400" />}
            color="yellow"
          />
          <StatCard
            title="待处理工单"
            value={pendingWorkOrders}
            unit="单"
            icon={<Clock className="w-6 h-6 text-purple-400" />}
            color="purple"
          />
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex gap-4 px-4 pb-2 overflow-hidden">
        {/* 左侧信息面板 */}
        <div className="w-72 flex flex-col gap-4 overflow-y-auto pr-2">
          {/* 焚烧炉状态 */}
          <div className="card-bg rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                焚烧炉状态
              </h3>
            </div>
            <div className="space-y-3">
              {incinerators.map((inc) => (
                <div key={inc.id} className="p-3 bg-black/30 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{inc.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      inc.status === 'alarm' ? 'bg-red-500/20 text-red-400' :
                      inc.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {getStatusName(inc.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-red-400" />
                      <span className="text-gray-400">温度:</span>
                      <span className={inc.furnaceTemperature > 1000 ? 'text-red-400' : 'text-white'}>
                        {inc.furnaceTemperature.toFixed(0)}℃
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="w-3 h-3 text-blue-400" />
                      <span className="text-gray-400">氧:</span>
                      <span className={inc.oxygenContent < 6 ? 'text-red-400' : 'text-white'}>
                        {inc.oxygenContent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      <span className="text-gray-400">蒸汽:</span>
                      <span className="text-white">{inc.steamFlow.toFixed(0)}t/h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-green-400" />
                      <span className="text-gray-400">给料:</span>
                      <span className="text-white">{inc.feedRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 烟气排放 */}
          <div className="card-bg rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                烟气排放
              </h3>
            </div>
            {flueGasSystems.map((fg) => (
              <div key={fg.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">SO₂</span>
                  <span className={`font-tech ${fg.emission.so2 > 80 ? 'text-red-400' : 'text-green-400'}`}>
                    {fg.emission.so2.toFixed(1)} mg/m³
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${fg.emission.so2 > 80 ? 'bg-red-500' : 'bg-green-500'} transition-all`}
                    style={{ width: `${Math.min(fg.emission.so2, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">NOx</span>
                  <span className={`font-tech ${fg.emission.nox > 250 ? 'text-red-400' : 'text-green-400'}`}>
                    {fg.emission.nox.toFixed(1)} mg/m³
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${fg.emission.nox > 250 ? 'bg-red-500' : 'bg-green-500'} transition-all`}
                    style={{ width: `${Math.min(fg.emission.nox / 3, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">颗粒物</span>
                  <span className={`font-tech ${fg.emission.particulate > 18 ? 'text-red-400' : 'text-green-400'}`}>
                    {fg.emission.particulate.toFixed(1)} mg/m³
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${fg.emission.particulate > 18 ? 'bg-red-500' : 'bg-green-500'} transition-all`}
                    style={{ width: `${Math.min(fg.emission.particulate * 5, 100)}%` }}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                    fg.desulfurizationRunning ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${fg.desulfurizationRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                    脱硫
                  </span>
                  <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                    fg.denitrificationRunning ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${fg.denitrificationRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                    脱硝
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中间3D场景 */}
        <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-700">
          <Scene />
          
          {/* 场景控制按钮 */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={addTruck}
              className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              调度车辆
            </button>
          </div>
        </div>

        {/* 右侧信息面板 */}
        <div className="w-72 flex flex-col gap-4 overflow-y-auto pl-2">
          {/* 垃圾车列表 */}
          <div className="card-bg rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-yellow-400" />
                在厂车辆
              </h3>
              <span className="text-xs text-gray-400">{activeTrucks} 辆</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trucks.slice(0, 5).map((truck) => (
                <div key={truck.id} className="p-2 bg-black/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-cyan-400 font-tech">{truck.plateNumber}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      truck.status === 'discharging' ? 'bg-yellow-500/20 text-yellow-400' :
                      truck.status === 'approaching' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {getStatusName(truck.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <p>来源: {truck.source}</p>
                    <p>类型: {getWasteTypeName(truck.wasteType)} | {truck.weight}吨</p>
                    {truck.assignedPort && (
                      <p className="text-green-400">卸料口: {truck.assignedPort}#</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 灰渣仓状态 */}
          <div className="card-bg rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-purple-400" />
                灰渣仓状态
              </h3>
            </div>
            <div className="space-y-4">
              {ashBins.map((ab) => (
                <div key={ab.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{ab.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      ab.status === 'full' ? 'bg-red-500/20 text-red-400' :
                      ab.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {getStatusName(ab.status)}
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        ab.status === 'full' ? 'bg-red-500' :
                        ab.status === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${ab.fillPercent}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {ab.fillPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{ab.currentLevel} / {ab.capacity} 吨</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最新报警 */}
          <div className="card-bg rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                最新报警
              </h3>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {alarms.filter(a => !a.resolved).slice(0, 4).map((alarm) => (
                <div key={alarm.id} className={`p-2 rounded-lg border-l-2 ${
                  alarm.level === 'critical' ? 'bg-red-500/10 border-red-500' :
                  alarm.level === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
                  'bg-blue-500/10 border-blue-500'
                }`}>
                  <p className="text-sm text-white line-clamp-1">{alarm.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alarm.deviceName}</p>
                </div>
              ))}
              {alarms.filter(a => !a.resolved).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">暂无报警</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
