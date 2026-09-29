import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { Bus, Users, Map, CheckCircle, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    totalDrivers: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const socketRef = useRef(null);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/buses/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    socketRef.current = io('http://localhost:5001', { transports: ['websocket'] });
    
    // Refresh stats when any bus changes status or location
    const handleUpdate = () => {
      fetchStats();
    };

    socketRef.current.on('statusUpdate', handleUpdate);
    socketRef.current.on('locationUpdate', handleUpdate);
    socketRef.current.on('busUpdated', handleUpdate);

    return () => socketRef.current.disconnect();
  }, []);

  // Mock data for charts
  const chartData = [
    { name: 'Mon', active: 4, total: 5 },
    { name: 'Tue', active: 5, total: 5 },
    { name: 'Wed', active: 3, total: 5 },
    { name: 'Thu', active: 5, total: 5 },
    { name: 'Fri', active: 4, total: 5 },
    { name: 'Sat', active: 2, total: 3 },
    { name: 'Sun', active: 1, total: 2 },
  ];

  const statCards = [
    { title: 'Total Fleet', value: stats.totalBuses, sub: 'Buses registered', icon: <Bus size={24} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { title: 'Live Now', value: stats.activeBuses, sub: 'Currently tracking', icon: <Activity size={24} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { title: 'Drivers', value: stats.totalDrivers, sub: 'Active accounts', icon: <Users size={24} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { title: 'Students', value: stats.totalStudents, sub: 'Total members', icon: <Users size={24} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  ];

  if (loading) return (
    <Box className="h-[80vh] flex items-center justify-center">
      <CircularProgress sx={{ color: '#3b82f6' }} />
    </Box>
  );

  return (
    <Box sx={{ p: 1 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Box className="flex justify-between items-center mb-8">
          <Box>
            <Typography variant="h4" className="text-white font-black tracking-tight">Admin Console</Typography>
            <Typography variant="body2" className="text-gray-400 mt-1">Real-time system monitoring & management</Typography>
          </Box>
          <Box className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <Typography className="text-green-500 text-xs font-bold uppercase tracking-widest">System Online</Typography>
          </Box>
        </Box>
      </motion.div>
      
      {/* Stat Cards */}
      <Grid container spacing={3}>
        {statCards.map((card, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-[#11111a] border border-white/5 hover:border-white/10 transition-all rounded-3xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  {card.icon}
                </div>
                <CardContent className="p-6">
                  <Box className="flex items-center gap-3 mb-4">
                    <Box sx={{ backgroundColor: card.bg, p: 1.5, borderRadius: '12px', color: card.color }}>
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography variant="h3" className="text-white font-black mb-1">{card.value}</Typography>
                  <Typography variant="body2" className="text-white/80 font-bold">{card.title}</Typography>
                  <Typography variant="caption" className="text-gray-500">{card.sub}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} className="mt-4">
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card className="bg-[#11111a] border border-white/5 rounded-3xl p-6">
              <Box className="flex justify-between items-center mb-8">
                <Typography variant="h6" className="text-white font-bold flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-500" /> Fleet Activity
                </Typography>
                <Box className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-400">Total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-xs text-gray-400">Active</span>
                  </div>
                </Box>
              </Box>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" stroke="#555" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis stroke="#555" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
                    <Area type="monotone" dataKey="active" stroke="#6366f1" fillOpacity={1} fill="url(#colorActive)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <Card className="bg-[#11111a] border border-white/5 rounded-3xl p-6 h-full">
              <Typography variant="h6" className="text-white font-bold mb-6">System Health</Typography>
              <Box className="space-y-6">
                <Box className="p-4 rounded-2xl bg-white/5 flex items-center justify-between">
                  <Box className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20 text-green-500"><CheckCircle size={18} /></div>
                    <Typography className="text-white text-sm font-medium">GPS Accuracy</Typography>
                  </Box>
                  <Typography className="text-green-500 font-bold">98%</Typography>
                </Box>
                <Box className="p-4 rounded-2xl bg-white/5 flex items-center justify-between">
                  <Box className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500"><Activity size={18} /></div>
                    <Typography className="text-white text-sm font-medium">Server Latency</Typography>
                  </Box>
                  <Typography className="text-blue-500 font-bold">42ms</Typography>
                </Box>
                <Box className="p-4 rounded-2xl bg-white/5 flex items-center justify-between">
                  <Box className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/20 text-orange-500"><AlertTriangle size={18} /></div>
                    <Typography className="text-white text-sm font-medium">Reported Issues</Typography>
                  </Box>
                  <Typography className="text-orange-500 font-bold">02</Typography>
                </Box>
              </Box>
              <Box className="mt-8 pt-8 border-t border-white/5 text-center">
                <Typography variant="caption" className="text-gray-500">Last updated: {new Date().toLocaleTimeString()}</Typography>
              </Box>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
