import { Layers, Thermometer, Clock, TrendingUp, Droplets, BarChart3 } from 'lucide-react';
import { useDeviceStore } from '@/store/useDeviceStore';
import { calculateBlendingRatio } from '@/utils/calc';

export default function PitMonitor() {
  const { pitZones } = useDeviceStore();
  
  const blendingRatio = calculateBlendingRatio(pitZones);
  const avgHeight = pitZones.reduce((s, z) => s + z.heightPercent, 0) / pitZones.length;
  const avgCalorific = pitZones.reduce((s, z) => s + z.averageCalorificValue, 0) / pitZones.length;
  const avgFermentation = pitZones.reduce((s, z) => s + z.fermentationDays, 0) / pitZones.length;

  const heightColors = [
    'from-red-500 to-red-600',
    'from-orange-500 to-orange-600',
    'from-yellow-500 to-yellow-600',
    'from-green-500 to-green-600',
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600'
  ];

  const calorificColors = (value: number) => {
    if (value >= 2000) return 'text-red-400 bg-red-500/20';
    if (value >= 1500) return 'text-orange-400 bg-orange-500/20';
    if (value >= 1000) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-tech text-2xl font-bold text-white">垃圾坑监控中心</h1>
          <p className="text-gray-400 mt-1">实时监控堆料高度、发酵天数、热值分布，智能计算最佳掺烧比例</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card-bg rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-sm text-gray-400">平均堆高</span>
          </div>
          <p className="font-tech text-3xl font-bold text-white">{avgHeight.toFixed(1)}%</p>
        </div>
        
        <div className="card-bg rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Thermometer className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-sm text-gray-400">平均热值</span>
          </div>
          <p className="font-tech text-3xl font-bold text-white">{avgCalorific.toFixed(0)} <span className="text-sm font-normal text-gray-400">kcal/kg</span></p>
        </div>
        
        <div className="card-bg rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-gray-400">平均发酵天数</span>
          </div>
          <p className="font-tech text-3xl font-bold text-white">{avgFermentation.toFixed(0)} <span className="text-sm font-normal text-gray-400">天</span></p>
        </div>
        
        <div className="card-bg rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-gray-400">掺烧比例</span>
          </div>
          <p className="font-tech text-3xl font-bold text-white">{blendingRatio.highHeat}:{blendingRatio.mediumHeat}:{blendingRatio.lowHeat}</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* 左侧：分区可视化 */}
        <div className="flex-1 flex flex-col">
          <div className="card-bg rounded-xl border border-gray-700 flex-1 p-6">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              料坑分区状态
            </h3>
            
            <div className="grid grid-cols-3 gap-4 h-full">
              {pitZones.map((zone, i) => (
                <div key={zone.id} className="relative bg-black/30 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-tech text-lg font-bold text-white">{zone.zoneName}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      zone.status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                      zone.status === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {zone.status === 'optimal' ? '最佳' : zone.status === 'high' ? '偏高' : '偏低'}
                    </span>
                  </div>
                  
                  {/* 堆料高度可视化 */}
                  <div className="flex-1 flex items-end gap-2 mb-4">
                    <div className="flex-1 h-full flex items-end">
                      <div
                        className={`w-full rounded-t-lg bg-gradient-to-t ${heightColors[i % heightColors.length]} transition-all duration-1000 relative`}
                        style={{ height: `${zone.heightPercent}%` }}
                      >
                        <div className="absolute inset-0 bg-white/10 animate-pulse rounded-t-lg" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-between h-full text-xs text-gray-500 py-1">
                      <span>100%</span>
                      <span>50%</span>
                      <span>0%</span>
                    </div>
                  </div>
                  
                  {/* 详细数据 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">堆料高度</span>
                      <span className="text-white font-medium">{zone.heightPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">发酵天数</span>
                      <span className="text-white font-medium">{zone.fermentationDays} 天</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">平均热值</span>
                      <span className={`font-medium px-1.5 py-0.5 rounded ${calorificColors(zone.averageCalorificValue)}`}>
                        {zone.averageCalorificValue} kcal/kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">当前存量</span>
                      <span className="text-white font-medium">{zone.currentVolume} m³</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：掺烧建议 */}
        <div className="w-80 flex flex-col gap-4">
          <div className="card-bg rounded-xl p-6 border border-gray-700">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-green-400" />
              智能掺烧建议
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                <p className="text-sm text-green-400 font-medium mb-2">推荐掺烧比例</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-8 rounded-lg bg-red-500/30 flex items-center justify-center">
                    <span className="text-xs text-red-300">高热值 {blendingRatio.highHeat}%</span>
                  </div>
                  <div className="flex-1 h-8 rounded-lg bg-yellow-500/30 flex items-center justify-center">
                    <span className="text-xs text-yellow-300">中热值 {blendingRatio.mediumHeat}%</span>
                  </div>
                  <div className="flex-1 h-8 rounded-lg bg-green-500/30 flex items-center justify-center">
                    <span className="text-xs text-green-300">低热值 {blendingRatio.lowHeat}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">建议说明</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    当前1#区热值偏高，建议增加3#区取料比例
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    4#区发酵充分，优先用于掺烧调节
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    预计可稳定炉温在 920-980℃ 区间
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 热值分布 */}
          <div className="card-bg rounded-xl p-6 border border-gray-700 flex-1">
            <h3 className="font-medium text-white mb-4">热值分布</h3>
            <div className="space-y-3">
              {pitZones.map((zone) => (
                <div key={zone.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">{zone.zoneName}</span>
                    <span className={calorificColors(zone.averageCalorificValue).split(' ')[0]}>
                      {zone.averageCalorificValue} kcal/kg
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                      style={{ width: `${(zone.averageCalorificValue / 2500) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>低 (800)</span>
                <span>中 (1500)</span>
                <span>高 (2500+)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
