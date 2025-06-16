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
import NotFound from './pages/NotFound';
import Payments from './pages/Payments';
import PaymentForm from './pages/PaymentForm';
import PaymentDetail from './pages/PaymentDetail';
import BankAccounts from './pages/BankAccounts';
import BankAccountForm from './pages/BankAccountForm';
import BankAccountDetail from './pages/BankAccountDetail';
import Tours from './pages/Tours';
import TourForm from './pages/TourForm';
import TourDetail from './pages/TourDetail';
import ResourceAvailability from './pages/ResourceAvailability';
import ResourceAvailabilityForm from './pages/ResourceAvailabilityForm';
import ResourceAvailabilityDetail from './pages/ResourceAvailabilityDetail';

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

        {/* Payment Routes */}
        <Route path="/payments" element={<Payments />} />
        <Route path="/payments/new" element={<PaymentForm />} />
        <Route path="/payments/:id" element={<PaymentDetail />} />
        <Route path="/payments/:id/edit" element={<PaymentForm />} />

        {/* Bank Account Routes */}
        <Route path="/bank-accounts" element={<BankAccounts />} />
        <Route path="/bank-accounts/new" element={<BankAccountForm />} />
        <Route path="/bank-accounts/:id" element={<BankAccountDetail />} />
        <Route path="/bank-accounts/:id/edit" element={<BankAccountForm />} />

        {/* Tour Planning Routes */}
        <Route path="/tours" element={<Tours />} />
        <Route path="/tours/new" element={<TourForm />} />
        <Route path="/tours/:id" element={<TourDetail />} />
        <Route path="/tours/:id/edit" element={<TourForm />} />

        {/* Resource Allocation Routes */}
        <Route path="/resource-availability" element={<ResourceAvailability />} />
        <Route path="/resource-availability/new" element={<ResourceAvailabilityForm />} />
        <Route path="/resource-availability/:id" element={<ResourceAvailabilityDetail />} />
        <Route path="/resource-availability/:id/edit" element={<ResourceAvailabilityForm />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

export default App;


