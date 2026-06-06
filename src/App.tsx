import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "@/pages/Login";
import MainLayout from "@/components/layout/MainLayout";
import ControlRoom from "@/pages/ControlRoom";
import TruckDispatch from "@/pages/TruckDispatch";
import PitMonitor from "@/pages/PitMonitor";
import AlarmCenter from "@/pages/AlarmCenter";
import ReportExport from "@/pages/ReportExport";
import { useAuthStore } from "@/store/useAuthStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <div className="w-screen h-screen overflow-hidden">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/control-room" replace />} />
            <Route path="control-room" element={<ControlRoom />} />
            <Route path="truck-dispatch" element={<TruckDispatch />} />
            <Route path="pit-monitor" element={<PitMonitor />} />
            <Route path="alarm-center" element={<AlarmCenter />} />
            <Route path="report-export" element={<ReportExport />} />
            <Route path="incinerators" element={
              <div className="p-6">
                <h1 className="font-tech text-2xl font-bold text-white mb-4">焚烧炉监控</h1>
                <p className="text-gray-400">焚烧炉详细监控页面开发中...</p>
              </div>
            } />
            <Route path="turbines" element={
              <div className="p-6">
                <h1 className="font-tech text-2xl font-bold text-white mb-4">汽轮发电机</h1>
                <p className="text-gray-400">汽轮发电机详细监控页面开发中...</p>
              </div>
            } />
            <Route path="flue-gas" element={
              <div className="p-6">
                <h1 className="font-tech text-2xl font-bold text-white mb-4">烟气净化系统</h1>
                <p className="text-gray-400">烟气净化系统详细监控页面开发中...</p>
              </div>
            } />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}
