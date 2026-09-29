import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Landing Page
import Landing from './pages/Landing';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBuses from './pages/admin/ManageBuses';
import ManageDrivers from './pages/admin/ManageDrivers';
import ManageStudents from './pages/admin/ManageStudents';
import ManageRoutes from './pages/admin/ManageRoutes';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import BusList from './pages/student/BusList';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ffffff' },
    secondary: { main: '#1976d2' },
    background: {
      default: '#0a0a0a',
      paper: '#141414',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        }
      }
    }
  }
});

function PrivateRoute({ children, roleRequired }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" />;
  if (roleRequired && user.role !== roleRequired) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/student" element={<PrivateRoute roleRequired="student"><DashboardLayout role="student" /></PrivateRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="buses" element={<BusList />} />
          </Route>
          
          <Route path="/admin" element={<PrivateRoute roleRequired="admin"><DashboardLayout role="admin" /></PrivateRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="buses" element={<ManageBuses />} />
            <Route path="drivers" element={<ManageDrivers />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="routes" element={<ManageRoutes />} />
          </Route>
          
          <Route path="/driver" element={<PrivateRoute roleRequired="driver"><DashboardLayout role="driver" /></PrivateRoute>}>
            <Route index element={<DriverDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
