import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Navbar = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AppBar position="static" className="bg-surface shadow-none border-b border-gray-800">
      <Toolbar className="flex justify-between">
        <Typography variant="h6" className="font-bold text-white tracking-wide">
          {title || 'Smart Bus Tracking'}
        </Typography>
        <Button color="inherit" onClick={handleLogout} startIcon={<LogOut size={18} />} className="text-gray-300 hover:text-white">
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
