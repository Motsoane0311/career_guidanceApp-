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
import JobApplicationForm from './JobApplicationForm'; // Remove .js extension

const Jobs = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);

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

  const openJobDetails = (job) => {
    setSelectedJob(job);
    setDetailsDialogOpen(true);
  };

  const openApplicationForm = (job) => {
    setSelectedJob(job);
    setApplicationDialogOpen(true);
  };

  const closeDialog = () => {
    setDetailsDialogOpen(false);
    setApplicationDialogOpen(false);
    setSelectedJob(null);
    setError('');
    setSuccess('');
  };

  const handleApplicationSuccess = (message) => {
    setSuccess(message);
    setApplicationDialogOpen(false);
    fetchJobs();
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
                        onClick={() => openApplicationForm(job)}
                        disabled={applyingJobId === job.id}
                      >
                        Apply
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
      <Dialog open={detailsDialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
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
                    {/* Academic Requirements */}
                    {selectedJob.requirements.minGPA && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Minimum GPA:</strong> {selectedJob.requirements.minGPA}
                      </Typography>
                    )}
                    {selectedJob.requirements.education?.level && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Education Level:</strong> {selectedJob.requirements.education.level}
                      </Typography>
                    )}
                    {selectedJob.requirements.minExperience !== undefined && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Minimum Experience:</strong> {selectedJob.requirements.minExperience} year(s)
                      </Typography>
                    )}
                    {selectedJob.requirements.requiredCourses && selectedJob.requirements.requiredCourses.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>Required Courses:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {selectedJob.requirements.requiredCourses.map((course, index) => (
                            <Chip key={index} label={course} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                    {selectedJob.requirements.requiredSkills && selectedJob.requirements.requiredSkills.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>Required Skills:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {selectedJob.requirements.requiredSkills.map((skill, index) => (
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
                    {selectedJob.requirements.requireReferences && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>References:</strong> {selectedJob.requirements.minReferences || '2'} professional references required
                      </Typography>
                    )}
                  </Box>
                </>
              )}

              {selectedJob.qualifications && selectedJob.qualifications.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Preferred Qualifications
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
            onClick={() => {
              setDetailsDialogOpen(false);
              openApplicationForm(selectedJob);
            }}
          >
            Apply for this Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Application Form Dialog */}
      {selectedJob && (
        <JobApplicationForm
          open={applicationDialogOpen}
          onClose={closeDialog}
          job={selectedJob}
          onSuccess={handleApplicationSuccess}
          onError={setError}
        />
      )}
    </Container>
  );
};

export default Jobs;