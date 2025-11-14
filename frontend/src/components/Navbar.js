import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
  IconButton,
} from '@mui/material';
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'admin':
        return '/admin';
      case 'institution':
        return '/institution';
      case 'company':
        return '/company';
      case 'student':
      default:
        return '/dashboard';
    }
  };

  // Render role-specific buttons
  const renderRoleButtons = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case 'company':
        return (
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/company/jobs')}
              variant="outlined"
              size="small"
            >
              Post New Job
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/company/applicants')}
              variant="outlined"
              size="small"
            >
              View Applicants
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/profile')}
              variant="outlined"
              size="small"
            >
              Update Profile
            </Button>
          </Box>
        );
      
      case 'student':
        return (
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/institutions')}
              variant="outlined"
              size="small"
            >
              Browse Institutions
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/jobs')}
              variant="outlined"
              size="small"
            >
              Browse Jobs
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/applications')}
              variant="outlined"
              size="small"
            >
              My Applications
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/profile')}
              variant="outlined"
              size="small"
            >
              Update Profile
            </Button>
          </Box>
        );
      
      case 'institution':
        return (
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/institution/faculties')}
              variant="outlined"
              size="small"
            >
              Manage Faculties
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/institution/courses')}
              variant="outlined"
              size="small"
            >
              Manage Courses
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/institution/applications')}
              variant="outlined"
              size="small"
            >
              View Applications
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/profile')}
              variant="outlined"
              size="small"
            >
              Update Profile
            </Button>
          </Box>
        );
      
      case 'admin':
        return (
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            {/* Removed all admin navigation buttons - now handled in sidebar */}
            <Button 
              color="inherit" 
              onClick={() => navigate('/profile')}
              variant="outlined"
              size="small"
            >
              Update Profile
            </Button>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate(getDashboardPath())}
        >
          Career Guidance Platform
        </Typography>

        {currentUser ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Role-specific buttons */}
            {renderRoleButtons()}
            
            <Typography variant="body1" sx={{ mr: 2 }}>
              Welcome, {currentUser.profile?.name || currentUser.profile?.personalInfo?.firstName || currentUser.email}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;