import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Box,
  Flame,
  Cog,
  Wind,
  Database,
  Wrench,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: '中央控制室', path: '/control-room', roles: ['director', 'manager', 'epa'] },
  { id: 'trucks', icon: Truck, label: '车辆调度', path: '/truck-dispatch', roles: ['director', 'manager'] },
  { id: 'pit', icon: Box, label: '垃圾坑监控', path: '/pit-monitor', roles: ['director', 'manager'] },
  { id: 'incinerator', icon: Flame, label: '焚烧炉监控', path: '/incinerators', roles: ['director', 'manager', 'epa'] },
  { id: 'turbine', icon: Cog, label: '汽轮发电机', path: '/turbines', roles: ['director', 'manager'] },
  { id: 'flue-gas', icon: Wind, label: '烟气净化', path: '/flue-gas', roles: ['director', 'manager', 'epa'] },
  { id: 'alarms', icon: AlertTriangle, label: '报警中心', path: '/alarm-center', roles: ['director', 'manager', 'epa'] },
  { id: 'reports', icon: FileText, label: '报表中心', path: '/report-export', roles: ['director', 'manager', 'epa'] }
];

interface SidebarProps {
  userRole?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ userRole, collapsed = false, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = menuItems.filter(item => !userRole || item.roles.includes(userRole));

  return (
    <aside
      className={cn(
        'h-full panel-bg border-r border-gray-700 flex flex-col transition-all duration-300 relative',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <nav className="flex-1 py-4 px-2 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 glow-border'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'animate-pulse')} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-400 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
    </aside>
  );
}
