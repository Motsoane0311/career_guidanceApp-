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
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  LibraryBooks as LibraryBooksIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { institutionsAPI } from '../services/api';

const InstitutionDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    admittedStudents: 0,
    totalCourses: 0,
    totalFaculties: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const applicationsResponse = await institutionsAPI.getApplications();
      const applications = applicationsResponse.data || [];
      
      setStats({
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        admittedStudents: applications.filter(app => app.status === 'admitted').length,
        totalCourses: currentUser?.profile?.courses?.length || 0,
        totalFaculties: currentUser?.profile?.faculties?.length || 0
      });

      setRecentApplications(applications.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: `${color}.main`, mt: 1 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted': return 'success';
      case 'rejected': return 'error';
      case 'waiting_list': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Institution Dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {currentUser?.profile?.name || 'Institution'}!
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Manage your educational programs and student applications
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            subtitle="All time"
            icon={<AssignmentIcon fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Review"
            value={stats.pendingApplications}
            subtitle="Awaiting action"
            icon={<PendingIcon fontSize="large" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Admitted Students"
            value={stats.admittedStudents}
            subtitle="Successful admissions"
            icon={<CheckCircleIcon fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Courses & Faculties"
            value={`${stats.totalCourses}/${stats.totalFaculties}`}
            subtitle="Courses/Faculties"
            icon={<SchoolIcon fontSize="large" />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Institution Profile */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Institution Profile
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Institution Name</Typography>
                  <Chip 
                    label={currentUser?.profile?.name || "Not set"} 
                    color={currentUser?.profile?.name ? "primary" : "default"}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Contact Email</Typography>
                  <Chip 
                    label={currentUser?.email || "Not set"} 
                    color="secondary"
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Phone Number</Typography>
                  <Chip 
                    label={currentUser?.profile?.phone || "Not set"} 
                    color={currentUser?.profile?.phone ? "info" : "default"}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Status</Typography>
                  <Chip 
                    label={currentUser?.profile?.status || "Active"} 
                    color="success"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Program Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Program Overview
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Total Faculties</Typography>
                  <Chip 
                    label={stats.totalFaculties} 
                    icon={<SchoolIcon />}
                    size="small" 
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Total Courses</Typography>
                  <Chip 
                    label={stats.totalCourses} 
                    icon={<LibraryBooksIcon />}
                    size="small" 
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Pending Applications</Typography>
                  <Chip 
                    label={stats.pendingApplications} 
                    color="warning" 
                    size="small" 
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Admitted Students</Typography>
                  <Chip 
                    label={stats.admittedStudents} 
                    color="success" 
                    size="small" 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Applications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon /> Recent Applications
              </Typography>
              
              {recentApplications.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  No applications received yet
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {recentApplications.map((application) => (
                    <Box 
                      key={application.id} 
                      sx={{ 
                        p: 1.5, 
                        border: 1, 
                        borderColor: 'divider', 
                        borderRadius: 1,
                        backgroundColor: 'background.default'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {application.student?.personalInfo?.firstName} {application.student?.personalInfo?.lastName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {application.course?.name || 'Course not specified'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={application.status} 
                          color={getStatusColor(application.status)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Institution Portal Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Institution Portal Features
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Use the navigation bar above to access all institution management features:
              </Typography>
              <ul>
                <li>Manage faculties and academic departments</li>
                <li>Create and update course offerings</li>
                <li>Review and process student applications</li>
                <li>Track admission statistics and trends</li>
                <li>Update institution profile and information</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InstitutionDashboard;