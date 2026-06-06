import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'cyan' | 'green' | 'yellow' | 'red' | 'purple';
  className?: string;
}

const colorMap = {
  cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
  green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
  yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
  red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400'
};

export default function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  color = 'cyan',
  className
}: StatCardProps) {
  return (
    <div className={cn(
      'card-bg rounded-xl p-4 border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg corner-decoration',
      colorMap[color],
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-black/20">
          {icon}
        </div>
        {trend && trendValue && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded',
            trend === 'up' ? 'bg-green-500/20 text-green-400' :
            trend === 'down' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      
      <div className="flex items-baseline gap-1">
        <span className="font-tech text-2xl font-bold">{value}</span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}
