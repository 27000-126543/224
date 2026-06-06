import { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { Thermometer, Wind, Droplets, Flame, AlertTriangle, Clock, Settings, Activity, X } from 'lucide-react';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useAlarmStore } from '@/store/useAlarmStore';
import type { Incinerator } from '@/types';

interface HistoryData {
  time: string;
  temp: number;
  oxygen: number;
  steam: number;
}

export default function Incinerators() {
  const { incinerators, simulateRealTimeData } = useDeviceStore();
  const { alarms, addAlarm } = useAlarmStore();
  const [selectedId, setSelectedId] = useState(1);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const selected = incinerators.find(i => i.id === selectedId) || incinerators[0];

  useEffect(() => {
    const initialData: HistoryData[] = [];
    const now = new Date();
    for (let i = 19; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 30000);
      initialData.push({
        time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temp: 900 + Math.random() * 150,
        oxygen: 7 + Math.random() * 4,
        steam: 50 + Math.random() * 20
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
          temp: selected?.furnaceTemperature || 950,
          oxygen: selected?.oxygenContent || 8,
          steam: selected?.steamFlow || 60
        });
        return newData;
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selected, simulateRealTimeData]);

  const statusColors = {
    normal: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: '正常运行' },
    warning: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: '预警状态' },
    alarm: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: '报警状态' }
  };

  const status = statusColors[selected?.status || 'normal'];

  const trendOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: '#374151',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['炉膛温度(℃)', '含氧量(%)', '蒸汽流量(t/h)'],
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
    yAxis: [
      {
        type: 'value',
        name: '温度/流量',
        min: 0,
        max: 1200,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#6B7280' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      {
        type: 'value',
        name: '含氧量',
        min: 0,
        max: 15,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#6B7280' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '炉膛温度(℃)',
        type: 'line',
        smooth: true,
        data: historyData.map(d => d.temp),
        lineStyle: { color: '#EF4444', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239,68,68,0.3)' },
              { offset: 1, color: 'rgba(239,68,68,0)' }
            ]
          }
        },
        itemStyle: { color: '#EF4444' },
        markLine: {
          silent: true,
          data: [{ yAxis: 1000, lineStyle: { color: '#EF4444', type: 'dashed' }, label: { formatter: '1000℃警戒线', color: '#EF4444' } }]
        }
      },
      {
        name: '含氧量(%)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: historyData.map(d => d.oxygen),
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
          data: [{ yAxis: 6, lineStyle: { color: '#06B6D4', type: 'dashed' }, label: { formatter: '6%警戒线', color: '#06B6D4' } }]
        }
      },
      {
        name: '蒸汽流量(t/h)',
        type: 'line',
        smooth: true,
        data: historyData.map(d => d.steam),
        lineStyle: { color: '#F59E0B', width: 2 },
        itemStyle: { color: '#F59E0B' }
      }
    ]
  };

  const feedDamperOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', textStyle: { color: '#fff' } },
    legend: { data: ['给料量(t/h)', '风门开度(%)'], textStyle: { color: '#9CA3AF' }, top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: historyData.map(d => d.time),
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6B7280', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 120,
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6B7280' },
      splitLine: { lineStyle: { color: '#1F2937' } }
    },
    series: [
      {
        name: '给料量(t/h)',
        type: 'bar',
        data: historyData.map(() => selected?.feedRate || 80),
        itemStyle: { color: '#8B5CF6', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '风门开度(%)',
        type: 'line',
        smooth: true,
        data: historyData.map(() => selected?.damperOpening || 75),
        lineStyle: { color: '#10B981', width: 3 },
        itemStyle: { color: '#10B981' }
      }
    ]
  };

  const relatedAlarms = alarms.filter(a => a.deviceType === 'incinerator' && a.deviceId === selected?.id.toString()).slice(0, 5);

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-tech text-2xl font-bold text-white">焚烧炉监控中心</h1>
          <p className="text-gray-400 mt-1">实时监控焚烧炉运行参数，智能调节燃烧工况</p>
        </div>
        <button
          onClick={() => setShowAlarmModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg hover:shadow-red-500/30 transition-all"
        >
          <AlertTriangle className="w-4 h-4" />
          手动报警
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        {incinerators.map((inc) => (
          <button
            key={inc.id}
            onClick={() => setSelectedId(inc.id)}
            className={`flex-1 p-4 rounded-xl border transition-all ${
              selectedId === inc.id
                ? 'bg-cyan-500/20 border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                : 'card-bg border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-tech font-bold text-white">{inc.name}</span>
              <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[inc.status].bg} ${statusColors[inc.status].text} ${statusColors[inc.status].border}`}>
                {statusColors[inc.status].label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">炉温</span>
                <p className={`font-tech font-bold ${inc.furnaceTemperature > 1000 ? 'text-red-400' : 'text-white'}`}>
                  {inc.furnaceTemperature.toFixed(0)}℃
                </p>
              </div>
              <div>
                <span className="text-gray-500">含氧</span>
                <p className={`font-tech font-bold ${inc.oxygenContent < 6 ? 'text-yellow-400' : 'text-white'}`}>
                  {inc.oxygenContent.toFixed(1)}%
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-500/10">
              <Thermometer className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">炉膛温度</p>
              <p className={`font-tech text-2xl font-bold ${selected?.furnaceTemperature > 1000 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {selected?.furnaceTemperature.toFixed(1)}℃
              </p>
            </div>
          </div>
        </div>

        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-cyan-500/10">
              <Wind className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">含氧量</p>
              <p className={`font-tech text-2xl font-bold ${selected?.oxygenContent < 6 ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
                {selected?.oxygenContent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Droplets className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">蒸汽流量</p>
              <p className="font-tech text-2xl font-bold text-white">{selected?.steamFlow.toFixed(1)} t/h</p>
            </div>
          </div>
        </div>

        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">运行时长</p>
              <p className="font-tech text-2xl font-bold text-white">{selected?.runningHours.toFixed(0)} h</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4">
          <div className="card-bg rounded-xl border border-gray-700 p-4 flex-1">
            <h3 className="font-medium text-white mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              温度/含氧量/蒸汽流量趋势
            </h3>
            <ReactECharts option={trendOption} style={{ height: '100%', minHeight: '200px' }} theme="dark" />
          </div>

          <div className="card-bg rounded-xl border border-gray-700 p-4 flex-1">
            <h3 className="font-medium text-white mb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              给料量与风门开度
            </h3>
            <ReactECharts option={feedDamperOption} style={{ height: '100%', minHeight: '200px' }} theme="dark" />
          </div>
        </div>

        <div className="w-80 flex flex-col gap-4">
          <div className="card-bg rounded-xl border border-gray-700 p-5">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              运行参数详情
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">设备状态</span>
                <span className={`px-2 py-0.5 rounded text-xs border ${status.bg} ${status.text} ${status.border}`}>
                  {status.label}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">给料量</span>
                <span className="text-white font-medium">{selected?.feedRate} t/h</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">风门开度</span>
                <span className="text-white font-medium">{selected?.damperOpening}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">运行负荷</span>
                <span className="text-white font-medium">85%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">累计运行</span>
                <span className="text-white font-medium">{selected?.runningHours.toFixed(1)} 小时</span>
              </div>
            </div>
          </div>

          <div className="card-bg rounded-xl border border-gray-700 p-5 flex-1 overflow-hidden flex flex-col">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              相关报警记录
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {relatedAlarms.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">暂无报警记录</p>
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

      {showAlarmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card-bg rounded-2xl border border-gray-700 p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-tech text-lg font-bold text-white">手动推送报警</h3>
              <button onClick={() => setShowAlarmModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">报警类型</label>
                <select className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white">
                  <option>温度超限</option>
                  <option>含氧量偏低</option>
                  <option>设备故障</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">报警级别</label>
                <select className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white">
                  <option value="info">提示</option>
                  <option value="warning">预警</option>
                  <option value="critical">严重</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">备注信息</label>
                <textarea
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white resize-none h-20"
                  placeholder="请输入报警备注..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlarmModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    addAlarm('manual', selected.id.toString(), selected.name, 'incinerator', 'warning', '手动报警：焚烧炉异常');
                    setShowAlarmModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all"
                >
                  确认报警
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
