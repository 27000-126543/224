import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useAlarmStore } from '@/store/useAlarmStore';
import { formatTime, getStatusName } from '@/utils/calc';
import { cn } from '@/lib/utils';

export default function AlarmBar() {
  const { alarms, resolveAlarm } = useAlarmStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const activeAlarms = alarms.filter(a => !a.resolved);

  useEffect(() => {
    if (activeAlarms.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeAlarms.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeAlarms.length]);

  if (activeAlarms.length === 0) {
    return (
      <div className="h-10 panel-bg border-t border-gray-700 flex items-center justify-center">
        <p className="text-sm text-gray-500">系统运行正常，暂无报警信息</p>
      </div>
    );
  }

  const currentAlarm = activeAlarms[currentIndex];
  
  const levelConfig = {
    critical: {
      icon: AlertCircle,
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      label: '严重'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      label: '预警'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      label: '提示'
    }
  };

  const config = levelConfig[currentAlarm.level];
  const Icon = config.icon;

  return (
    <div className={cn(
      'h-10 panel-bg border-t flex items-center px-4 overflow-hidden',
      config.border,
      currentAlarm.level === 'critical' && 'animate-pulse'
    )}>
      <div className="flex items-center gap-3 w-full">
        <div className={cn('flex items-center gap-2 px-3 py-1 rounded', config.bg)}>
          <Icon className={cn('w-4 h-4', config.text)} />
          <span className={cn('text-xs font-medium', config.text)}>{config.label}</span>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <p className="text-sm text-white truncate">
            <span className="text-cyan-400 mr-2">[{currentAlarm.deviceName}]</span>
            {currentAlarm.message}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">{formatTime(currentAlarm.timestamp)}</span>
          <span className="text-xs text-gray-500">
            {currentIndex + 1} / {activeAlarms.length}
          </span>
          <button
            onClick={() => resolveAlarm(currentAlarm.id)}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
