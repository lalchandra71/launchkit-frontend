import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import SetupOrganization from './pages/SetupOrganization';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Organization from './pages/Organization';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import BillingSuccess from './pages/BillingSuccess';
import ProtectedRoute from './components/ProtectedRoute';
import RequireOrganization from './components/RequireOrganization';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/setup-organization" element={<SetupOrganization />} />
          <Route path="/dashboard" element={<ProtectedRoute><RequireOrganization><Dashboard /></RequireOrganization></ProtectedRoute>} />
          <Route path="/dashboard/organization" element={<ProtectedRoute><RequireOrganization><Organization /></RequireOrganization></ProtectedRoute>} />
          <Route path="/dashboard/team" element={<ProtectedRoute><RequireOrganization><Team /></RequireOrganization></ProtectedRoute>} />
          <Route path="/dashboard/billing" element={<ProtectedRoute><RequireOrganization><Billing /></RequireOrganization></ProtectedRoute>} />
          <Route path="/billing/success" element={<ProtectedRoute><BillingSuccess /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;