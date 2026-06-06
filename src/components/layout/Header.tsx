import { useState, useEffect } from 'react';
import { User, LogOut, Bell, Settings, Zap, TrendingUp, Wind } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAlarmStore } from '@/store/useAlarmStore';
import { useDeviceStore } from '@/store/useDeviceStore';
import { getRoleName, formatTime } from '@/utils/calc';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { getUnresolvedCount } = useAlarmStore();
  const { turbines, flueGasSystems } = useDeviceStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const alarmCounts = getUnresolvedCount();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPower = turbines.reduce((sum, t) => sum + t.powerOutput, 0);
  const avgEmission = flueGasSystems.length > 0
    ? flueGasSystems.reduce((sum, f) => sum + f.emission.so2 + f.emission.nox + f.emission.particulate, 0) / flueGasSystems.length / 3
    : 0;

  return (
    <header className="h-16 panel-bg border-b border-gray-700 flex items-center justify-between px-6 relative z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center glow-box">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-tech text-lg font-bold text-cyan-400 glow-text">
              智慧垃圾焚烧电厂
            </h1>
            <p className="text-xs text-gray-400">综合运营与环保监管平台</p>
          </div>
        </div>

        <div className="h-8 w-px bg-gray-600" />

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">实时发电量</p>
              <p className="font-tech text-lg text-green-400">{totalPower.toFixed(1)} <span className="text-sm">MW</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-xs text-gray-400">综合排放指数</p>
              <p className={`font-tech text-lg ${avgEmission < 50 ? 'text-green-400' : avgEmission < 100 ? 'text-yellow-400' : 'text-red-400'}`}>
                {avgEmission.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-tech text-xl text-cyan-400">{formatTime(currentTime)}</p>
          <p className="text-xs text-gray-400">{currentTime.toLocaleDateString('zh-CN')}</p>
        </div>

        <div className="h-8 w-px bg-gray-600" />

        <button className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors">
          <Bell className="w-5 h-5 text-gray-300" />
          {(alarmCounts.warning > 0 || alarmCounts.critical > 0) && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center px-1 animate-pulse">
              {alarmCounts.warning + alarmCounts.critical}
            </span>
          )}
        </button>

        <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
          <Settings className="w-5 h-5 text-gray-300" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-600">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-cyan-400">{getRoleName(user?.role || '')}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    </header>
  );
}
