import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import Orders from './pages/Orders';
import Planning from './pages/Planning';
import Shipments from './pages/Shipments';
import Documents from './pages/Documents';
import Fleet from './pages/Fleet';
import Maintenance from './pages/Maintenance';
import Partners from './pages/Partners';
import KPIs from './pages/KPIs';
import Forecasting from './pages/Forecasting';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
 import References from './pages/References';
import NotFound2 from './pages/NotFound';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/kpis" element={<KPIs />} />
        <Route path="/forecasting" element={<Forecasting />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/references" element={<References />} />
        <Route path="*" element={<NotFound2 />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
