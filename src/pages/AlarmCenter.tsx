import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, Clock, CheckCircle, Filter, X, Bell } from 'lucide-react';
import { useAlarmStore } from '@/store/useAlarmStore';
import { formatTime } from '@/utils/calc';
import type { AlarmLevel, DeviceType } from '@/types';
import { cn } from '@/lib/utils';

const levelConfig: Record<AlarmLevel, { icon: typeof AlertTriangle; label: string; color: string; bg: string; border: string }> = {
  critical: {
    icon: AlertCircle,
    label: '严重',
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/50'
  },
  warning: {
    icon: AlertTriangle,
    label: '预警',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50'
  },
  info: {
    icon: Info,
    label: '提示',
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50'
  }
};

const deviceTypeNames: Record<DeviceType | 'all', string> = {
  all: '全部设备',
  incinerator: '焚烧炉',
  turbine: '汽轮机',
  flueGas: '烟气净化',
  ashBin: '灰渣仓',
  truck: '垃圾车',
  pit: '垃圾坑',
  boiler: '余热锅炉'
};

export default function AlarmCenter() {
  const { alarms, resolveAlarm, getUnresolvedCount } = useAlarmStore();
  const [filterLevel, setFilterLevel] = useState<AlarmLevel | 'all'>('all');
  const [filterResolved, setFilterResolved] = useState<'all' | 'active' | 'resolved'>('all');
  const [filterDevice, setFilterDevice] = useState<DeviceType | 'all'>('all');

  const alarmCounts = getUnresolvedCount();

  const filteredAlarms = alarms.filter(alarm => {
    if (filterLevel !== 'all' && alarm.level !== filterLevel) return false;
    if (filterResolved === 'active' && alarm.resolved) return false;
    if (filterResolved === 'resolved' && !alarm.resolved) return false;
    if (filterDevice !== 'all' && alarm.deviceType !== filterDevice) return false;
    return true;
  });

  const stats = [
    { label: '严重报警', value: alarmCounts.critical, level: 'critical' as AlarmLevel },
    { label: '预警信息', value: alarmCounts.warning, level: 'warning' as AlarmLevel },
    { label: '提示信息', value: alarmCounts.info, level: 'info' as AlarmLevel }
  ];

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-tech text-2xl font-bold text-white">报警管理中心</h1>
          <p className="text-gray-400 mt-1">全厂设备报警实时监控与处理</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => {
          const config = levelConfig[stat.level];
          const Icon = config.icon;
          return (
            <div
              key={stat.level}
              className={cn(
                'card-bg rounded-xl p-5 border transition-all',
                config.border,
                stat.value > 0 && 'animate-pulse'
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn('p-4 rounded-xl', config.bg)}>
                  <Icon className={cn('w-8 h-8', config.color)} />
                </div>
                <div>
                  <p className={cn('text-sm', config.color)}>{stat.label}</p>
                  <p className={cn('font-tech text-3xl font-bold', config.color)}>{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 过滤器 */}
      <div className="card-bg rounded-xl p-4 border border-gray-700 mb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">筛选:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">级别:</span>
            <div className="flex gap-1">
              {(['all', 'critical', 'warning', 'info'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterLevel(level)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    filterLevel === level
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      : 'text-gray-400 hover:bg-gray-700'
                  )}
                >
                  {level === 'all' ? '全部' : levelConfig[level].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">状态:</span>
            <div className="flex gap-1">
              {(['all', 'active', 'resolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterResolved(status)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    filterResolved === status
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      : 'text-gray-400 hover:bg-gray-700'
                  )}
                >
                  {status === 'all' ? '全部' : status === 'active' ? '未处理' : '已处理'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">设备:</span>
            <select
              value={filterDevice}
              onChange={(e) => setFilterDevice(e.target.value as DeviceType | 'all')}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(deviceTypeNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 报警列表 */}
      <div className="flex-1 overflow-hidden">
        <div className="card-bg rounded-xl border border-gray-700 h-full flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-medium text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              报警列表
              <span className="text-xs text-gray-500">({filteredAlarms.length}条)</span>
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredAlarms.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <CheckCircle className="w-16 h-16 mb-4 text-green-500/50" />
                <p>暂无符合条件的报警记录</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredAlarms.map((alarm) => {
                  const config = levelConfig[alarm.level];
                  const Icon = config.icon;
                  return (
                    <div
                      key={alarm.id}
                      className={cn(
                        'p-4 hover:bg-gray-800/50 transition-colors',
                        alarm.resolved ? 'opacity-60' : ''
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn('p-2 rounded-lg shrink-0', config.bg)}>
                          <Icon className={cn('w-5 h-5', config.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-white font-medium">{alarm.message}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <span className="text-cyan-400">[{alarm.deviceName}]</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(alarm.timestamp)}
                                </span>
                                <span className={cn('px-2 py-0.5 rounded text-xs', config.bg, config.color)}>
                                  {config.label}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              {alarm.resolved ? (
                                <span className="flex items-center gap-1 text-xs text-green-400 px-2 py-1 bg-green-500/20 rounded">
                                  <CheckCircle className="w-3 h-3" />
                                  已处理
                                </span>
                              ) : (
                                <button
                                  onClick={() => resolveAlarm(alarm.id)}
                                  className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 text-sm rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  确认处理
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
