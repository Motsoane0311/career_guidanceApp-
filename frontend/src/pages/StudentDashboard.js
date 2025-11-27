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
  Grade as GradeIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { currentUser } = useAuth();

  // Mock data - replace with actual API calls later
  const dashboardData = {
    stats: {
      applications: currentUser?.profile?.applications?.length || 0,
      pendingApplications: currentUser?.profile?.applications?.filter(app => app.status === 'pending')?.length || 0,
      approvedApplications: currentUser?.profile?.applications?.filter(app => app.status === 'approved' || app.status === 'admitted')?.length || 0,
      institutionsApplied: currentUser?.profile?.applications?.filter(app => app.type === 'institution')?.length || 0,
      jobsApplied: currentUser?.profile?.applications?.filter(app => app.type === 'job')?.length || 0
    },
    academic: {
      gpa: currentUser?.profile?.education?.gpa || 0,
      totalCredits: currentUser?.profile?.education?.totalCredits || 0,
      subjects: currentUser?.profile?.education?.academicRecords?.length || 0
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
                    GPA Score
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {data.academic.gpa.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {data.academic.totalCredits} credits
                  </Typography>
                </Box>
                <Box sx={{ color: 'info.main', mt: 1 }}>
                  <GradeIcon fontSize="large" />
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
                    Subjects
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {data.academic.subjects}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completed
                  </Typography>
                </Box>
                <Box sx={{ color: 'success.main', mt: 1 }}>
                  <SchoolIcon fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Academic Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon /> Academic Summary
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Overall GPA</Typography>
                  <Chip 
                    label={data.academic.gpa.toFixed(2)} 
                    color={
                      data.academic.gpa >= 3.5 ? 'success' : 
                      data.academic.gpa >= 3.0 ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Total Credits</Typography>
                  <Chip 
                    label={data.academic.totalCredits} 
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Subjects Completed</Typography>
                  <Chip 
                    label={data.academic.subjects} 
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Academic Status</Typography>
                  <Chip 
                    label={data.academic.gpa >= 2.0 ? 'Good Standing' : 'Needs Improvement'} 
                    color={data.academic.gpa >= 2.0 ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Application Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon /> Application Status
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

        {/* Profile Completion */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Completion Status
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                    <Typography variant="body2">Personal Information</Typography>
                    <Chip 
                      label={currentUser?.profile?.personalInfo ? "Complete" : "Incomplete"} 
                      color={currentUser?.profile?.personalInfo ? "success" : "warning"}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                    <Typography variant="body2">Academic Records</Typography>
                    <Chip 
                      label={currentUser?.profile?.education?.academicRecords ? "Complete" : "Incomplete"} 
                      color={currentUser?.profile?.education?.academicRecords ? "success" : "warning"}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                    <Typography variant="body2">Work Experience</Typography>
                    <Chip 
                      label={currentUser?.profile?.workExperience ? "Added" : "Not Added"} 
                      color={currentUser?.profile?.workExperience ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                    <Typography variant="body2">References</Typography>
                    <Chip 
                      label={currentUser?.profile?.references ? "Added" : "Not Added"} 
                      color={currentUser?.profile?.references ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ready to Take the Next Step?
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Your academic profile is looking great! Here's what you can do next:
              </Typography>
              <ul>
                <li>Apply to educational institutions with your strong GPA of {data.academic.gpa.toFixed(2)}</li>
                <li>Explore job opportunities that match your academic background</li>
                <li>Add work experience and references to strengthen your job applications</li>
                <li>Track your application status and receive admission decisions</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;