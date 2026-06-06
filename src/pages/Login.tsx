import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Shield, Building2, Factory, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const roles: { id: UserRole; name: string; icon: typeof User; desc: string }[] = [
  { id: 'director', name: '厂长', icon: Building2, desc: '全厂管理与决策' },
  { id: 'manager', name: '运营部长', icon: Factory, desc: '日常运营调度' },
  { id: 'epa', name: '环保局', icon: Shield, desc: '环保排放监管' }
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('director');
  const [userName, setUserName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isScanning) {
      const timer = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            handleLogin();
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isScanning]);

  const startFaceScan = () => {
    if (!userName.trim()) {
      alert('请输入姓名');
      return;
    }
    setIsScanning(true);
    setScanProgress(0);
  };

  const handleLogin = () => {
    const name = userName.trim() || roles.find(r => r.id === selectedRole)?.name;
    login(selectedRole, name || '用户');
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  const quickLogin = (role: UserRole) => {
    setSelectedRole(role);
    const defaultNames: Record<UserRole, string> = {
      director: '张厂长',
      manager: '李部长',
      epa: '环保局监管员'
    };
    setUserName(defaultNames[role]);
    login(role, defaultNames[role]);
    navigate('/');
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center overflow-hidden relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/10 rounded-full animate-rotate-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyan-500/5 rounded-full" />
      </div>

      {/* 网格背景 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 w-full max-w-6xl px-8 flex items-center gap-12">
        {/* 左侧品牌信息 */}
        <div className="flex-1 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center glow-box animate-float">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="font-tech text-4xl font-bold text-cyan-400 glow-text">
                智慧垃圾焚烧电厂
              </h1>
              <p className="text-xl text-gray-400 mt-1">综合运营与环保监管可视化平台</p>
            </div>
          </div>
          
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            基于WebGL的沉浸式三维可视化系统，实现全厂生产运营、环保排放、
            设备运维的一体化智能监管。
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '3D', label: '可视化场景' },
              { value: '实时', label: '数据监控' },
              { value: '智能', label: '调度优化' }
            ].map((item, i) => (
              <div key={i} className="card-bg rounded-xl p-4 border border-gray-700">
                <p className="font-tech text-2xl font-bold text-cyan-400">{item.value}</p>
                <p className="text-sm text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧登录卡片 */}
        <div className="w-[420px]">
          <div className="panel-bg rounded-2xl border border-gray-700 p-8 corner-decoration scan-line">
            <h2 className="font-tech text-2xl font-bold text-white text-center mb-6">
              人脸识别登录
            </h2>

            {/* 角色选择 */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">选择登录角色</p>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={cn(
                        'p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2',
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 glow-border'
                          : 'border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white'
                      )}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{role.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {roles.find(r => r.id === selectedRole)?.desc}
              </p>
            </div>

            {/* 姓名输入 */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">姓名</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="请输入您的姓名"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* 人脸识别区域 */}
            <div className="mb-6">
              <div className="relative aspect-video bg-gray-900 rounded-xl border-2 border-gray-700 overflow-hidden">
                {isScanning ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-cyan-900/20 to-transparent">
                    <div className="relative w-24 h-24 mb-4">
                      <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-ping opacity-50" />
                      <div className="absolute inset-2 border-2 border-cyan-400 rounded-full" />
                      <Camera className="absolute inset-0 m-auto w-10 h-10 text-cyan-400 animate-pulse" />
                    </div>
                    <p className="text-cyan-400 font-medium">人脸识别中...</p>
                    <div className="w-48 h-2 bg-gray-700 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-100"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                      <Camera className="w-10 h-10 text-gray-500" />
                    </div>
                    <p className="text-gray-500 text-sm">点击下方按钮开始人脸识别</p>
                  </div>
                )}
                
                {/* 扫描线动画 */}
                {isScanning && (
                  <div 
                    className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-lg shadow-cyan-400/50"
                    style={{
                      animation: 'scanFace 2s linear infinite',
                      top: `${scanProgress}%`
                    }}
                  />
                )}
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              onClick={startFaceScan}
              disabled={isScanning}
              className={cn(
                'w-full py-4 rounded-xl font-medium text-lg transition-all duration-300 flex items-center justify-center gap-2',
                isScanning
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105'
              )}
            >
              <Eye className="w-5 h-5" />
              {isScanning ? '识别中...' : '开始人脸识别'}
            </button>

            {/* 快捷登录（调试用） */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="w-full text-xs text-gray-500 hover:text-gray-400 flex items-center justify-center gap-1"
              >
                {showDebug ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showDebug ? '隐藏' : '显示'}快捷登录
              </button>
              
              {showDebug && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => quickLogin(role.id)}
                      className="py-2 px-3 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                    >
                      跳过登录-{role.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanFace {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes rotate-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-rotate-slow {
          animation: rotate-slow 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
