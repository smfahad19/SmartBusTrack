import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Button, TextField, Grid, Card, CardContent, 
  IconButton, Chip, InputAdornment, Divider, Tooltip, Avatar
} from '@mui/material';
import { Plus, Trash2, MapPin, Clock, Bus, Navigation, ListOrdered, Pencil, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ManageRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [routeName, setRouteName] = useState('');
  const [stops, setStops] = useState('');
  const [etas, setEtas] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchRoutes = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/routes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoutes(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleAddRoute = async (e) => {
    e.preventDefault();
    try {
      const stopsArr = stops.split(',').map(s => s.trim());
      const etasArr = etas.split(',').map(e => e.trim());

      if (isEditing) {
        await axios.put(`http://localhost:5001/api/routes/${editingId}`,
          { name: routeName, stops: stopsArr, etas: etasArr },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Route updated successfully');
      } else {
        await axios.post('http://localhost:5001/api/routes',
          { name: routeName, stops: stopsArr, etas: etasArr },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('New route mapped successfully');
      }
      
      resetForm();
      fetchRoutes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving route');
    }
  };

  const handleEditClick = (route) => {
    setIsEditing(true);
    setEditingId(route.id);
    setRouteName(route.name);
    
    let parsedStops = [];
    let parsedEtas = [];
    try {
      parsedStops = JSON.parse(route.stops);
      parsedEtas = JSON.parse(route.etas);
    } catch(e) {}
    
    setStops(parsedStops.join(', '));
    setEtas(parsedEtas.join(', '));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setRouteName('');
    setStops('');
    setEtas('');
  };

  const handleDeleteRoute = async (id) => {
    if (!window.confirm('Delete this route map?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/routes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Route removed');
      fetchRoutes();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error deleting route');
    }
  };

  return (
    <Box>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Box className="flex justify-between items-center mb-8">
          <Box>
            <Typography variant="h4" className="text-white font-black tracking-tight">Navigation Mapping</Typography>
            <Typography variant="body2" className="text-gray-400 mt-1">Define university routes and estimated arrival times</Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Add Route Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-[#11111a] border border-white/5 rounded-3xl mb-10 overflow-hidden">
          <Box className="h-2 bg-purple-600" />
          <CardContent className="p-8">
            <Typography variant="h6" className="text-white font-bold mb-6 flex items-center gap-2">
              {isEditing ? <Pencil size={20} className="text-purple-500" /> : <Plus size={20} className="text-purple-500" />} 
              {isEditing ? 'Edit Route Map' : 'Map New Route'}
            </Typography>
            <form onSubmit={handleAddRoute}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField 
                    label="Route Title" 
                    fullWidth
                    value={routeName} 
                    onChange={(e)=>setRouteName(e.target.value)} 
                    required 
                    placeholder="e.g. Blue Line - Sector A"
                    sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                    InputProps={{ startAdornment: <InputAdornment position="start"><Navigation size={18} className="text-purple-500" /></InputAdornment> }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField 
                    label="Stops (Comma Separated)" 
                    fullWidth
                    value={stops} 
                    onChange={(e)=>setStops(e.target.value)} 
                    required 
                    placeholder="Main Gate, Library, Hostel"
                    sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                    InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} className="text-purple-500" /></InputAdornment> }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box className="flex gap-3">
                    <TextField 
                      label="ETAs (Comma Separated)" 
                      fullWidth
                      value={etas} 
                      onChange={(e)=>setEtas(e.target.value)} 
                      required 
                      placeholder="5m, 10m, 15m"
                      sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                      InputProps={{ startAdornment: <InputAdornment position="start"><Clock size={18} className="text-purple-500" /></InputAdornment> }}
                    />
                    <Button 
                      type="submit" 
                      variant="contained" 
                      className="bg-purple-600 hover:bg-purple-700 rounded-xl px-8 font-bold shadow-lg shadow-purple-900/20"
                    >
                      {isEditing ? 'Update' : 'Save'}
                    </Button>
                    {isEditing && (
                      <IconButton onClick={resetForm} className="bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl px-4">
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

      {/* Routes Grid */}
      <Grid container spacing={4}>
        {routes.map((route, idx) => {
          let parsedStops = [];
          let parsedEtas = [];
          try { 
            parsedStops = JSON.parse(route.stops); 
            parsedEtas = JSON.parse(route.etas);
          } catch(e){}

          return (
            <Grid size={{ xs: 12, md: 6 }} key={route.id}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="bg-[#11111a] border border-white/5 hover:border-white/20 transition-all rounded-3xl overflow-hidden group">
                  <CardContent className="p-0">
                    <Box className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                      <Box className="flex items-center gap-4">
                        <Box className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <Navigation size={24} />
                        </Box>
                        <Box>
                          <Typography variant="h6" className="text-white font-black leading-none">{route.name}</Typography>
                          <Typography variant="caption" className="text-gray-500 uppercase font-bold tracking-tighter">
                            {parsedStops.length} Checkpoints
                          </Typography>
                        </Box>
                      </Box>
                      <Box className="flex gap-1">
                        <IconButton onClick={() => handleEditClick(route)} className="text-gray-500 hover:text-white transition-colors">
                          <Pencil size={20} />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteRoute(route.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                          <Trash2 size={20} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box className="p-6 space-y-6">
                      {/* Bus Assignment Info */}
                      <Box className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <Box className="flex items-center gap-3">
                          <Box className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Bus size={20} />
                          </Box>
                          <Box>
                            <Typography variant="caption" className="text-gray-500 font-bold uppercase block">Active Bus</Typography>
                            <Typography className="text-white font-bold">{route.bus_name || 'No Bus Assigned'}</Typography>
                          </Box>
                        </Box>
                        {route.bus_plate && (
                          <Chip 
                            label={route.bus_plate} 
                            size="small" 
                            className="bg-blue-600 font-mono text-[11px] font-black text-white rounded-lg px-1"
                          />
                        )}
                      </Box>

                      {/* Stops Timeline */}
                      <Box className="space-y-4 px-2">
                        <Typography variant="caption" className="text-gray-500 font-bold uppercase flex items-center gap-2">
                          <ListOrdered size={14} /> Journey Path
                        </Typography>
                        <Box className="space-y-3 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                          {parsedStops.map((stop, i) => (
                            <Box key={i} className="flex items-center gap-4 relative pl-8">
                              <div className="absolute left-1 w-3 h-3 rounded-full border-2 border-purple-500 bg-[#11111a]" />
                              <Typography variant="body2" className="text-gray-300 flex-1">{stop}</Typography>
                              <Box className="flex items-center gap-1 text-gray-500">
                                <Clock size={12} />
                                <Typography variant="caption" className="font-mono">{parsedEtas[i] || '--'}</Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  );
};

export default ManageRoutes;
