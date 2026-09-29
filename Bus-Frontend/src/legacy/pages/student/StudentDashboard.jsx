import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { 
  Box, Typography, Button, Card, CardContent, Chip, Grid, 
  CircularProgress, IconButton, Avatar, Tooltip, Divider,
  Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, Paper
} from '@mui/material';
import { 
  MapPin, Bus as BusIcon, Navigation, Activity, 
  CheckCircle, AlertCircle, Clock, LocateFixed, Eye,
  ExternalLink, Bell, Milestone, ChevronRight, Timer, X, Users
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

// --- Custom Styled Connector ---
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: { [`& .${stepConnectorClasses.line}`]: { backgroundColor: '#3b82f6' } },
  [`&.${stepConnectorClasses.completed}`]: { [`& .${stepConnectorClasses.line}`]: { backgroundColor: '#3b82f6' } },
  [`& .${stepConnectorClasses.line}`]: { height: 3, border: 0, backgroundColor: '#1e1e2e', borderRadius: 1 },
}));

const busIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [0, -40]
});

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 16); }, [center]);
  return null;
};

// Fixes React Leaflet black screen on remount by invalidating tile size
const MapInitializer = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const StudentDashboard = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [followBusId, setFollowBusId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTimers, setActiveTimers] = useState({}); // { busId: seconds }
  
  const token = localStorage.getItem('token');
  const socketRef = useRef(null);

  const fetchData = async () => {
    try {
      const [busRes, routeRes] = await Promise.all([
        axios.get('http://localhost:5001/api/buses', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5001/api/routes', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const busData = busRes.data;
      setBuses(busData);
      setRoutes(routeRes.data.map(r => ({
        ...r,
        parsedStops: typeof r.stops === 'string' ? JSON.parse(r.stops) : r.stops,
        parsedEtas: typeof r.etas === 'string' ? JSON.parse(r.etas) : r.etas
      })));

      // Auto-select bus if coming from "Track this Route" in BusList
      const trackRouteName = sessionStorage.getItem('trackRouteName');
      if (trackRouteName) {
        const targetBus = busData.find(b => b.route === trackRouteName);
        if (targetBus) setFollowBusId(targetBus.id);
        sessionStorage.removeItem('trackRouteName');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const addNotification = (msg) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => {
      const newList = [{ id, msg }, ...prev];
      return newList.slice(0, 3);
    });
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    fetchData();
    socketRef.current = io('http://localhost:5001', { transports: ['websocket'] });

    socketRef.current.on('connect', () => setSocketConnected(true));

    socketRef.current.on('locationUpdate', (data) => {
      setBuses(prev => prev.map(bus => {
        if (bus.id === parseInt(data.id)) {
          const newPos = [data.lat, data.lng];
          // If this is the followed bus, update its history for the trail
          return { ...bus, lat: data.lat, lng: data.lng, history: [...(bus.history || []), newPos].slice(-50) };
        }
        return bus;
      }));
    });

    socketRef.current.on('statusUpdate', (data) => {
      setBuses(prev => prev.map(bus => {
        if (bus.id === parseInt(data.id)) {
          if (data.status.includes('Arrived')) {
            setActiveTimers(t => ({ ...t, [bus.id]: 180 })); // Sync 3 min timer
          } else {
            setActiveTimers(t => { const newT = { ...t }; delete newT[bus.id]; return newT; });
          }
          addNotification(`${bus.name}: ${data.status}`);
          return { ...bus, status: data.status };
        }
        return bus;
      }));
    });

    socketRef.current.on('stopUpdate', (data) => {
      setBuses(prev => prev.map(bus => {
        if (bus.id === parseInt(data.id)) {
          addNotification(`${bus.name} reached ${data.current_stop}`);
          return { ...bus, current_stop: data.current_stop };
        }
        return bus;
      }));
    });

    return () => socketRef.current.disconnect();
  }, []);

  // Timer interval for student side
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (next[id] > 0) next[id] -= 1;
          else delete next[id];
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getFollowedBus = () => buses.find(b => b.id === followBusId);
  const getBusRoute = (bus) => routes.find(r => r.name === bus?.route);
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return <Box className="h-screen flex items-center justify-center bg-[#0a0a0f]"><CircularProgress /></Box>;

  return (
    <Box className="pb-10 bg-[#0a0a0f] min-h-screen">
      {/* Real-time Toast Notifications */}
      <Box className="fixed top-24 right-6 z-[3000] space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div key={n.id} initial={{ opacity: 0, y: -20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.5, x: 50 }}>
              <Paper className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(37,99,235,0.4)] flex items-center gap-4 border border-white/20 backdrop-blur-xl pointer-events-auto">
                <Avatar className="bg-white/20 text-white w-8 h-8"><Bell size={16} /></Avatar>
                <Typography variant="body2" className="font-black tracking-tight flex-1">{n.msg}</Typography>
                <IconButton size="small" onClick={() => removeNotification(n.id)} className="text-white/50 hover:text-white transition-colors">
                  <X size={16} />
                </IconButton>
              </Paper>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      <Box className="flex justify-between items-center mb-10">
        <Box>
          <Typography variant="h3" className="text-white font-black tracking-tighter flex items-center gap-4">
            Live Fleet Monitor <Activity className="text-blue-500 animate-pulse" />
          </Typography>
          <Typography variant="body1" className="text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">
            {socketConnected ? 'Satellite Link: ACTIVE' : 'RECONNECTING...'}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Fleet Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box className="space-y-6">
            <Typography variant="caption" className="text-gray-600 font-black uppercase tracking-[0.25em] block mb-2">Operational Fleet</Typography>
            {buses.map(bus => {
              const busRoute = getBusRoute(bus);
              const activeStopIdx = busRoute?.parsedStops.indexOf(bus.current_stop) || 0;
              const isSelected = followBusId === bus.id;
              const timer = activeTimers[bus.id];

              return (
                <Card 
                  key={bus.id}
                  onClick={() => setFollowBusId(bus.id)}
                  className={`bg-[#11111a] border ${isSelected ? 'border-blue-500' : 'border-white/5'} rounded-[32px] cursor-pointer transition-all hover:border-white/20 overflow-hidden shadow-2xl`}
                >
                  <CardContent className="p-8">
                    <Box className="flex justify-between items-start mb-6">
                      <Box className="flex items-center gap-4">
                        <Avatar className={isSelected ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400"} sx={{ width: 48, height: 48 }}>
                          <BusIcon size={24} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" className="text-white font-black leading-tight">{bus.name}</Typography>
                          <Typography variant="caption" className="text-gray-500 font-black uppercase tracking-widest block">{bus.number_plate}</Typography>
                          <Typography variant="caption" className="text-blue-400 font-bold flex items-center gap-1 mt-1">
                            <Users size={12} /> {bus.driver_name || 'Unassigned'}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={bus.status} 
                        size="small" 
                        className={`font-black uppercase text-[10px] ${bus.status.includes('Arrived') ? 'bg-orange-600 text-white' : bus.status.includes('Moving') ? 'bg-green-600 text-white' : 'bg-blue-500/10 text-blue-500'}`} 
                      />
                    </Box>

                    {timer > 0 && (
                      <Box className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-between">
                        <Box className="flex items-center gap-2 text-orange-500">
                          <Timer size={16} className="animate-spin-slow" />
                          <Typography variant="caption" className="font-black">STOP DELAY</Typography>
                        </Box>
                        <Typography className="text-white font-mono font-black">{formatTime(timer)}</Typography>
                      </Box>
                    )}

                    {isSelected && busRoute && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                        <Divider className="border-white/5 mb-6" />
                        <Typography variant="caption" className="text-gray-600 font-black uppercase tracking-widest block mb-4">Route Journey</Typography>
                        <Stepper orientation="vertical" activeStep={activeStopIdx} connector={<ColorlibConnector />}>
                          {busRoute.parsedStops.map((stop, i) => (
                            <Step key={stop} completed={i < activeStopIdx}>
                              <StepLabel StepIconProps={{ sx: { color: i <= activeStopIdx ? '#3b82f6' : '#1e1e2e' } }}>
                                <Box sx={{ opacity: i < activeStopIdx ? 0.3 : 1 }}>
                                  <Typography className="text-white font-black text-sm">{stop}</Typography>
                                  <Typography variant="caption" className="text-blue-500 font-bold">{busRoute.parsedEtas[i]}</Typography>
                                </Box>
                              </StepLabel>
                            </Step>
                          ))}
                        </Stepper>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Grid>

        {/* Immersive Tracking Console */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card className="bg-[#11111a] border border-white/5 rounded-[56px] overflow-hidden relative shadow-2xl h-[750px] border-t-blue-500/20">
             <MapContainer center={[31.5204, 74.3587]} zoom={15} style={{ height: '100%', width: '100%' }}>
                <MapInitializer />
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                <MapController center={followBusId && getFollowedBus()?.lat && getFollowedBus()?.lng ? [getFollowedBus().lat, getFollowedBus().lng] : null} />
                
                {buses.map(bus => (
                  <div key={bus.id}>
                    {bus.history && <Polyline positions={bus.history} color="#3b82f6" weight={4} opacity={0.5} />}
                    <Marker position={[bus.lat || 31.5204, bus.lng || 74.3587]} icon={busIcon}>
                      <Popup className="custom-popup">
                        <Box className="p-2 min-w-[150px]">
                          <Typography className="font-black text-blue-600">{bus.name}</Typography>
                          <Typography variant="caption" className="text-gray-400 font-bold uppercase">{bus.status}</Typography>
                          <Divider className="my-2" />
                          <Box className="flex items-center gap-2">
                            <Milestone size={14} className="text-blue-500" />
                            <Typography variant="body2" className="font-bold">{bus.current_stop || 'Tracking...'}</Typography>
                          </Box>
                          <Box className="flex items-center gap-2 mt-1">
                            <Users size={14} className="text-blue-500" />
                            <Typography variant="caption" className="font-bold text-gray-400">Driver: {bus.driver_name || 'Unassigned'}</Typography>
                          </Box>
                        </Box>
                      </Popup>
                    </Marker>
                  </div>
                ))}
             </MapContainer>

             {followBusId && (
               <Box className="absolute bottom-12 left-12 right-12 z-[1000] flex gap-4">
                  <Button 
                    fullWidth 
                    variant="contained" 
                    className="bg-white text-black py-6 rounded-[28px] font-black text-xl shadow-2xl hover:bg-gray-100"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${getFollowedBus()?.lat},${getFollowedBus()?.lng}`, '_blank')}
                  >
                    <Navigation size={24} className="mr-3" /> TRACK IN GOOGLE MAPS
                  </Button>
               </Box>
             )}

             <Box className="absolute top-10 right-10 z-[1000]">
                <Paper className="bg-black/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl">
                  <Typography variant="caption" className="text-blue-500 font-black tracking-widest block mb-1">SELECTED UNIT</Typography>
                  <Typography className="text-white font-black">{getFollowedBus()?.name || 'Awaiting Target...'}</Typography>
                </Paper>
             </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
