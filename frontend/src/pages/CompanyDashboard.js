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
  Business as BusinessIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const CompanyDashboard = () => {
  const { currentUser } = useAuth();

  // Mock data - replace with actual API calls later
  const dashboardData = {
    stats: {
      jobsPosted: currentUser?.profile?.jobsPosted?.length || 0,
      totalApplications: currentUser?.profile?.totalApplications || 0,
      pendingApplications: currentUser?.profile?.pendingApplications || 0,
      hiredCandidates: currentUser?.profile?.hiredCandidates || 0
    }
  };

  const data = dashboardData;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {currentUser?.profile?.name || 'Company'}!
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Manage your recruitment and candidate pipeline
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
                    Jobs Posted
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {data.stats.jobsPosted}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active positions
                  </Typography>
                </Box>
                <Box sx={{ color: 'primary.main', mt: 1 }}>
                  <WorkIcon fontSize="large" />
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
                    Total Applications
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {data.stats.totalApplications}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    All time
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main', mt: 1 }}>
                  <PeopleIcon fontSize="large" />
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
                    Pending Reviews
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {data.stats.pendingApplications}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Awaiting action
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
                    Hired Candidates
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {data.stats.hiredCandidates}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Successful hires
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main', mt: 1 }}>
                  <CheckCircleIcon fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Company Profile */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Company Profile
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Company Name</Typography>
                  <Chip 
                    label={currentUser?.profile?.name || "Not set"} 
                    color={currentUser?.profile?.name ? "primary" : "default"}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Industry</Typography>
                  <Chip 
                    label={currentUser?.profile?.industry || "Not set"} 
                    color={currentUser?.profile?.industry ? "secondary" : "default"}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Approval Status</Typography>
                  <Chip 
                    label={currentUser?.profile?.status || "Pending"} 
                    color={currentUser?.profile?.status === 'approved' ? "success" : "warning"}
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
                Recruitment Overview
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Active Job Postings</Typography>
                  <Chip label={data.stats.jobsPosted} size="small" variant="outlined" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Total Applicants</Typography>
                  <Chip label={data.stats.totalApplications} size="small" variant="outlined" />
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
                  <Typography variant="body2">Successful Hires</Typography>
                  <Chip 
                    label={data.stats.hiredCandidates} 
                    color="success" 
                    size="small" 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Portal Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Company Portal Features
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Use the navigation bar above to access all company features:
              </Typography>
              <ul>
                <li>Post new job opportunities for graduates</li>
                <li>Review qualified applicants automatically matched by the system</li>
                <li>Filter candidates based on academic performance and skills</li>
                <li>Manage your company profile and job postings</li>
                <li>Track application status and communicate with candidates</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CompanyDashboard;