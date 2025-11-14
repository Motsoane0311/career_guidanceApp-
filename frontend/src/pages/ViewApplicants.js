import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { companiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ViewApplicants = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      const response = await companiesAPI.getDashboardStats();
      setJobs(response.data.jobs || []);
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (jobId) => {
    try {
      setLoading(true);
      const response = await companiesAPI.getJobApplicants(jobId);
      setApplicants(response.data);
      setSelectedJob(jobs.find(job => job.id === jobId));
      setDialogOpen(true);
    } catch (err) {
      setError('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await companiesAPI.updateApplicationStatus(applicationId, status);
      // Refresh applicants list
      if (selectedJob) {
        fetchApplicants(selectedJob.id);
      }
    } catch (err) {
      setError('Failed to update application status');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedJob(null);
    setApplicants([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        View Applicants
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {jobs.length === 0 ? (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No jobs posted yet
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Post a job to start receiving applications from qualified candidates.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          jobs.map((job) => (
            <Grid item xs={12} md={6} key={job.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {job.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {job.location} • {job.jobType}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {job.description.length > 100 
                      ? `${job.description.substring(0, 100)}...` 
                      : job.description
                    }
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={job.status} 
                      color={job.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                    <Typography variant="body2" color="textSecondary">
                      Applications: {job.applicationCount || 0}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => fetchApplicants(job.id)}
                    disabled={loading}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    View Applicants
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Applicants Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Applicants for {selectedJob?.title}
        </DialogTitle>
        <DialogContent>
          {applicants.length === 0 ? (
            <Typography color="textSecondary" sx={{ py: 2 }}>
              No applicants yet for this position.
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {applicants.map((applicant) => (
                <Card key={applicant.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6">
                          {applicant.student?.personalInfo?.firstName} {applicant.student?.personalInfo?.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {applicant.student?.email}
                        </Typography>
                        <Typography variant="body2">
                          Match Score: <strong>{applicant.matchScore}%</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Chip 
                          label={applicant.status} 
                          color={getStatusColor(applicant.status)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                          {applicant.status === 'pending' && (
                            <>
                              <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                onClick={() => updateApplicationStatus(applicant.id, 'accepted')}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => updateApplicationStatus(applicant.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {/* Matched Qualifications */}
                    {applicant.matchedQualifications && applicant.matchedQualifications.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Matched Qualifications:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {applicant.matchedQualifications.map((qual, index) => (
                            <Chip key={index} label={qual} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewApplicants;