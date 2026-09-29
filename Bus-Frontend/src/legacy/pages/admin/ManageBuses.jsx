import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Button, TextField, Grid, Card, CardContent, 
  IconButton, Chip, Select, MenuItem, FormControl, InputLabel, 
  CircularProgress, Avatar, Tooltip, InputAdornment 
} from '@mui/material';
import { Trash2, Plus, Bus, User, MapPin, AlertCircle, Navigation, Pencil, X, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ManageBuses = () => {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [busName, setBusName] = useState('');
  const [busPlate, setBusPlate] = useState('');
  const [busRoute, setBusRoute] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const [busRes, driverRes, routeRes] = await Promise.all([
        axios.get('http://localhost:5001/api/buses', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5001/api/auth/drivers', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5001/api/routes', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setBuses(busRes.data);
      setDrivers(driverRes.data);
      setRoutes(routeRes.data);
    } catch (err) {
      console.error('Fetch Error:', err.response || err);
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      toast.error(`Failed to load data: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBus = async (e, force = false) => {
    if (e) e.preventDefault();
    if (!busRoute) {
      toast.warning('Please select a route');
      return;
    }
    try {
      const busData = { 
        name: busName, 
        number_plate: busPlate, 
        route: busRoute, 
        departure_time: departureTime,
        driver_id: selectedDriver || null,
        force
      };

      if (isEditing) {
        await axios.put(`http://localhost:5001/api/buses/${editingId}`, busData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Bus details updated');
      } else {
        await axios.post('http://localhost:5001/api/buses', busData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Bus added and assigned successfully');
      }

      resetForm();
      fetchData();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.code === 'DRIVER_ASSIGNED') {
        if (window.confirm(err.response.data.message)) {
          handleAddBus(null, true);
        }
      } else {
        toast.error(err.response?.data?.error || 'Error saving bus');
      }
    }
  };

  const handleEditClick = (bus) => {
    setIsEditing(true);
    setEditingId(bus.id);
    setBusName(bus.name);
    setBusPlate(bus.number_plate);
    setBusRoute(bus.route);
    setDepartureTime(bus.departure_time || '');
    setSelectedDriver(bus.driver_id || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setBusName('');
    setBusPlate('');
    setBusRoute('');
    setDepartureTime('');
    setSelectedDriver('');
  };

  const handleDeleteBus = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/buses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Bus removed from fleet');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error deleting bus');
    }
  };

  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.name : 'Unassigned';
  };

  if (loading) return (
    <Box className="h-[60vh] flex items-center justify-center">
      <CircularProgress sx={{ color: '#3b82f6' }} />
    </Box>
  );

  return (
    <Box>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Box className="flex justify-between items-center mb-8">
          <Box>
            <Typography variant="h4" className="text-white font-black tracking-tight">Fleet Management</Typography>
            <Typography variant="body2" className="text-gray-400 mt-1">Add, track and assign drivers to buses</Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Add Bus Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-[#11111a] border border-white/5 rounded-3xl mb-10 overflow-visible">
          <CardContent className="p-8">
            <Typography variant="h6" className="text-white font-bold mb-6 flex items-center gap-2">
              {isEditing ? <Pencil size={20} className="text-blue-500" /> : <Plus size={20} className="text-blue-500" />} 
              {isEditing ? 'Update Bus Details' : 'Register New Bus'}
            </Typography>
            <form onSubmit={handleAddBus}>
              <Grid container spacing={3} alignItems="flex-end">
                <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                  <TextField 
                    label="Bus Name" 
                    fullWidth
                    value={busName} 
                    onChange={(e)=>setBusName(e.target.value)} 
                    required 
                    placeholder="e.g. Campus Express"
                    sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <TextField 
                    label="Plate Number" 
                    fullWidth
                    value={busPlate} 
                    onChange={(e)=>setBusPlate(e.target.value)} 
                    required 
                    placeholder="ABC-1234"
                    sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }}>
                    <InputLabel>Select Route</InputLabel>
                    <Select
                      value={busRoute}
                      label="Select Route"
                      required
                      onChange={(e) => setBusRoute(e.target.value)}
                    >
                      <MenuItem value="" disabled><em>Select a route</em></MenuItem>
                      {routes.map(route => (
                        <MenuItem key={route.id} value={route.name}>
                          <Box className="flex items-center gap-2">
                            <Navigation size={14} className="text-purple-500" />
                            {route.name}
                          </Box>
                        </MenuItem>
                      ))}
                      {routes.length === 0 && <MenuItem disabled>No routes available</MenuItem>}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <TextField 
                    label="Departure Time" 
                    fullWidth
                    value={departureTime} 
                    onChange={(e)=>setDepartureTime(e.target.value)} 
                    placeholder="e.g. 08:30 AM"
                    sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                    InputProps={{ startAdornment: <InputAdornment position="start"><Clock size={18} className="text-blue-500" /></InputAdornment> }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }}>
                    <InputLabel>Assign Driver</InputLabel>
                    <Select
                      value={selectedDriver}
                      label="Assign Driver"
                      onChange={(e) => setSelectedDriver(e.target.value)}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {drivers.map(driver => (
                        <MenuItem key={driver.id} value={driver.id}>{driver.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
                  <Box className="flex gap-2">
                    <Button 
                      type="submit" 
                      fullWidth
                      variant="contained" 
                      className="bg-blue-600 hover:bg-blue-700 h-[56px] rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
                    >
                      {isEditing ? 'Update' : 'Add Bus'}
                    </Button>
                    {isEditing && (
                      <IconButton onClick={resetForm} className="bg-white/5 hover:bg-white/10 text-gray-400 h-[56px] w-[56px] rounded-xl">
                        <X size={20} />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bus Grid */}
      <Grid container spacing={4}>
        {buses.map((bus, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={bus.id}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.1 * idx }}
            >
              <Card className="bg-[#11111a] border border-white/5 hover:border-white/20 transition-all rounded-3xl group overflow-hidden">
                <Box className="h-2 bg-gradient-to-right from-blue-500 to-indigo-600" />
                <CardContent className="p-6">
                  <Box className="flex justify-between items-start mb-6">
                    <Box className="flex items-center gap-4">
                      <Box className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Bus size={24} />
                      </Box>
                      <Box>
                        <Typography variant="h6" className="text-white font-black leading-none">{bus.name}</Typography>
                        <Typography variant="caption" className="text-gray-500 font-mono tracking-widest">{bus.number_plate}</Typography>
                      </Box>
                    </Box>
                    <Box className="flex gap-1">
                      <IconButton size="small" onClick={() => handleEditClick(bus)} className="text-gray-500 hover:text-white transition-colors">
                        <Pencil size={18} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteBus(bus.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box className="space-y-4">
                    <Box className="flex items-center gap-3">
                      <Navigation size={16} className="text-purple-500" />
                      <Typography variant="body2" className="text-gray-300 font-medium">{bus.route}</Typography>
                    </Box>

                    <Box className="flex items-center gap-3">
                      <Clock size={16} className="text-blue-500" />
                      <Typography variant="body2" className="text-gray-300 font-medium">Departure: {bus.departure_time || 'Not set'}</Typography>
                    </Box>

                    <Box className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <Box className="flex items-center justify-between mb-2">
                        <Box className="flex items-center gap-2">
                          <User size={14} className="text-blue-500" />
                          <Typography variant="caption" className="text-gray-500 font-bold uppercase">Assigned Driver</Typography>
                        </Box>
                        {!bus.driver_id && <AlertCircle size={14} className="text-orange-500 animate-pulse" />}
                      </Box>
                      <Box className="flex items-center gap-3">
                        <Avatar sx={{ width: 28, height: 28, bgcolor: bus.driver_id ? '#3b82f6' : '#222', fontSize: '12px', fontWeight: 'bold' }}>
                          {getDriverName(bus.driver_id)[0]}
                        </Avatar>
                        <Typography variant="body2" className={bus.driver_id ? "text-white font-bold" : "text-gray-600 italic"}>
                          {getDriverName(bus.driver_id)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                    <Chip 
                      label={bus.status} 
                      size="small" 
                      className={`${bus.status.includes('Moving') ? 'bg-green-500/10 text-green-500' : bus.status.includes('Arrived') ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'} font-bold rounded-lg`} 
                    />
                    <Box className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${bus.status === 'On time' ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <Typography variant="caption" className="text-gray-500 font-bold uppercase tracking-tighter">Live</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
        {buses.length === 0 && (
          <Box className="w-full text-center py-20 opacity-50">
            <Bus size={48} className="mx-auto mb-4" />
            <Typography>No buses found in the fleet.</Typography>
          </Box>
        )}
      </Grid>
    </Box>
  );
};

export default ManageBuses;
