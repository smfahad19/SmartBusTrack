import SessionGate from './components/SessionGate';
import Institutes from './pages/admin/Institutes';
import { useMemo } from 'react';
import { MotionConfig } from 'framer-motion';
import { buildTheme } from './theme';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, StyledEngineProvider } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Landing Page
import Landing from './pages/Landing';

// Auth Pages
import Login from './pages/auth/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBuses from './pages/admin/ManageBuses';
import ManageDrivers from './pages/admin/ManageDrivers';
import ManageStudents from './pages/admin/ManageStudents';
import ManageRoutes from './pages/admin/ManageRoutes';
import AdminMap from './pages/admin/AdminMap';
import Policies from './pages/admin/Policies';
import ContactInquiries from './pages/admin/ContactInquiries';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import BusList from './pages/student/BusList';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import Profile from './pages/Profile';

function PrivateRoute({ children, roleRequired }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" />;
  if (roleRequired && user.role !== roleRequired && !(roleRequired === 'admin' && user.role === 'superadmin')) return <Navigate to="/login" />;
  return children;
}

function SharedApp({ mode }) {
  const theme = useMemo(() => buildTheme(mode), [mode]);
  return (
    <MotionConfig reducedMotion="user"><StyledEngineProvider injectFirst><ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer theme={mode} position="top-right" autoClose={3000} />
      <SessionGate><Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/student" element={<PrivateRoute roleRequired="student"><DashboardLayout role="student" /></PrivateRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="buses" element={<BusList />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="/admin" element={<PrivateRoute roleRequired="admin"><DashboardLayout role="admin" /></PrivateRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="buses" element={<ManageBuses />} />
            <Route path="map" element={<AdminMap />} />
            <Route path="drivers" element={<ManageDrivers />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="routes" element={<ManageRoutes />} />
            <Route path="reports" element={<Navigate to="/admin" replace />} />
            <Route path="institutes" element={<PrivateRoute roleRequired="superadmin"><Institutes /></PrivateRoute>} />
            <Route path="policies" element={<PrivateRoute roleRequired="superadmin"><Policies /></PrivateRoute>} />
            <Route path="contacts" element={<PrivateRoute roleRequired="superadmin"><ContactInquiries /></PrivateRoute>} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="/driver" element={<PrivateRoute roleRequired="driver"><DashboardLayout role="driver" /></PrivateRoute>}>
            <Route index element={<DriverDashboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router></SessionGate>
    </ThemeProvider></StyledEngineProvider></MotionConfig>
  );
}

export default SharedApp;
