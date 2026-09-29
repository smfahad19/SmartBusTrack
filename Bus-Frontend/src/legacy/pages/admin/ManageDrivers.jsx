import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Button, TextField, Grid, Card, CardContent, 
  InputAdornment, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Avatar, IconButton, Chip, CircularProgress 
} from '@mui/material';
import { UserPlus, Mail, Lock, User, ShieldCheck, Trash2, Shield, Search, Pencil, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ManageDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPassword, setDriverPassword] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchDrivers = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/auth/drivers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load drivers list');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleRegisterDriver = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5001/api/auth/drivers/${editingId}`, 
          { name: driverName, email: driverEmail, password: driverPassword || undefined, phone: driverPhone },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Driver details updated!');
      } else {
        await axios.post('http://localhost:5001/api/auth/register-driver', 
          { name: driverName, email: driverEmail, password: driverPassword, phone: driverPhone },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Driver account created successfully!');
      }
      resetForm();
      fetchDrivers(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving driver');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (driver) => {
    setIsEditing(true);
    setEditingId(driver.id);
    setDriverName(driver.name);
    setDriverEmail(driver.email);
    setDriverPhone(driver.phone || '');
    setDriverPassword(''); // Don't show password, only set if changing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setDriverName('');
    setDriverEmail('');
    setDriverPhone('');
    setDriverPassword('');
  };

  const handleDeleteDriver = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver? This will also unassign them from any bus.')) return;
    try {
      await axios.delete(`http://localhost:5001/api/auth/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Driver removed');
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error deleting driver');
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Box className="flex justify-between items-center mb-8">
          <Box>
            <Typography variant="h4" className="text-white font-black tracking-tight">Driver Personnel</Typography>
            <Typography variant="body2" className="text-gray-400 mt-1">Manage driver credentials and fleet access</Typography>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        {/* Registration Form */}
        <Grid size={{ xs: 12 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-[#11111a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl sticky top-24">
              <Box className="h-2 bg-blue-600" />
              <CardContent className="p-8">
                <Box className="flex items-center gap-4 mb-8">
                  <Box className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                    <UserPlus size={28} />
                  </Box>
                  <Box>
                    <Typography variant="h6" className="text-white font-bold">{isEditing ? 'Update Driver' : 'New Registration'}</Typography>
                    <Typography variant="caption" className="text-gray-500">{isEditing ? 'Modify driver credentials' : 'Create a secure driver account'}</Typography>
                  </Box>
                </Box>
                
                <form onSubmit={handleRegisterDriver}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                      <TextField 
                        label="Full Name" 
                        fullWidth 
                        value={driverName} 
                        onChange={(e)=>setDriverName(e.target.value)} 
                        required 
                        sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><User size={18} className="text-gray-500" /></InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                      <TextField 
                        label="Email Address" 
                        type="email" 
                        fullWidth 
                        value={driverEmail} 
                        onChange={(e)=>setDriverEmail(e.target.value)} 
                        required 
                        sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Mail size={18} className="text-gray-500" /></InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                      <TextField 
                        label="Contact Number" 
                        fullWidth 
                        value={driverPhone} 
                        onChange={(e)=>setDriverPhone(e.target.value)} 
                        sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                      <TextField 
                        label={isEditing ? "New Password (Optional)" : "Temporary Password"} 
                        type="password" 
                        fullWidth 
                        value={driverPassword} 
                        onChange={(e)=>setDriverPassword(e.target.value)} 
                        required={!isEditing} 
                        sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Lock size={18} className="text-gray-500" /></InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Box className="flex gap-3 mt-2">
                        <Button 
                          type="submit" 
                          disabled={loading}
                          variant="contained" 
                          className="bg-blue-600 hover:bg-blue-700 py-4 px-8 rounded-xl font-bold shadow-lg shadow-blue-900/20 w-auto min-w-[200px]"
                        >
                          {loading ? 'Processing...' : (isEditing ? 'Update Details' : 'Register Driver')}
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
        </Grid>

        {/* Drivers List */}
        <Grid size={{ xs: 12 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-[#11111a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                <Box className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                  <Box className="flex items-center gap-3">
                    <Box className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                      <Shield size={22} />
                    </Box>
                    <Typography variant="h6" className="text-white font-bold">Registered Drivers</Typography>
                  </Box>
                  <TextField 
                    size="small"
                    placeholder="Search drivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '10px', width: {md: '300px'} }, '& label': { color: '#64748b' } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Search size={16} className="text-gray-500" /></InputAdornment>,
                    }}
                  />
                </Box>

                {fetching ? (
                  <Box className="p-20 flex justify-center"><CircularProgress /></Box>
                ) : (
                  <TableContainer component={Box} className="max-h-[600px] overflow-auto">
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell className="bg-[#11111a] text-gray-400 border-white/5 font-bold">Personnel</TableCell>
                          <TableCell className="bg-[#11111a] text-gray-400 border-white/5 font-bold">Email</TableCell>
                          <TableCell className="bg-[#11111a] text-gray-400 border-white/5 font-bold">Contact</TableCell>
                          <TableCell className="bg-[#11111a] text-gray-400 border-white/5 font-bold">Role</TableCell>
                          <TableCell className="bg-[#11111a] text-gray-400 border-white/5 font-bold align-right text-right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredDrivers.map((driver) => (
                          <TableRow key={driver.id} className="hover:bg-white/5 transition-colors group">
                            <TableCell className="border-white/5">
                              <Box className="flex items-center gap-3">
                                <Avatar sx={{ width: 36, height: 36, bgcolor: '#3b82f6', fontWeight: 'bold' }}>
                                  {driver.name.charAt(0)}
                                </Avatar>
                                <Typography className="text-white font-medium">{driver.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell className="border-white/5 text-gray-400">{driver.email}</TableCell>
                            <TableCell className="border-white/5 text-gray-400">{driver.phone || '-'}</TableCell>
                            <TableCell className="border-white/5">
                              <Chip label="DRIVER" size="small" className="bg-blue-500/10 text-blue-500 font-bold text-[10px]" />
                            </TableCell>
                            <TableCell className="border-white/5 text-right">
                              <Box className="flex justify-end gap-1">
                                <IconButton size="small" onClick={() => handleEditClick(driver)} className="text-gray-500 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100">
                                  <Pencil size={18} />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDeleteDriver(driver.id)} className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                  <Trash2 size={18} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredDrivers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-20 border-none text-gray-500 italic">
                              No drivers found matching your search.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManageDrivers;
