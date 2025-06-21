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
import ResourceAvailabilityV1 from './pages/ResourceAvailabilityV1';
import ResourceAvailabilityForm from './pages/ResourceAvailabilityForm';
import ResourceAvailabilityDetail from './pages/ResourceAvailabilityDetail';
import Rates from './pages/Rates';
import RateForm from './pages/RateForm';
import RateDetail from './pages/RateDetail';
import Contracts from './pages/Contracts';
import ContractForm from './pages/ContractForm';
import ContractDetail from './pages/ContractDetail';
import Surcharges from './pages/Surcharges';
import SurchargeForm from './pages/SurchargeForm';
import SurchargeDetail from './pages/SurchargeDetail';
import Sites from './pages/Sites';
import Drivers from './pages/Drivers';
import Contacts from './pages/Contacts';
import Vehicles from './pages/Vehicles';
import UserManagement from './pages/UserManagement';
import RoleManagement from './pages/RoleManagement';
import Profile from './pages/Profile';
import Administration from './pages/Administration';
import ReferenceEntries from './pages/ReferenceEntries';
import ReferenceEntryForm from './components/ReferenceEntryForm';
import { useParams } from 'react-router-dom';

function ReferenceEntryFormWrapper(props: { mode: 'create' | 'edit' }) {
  const { typeId } = useParams<{ typeId: string }>();
  return <ReferenceEntryForm {...props} typeId={typeId!} />;
}

function App() {
  return (
    <AppLayout>
      {/* <Routes> */}
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
        <Route path="/forecasting" element={<Forecasting />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<Settings />} />        
        <Route path="/admin/references" element={<References />} />
        <Route path="/admin/references/:typeId" element={<ReferenceEntries />} />
        <Route path="/admin/references/:typeId/new" element={<ReferenceEntryFormWrapper mode="create" />} />
        <Route path="/admin/references/:typeId/:id/edit" element={<ReferenceEntryFormWrapper mode="edit" />} />

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
        <Route path="/resource-availability" element={<ResourceAvailabilityV1 />} />
        <Route path="/resource-availability/new" element={<ResourceAvailabilityForm />} />
        <Route path="/resource-availability/:id" element={<ResourceAvailabilityDetail />} />
        <Route path="/resource-availability/:id/edit" element={<ResourceAvailabilityForm />} />

        {/* Rates Routes */}
        <Route path="/rates" element={<Rates />} />
        <Route path="/rates/new" element={<RateForm />} />
        <Route path="/rates/:id" element={<RateDetail />} />
        <Route path="/rates/:id/edit" element={<RateForm />} />

        {/* Contracts Routes */}
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/contracts/new" element={<ContractForm />} />
        <Route path="/contracts/:id" element={<ContractDetail />} />
        <Route path="/contracts/:id/edit" element={<ContractForm />} />

        {/* Surcharges Routes */}
        <Route path="/surcharges" element={<Surcharges />} />
        <Route path="/surcharges/new" element={<SurchargeForm />} />
        <Route path="/surcharges/:id" element={<SurchargeDetail />} />
        <Route path="/surcharges/:id/edit" element={<SurchargeForm />} />

        {/* Additional Routes */}
        <Route path="/sites" element={<Sites />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/usermanagement" element={<UserManagement />} />
        <Route path="/rolemanagement" element={<RoleManagement />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/administration" element={<Administration />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

export default App;


