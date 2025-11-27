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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
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
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      const response = await companiesAPI.getCompanyJobs();
      setJobs(response.data || []);
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
    setSelectedTab(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'under_review': return 'warning';
      default: return 'default';
    }
  };

  const renderAcademicInfo = (student) => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon /> Academic Information
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>University:</strong> {student.education?.university || 'Not specified'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Degree Level:</strong> {student.education?.degreeLevel || 'Not specified'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>GPA:</strong> 
            <Chip 
              label={student.education?.gpa?.toFixed(2) || 'N/A'} 
              color={student.education?.gpa >= 3.5 ? 'success' : student.education?.gpa >= 3.0 ? 'warning' : 'default'}
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Total Credits:</strong> {student.education?.totalCredits || 'N/A'}
          </Typography>
        </Grid>
      </Grid>

      {student.education?.academicRecords && student.education.academicRecords.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Academic Transcript ({student.education.academicRecords.length} subjects)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell><strong>Grade</strong></TableCell>
                    <TableCell><strong>Credits</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {student.education.academicRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.name || record.subject}</TableCell>
                      <TableCell>
                        <Chip 
                          label={record.grade} 
                          color={
                            record.grade.includes('A') || parseInt(record.grade) >= 80 ? 'success' :
                            record.grade.includes('B') || parseInt(record.grade) >= 70 ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.credits}</TableCell>
                      <TableCell>
                        <Chip 
                          label={record.type} 
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );

  const renderWorkExperience = (workExperience) => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WorkIcon /> Work Experience
      </Typography>
      
      {(!workExperience || workExperience.length === 0) ? (
        <Typography variant="body2" color="textSecondary">
          No work experience provided
        </Typography>
      ) : (
        workExperience.map((exp, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {exp.position} at {exp.company}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} - 
                {exp.currentlyWorking ? ' Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A'}
                {exp.duration && ` (${exp.duration} months)`}
              </Typography>
              <Typography variant="body2">
                {exp.description}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );

  const renderReferences = (references) => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon /> Professional References
      </Typography>
      
      {(!references || references.length === 0) ? (
        <Typography variant="body2" color="textSecondary">
          No references provided
        </Typography>
      ) : (
        references.map((ref, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {ref.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {ref.position} at {ref.company}
              </Typography>
              <Typography variant="body2">
                <strong>Relationship:</strong> {ref.relationship}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {ref.email}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {ref.phone}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );

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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
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
              <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                <Tab label="Applicant List" />
                <Tab label="Detailed View" />
              </Tabs>

              {selectedTab === 0 && (
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
                            <Typography variant="body2">
                              GPA: <strong>{applicant.student?.education?.gpa?.toFixed(2) || 'N/A'}</strong>
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
                                  <Button
                                    variant="outlined"
                                    color="warning"
                                    size="small"
                                    onClick={() => {
                                      setSelectedTab(1);
                                      // You might want to scroll to this applicant in detailed view
                                    }}
                                  >
                                    Review
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

              {selectedTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  {applicants.map((applicant) => (
                    <Card key={applicant.id} sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h5" gutterBottom>
                          {applicant.student?.personalInfo?.firstName} {applicant.student?.personalInfo?.lastName}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            label={`Match Score: ${applicant.matchScore}%`} 
                            color={applicant.matchScore >= 80 ? 'success' : applicant.matchScore >= 60 ? 'warning' : 'error'}
                          />
                          <Chip 
                            label={applicant.status} 
                            color={getStatusColor(applicant.status)}
                            sx={{ ml: 1 }}
                          />
                        </Box>

                        {renderAcademicInfo(applicant.student)}
                        
                        {renderWorkExperience(applicant.student?.workExperience)}
                        
                        {renderReferences(applicant.student?.references)}

                        {applicant.coverLetter && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              Cover Letter
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="body2">
                                {applicant.coverLetter}
                              </Typography>
                            </Paper>
                          </Box>
                        )}

                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          {applicant.status === 'pending' && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => updateApplicationStatus(applicant.id, 'accepted')}
                              >
                                Accept Application
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => updateApplicationStatus(applicant.id, 'rejected')}
                              >
                                Reject Application
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => updateApplicationStatus(applicant.id, 'under_review')}
                              >
                                Mark for Review
                              </Button>
                            </>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
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