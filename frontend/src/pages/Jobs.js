import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null); // Track which job is being applied to
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await jobsAPI.getJobs();
      console.log('Jobs response:', response.data);
      setJobs(response.data || []);
    } catch (err) {
      console.error('Fetch jobs error:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyForJob = async (jobId) => {
    try {
      setApplyingJobId(jobId); // Set the specific job being applied to
      setError('');
      setSuccess('');
      
      const response = await jobsAPI.applyForJob(jobId);
      setSuccess(response.data.message || 'Successfully applied for the job!');
      setDialogOpen(false);
      
      // Refresh jobs to update application status if needed
      fetchJobs();
    } catch (err) {
      console.error('Apply job error:', err);
      setError(err.response?.data?.error || 'Failed to apply for job. Please try again.');
    } finally {
      setApplyingJobId(null); // Reset applying state
    }
  };

  const openJobDetails = (job) => {
    setSelectedJob(job);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedJob(null);
    setError('');
    setSuccess('');
  };

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case 'full-time': return 'primary';
      case 'part-time': return 'secondary';
      case 'contract': return 'success';
      case 'internship': return 'warning';
      default: return 'default';
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Negotiable';
    return salary;
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading jobs...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Job Opportunities
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Browse and apply for jobs from our partner companies
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="jobs table">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Job Title</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Company</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Salary</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Deadline</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No jobs available at the moment
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Companies haven't posted any jobs yet. Check back later for new opportunities.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow 
                  key={job.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    {job.title}
                  </TableCell>
                  <TableCell>{job.company?.name || 'Unknown Company'}</TableCell>
                  <TableCell>{job.location || 'Not specified'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={job.jobType || 'Not specified'} 
                      color={getJobTypeColor(job.jobType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatSalary(job.salary)}</TableCell>
                  <TableCell>{formatDate(job.deadline)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => openJobDetails(job)}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => applyForJob(job.id)}
                        disabled={applyingJobId === job.id} // Only disable the specific button
                      >
                        {applyingJobId === job.id ? 'Applying...' : 'Apply'}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Job Details Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedJob?.title}
        </DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                {selectedJob.company?.name || 'Unknown Company'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {selectedJob.jobType && (
                  <Chip 
                    label={selectedJob.jobType} 
                    color={getJobTypeColor(selectedJob.jobType)}
                  />
                )}
                {selectedJob.location && (
                  <Chip 
                    label={selectedJob.location} 
                    variant="outlined"
                  />
                )}
                {selectedJob.salary && (
                  <Chip 
                    label={formatSalary(selectedJob.salary)} 
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>

              <Typography variant="body1" paragraph>
                {selectedJob.description || 'No description available.'}
              </Typography>

              {selectedJob.requirements && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Requirements
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedJob.requirements.educationLevel && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Education Level:</strong> {selectedJob.requirements.educationLevel}
                      </Typography>
                    )}
                    {selectedJob.requirements.minExperience !== undefined && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Minimum Experience:</strong> {selectedJob.requirements.minExperience} year(s)
                      </Typography>
                    )}
                    {selectedJob.requirements.skills && selectedJob.requirements.skills.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>Required Skills:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {selectedJob.requirements.skills.map((skill, index) => (
                            <Chip key={index} label={skill} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                    {selectedJob.requirements.certificates && selectedJob.requirements.certificates.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>Required Certificates:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {selectedJob.requirements.certificates.map((cert, index) => (
                            <Chip key={index} label={cert} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </>
              )}

              {selectedJob.qualifications && selectedJob.qualifications.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Qualifications
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                    {selectedJob.qualifications.map((qual, index) => (
                      <Typography component="li" variant="body2" key={index}>
                        {qual}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}

              {selectedJob.deadline && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Application Deadline:</strong> {new Date(selectedJob.deadline).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => applyForJob(selectedJob?.id)}
            disabled={applyingJobId === selectedJob?.id}
          >
            {applyingJobId === selectedJob?.id ? 'Applying...' : 'Apply for this Job'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Jobs;