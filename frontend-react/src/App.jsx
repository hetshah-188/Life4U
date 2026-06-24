import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import WhyDonate from './pages/WhyDonate';
import BecomeDonor from './pages/BecomeDonor';
import Contact from './pages/Contact';
import DonorDashboard from './pages/DonorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import RequestBlood from './pages/RequestBlood';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          <Route path="/about" element={<About />} />
          <Route path="/why-donate" element={<WhyDonate />} />
          <Route path="/become-donor" element={<BecomeDonor />} />
          <Route path="/contact" element={<Contact />} />

          <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
            <Route path="/donor-dashboard" element={<DonorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['recipient']} />}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/request-blood" element={<RequestBlood />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
          </Route>

        </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
