import { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { Wind, Droplets, AlertTriangle, Shield, Clock, Send, X, Activity } from 'lucide-react';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useAlarmStore } from '@/store/useAlarmStore';

interface HistoryData {
  time: string;
  so2: number;
  nox: number;
  particulate: number;
}

export default function FlueGas() {
  const { flueGasSystems, simulateRealTimeData } = useDeviceStore();
  const { alarms, addAlarm } = useAlarmStore();
  const [selectedId, setSelectedId] = useState(1);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [showEpaModal, setShowEpaModal] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const selected = flueGasSystems.find(f => f.id === selectedId) || flueGasSystems[0];

  useEffect(() => {
    const initialData: HistoryData[] = [];
    const now = new Date();
    for (let i = 19; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 30000);
      initialData.push({
        time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        so2: 30 + Math.random() * 50,
        nox: 100 + Math.random() * 150,
        particulate: 5 + Math.random() * 15
      });
    }
    setHistoryData(initialData);
  }, [selectedId]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      simulateRealTimeData();
      setHistoryData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          so2: selected?.emission.so2 || 50,
          nox: selected?.emission.nox || 180,
          particulate: selected?.emission.particulate || 10
        });
        return newData;
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selected, simulateRealTimeData]);

  const statusColors = {
    normal: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: '达标排放' },
    warning: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: '接近限值' },
    alarm: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: '超标排放' }
  };

  const status = statusColors[selected?.status || 'normal'];

  const emissionOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: '#374151',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['SO₂(mg/m³)', 'NOx(mg/m³)', '颗粒物(mg/m³)'],
      textStyle: { color: '#9CA3AF' },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: historyData.map(d => d.time),
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6B7280', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 350,
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6B7280' },
      splitLine: { lineStyle: { color: '#1F2937' } }
    },
    series: [
      {
        name: 'SO₂(mg/m³)',
        type: 'line',
        smooth: true,
        data: historyData.map(d => d.so2),
        lineStyle: { color: '#F59E0B', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245,158,11,0.3)' },
              { offset: 1, color: 'rgba(245,158,11,0)' }
            ]
          }
        },
        itemStyle: { color: '#F59E0B' },
        markLine: {
          silent: true,
          data: [{ yAxis: 80, lineStyle: { color: '#F59E0B', type: 'dashed' }, label: { formatter: 'SO₂限值 80', color: '#F59E0B' } }]
        }
      },
      {
        name: 'NOx(mg/m³)',
        type: 'line',
        smooth: true,
        data: historyData.map(d => d.nox),
        lineStyle: { color: '#8B5CF6', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(139,92,246,0.3)' },
              { offset: 1, color: 'rgba(139,92,246,0)' }
            ]
          }
        },
        itemStyle: { color: '#8B5CF6' },
        markLine: {
          silent: true,
          data: [{ yAxis: 250, lineStyle: { color: '#8B5CF6', type: 'dashed' }, label: { formatter: 'NOx限值 250', color: '#8B5CF6' } }]
        }
      },
      {
        name: '颗粒物(mg/m³)',
        type: 'line',
        smooth: true,
        data: historyData.map(d => d.particulate),
        lineStyle: { color: '#06B6D4', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6,182,212,0.3)' },
              { offset: 1, color: 'rgba(6,182,212,0)' }
            ]
          }
        },
        itemStyle: { color: '#06B6D4' },
        markLine: {
          silent: true,
          data: [{ yAxis: 18, lineStyle: { color: '#06B6D4', type: 'dashed' }, label: { formatter: '颗粒物限值 18', color: '#06B6D4' } }]
        }
      }
    ]
  };

  const efficiencyOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.8)', textStyle: { color: '#fff' } },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#9CA3AF' }
    },
    series: [
      {
        name: '净化效率',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#111827',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' }
        },
        labelLine: { show: false },
        data: [
          { value: 95, name: '脱硫效率', itemStyle: { color: '#10B981' } },
          { value: 5, name: '剩余SO₂', itemStyle: { color: '#374151' } }
        ]
      }
    ]
  };

  const relatedAlarms = alarms.filter(a => a.deviceType === 'flueGas' && a.deviceId === selected?.id.toString()).slice(0, 5);

  const isOverLimit = () => {
    if (!selected) return false;
    return selected.emission.so2 > 80 || selected.emission.nox > 250 || selected.emission.particulate > 18;
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-tech text-2xl font-bold text-white">烟气净化系统监控中心</h1>
          <p className="text-gray-400 mt-1">实时监测烟气排放指标，确保环保达标排放</p>
        </div>
        <button
          onClick={() => setShowEpaModal(true)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            isOverLimit()
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/30 animate-pulse'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30'
          }`}
        >
          <Send className="w-4 h-4" />
          {isOverLimit() ? '超标报告环保局' : '数据同步环保局'}
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        {flueGasSystems.map((fg) => (
          <button
            key={fg.id}
            onClick={() => setSelectedId(fg.id)}
            className={`flex-1 p-4 rounded-xl border transition-all ${
              selectedId === fg.id
                ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/20'
                : 'card-bg border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-tech font-bold text-white">{fg.name}</span>
              <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[fg.status].bg} ${statusColors[fg.status].text} ${statusColors[fg.status].border}`}>
                {statusColors[fg.status].label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-sm">
              <div>
                <span className="text-gray-500 text-xs">SO₂</span>
                <p className={`font-tech font-bold ${fg.emission.so2 > 80 ? 'text-red-400' : 'text-white'}`}>
                  {fg.emission.so2.toFixed(0)}
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">NOx</span>
                <p className={`font-tech font-bold ${fg.emission.nox > 250 ? 'text-red-400' : 'text-white'}`}>
                  {fg.emission.nox.toFixed(0)}
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">颗粒物</span>
                <p className={`font-tech font-bold ${fg.emission.particulate > 18 ? 'text-red-400' : 'text-white'}`}>
                  {fg.emission.particulate.toFixed(0)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Wind className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">SO₂排放</p>
              <p className={`font-tech text-2xl font-bold ${selected?.emission.so2 > 80 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {selected?.emission.so2.toFixed(1)}
                <span className="text-sm font-normal text-gray-400 ml-1">mg/m³</span>
              </p>
            </div>
          </div>
          <div className="mt-2 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${selected?.emission.so2 > 80 ? 'bg-red-500' : 'bg-yellow-500'}`}
              style={{ width: `${Math.min((selected?.emission.so2 || 0) / 100 * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">限值: 80 mg/m³</p>
        </div>

        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Wind className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">NOx排放</p>
              <p className={`font-tech text-2xl font-bold ${selected?.emission.nox > 250 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {selected?.emission.nox.toFixed(1)}
                <span className="text-sm font-normal text-gray-400 ml-1">mg/m³</span>
              </p>
            </div>
          </div>
          <div className="mt-2 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${selected?.emission.nox > 250 ? 'bg-red-500' : 'bg-purple-500'}`}
              style={{ width: `${Math.min((selected?.emission.nox || 0) / 300 * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">限值: 250 mg/m³</p>
        </div>

        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-cyan-500/10">
              <Droplets className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">颗粒物排放</p>
              <p className={`font-tech text-2xl font-bold ${selected?.emission.particulate > 18 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {selected?.emission.particulate.toFixed(1)}
                <span className="text-sm font-normal text-gray-400 ml-1">mg/m³</span>
              </p>
            </div>
          </div>
          <div className="mt-2 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${selected?.emission.particulate > 18 ? 'bg-red-500' : 'bg-cyan-500'}`}
              style={{ width: `${Math.min((selected?.emission.particulate || 0) / 25 * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">限值: 18 mg/m³</p>
        </div>

        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">系统状态</p>
              <p className={`font-tech text-2xl font-bold ${status.text}`}>{status.label}</p>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <span className={`text-xs px-2 py-0.5 rounded ${selected?.desulfurizationRunning ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
              脱硫{selected?.desulfurizationRunning ? '运行' : '待机'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${selected?.denitrificationRunning ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
              脱硝{selected?.denitrificationRunning ? '运行' : '待机'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4">
          <div className="card-bg rounded-xl border border-gray-700 p-4 flex-1">
            <h3 className="font-medium text-white mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              烟气排放浓度实时趋势
            </h3>
            <ReactECharts option={emissionOption} style={{ height: '100%', minHeight: '200px' }} theme="dark" />
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="card-bg rounded-xl border border-gray-700 p-4">
              <h3 className="font-medium text-white mb-2">脱硫效率</h3>
              <ReactECharts option={efficiencyOption} style={{ height: '150px' }} theme="dark" />
            </div>
            <div className="card-bg rounded-xl border border-gray-700 p-4">
              <h3 className="font-medium text-white mb-2">运行信息</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">喷淋状态</span>
                  <span className={`font-medium ${selected?.sprayActive ? 'text-green-400' : 'text-gray-500'}`}>
                    {selected?.sprayActive ? '喷淋中' : '未喷淋'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">脱硫剂用量</span>
                  <span className="text-white font-medium">2.5 t/h</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">脱硝剂用量</span>
                  <span className="text-white font-medium">1.8 t/h</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">烟气流量</span>
                  <span className="text-white font-medium">60万 m³/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-80 flex flex-col gap-4">
          <div className="card-bg rounded-xl border border-gray-700 p-5">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              排放标准限值
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-black/30 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-sm">二氧化硫 SO₂</span>
                  <span className="text-yellow-400 font-tech">≤ 80 mg/m³</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${selected?.emission.so2 > 80 ? 'bg-red-500' : 'bg-yellow-500'}`}
                    style={{ width: `${Math.min((selected?.emission.so2 || 0) / 80 * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="p-3 bg-black/30 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-sm">氮氧化物 NOx</span>
                  <span className="text-purple-400 font-tech">≤ 250 mg/m³</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${selected?.emission.nox > 250 ? 'bg-red-500' : 'bg-purple-500'}`}
                    style={{ width: `${Math.min((selected?.emission.nox || 0) / 250 * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="p-3 bg-black/30 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-sm">颗粒物</span>
                  <span className="text-cyan-400 font-tech">≤ 18 mg/m³</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${selected?.emission.particulate > 18 ? 'bg-red-500' : 'bg-cyan-500'}`}
                    style={{ width: `${Math.min((selected?.emission.particulate || 0) / 18 * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card-bg rounded-xl border border-gray-700 p-5 flex-1 overflow-hidden flex flex-col">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              报警与环保局通知
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {relatedAlarms.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">暂无排放超标报警</p>
              ) : (
                relatedAlarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className={`p-3 rounded-lg border ${
                      alarm.level === 'critical'
                        ? 'bg-red-500/10 border-red-500/30'
                        : alarm.level === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <p className="text-sm text-white mb-1">{alarm.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alarm.timestamp).toLocaleString('zh-CN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showEpaModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card-bg rounded-2xl border border-gray-700 p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-tech text-lg font-bold text-white">环保局数据报送</h3>
              <button onClick={() => setShowEpaModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                <p className="text-green-400 font-medium mb-2">当前排放状态</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">SO₂</span>
                    <span className={selected?.emission.so2 > 80 ? 'text-red-400' : 'text-green-400'}>
                      {selected?.emission.so2.toFixed(1)} mg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">NOx</span>
                    <span className={selected?.emission.nox > 250 ? 'text-red-400' : 'text-green-400'}>
                      {selected?.emission.nox.toFixed(1)} mg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">颗粒物</span>
                    <span className={selected?.emission.particulate > 18 ? 'text-red-400' : 'text-green-400'}>
                      {selected?.emission.particulate.toFixed(1)} mg/m³
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">报送说明</label>
                <textarea
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white resize-none h-20"
                  placeholder="请输入报送说明..."
                  defaultValue={isOverLimit() ? '排放超标紧急报告，已启动应急处理措施' : '日常排放数据同步，各项指标达标'}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEpaModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    addAlarm('epa', selected.id.toString(), selected.name, 'flueGas', 'info',
                      isOverLimit() ? '超标报告已发送至环保局' : '排放数据已同步至环保局');
                    setShowEpaModal(false);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    isOverLimit()
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/30'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30'
                  }`}
                >
                  确认报送
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
