import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Button, TextField, Grid, Card, CardContent, 
  InputAdornment, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Avatar, IconButton, Chip, CircularProgress 
} from '@mui/material';
import { UserPlus, Mail, Lock, User, ShieldCheck, Trash2, Search, Pencil, X, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/auth/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students list');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5001/api/auth/students/${editingId}`, 
          { name: studentName, email: studentEmail, password: studentPassword || undefined },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Student details updated!');
      } else {
        await axios.post('http://localhost:5001/api/auth/signup', 
          { name: studentName, email: studentEmail, password: studentPassword, role: 'student' }
        );
        toast.success('Student account created successfully!');
      }
      resetForm();
      fetchStudents(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving student');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (student) => {
    setIsEditing(true);
    setEditingId(student.id);
    setStudentName(student.name);
    setStudentEmail(student.email);
    setStudentPassword(''); // Don't show password, only set if changing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setStudentName('');
    setStudentEmail('');
    setStudentPassword('');
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student account?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/auth/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Student removed');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error deleting student');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Box className="flex justify-between items-center mb-8">
          <Box>
            <Typography variant="h4" className="text-white font-black tracking-tight">Student Directory</Typography>
            <Typography variant="body2" className="text-gray-400 mt-1">Manage student accounts and access</Typography>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        {/* Form */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-[#11111a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl sticky top-24">
              <Box className="h-2 bg-purple-600" />
              <CardContent className="p-8">
                <Box className="flex items-center gap-4 mb-8">
                  <Box className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                    <UserPlus size={28} />
                  </Box>
                  <Box>
                    <Typography variant="h6" className="text-white font-bold">{isEditing ? 'Update Student' : 'Add Student'}</Typography>
                    <Typography variant="caption" className="text-gray-500">{isEditing ? 'Modify student profile' : 'Create a new student record'}</Typography>
                  </Box>
                </Box>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <TextField 
                    label="Full Name" 
                    fullWidth 
                    value={studentName} 
                    onChange={(e)=>setStudentName(e.target.value)} 
                    required 
                    sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><User size={18} className="text-gray-500" /></InputAdornment>,
                    }}
                  />
                  <TextField 
                    label="Email Address" 
                    type="email" 
                    fullWidth 
                    value={studentEmail} 
                    onChange={(e)=>setStudentEmail(e.target.value)} 
                    required 
                    sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Mail size={18} className="text-gray-500" /></InputAdornment>,
                    }}
                  />
                  <TextField 
                    label={isEditing ? "New Password (Optional)" : "Password"} 
                    type="password" 
                    fullWidth 
                    value={studentPassword} 
                    onChange={(e)=>setStudentPassword(e.target.value)} 
                    required={!isEditing} 
                    sx={{ '& .MuiOutlinedInput-root': { color: 'white', borderRadius: '12px' }, '& label': { color: '#64748b' } }} 
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock size={18} className="text-gray-500" /></InputAdornment>,
                    }}
                  />
                  <Box className="flex gap-3 mt-2">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      variant="contained" 
                      className="bg-purple-600 hover:bg-purple-700 py-4 flex-1 rounded-xl font-bold shadow-lg shadow-purple-900/20"
                    >
                      {loading ? 'Processing...' : (isEditing ? 'Update Student' : 'Register Student')}
                    </Button>
                    {isEditing && (
                      <IconButton onClick={resetForm} className="bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl px-4">
                        <X size={20} />
                      </IconButton>
                    )}
                  </Box>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* List */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-[#11111a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                <Box className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                  <Box className="flex items-center gap-3">
                    <Box className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                      <GraduationCap size={22} />
                    </Box>
                    <Typography variant="h6" className="text-white font-bold">Registered Students</Typography>
                  </Box>
                  <TextField 
                    size="small"
                    placeholder="Search students..."
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
                          <TableCell className="bg-[#11111a] text-gray-400 border-white/5 font-bold">Student</TableCell>
                          <TableCell className="bg-[#11111a] text-gray-400 border-white/5 font-bold">Email</TableCell>
                          <TableCell className="bg-[#11111a] text-gray-400 border-white/5 font-bold">Role</TableCell>
                          <TableCell className="bg-[#11111a] text-gray-400 border-white/5 font-bold align-right text-right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id} className="hover:bg-white/5 transition-colors group">
                            <TableCell className="border-white/5">
                              <Box className="flex items-center gap-3">
                                <Avatar sx={{ width: 36, height: 36, bgcolor: '#8b5cf6', fontWeight: 'bold' }}>
                                  {student.name.charAt(0)}
                                </Avatar>
                                <Typography className="text-white font-medium">{student.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell className="border-white/5 text-gray-400">{student.email}</TableCell>
                            <TableCell className="border-white/5">
                              <Chip label="STUDENT" size="small" className="bg-purple-500/10 text-purple-500 font-bold text-[10px]" />
                            </TableCell>
                            <TableCell className="border-white/5 text-right">
                              <Box className="flex justify-end gap-1">
                                <IconButton size="small" onClick={() => handleEditClick(student)} className="text-gray-500 hover:text-purple-500 transition-colors opacity-0 group-hover:opacity-100">
                                  <Pencil size={18} />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDeleteStudent(student.id)} className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                  <Trash2 size={18} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredStudents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-20 border-none text-gray-500 italic">
                              No students found matching your search.
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

export default ManageStudents;
