import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, AppBar, Toolbar, Avatar } from '@mui/material';
import { Map, Bus, Users, Route, LayoutDashboard, Menu, LogOut, X } from 'lucide-react';
import { motion } from 'framer-motion';

const drawerWidth = 260;

const DashboardLayout = ({ role }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { text: 'Dashboard', icon: <LayoutDashboard />, path: '/admin' },
      { text: 'Manage Buses', icon: <Bus />, path: '/admin/buses' },
      { text: 'Manage Drivers', icon: <Users />, path: '/admin/drivers' },
      { text: 'Manage Students', icon: <Users />, path: '/admin/students' },
      { text: 'Manage Routes', icon: <Route />, path: '/admin/routes' },
    ],
    student: [
      { text: 'Live Tracking', icon: <Map />, path: '/student' },
      { text: 'Bus Schedules', icon: <Bus />, path: '/student/buses' },
    ],
    driver: [
      { text: 'My Dashboard', icon: <Map />, path: '/driver' },
    ]
  };

  const drawer = (
    <Box className="h-full bg-[#141414] border-r border-gray-800 flex flex-col">
      <Box className="p-6 flex justify-between items-center border-b border-gray-800">
        <Typography variant="h5" className="font-bold text-white tracking-wide">
          SmartBus<span className="text-blue-500">.</span>
        </Typography>
        <IconButton color="inherit" aria-label="close drawer" edge="end" onClick={handleDrawerToggle} sx={{ display: { sm: 'none' } }}>
          <X size={20} />
        </IconButton>
      </Box>
      <List className="flex-1 px-3 py-6 space-y-2">
        {menuItems[role].map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <ListItemIcon className={isActive ? 'text-blue-400' : 'text-gray-500'}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }} />
            </ListItem>
          );
        })}
      </List>
      <Box className="p-4 border-t border-gray-800">
        <ListItem button onClick={handleLogout} className="rounded-xl text-red-400 hover:bg-red-500/10">
          <ListItemIcon className="text-red-400"><LogOut /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }} className="h-screen bg-[#0a0a0a] overflow-hidden">
      {/* App Bar */}
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, bgcolor: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #27272a', boxShadow: 'none' }}>
        <Toolbar className="flex justify-between">
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <Menu />
          </IconButton>
          <Box className="flex-1" />
          <Box className="flex items-center gap-3 bg-white/5 py-1 px-3 rounded-full border border-white/10">
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>{user?.name?.charAt(0)}</Avatar>
            <Typography variant="body2" className="hidden md:block font-medium">{user?.name}</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' } }} open>
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, height: '100vh' }} className="overflow-y-auto">
        <Toolbar />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ height: 'calc(100% - 64px)' }}>
          <Outlet />
        </motion.div>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
