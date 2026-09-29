import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Card, CardContent, Grid,
  Chip, Avatar, Divider, IconButton, Tooltip, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Paper, Stepper, Step, StepLabel, StepConnector, stepConnectorClasses
} from '@mui/material';
import {
  Navigation, Map as MapIcon, Bus as BusIcon,
  Flag, Coffee, ChevronRight, ListOrdered, Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
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

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => { if (coords) map.setView(coords, map.getZoom()); }, [coords]);
  return null;
};

const DriverDashboard = () => {
  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState('On time');
  const [isSharing, setIsSharing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState([31.5204, 74.3587]);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stopCountdown, setStopCountdown] = useState(0);
  const [isAtStop, setIsAtStop] = useState(false);
  const [arrivedTimer, setArrivedTimer] = useState(false);
  const [finalCountdown, setFinalCountdown] = useState(0);
  const [history, setHistory] = useState([]);
  const watchId = useRef(null);
  const simulationId = useRef(null);
  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    if (simulationId.current !== null) clearInterval(simulationId.current);
  }, []);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      const busRes = await axios.get('http://localhost:5001/api/buses/my-bus', { headers: { Authorization: `Bearer ${token}` } });
      setBus(busRes.data);
      setStatus(busRes.data.status);
      if (busRes.data.lat) setCurrentLocation([busRes.data.lat, busRes.data.lng]);

      if (busRes.data.route) {
        const routeRes = await axios.get('http://localhost:5001/api/routes', { headers: { Authorization: `Bearer ${token}` } });
        const assignedRoute = routeRes.data.find(r => r.name === busRes.data.route);
        if (assignedRoute) {
          const stops = JSON.parse(assignedRoute.stops);
          setRoute({ ...assignedRoute, parsedStops: stops, parsedEtas: JSON.parse(assignedRoute.etas) });
          const idx = stops.indexOf(busRes.data.current_stop);
          setActiveStopIndex(idx !== -1 ? idx : 0);
        }
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let timer;
    if (stopCountdown > 0) {
      timer = setInterval(() => setStopCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [stopCountdown]);

  useEffect(() => {
    let timer;
    if (finalCountdown > 0) {
      timer = setInterval(() => setFinalCountdown(prev => prev - 1), 1000);
    } else if (finalCountdown === 0 && arrivedTimer) {
      handleResetTrip();
    }
    return () => clearInterval(timer);
  }, [finalCountdown, arrivedTimer]);

  const startTracking = () => {
    setIsSharing(true);
    toast.success("Satellite Link Established. Broadcasting Live.");
    watchId.current = navigator.geolocation.watchPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const newPos = [latitude, longitude];
      setCurrentLocation(newPos);
      setHistory(prev => [...prev, newPos]);
      try {
        await axios.put(`http://localhost:5001/api/buses/${bus.id}/location`, { lat: latitude, lng: longitude }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (e) { }
    }, null, { enableHighAccuracy: true });
  };

  const simulateMovement = () => {
    if (simulationId.current !== null) clearInterval(simulationId.current);
    setIsSharing(true);
    toast.info("Simulation: Moving along route...");
    let step = 0;
    const baseLat = currentLocation[0];
    const baseLng = currentLocation[1];
    const interval = setInterval(async () => {
      const nextLat = baseLat + (step * 0.0005);
      const nextLng = baseLng + (step * 0.0008);
      const newPos = [nextLat, nextLng];
      setCurrentLocation(newPos);
      setHistory(prev => [...prev, newPos]);

      try {
        await axios.put(`http://localhost:5001/api/buses/${bus.id}/location`, { lat: nextLat, lng: nextLng }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (e) { }

      step++;
      if (step > 30) clearInterval(interval);
    }, 2000);
    simulationId.current = interval;
  };

  const handleArriveAtStop = async () => {
    const stopName = route.parsedStops[activeStopIndex];
    setIsAtStop(true);
    setStopCountdown(180);
    try {
      await axios.put(`http://localhost:5001/api/buses/${bus.id}/stop`, { stopName }, { headers: { Authorization: `Bearer ${token}` } });
      const statusText = `Arrived at ${stopName}`;
      await axios.put(`http://localhost:5001/api/buses/${bus.id}/status`, { status: statusText }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus(statusText);
      toast.success(statusText);
    } catch (e) { }
  };

  const handleLeaveStop = async () => {
    const isFinal = activeStopIndex === route.parsedStops.length - 1;
    if (isFinal) {
      setArrivedTimer(true);
      setFinalCountdown(60);
      try {
        await axios.put(`http://localhost:5001/api/buses/${bus.id}/status`, { status: 'Journey Completed' }, { headers: { Authorization: `Bearer ${token}` } });
      } catch(e) {}
      return;
    }

    setIsAtStop(false);
    setStopCountdown(0);
    const nextIdx = activeStopIndex + 1;
    const nextStopName = route.parsedStops[nextIdx];
    
    // Crucially: Don't update the stop name in DB yet, only the status
    // This way student panel knows we are MOVING but still lists last stop
    try {
      const statusText = `Moving toward ${nextStopName}`;
      await axios.put(`http://localhost:5001/api/buses/${bus.id}/status`, { status: statusText }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus(statusText);
      toast.info(statusText);
      // We advance the index for the driver's UI to show what's next
      setActiveStopIndex(nextIdx);
    } catch (e) { }
  };

  const handleResetTrip = () => {
    setActiveStopIndex(0);
    setIsAtStop(false);
    setArrivedTimer(false);
    setHistory([]);
    setStatus('On time');
  };

  const handleTrafficDelay = async () => {
    try {
      const statusText = 'Delayed due to traffic';
      await axios.put(`http://localhost:5001/api/buses/${bus.id}/status`, { status: statusText }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus(statusText);
      toast.warning('Traffic delay reported to students');
    } catch (e) {
      toast.error('Failed to report delay');
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return <Box className="h-screen flex items-center justify-center bg-[#0a0a0f]"><CircularProgress /></Box>;

  return (
    <Box className="pb-10 relative bg-[#0a0a0f]">
      <AnimatePresence>
        {arrivedTimer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center">
            <Box className="text-center p-16 bg-[#11111a] border border-blue-500/30 rounded-[60px] shadow-[0_0_100px_rgba(59,130,246,0.2)] max-w-lg">
              <Flag size={80} className="text-blue-500 mx-auto mb-8 animate-bounce" />
              <Typography variant="h2" className="text-white font-black mb-4 tracking-tighter">FINISH LINE</Typography>
              <Typography className="text-gray-400 mb-10 text-xl font-bold">Route completed. System cooldown active.</Typography>
              <Box className="p-8 bg-blue-500/5 rounded-[40px] border border-blue-500/10 mb-10">
                <Typography variant="h1" className="text-blue-500 font-mono font-black">{formatTime(finalCountdown)}</Typography>
              </Box>
              <Button fullWidth variant="contained" onClick={handleResetTrip} className="bg-blue-600 py-5 rounded-[24px] font-black text-2xl shadow-xl shadow-blue-900/40">RESTART SYSTEM</Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Box className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <Box>
          <Typography variant="h3" className="text-white font-black tracking-tighter flex items-center gap-4">
            Command Center <Activity className="text-blue-500 animate-pulse" />
          </Typography>
          <Typography variant="body1" className="text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">{bus?.name} | {bus?.number_plate}</Typography>
        </Box>
        <Box className="flex gap-3 w-full md:w-auto">
          <Button variant="outlined" onClick={simulateMovement} className="border-blue-500 text-blue-500 rounded-2xl px-6 py-4 font-black">SIMULATE</Button>
          {!isSharing ? (
            <Button variant="contained" onClick={startTracking} className="bg-blue-600 hover:bg-blue-700 rounded-2xl px-12 py-4 font-black shadow-xl shadow-blue-900/40">START BROADCAST</Button>
          ) : (
            <Box className="bg-green-500/10 border border-green-500/20 px-6 py-4 rounded-2xl flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <Typography className="text-green-500 font-black tracking-widest text-sm">TRANSMITTING LIVE</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card className="bg-[#11111a] border border-white/5 rounded-[40px] shadow-2xl p-8 sticky top-4">
            <Box className="mb-10 text-center">
              <Typography variant="caption" className="text-gray-500 font-black uppercase tracking-[0.2em] block mb-2">Current Objective</Typography>
              <Typography variant="h4" className="text-white font-black">{isAtStop ? 'HOLDING AT STOP' : `MOVING TO ${route?.parsedStops[activeStopIndex]}`}</Typography>
            </Box>

            <Stepper orientation="vertical" activeStep={activeStopIndex} connector={<ColorlibConnector />}>
              {route?.parsedStops.map((stop, index) => (
                <Step key={stop} completed={index < activeStopIndex}>
                  <StepLabel StepIconProps={{ sx: { color: index < activeStopIndex ? '#3b82f6' : index === activeStopIndex ? '#3b82f6' : '#1e1e2e' } }}>
                    <Box sx={{ opacity: index < activeStopIndex ? 0.3 : 1, filter: index < activeStopIndex ? 'grayscale(1)' : 'none' }}>
                      <Typography className="text-white font-black text-lg">{stop}</Typography>
                      <Typography variant="caption" className="text-blue-500 font-black">{route.parsedEtas[index]}</Typography>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Divider className="border-white/5 my-10" />

            <Box>
              {!isAtStop ? (
                <>
                  <Button fullWidth variant="contained" onClick={handleArriveAtStop} className="bg-orange-600 hover:bg-orange-700 rounded-[24px] py-6 font-black text-xl shadow-xl shadow-orange-900/40">
                    MARK ARRIVAL
                  </Button>
                  <Box className="mt-4">
                    <Button fullWidth variant="outlined" onClick={handleTrafficDelay} className="border-red-500 text-red-500 hover:bg-red-500/10 rounded-[24px] py-4 font-black text-lg">
                      REPORT TRAFFIC DELAY
                    </Button>
                  </Box>
                </>
              ) : (
                <Box className="p-8 bg-blue-600/5 rounded-[32px] border border-blue-500/20 text-center">
                  <Typography className="text-blue-500 font-black uppercase tracking-widest mb-2">Break Remaining</Typography>
                  <Typography variant="h2" className="text-white font-mono font-black mb-8">{formatTime(stopCountdown)}</Typography>
                  <Button fullWidth variant="contained" onClick={handleLeaveStop} className="bg-blue-600 hover:bg-blue-700 rounded-[24px] py-5 font-black text-xl">
                    PROCEED <ChevronRight size={24} className="ml-2" />
                  </Button>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Card className="bg-[#11111a] border border-white/5 rounded-[56px] overflow-hidden relative shadow-2xl h-[800px] border-t-blue-500/20">
            <MapContainer center={currentLocation} zoom={16} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
              <RecenterMap coords={currentLocation} />
              <Polyline positions={history} color="#3b82f6" weight={5} opacity={0.6} />
              <Marker position={currentLocation} icon={busIcon}>
                <Popup><Typography className="font-bold">{bus?.name}</Typography></Popup>
              </Marker>
            </MapContainer>

            <Box className="absolute top-10 right-10 z-[1000]">
              <Paper className="bg-[#11111a]/80 backdrop-blur-xl border border-white/5 p-4 rounded-3xl">
                <Box className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  <Typography className="text-white font-bold text-sm">GPS LOCK: 31.52°N, 74.35°E</Typography>
                </Box>
              </Paper>
            </Box>

            <Box className="absolute bottom-12 left-12 right-12 z-[1000]">
              <Button fullWidth variant="contained" className="bg-white text-black py-6 rounded-[28px] font-black text-lg hover:bg-gray-100 shadow-2xl" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${currentLocation[0]},${currentLocation[1]}`, '_blank')}>
                <Navigation size={22} className="mr-3" /> LAUNCH GOOGLE MAPS CO-PILOT
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriverDashboard;
