import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Avatar,
  LinearProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  Dashboard as DashboardIcon,
  AddBusiness as AddBusinessIcon,
  LibraryBooks as LibraryBooksIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  BarChart as BarChartIcon,
  Group as GroupIcon,
  BusinessCenter as BusinessCenterIcon,
  CastForEducation as CastForEducationIcon,
  RateReview as RateReviewIcon,
  SystemUpdateAlt as SystemUpdateAltIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { adminAPI } from '../services/api';

const drawerWidth = 300;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin', badge: 0 },
  { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users', badge: 0 },
  { text: 'Institutions', icon: <SchoolIcon />, path: '/admin/institutions', badge: 0 },
  { text: 'Company Approval', icon: <BusinessIcon />, path: '/admin/companies', badge: 5 },
  { text: 'System Reports', icon: <AssessmentIcon />, path: '/admin/reports', badge: 0 },
  { text: 'Add Institution', icon: <AddBusinessIcon />, path: '/admin/add-institution', badge: 0 },
  { text: 'Add Faculty', icon: <CastForEducationIcon />, path: '/admin/add-faculty', badge: 0 },
  { text: 'Add Course', icon: <LibraryBooksIcon />, path: '/admin/add-course', badge: 0 },
  { text: 'Analytics', icon: <BarChartIcon />, path: '/admin/analytics', badge: 0 },
  { text: 'System Settings', icon: <SettingsIcon />, path: '/admin/settings', badge: 0 },
];

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [systemHealth, setSystemHealth] = useState({ status: 'healthy', usage: 65 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.pathname === '/admin') {
      fetchDashboardData();
    }
  }, [location.pathname]);

  useEffect(() => {
    // Filter companies based on search term
    if (pendingCompanies && searchTerm) {
      const filtered = pendingCompanies.filter(company =>
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(pendingCompanies);
    }
  }, [pendingCompanies, searchTerm]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.stats);
      setRecentActivities(response.data.recentActivities || []);
      setPendingCompanies(response.data.pendingCompanies || []);
      setFilteredCompanies(response.data.pendingCompanies || []);
      setSystemHealth(response.data.systemHealth || { status: 'healthy', usage: 65 });
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const StatCard = ({ title, value, change, subtitle, icon, color = 'primary', onClick }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        background: `linear-gradient(135deg, ${color}.main, ${color}.dark)`,
        color: 'white',
        '&:hover': onClick ? { 
          transform: 'translateY(-8px)',
          boxShadow: 6 
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'white', opacity: 0.9 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {value}
            </Typography>
            {change && (
              <Chip 
                label={change} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            )}
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            borderRadius: '50%', 
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 32 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // If we're on a nested route, render the nested component with sidebar
  if (location.pathname !== '/admin') {
    return (
      <Box sx={{ display: 'flex' }}>
        {/* Enhanced Sidebar Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #2c3e50 0%, #3498db 100%)',
              color: 'white',
            },
          }}
        >
          <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                Admin Panel
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                System Control Center
              </Typography>
            </Box>
          </Toolbar>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <Box sx={{ overflow: 'auto', flex: 1 }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: 'white',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        borderRight: '4px solid #fff',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 45 }}>
                      <Badge badgeContent={item.badge || 0} color="error">
                        {item.icon}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 'bold' : 'normal' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
          
          {/* Admin Profile Section */}
          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {currentUser?.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {currentUser?.profile?.name || 'System Admin'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {currentUser?.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Drawer>

        {/* Main Content Area for Nested Routes */}
        <Box component="main" sx={{ flexGrow: 1, p: 0, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    );
  }

  // Main Dashboard Content (only for /admin route)
  if (loading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #2c3e50 0%, #3498db 100%)',
              color: 'white',
            },
          }}
        >
          <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                Admin Panel
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                System Control Center
              </Typography>
            </Box>
          </Toolbar>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: 'white',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        borderRight: '4px solid #fff',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 45 }}>
                      <Badge badgeContent={item.badge || 0} color="error">
                        {item.icon}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 'bold' : 'normal' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <Box textAlign="center">
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>Loading Admin Dashboard...</Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    );
  }

  const displayCompanies = searchTerm ? filteredCompanies : pendingCompanies;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Enhanced Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #2c3e50 0%, #3498db 100%)',
            color: 'white',
          },
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              System Control Center
            </Typography>
          </Box>
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
        <Box sx={{ overflow: 'auto', flex: 1 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: 'white',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderRight: '4px solid #fff',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 45 }}>
                    <Badge badgeContent={item.badge || 0} color="error">
                      {item.icon}
                    </Badge>
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 'bold' : 'normal' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        
        {/* Admin Profile Section */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {currentUser?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {currentUser?.profile?.name || 'System Admin'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {currentUser?.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Main Dashboard Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 0, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
              System Administration
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Complete control and monitoring of the Career Guidance Platform
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* System Health Card */}
          <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Grid container alignItems="center" spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    System Health & Performance
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    Overall system status: <Chip label={systemHealth.status} color="success" sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">Server Usage:</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={systemHealth.usage} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'white'
                          }
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {systemHealth.usage}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <SecurityIcon sx={{ fontSize: 80, opacity: 0.9 }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>


          <Grid container spacing={3}>
            {/* System Metrics */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChartIcon /> System Metrics
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                          {stats?.faculties || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Faculties
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="secondary" sx={{ fontWeight: 'bold' }}>
                          {stats?.courses || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Courses
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="success" sx={{ fontWeight: 'bold' }}>
                          {stats?.jobs || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Job Postings
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h4" color="warning" sx={{ fontWeight: 'bold' }}>
                          {pendingCompanies.length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Pending Companies
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick System Actions */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon /> Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Chip 
                      clickable
                      icon={<RateReviewIcon />}
                      label="Review Pending Companies"
                      color="warning"
                      variant="outlined"
                      onClick={() => navigate('/admin/companies')}
                      sx={{ justifyContent: 'flex-start', py: 2 }}
                    />
                    <Chip 
                      clickable
                      icon={<SystemUpdateAltIcon />}
                      label="Generate System Report"
                      color="primary"
                      variant="outlined"
                      onClick={() => navigate('/admin/reports')}
                      sx={{ justifyContent: 'flex-start', py: 2 }}
                    />
                    <Chip 
                      clickable
                      icon={<NotificationsIcon />}
                      label="Send System Announcement"
                      color="info"
                      variant="outlined"
                      onClick={() => navigate('/admin/users')}
                      sx={{ justifyContent: 'flex-start', py: 2 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Pending Companies with Search */}
            {pendingCompanies.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon /> Pending Company Approvals
                      </Typography>
                      <TextField
                        size="small"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ width: 250 }}
                      />
                    </Box>
                    
                    {displayCompanies.length > 0 ? (
                      <>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Company Name</strong></TableCell>
                                <TableCell><strong>Industry</strong></TableCell>
                                <TableCell><strong>Contact</strong></TableCell>
                                <TableCell><strong>Action</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {displayCompanies.slice(0, 4).map((company) => (
                                <TableRow key={company.id} hover>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <BusinessIcon color="action" />
                                      <Typography variant="body2" fontWeight="medium">
                                        {company.name || 'Unnamed Company'}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={company.industry || 'Not specified'} size="small" variant="outlined" />
                                  </TableCell>
                                  <TableCell>{company.email || 'No email'}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      clickable
                                      label="Review" 
                                      size="small"
                                      color="warning"
                                      onClick={() => navigate('/admin/companies')}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        {displayCompanies.length > 4 && (
                          <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Chip 
                              clickable
                              label={`View All ${displayCompanies.length} Companies`}
                              color="primary"
                              variant="outlined"
                              onClick={() => navigate('/admin/companies')}
                            />
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                        No companies found matching your search.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Recent Activities */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon /> Recent System Activities
                  </Typography>
                  {recentActivities.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>User</strong></TableCell>
                            <TableCell><strong>Role</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                            <TableCell><strong>Time</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentActivities.slice(0, 5).map((activity) => (
                            <TableRow key={activity.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                                    {activity.email?.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {activity.email}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={activity.role} 
                                  size="small" 
                                  color={
                                    activity.role === 'admin' ? 'error' :
                                    activity.role === 'institution' ? 'primary' :
                                    activity.role === 'company' ? 'secondary' : 'default'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" noWrap>
                                  {activity.action}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="textSecondary">
                                  {activity.timestamp || 'Just now'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                      No recent activities
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* System Overview */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdminPanelSettingsIcon /> Administrative Overview
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">User Management</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Manage all user accounts and permissions
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <BusinessIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">Company Oversight</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Approve and monitor company registrations
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <SchoolIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">Institution Control</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Oversee educational institutions and courses
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <AssessmentIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">Analytics & Reports</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Generate comprehensive system reports
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;