import { Truck, MapPin, Scale, Package, Clock, Plus, RefreshCw, CheckCircle } from 'lucide-react';
import { useDeviceStore } from '@/store/useDeviceStore';
import { getWasteTypeName, getStatusName } from '@/utils/calc';

export default function TruckDispatch() {
  const { trucks, addTruck, simulateRealTimeData } = useDeviceStore();

  const statusColors = {
    approaching: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    waiting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    discharging: 'bg-green-500/20 text-green-400 border-green-500/30',
    leaving: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  const typeColors = {
    domestic: 'bg-orange-500/20 text-orange-400',
    industrial: 'bg-purple-500/20 text-purple-400',
    kitchen: 'bg-green-500/20 text-green-400',
    recyclable: 'bg-blue-500/20 text-blue-400'
  };

  const stats = [
    { label: '今日进厂', value: trucks.length, icon: Truck, color: 'cyan' },
    { label: '待卸料', value: trucks.filter(t => t.status === 'waiting').length, icon: Clock, color: 'yellow' },
    { label: '卸料中', value: trucks.filter(t => t.status === 'discharging').length, icon: Package, color: 'green' },
    { label: '今日总重量', value: trucks.reduce((s, t) => s + t.weight, 0), unit: '吨', icon: Scale, color: 'purple' }
  ];

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-tech text-2xl font-bold text-white">车辆调度管理</h1>
          <p className="text-gray-400 mt-1">智能分配卸料口，优化车辆进出流程</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => simulateRealTimeData()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新数据
          </button>
          <button
            onClick={addTruck}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            调度车辆
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-bg rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-cyan-500/10">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="font-tech text-2xl font-bold text-white">
                    {stat.value}
                    {stat.unit && <span className="text-sm font-normal text-gray-400 ml-1">{stat.unit}</span>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 车辆列表 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="card-bg rounded-xl border border-gray-700 flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-medium text-white">车辆列表</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-black/30 sticky top-0">
                <tr>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">车牌号</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">来源</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">垃圾类型</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">重量</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">热值</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">状态</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">分配卸料口</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck) => (
                  <tr key={truck.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="p-3">
                      <span className="font-tech text-cyan-400 font-medium">{truck.plateNumber}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-gray-300">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        {truck.source}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${typeColors[truck.wasteType]}`}>
                        {getWasteTypeName(truck.wasteType)}
                      </span>
                    </td>
                    <td className="p-3 text-white">{truck.weight} 吨</td>
                    <td className="p-3 text-white">{truck.calorificValue} kcal/kg</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs border ${statusColors[truck.status]}`}>
                        {getStatusName(truck.status)}
                      </span>
                    </td>
                    <td className="p-3">
                      {truck.assignedPort ? (
                        <span className="text-green-400 font-medium flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {truck.assignedPort}#卸料口
                        </span>
                      ) : (
                        <span className="text-gray-500">待分配</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors">
                          详情
                        </button>
                        <button className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
                          轨迹
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
