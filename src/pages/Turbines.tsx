import { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { Zap, Activity, Gauge, Clock, AlertTriangle, Settings, Wrench, X, BarChart3 } from 'lucide-react';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useAlarmStore } from '@/store/useAlarmStore';

interface HistoryData {
  time: string;
  power: number;
  vibration: number;
  load: number;
}

export default function Turbines() {
  const { turbines, simulateRealTimeData, addWorkOrder } = useDeviceStore();
  const { alarms, addAlarm } = useAlarmStore();
  const [selectedId, setSelectedId] = useState(1);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const selected = turbines.find(t => t.id === selectedId) || turbines[0];

  useEffect(() => {
    const initialData: HistoryData[] = [];
    const now = new Date();
    for (let i = 19; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 30000);
      initialData.push({
        time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        power: 20 + Math.random() * 10,
        vibration: 2 + Math.random() * 3,
        load: 60 + Math.random() * 30
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
          power: selected?.powerOutput || 25,
          vibration: selected?.vibration || 3,
          load: selected?.loadPercent || 75
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

  const powerOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: '#374151',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['功率输出(MW)', '负荷率(%)'],
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
        name: 'MW',
        min: 0,
        max: 40,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#6B7280' },
        splitLine: { lineStyle: { color: '#1F2937' } }
      },
      {
        type: 'value',
        name: '%',
        min: 0,
        max: 120,
        axisLine: { lineStyle: { color: '#374151' } },
        axisLabel: { color: '#6B7280' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '功率输出(MW)',
        type: 'line',
        smooth: true,
        data: historyData.map(d => d.power),
        lineStyle: { color: '#8B5CF6', width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(139,92,246,0.4)' },
              { offset: 1, color: 'rgba(139,92,246,0)' }
            ]
          }
        },
        itemStyle: { color: '#8B5CF6' }
      },
      {
        name: '负荷率(%)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: historyData.map(d => d.load),
        lineStyle: { color: '#10B981', width: 2 },
        itemStyle: { color: '#10B981' }
      }
    ]
  };

  const vibrationOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', textStyle: { color: '#fff' } },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: historyData.map(d => d.time),
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6B7280', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: 'mm/s',
      min: 0,
      max: 10,
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: '#6B7280' },
      splitLine: { lineStyle: { color: '#1F2937' } }
    },
    series: [
      {
        name: '振动值(mm/s)',
        type: 'bar',
        data: historyData.map(d => d.vibration),
        itemStyle: {
          color: (params: any) => {
            const val = params.value;
            if (val > 5) return '#EF4444';
            if (val > 4) return '#F59E0B';
            return '#22C55E';
          },
          borderRadius: [4, 4, 0, 0]
        },
        markLine: {
          silent: true,
          data: [
            { yAxis: 4, lineStyle: { color: '#F59E0B', type: 'dashed' }, label: { formatter: '预警线 4mm/s', color: '#F59E0B' } },
            { yAxis: 5, lineStyle: { color: '#EF4444', type: 'dashed' }, label: { formatter: '报警线 5mm/s', color: '#EF4444' } }
          ]
        }
      }
    ]
  };

  const relatedAlarms = alarms.filter(a => a.deviceType === 'turbine' && a.deviceId === selected?.id.toString()).slice(0, 5);

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-tech text-2xl font-bold text-white">汽轮发电机监控中心</h1>
          <p className="text-gray-400 mt-1">实时监控汽轮机运行状态，振动分析与功率预测</p>
        </div>
        <button
          onClick={() => setShowWorkOrderModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          <Wrench className="w-4 h-4" />
          生成工单
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        {turbines.map((tur) => (
          <button
            key={tur.id}
            onClick={() => setSelectedId(tur.id)}
            className={`flex-1 p-4 rounded-xl border transition-all ${
              selectedId === tur.id
                ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                : 'card-bg border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-tech font-bold text-white">{tur.name}</span>
              <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[tur.status].bg} ${statusColors[tur.status].text} ${statusColors[tur.status].border}`}>
                {statusColors[tur.status].label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">功率</span>
                <p className="font-tech font-bold text-white">{tur.powerOutput.toFixed(1)} MW</p>
              </div>
              <div>
                <span className="text-gray-500">振动</span>
                <p className={`font-tech font-bold ${tur.vibration > 5 ? 'text-red-400' : tur.vibration > 4 ? 'text-yellow-400' : 'text-white'}`}>
                  {tur.vibration.toFixed(1)} mm/s
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">功率输出</p>
              <p className="font-tech text-2xl font-bold text-white">{selected?.powerOutput.toFixed(2)} MW</p>
            </div>
          </div>
        </div>

        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <Activity className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">振动值</p>
              <p className={`font-tech text-2xl font-bold ${selected?.vibration > 5 ? 'text-red-400 animate-pulse' : selected?.vibration > 4 ? 'text-yellow-400' : 'text-white'}`}>
                {selected?.vibration.toFixed(2)} mm/s
              </p>
            </div>
          </div>
        </div>

        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Gauge className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">运行负荷</p>
              <p className="font-tech text-2xl font-bold text-white">{selected?.loadPercent}%</p>
            </div>
          </div>
        </div>

        <div className="card-bg rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-cyan-500/10">
              <Clock className="w-6 h-6 text-cyan-400" />
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
              <BarChart3 className="w-5 h-5 text-purple-400" />
              功率输出与负荷趋势
            </h3>
            <ReactECharts option={powerOption} style={{ height: '100%', minHeight: '200px' }} theme="dark" />
          </div>

          <div className="card-bg rounded-xl border border-gray-700 p-4 flex-1">
            <h3 className="font-medium text-white mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              振动值监测柱状图
            </h3>
            <ReactECharts option={vibrationOption} style={{ height: '100%', minHeight: '200px' }} theme="dark" />
          </div>
        </div>

        <div className="w-80 flex flex-col gap-4">
          <div className="card-bg rounded-xl border border-gray-700 p-5">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
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
                <span className="text-gray-400">额定功率</span>
                <span className="text-white font-medium">30 MW</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">当前功率</span>
                <span className="text-white font-medium">{selected?.powerOutput.toFixed(1)} MW</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">转速</span>
                <span className="text-white font-medium">3000 rpm</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">轴承温度</span>
                <span className="text-white font-medium">65℃</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">累计发电量</span>
                <span className="text-white font-medium">{(selected?.runningHours * 25 / 1000).toFixed(1)} 万kWh</span>
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

      {showWorkOrderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card-bg rounded-2xl border border-gray-700 p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-tech text-lg font-bold text-white">生成维修工单</h3>
              <button onClick={() => setShowWorkOrderModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">设备</label>
                <input
                  type="text"
                  value={selected?.name || ''}
                  readOnly
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">工单类型</label>
                <select className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white">
                  <option>定期检修</option>
                  <option>故障维修</option>
                  <option>振动异常</option>
                  <option>大修</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">优先级</label>
                <select className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white">
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">问题描述</label>
                <textarea
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-white resize-none h-20"
                  placeholder="请描述设备问题..."
                  defaultValue={`${selected?.name} 振动值偏高，建议检查轴承`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWorkOrderModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    addWorkOrder({
                      deviceId: selected.id.toString(),
                      deviceName: selected.name,
                      type: 'repair',
                      priority: 'high',
                      description: `${selected.name} 振动异常检修`,
                      parts: ['轴承', '密封圈']
                    });
                    addAlarm('workOrder', selected.id.toString(), selected.name, 'turbine', 'info', '已生成维修工单');
                    setShowWorkOrderModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  确认生成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
