import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import AlarmBar from './AlarmBar';
import { useState } from 'react';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="w-full h-full flex flex-col bg-gray-950 overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        
        <main className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950">
          <Outlet />
        </main>
      </div>
      
      <AlarmBar />
    </div>
  );
}
