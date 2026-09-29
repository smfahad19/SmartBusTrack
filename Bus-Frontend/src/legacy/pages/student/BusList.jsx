import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Grid, Card, CardContent, Chip, Divider, Avatar, Button } from '@mui/material';
import { MapPin, Clock, Navigation, ListOrdered, Bus as BusIcon, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const BusList = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/routes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoutes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  return (
    <Box className="pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Box className="mb-10">
          <Typography variant="h4" className="text-white font-black tracking-tight">Fleet Schedule</Typography>
          <Typography variant="body2" className="text-gray-400 mt-1 uppercase tracking-widest font-bold">University Route Map & Timing Guide</Typography>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        {routes.map((route, idx) => {
          let parsedStops = [];
          let parsedEtas = [];
          try {
            parsedStops = typeof route.stops === 'string' ? JSON.parse(route.stops) : (route.stops || []);
            parsedEtas = typeof route.etas === 'string' ? JSON.parse(route.etas) : (route.etas || []);
          } catch (e) { }

          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={route.id}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-[#11111a] border border-white/5 hover:border-white/20 transition-all rounded-[32px] overflow-hidden group h-full flex flex-col">
                  <Box className="h-2 bg-gradient-to-right from-purple-500 to-blue-600" />
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <Box className="flex justify-between items-start mb-6">
                      <Box className="flex items-center gap-4">
                        <Box className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <Navigation size={24} />
                        </Box>
                        <Box>
                          <Typography variant="h6" className="text-white font-black leading-none">{route.name}</Typography>
                          <Typography variant="caption" className="text-gray-500 font-bold uppercase tracking-widest">
                            {parsedStops.length} Total Stops
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Route Bus Info */}
                    <Box className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <Box className="flex items-center gap-3">
                        <BusIcon size={18} className="text-blue-500" />
                        <Typography variant="caption" className="text-gray-300 font-bold">
                          {route.bus_name || 'No Bus Assigned'}
                        </Typography>
                      </Box>
                      {route.bus_plate && (
                        <Box className="flex flex-col items-end gap-1">
                          <Chip label={route.bus_plate} size="small" className="bg-blue-600 text-white font-black text-[9px]" />
                          <Typography variant="caption" className="text-gray-500 font-bold text-[10px] flex items-center gap-1">
                            <Users size={10} /> {route.driver_name || 'No Driver'}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider className="border-white/5 mb-6" />

                    {/* Timeline Path */}
                    <Box className="space-y-6 relative flex-1">
                      {parsedStops.map((stop, i) => (
                        <Box 
                          key={i} 
                          className="flex gap-4 relative group/stop cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all"
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop + ' Lahore')}`, '_blank')}
                        >
                          <Box className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white/20 shadow-[0_0_10px_rgba(168,85,247,0.4)] group-hover/stop:scale-125 transition-transform" />
                            {i < parsedStops.length - 1 && <div className="w-0.5 h-full bg-white/5 my-1" />}
                          </Box>
                          <Box className="flex-1">
                            <Box className="flex items-center justify-between">
                              <Typography variant="body2" className="text-white font-bold leading-none">{stop}</Typography>
                              <MapPin size={14} className="text-gray-600 group-hover/stop:text-blue-500 transition-colors" />
                            </Box>
                            <Typography variant="caption" className="text-gray-500 font-mono flex items-center gap-1 mt-1">
                              <Clock size={10} /> {parsedEtas[i] || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    <Button 
                      fullWidth 
                      variant="outlined" 
                      onClick={() => {
                        // Save route name so StudentDashboard can auto-select the correct bus
                        sessionStorage.setItem('trackRouteName', route.name);
                        navigate('/student');
                      }}
                      className="mt-6 border-white/10 text-gray-400 rounded-xl py-3 font-bold hover:border-blue-500 hover:text-blue-500 transition-all"
                    >
                      Track this Route
                    </Button>
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

export default BusList;
