import InstituteField from '../../components/InstituteField';
import PasswordField from '../../components/PasswordField';
import PageToolbar from '../../components/PageToolbar';
import DownloadPdfButton from '../../components/DownloadPdfButton';
import DialogHeader from '../../components/DialogHeader';
import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, TextField, Grid, Card, CardContent,
  InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, IconButton, Chip, CircularProgress,
  Dialog, DialogContent
} from '@mui/material';
import { UserPlus, Mail, User, Trash2, Shield, Search, Pencil } from 'lucide-react';
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
  const [formOpen, setFormOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const [recordInstitute, setRecordInstitute] = useState(user.role === 'superadmin' ? localStorage.getItem('instituteScope') || '' : String(user.institute_id));
  const token = localStorage.getItem('token');

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/auth/drivers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(res.data);
    } catch {
      toast.error('Failed to load drivers list');
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleRegisterDriver = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5001/api/auth/drivers/${editingId}`,
          { institute_id: recordInstitute, name: driverName, email: driverEmail, password: driverPassword || undefined, phone: driverPhone },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Driver details updated!');
      } else {
        await axios.post('http://localhost:5001/api/auth/register-driver',
          { institute_id: recordInstitute, name: driverName, email: driverEmail, password: 'password123', phone: driverPhone },
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
    setRecordInstitute(String(driver.institute_id));
    setIsEditing(true);
    setEditingId(driver.id);
    setDriverName(driver.name);
    setDriverEmail(driver.email);
    setDriverPhone(driver.phone || '');
    setDriverPassword(''); // Don't show password, only set if changing
    setFormOpen(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setDriverName('');
    setDriverEmail('');
    setDriverPhone('');
    setDriverPassword('');
    setRecordInstitute(user.role === 'superadmin' ? localStorage.getItem('instituteScope') || '' : String(user.institute_id));
    setFormOpen(false);
  };

  const openAddDialog = () => {
    resetForm();
    setFormOpen(true);
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
        <Box className="page-heading">
          <Box>
            <Typography variant="h4" className="text-slate-900 font-bold tracking-tight">Drivers</Typography>
            <Typography variant="body2" className="text-slate-500 mt-1">Manage driver credentials and fleet access</Typography>
          </Box>

        </Box>
      </motion.div>
      <PageToolbar search={<label className="toolbar-search-label">Search drivers                  <TextField
                    size="small"
                    placeholder="Name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { color: 'text.primary', borderRadius: '10px', width: {md: '300px'} }, '& label': { color: 'text.secondary' } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Search size={16} className="text-slate-500" /></InputAdornment>,
                    }}
                  /></label>}>
        <DownloadPdfButton type="drivers" params={{ search: searchTerm }} />
        <button type="button" className="primary-button" onClick={openAddDialog}><UserPlus size={18} /> Add driver</button>
      </PageToolbar>

      <Dialog open={formOpen} onClose={()=>!loading&&resetForm()} fullWidth maxWidth="md" aria-labelledby="driver-form-title">
        <DialogHeader id="driver-form-title" disabled={loading} onClose={resetForm}>{isEditing ? 'Edit driver' : 'Add driver'}</DialogHeader>
        <DialogContent>
          <form className="dialog-form" onSubmit={handleRegisterDriver}>
            <InstituteField value={recordInstitute} disabled={isEditing} onChange={setRecordInstitute}/>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Full name" fullWidth value={driverName} onChange={(e)=>setDriverName(e.target.value)} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} /></InputAdornment> }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Email address" type="email" fullWidth value={driverEmail} onChange={(e)=>setDriverEmail(e.target.value)} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment> }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Contact number" fullWidth value={driverPhone} onChange={(e)=>setDriverPhone(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <PasswordField label={isEditing ? 'New password (optional)' : 'Temporary password'} value={isEditing ? driverPassword : 'password123'} readOnly={!isEditing} minLength={8} autoComplete="new-password" onChange={e=>setDriverPassword(e.target.value)}/>
                <p className="form-note">Password change required on first sign-in.</p>
              </Grid>
            </Grid>
            <Box className="form-actions">
              <Button variant="outlined" disabled={loading} onClick={resetForm}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving...' : isEditing ? 'Save changes' : 'Add driver'}</Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      <Grid container spacing={4}>
        {/* Drivers List */}
        <Grid size={{ xs: 12 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <Box className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                  <Box className="flex items-center gap-3">
                    <Box className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                      <Shield size={22} />
                    </Box>
                    <Typography variant="h6" className="text-slate-900 font-bold">Registered Drivers</Typography>
                  </Box>

                </Box>

                {fetching ? (
                  <Box className="p-20 flex justify-center"><CircularProgress /></Box>
                ) : (
                  <TableContainer component={Box} className="max-h-[600px] overflow-auto">
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell className="bg-white text-slate-500 border-slate-200 font-bold">Personnel</TableCell>
                          <TableCell className="bg-white text-slate-500 border-slate-200 font-bold">Email</TableCell>
                          <TableCell className="bg-white text-slate-500 border-slate-200 font-bold">Contact</TableCell>
                          <TableCell className="bg-white text-slate-500 border-slate-200 font-bold">Role</TableCell>
                          <TableCell className="bg-white text-slate-500 border-slate-200 font-bold align-right text-right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredDrivers.map((driver) => (
                          <TableRow key={driver.id} hover className="transition-colors group">
                            <TableCell className="border-slate-200">
                              <Box className="flex items-center gap-3">
                                <Avatar sx={{ width: 36, height: 36, bgcolor: '#3b82f6', fontWeight: 'bold' }}>
                                  {driver.name.charAt(0)}
                                </Avatar>
                                <Box><Typography className="text-slate-900 font-medium">{driver.name}</Typography><Typography variant="caption" className="text-slate-500">{driver.institute_name}</Typography></Box>
                              </Box>
                            </TableCell>
                            <TableCell className="border-slate-200 text-slate-500">{driver.email}</TableCell>
                            <TableCell className="border-slate-200 text-slate-500">{driver.phone || '-'}</TableCell>
                            <TableCell className="border-slate-200">
                              <Chip label="DRIVER" size="small" className="bg-blue-500/10 text-blue-500 font-bold text-[10px]" />
                            </TableCell>
                            <TableCell className="border-slate-200 text-right">
                              <Box className="flex justify-end gap-1">
                                <IconButton size="small" onClick={() => handleEditClick(driver)} className="text-slate-500 hover:text-blue-500 transition-colors opacity-100">
                                  <Pencil size={18} />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDeleteDriver(driver.id)} className="text-slate-500 hover:text-red-500 transition-colors opacity-100">
                                  <Trash2 size={18} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredDrivers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-20 border-none text-slate-500 italic">
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
