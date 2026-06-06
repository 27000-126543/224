import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "@/pages/Login";
import MainLayout from "@/components/layout/MainLayout";
import ControlRoom from "@/pages/ControlRoom";
import TruckDispatch from "@/pages/TruckDispatch";
import PitMonitor from "@/pages/PitMonitor";
import AlarmCenter from "@/pages/AlarmCenter";
import ReportExport from "@/pages/ReportExport";
import Incinerators from "@/pages/Incinerators";
import Turbines from "@/pages/Turbines";
import FlueGas from "@/pages/FlueGas";
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
            <Route path="incinerators" element={<Incinerators />} />
            <Route path="turbines" element={<Turbines />} />
            <Route path="flue-gas" element={<FlueGas />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}
