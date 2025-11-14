import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { currentUser } = useAuth();

  // Mock data - replace with actual API calls later
  const dashboardData = {
    stats: {
      applications: currentUser?.profile?.applications?.length || 0,
      pendingApplications: currentUser?.profile?.applications?.filter(app => app.status === 'pending')?.length || 0,
      approvedApplications: currentUser?.profile?.applications?.filter(app => app.status === 'approved')?.length || 0,
      institutionsApplied: currentUser?.profile?.applications?.filter(app => app.type === 'institution')?.length || 0,
      jobsApplied: currentUser?.profile?.applications?.filter(app => app.type === 'job')?.length || 0
    }
  };

  const data = dashboardData;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {currentUser?.profile?.personalInfo?.firstName || 'Student'}!
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Here's your academic and career journey overview
        </Typography>
      </Box>

      {/* Statistics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Total Applications
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {data.stats.applications}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    All time
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main', mt: 1 }}>
                  <AssignmentIcon fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Pending
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {data.stats.pendingApplications}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Awaiting review
                  </Typography>
                </Box>
                <Box sx={{ color: 'warning.main', mt: 1 }}>
                  <PendingIcon fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Approved
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {data.stats.approvedApplications}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Successful applications
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main', mt: 1 }}>
                  <CheckCircleIcon fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Institutions
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {data.stats.institutionsApplied}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Applied to
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main', mt: 1 }}>
                  <SchoolIcon fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Profile Completion */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Completion
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Personal Information</Typography>
                  <Chip 
                    label={currentUser?.profile?.personalInfo ? "Complete" : "Incomplete"} 
                    color={currentUser?.profile?.personalInfo ? "success" : "warning"}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Academic Records</Typography>
                  <Chip 
                    label={currentUser?.profile?.transcriptsUploaded ? "Uploaded" : "Pending"} 
                    color={currentUser?.profile?.transcriptsUploaded ? "success" : "warning"}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Career Preferences</Typography>
                  <Chip 
                    label={currentUser?.profile?.careerPreferences ? "Set" : "Not Set"} 
                    color={currentUser?.profile?.careerPreferences ? "success" : "default"}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Status
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Institution Applications</Typography>
                  <Chip label={data.stats.institutionsApplied} size="small" variant="outlined" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Job Applications</Typography>
                  <Chip label={data.stats.jobsApplied} size="small" variant="outlined" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Pending Reviews</Typography>
                  <Chip 
                    label={data.stats.pendingApplications} 
                    color="warning" 
                    size="small" 
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Approved</Typography>
                  <Chip 
                    label={data.stats.approvedApplications} 
                    color="success" 
                    size="small" 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Getting Started
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Welcome to your dashboard! Use the navigation bar above to:
              </Typography>
              <ul>
                <li>Browse and apply to educational institutions</li>
                <li>Explore job opportunities from partner companies</li>
                <li>Track your application status</li>
                <li>Update your profile and academic records</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;