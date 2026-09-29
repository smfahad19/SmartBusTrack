import InstituteField from '../../components/InstituteField';
import PageToolbar from '../../components/PageToolbar';
import DownloadPdfButton from '../../components/DownloadPdfButton';
import RouteStopPicker from '../../components/RouteStopPicker';
import DialogHeader from '../../components/DialogHeader';
import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, TextField, Grid, Card, CardContent,
  IconButton, Chip, InputAdornment, Dialog, DialogContent, CircularProgress
} from '@mui/material';
import { Plus, Trash2, MapPin, Clock, Bus, Navigation, ListOrdered, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const parseList = (value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const ManageRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [routeName, setRouteName] = useState('');
  const [stops, setStops] = useState('');
  const [etas, setEtas] = useState('');
  const [stopCoordinates, setStopCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const [recordInstitute, setRecordInstitute] = useState(user.role === 'superadmin' ? localStorage.getItem('instituteScope') || '' : String(user.institute_id));
  const token = localStorage.getItem('token');

  const fetchRoutes = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/routes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoutes(res.data);
    } catch {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleAddRoute = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const stopsArr = stops.split(',').map(s => s.trim());
      const etasArr = etas.split(',').map(e => e.trim());
      if (stopCoordinates.length !== stopsArr.length || stopCoordinates.some(point => !point || !Number.isFinite(Number(point.lat)) || !Number.isFinite(Number(point.lng)) || Math.abs(point.lat)>90 || Math.abs(point.lng)>180)) {
        toast.error('Place every stop on the map before saving the route.');
        setSaving(false);
        return;
      }
      const payload={ institute_id: recordInstitute, name: routeName, stops: stopsArr, etas: etasArr, stop_coordinates: stopCoordinates };

      if (isEditing) {
        const response=await axios.put(`http://localhost:5001/api/routes/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if(response.data?.mappedStops!==stopsArr.length)throw new Error('The server did not save stop locations. Restart the backend and try again.');
        toast.success('Route updated successfully');
      } else {
        const response=await axios.post('http://localhost:5001/api/routes',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if(response.data?.mappedStops!==stopsArr.length)throw new Error('The server did not save stop locations. Restart the backend and try again.');
        toast.success('New route mapped successfully');
      }

      resetForm();
      fetchRoutes();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Error saving route');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (route) => {
    setRecordInstitute(String(route.institute_id));
    setIsEditing(true);
    setEditingId(route.id);
    setRouteName(route.name);

    const parsedStops = parseList(route.stops);
    const parsedEtas = parseList(route.etas);
    let parsedCoordinates;
    try { parsedCoordinates=JSON.parse(route.stop_coordinates||'[]'); } catch { parsedCoordinates=[]; }

    setStops(parsedStops.join(', '));
    setEtas(parsedEtas.join(', '));
    setStopCoordinates(parsedCoordinates);
    setFormOpen(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setRouteName('');
    setStops('');
    setEtas('');
    setStopCoordinates([]);
    setRecordInstitute(user.role === 'superadmin' ? localStorage.getItem('instituteScope') || '' : String(user.institute_id));
    setFormOpen(false);
  };

  const openAddDialog = () => {
    resetForm();
    setFormOpen(true);
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

  if (loading) return (
    <Box className="h-[60vh] flex items-center justify-center">
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Box className="page-heading">
          <Box>
            <Typography variant="h4" className="text-slate-900 font-bold tracking-tight">Routes & stops</Typography>
            <Typography variant="body2" className="text-slate-500 mt-1">Define university routes and estimated arrival times</Typography>
          </Box>

        </Box>
      </motion.div>
      <PageToolbar>
        <DownloadPdfButton type="routes" />
        <button type="button" className="primary-button" onClick={openAddDialog}><Plus size={18} /> Add route</button>
      </PageToolbar>

      <Dialog open={formOpen} onClose={()=>!saving&&resetForm()} fullWidth maxWidth="md" aria-labelledby="route-form-title">
        <DialogHeader id="route-form-title" disabled={saving} onClose={resetForm}>{isEditing ? 'Edit route' : 'Add route'}</DialogHeader>
        <DialogContent>
          <form className="dialog-form" onSubmit={handleAddRoute}>
            <InstituteField value={recordInstitute} disabled={isEditing} onChange={setRecordInstitute}/>
            <TextField label="Route title" fullWidth value={routeName} onChange={(e)=>setRouteName(e.target.value)} required placeholder="e.g. Blue Line - Sector A"
              InputProps={{ startAdornment: <InputAdornment position="start"><Navigation size={18} /></InputAdornment> }} />
            <TextField label="Stops (comma separated)" fullWidth value={stops} onChange={(e)=>setStops(e.target.value)} required placeholder="Main Gate, Library, Hostel"
              InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} /></InputAdornment> }} />
            <TextField label="ETAs (comma separated)" fullWidth value={etas} onChange={(e)=>setEtas(e.target.value)} required placeholder="5m, 10m, 15m"
              InputProps={{ startAdornment: <InputAdornment position="start"><Clock size={18} /></InputAdornment> }} />
            <RouteStopPicker stops={stops.split(',').map(stop=>stop.trim()).filter(Boolean)} coordinates={stopCoordinates} onChange={setStopCoordinates}/>
            <Box className="form-actions">
              <Button variant="outlined" disabled={saving} onClick={resetForm}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : isEditing ? 'Save changes' : 'Add route'}</Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      {/* Routes Grid */}
      <Grid container spacing={4}>
        {routes.map((route, idx) => {
          const parsedStops = parseList(route.stops);
          const parsedEtas = parseList(route.etas);
          let parsedCoordinates=[];
          try { parsedCoordinates=JSON.parse(route.stop_coordinates||'[]'); } catch { parsedCoordinates=[]; }

          return (
            <Grid size={{ xs: 12, md: 6 }} key={route.id + '-' + (route.bus_id || 'none')}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="bg-white border border-slate-200 hover:border-slate-200 transition-all rounded-3xl overflow-hidden group">
                  <CardContent className="p-0">
                    <Box className="p-6 border-b border-slate-200 flex justify-between items-center bg-white/2">
                      <Box className="flex items-center gap-4">
                        <Box className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <Navigation size={24} />
                        </Box>
                        <Box>
                          <Typography variant="h6" className="text-slate-900 font-bold leading-none">{route.name}</Typography><Typography variant="caption" className="block text-slate-500">{route.institute_name}</Typography>
                          <Typography variant="caption" className="text-slate-500 uppercase font-bold tracking-tighter">
                            {parsedCoordinates.length}/{parsedStops.length} stop locations mapped
                          </Typography>
                        </Box>
                      </Box>
                      <Box className="flex gap-1">
                        <IconButton onClick={() => handleEditClick(route)} className="text-slate-500 hover:text-slate-900 transition-colors">
                          <Pencil size={20} />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteRoute(route.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                          <Trash2 size={20} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box className="p-6 space-y-6">
                      {/* Bus Assignment Info */}
                      <Box className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <Box className="flex items-center gap-3">
                          <Box className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Bus size={20} />
                          </Box>
                          <Box>
                            <Typography variant="caption" className="text-slate-500 font-bold uppercase block">Active Bus</Typography>
                            <Typography className="text-slate-900 font-bold">{route.bus_name || 'No Bus Assigned'}</Typography>
                          </Box>
                        </Box>
                        {route.bus_plate && (
                          <Chip
                            label={route.bus_plate}
                            size="small"
                            className="bg-blue-600 font-mono text-[11px] font-bold text-white rounded-lg px-1"
                          />
                        )}
                      </Box>

                      {/* Stops Timeline */}
                      <Box className="space-y-4 px-2">
                        <Typography variant="caption" className="text-slate-500 font-bold uppercase flex items-center gap-2">
                          <ListOrdered size={14} /> Journey Path
                        </Typography>
                        <Box className="space-y-3 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
                          {parsedStops.map((stop, i) => (
                            <Box key={i} className="flex items-center gap-4 relative pl-8">
                              <div className="absolute left-1 w-3 h-3 rounded-full border-2 border-purple-500 bg-white" />
                              <Typography variant="body2" className="text-slate-600 flex-1">{stop}</Typography>
                              {parsedCoordinates[i]&&<Typography variant="caption" className="font-mono text-slate-500">{parsedCoordinates[i].lat}, {parsedCoordinates[i].lng}</Typography>}
                              <Box className="flex items-center gap-1 text-slate-500">
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
