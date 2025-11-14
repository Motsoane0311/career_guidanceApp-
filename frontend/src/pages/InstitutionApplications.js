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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, School as SchoolIcon } from '@mui/icons-material';
import { institutionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const InstitutionApplications = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [evaluationResults, setEvaluationResults] = useState({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await institutionsAPI.getApplications();
      setApplications(response.data || []);
      
      // Evaluate each application
      const evaluations = {};
      for (const app of response.data || []) {
        if (app.studentId && app.courseId) {
          const evaluation = await evaluateApplication(app.studentId, app.courseId);
          evaluations[app.id] = evaluation;
        }
      }
      setEvaluationResults(evaluations);
    } catch (error) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const evaluateApplication = async (studentId, courseId) => {
    try {
      // This would call a backend API for evaluation
      // For now, we'll do a simple frontend evaluation
      const student = applications.find(app => app.studentId === studentId)?.student;
      const course = applications.find(app => app.courseId === courseId)?.course;
      
      if (!student || !course) return { eligible: true, reasons: [] };

      const evaluation = {
        eligible: true,
        meetsGPA: true,
        meetsSubjectRequirements: true,
        reasons: []
      };

      // Check GPA
      const studentGPA = student.education?.gpa || 0;
      const requiredGPA = course.requirements?.minimumGPA || 2.5;
      
      if (studentGPA < requiredGPA) {
        evaluation.eligible = false;
        evaluation.meetsGPA = false;
        evaluation.reasons.push(`GPA ${studentGPA} is below required ${requiredGPA}`);
      }

      // Check subjects (simplified)
      const requiredSubjects = course.requirements?.requiredSubjects || [];
      const studentSubjects = student.education?.academicRecords || [];
      
      if (requiredSubjects.length > 0 && studentSubjects.length === 0) {
        evaluation.eligible = false;
        evaluation.meetsSubjectRequirements = false;
        evaluation.reasons.push('No academic records provided');
      }

      return evaluation;
    } catch (error) {
      return { eligible: true, reasons: ['Evaluation error'] };
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdating(true);
      setError('');
      
      await institutionsAPI.updateApplicationStatus(applicationId, newStatus);
      setSuccess(`Application status updated to ${newStatus}`);
      
      // Refresh applications
      fetchApplications();
      setDialogOpen(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const openApplicationDetails = (application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedApplication(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted': return 'success';
      case 'rejected': return 'error';
      case 'waiting_list': return 'warning';
      default: return 'default';
    }
  };

  const getEligibilityColor = (eligible) => {
    return eligible ? 'success' : 'error';
  };

  const filteredApplications = applications.filter(app => 
    statusFilter === 'all' || app.status === statusFilter
  );

  const getStatusCount = (status) => {
    return applications.filter(app => app.status === status).length;
  };

  const renderAcademicRecords = (student) => {
    const records = student.education?.academicRecords || [];
    
    if (records.length === 0) {
      return <Typography variant="body2" color="textSecondary">No academic records provided</Typography>;
    }

    return (
      <Box>
        <Typography variant="body2" gutterBottom>
          <strong>GPA:</strong> {student.education?.gpa?.toFixed(2) || 'N/A'} | 
          <strong> Total Credits:</strong> {student.education?.totalCredits || 0}
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
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
              {records.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.name}</TableCell>
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
      </Box>
    );
  };

  const renderCourseRequirements = (course) => {
    const requirements = course.requirements || {};
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Course Requirements:
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Minimum GPA:</strong> {requirements.minimumGPA || 2.5}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Minimum Credits:</strong> {requirements.minimumCredits || 0}
            </Typography>
          </Grid>
          {requirements.requiredSubjects && requirements.requiredSubjects.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>Required Subjects:</strong> {requirements.requiredSubjects.map(s => s.subject).join(', ')}
              </Typography>
            </Grid>
          )}
          {requirements.entranceExam && (
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>Entrance Exam:</strong> Required
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Student Applications
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

      {/* Status Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip 
          label={`Total: ${applications.length}`} 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          label={`Pending: ${getStatusCount('pending')}`} 
          color="warning" 
          variant="outlined" 
        />
        <Chip 
          label={`Admitted: ${getStatusCount('admitted')}`} 
          color="success" 
          variant="outlined" 
        />
        <Chip 
          label={`Rejected: ${getStatusCount('rejected')}`} 
          color="error" 
          variant="outlined" 
        />
        <Chip 
          label={`Waiting List: ${getStatusCount('waiting_list')}`} 
          color="info" 
          variant="outlined" 
        />
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Applications</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="admitted">Admitted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="waiting_list">Waiting List</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="applications table">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Course</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Academic Info</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Applied Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Eligibility</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No applications found
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {statusFilter === 'all' 
                      ? 'No students have applied to your courses yet' 
                      : `No ${statusFilter} applications found`
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((application) => {
                const evaluation = evaluationResults[application.id] || { eligible: true, reasons: [] };
                const studentGPA = application.student?.education?.gpa || 0;
                
                return (
                  <TableRow key={application.id}>
                    <TableCell component="th" scope="row">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {application.student?.personalInfo?.firstName} {application.student?.personalInfo?.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {application.student?.email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          GPA: {studentGPA.toFixed(2)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {application.course?.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {application.course?.faculty?.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <strong>School:</strong> {application.student?.education?.highSchool || 'Not provided'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Graduation:</strong> {application.student?.education?.graduationYear || 'Not provided'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Subjects:</strong> {application.student?.education?.academicRecords?.length || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={application.status} 
                        color={getStatusColor(application.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={evaluation.eligible ? <CheckIcon /> : <CloseIcon />}
                        label={evaluation.eligible ? 'Eligible' : 'Not Eligible'}
                        color={getEligibilityColor(evaluation.eligible)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => openApplicationDetails(application)}
                        >
                          Review
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleStatusUpdate(application.id, 'admitted')}
                              disabled={updating}
                            >
                              Admit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                              disabled={updating}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Application Details Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          Application Review - {selectedApplication?.student?.personalInfo?.firstName} {selectedApplication?.student?.personalInfo?.lastName}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Grid container spacing={3}>
                {/* Student Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Student Information
                      </Typography>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedApplication.student?.personalInfo?.firstName} {selectedApplication.student?.personalInfo?.lastName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedApplication.student?.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedApplication.student?.personalInfo?.phone || 'Not provided'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Address:</strong> {selectedApplication.student?.personalInfo?.address || 'Not provided'}
                      </Typography>
                      
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Education Summary
                      </Typography>
                      <Typography variant="body2">
                        <strong>High School:</strong> {selectedApplication.student?.education?.highSchool || 'Not provided'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Graduation Year:</strong> {selectedApplication.student?.education?.graduationYear || 'Not provided'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>GPA:</strong> {selectedApplication.student?.education?.gpa?.toFixed(2) || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Credits:</strong> {selectedApplication.student?.education?.totalCredits || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Course Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Course Information
                      </Typography>
                      <Typography variant="body2">
                        <strong>Course:</strong> {selectedApplication.course?.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Faculty:</strong> {selectedApplication.course?.faculty?.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Duration:</strong> {selectedApplication.course?.duration}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Fees:</strong> M{selectedApplication.course?.fees}
                      </Typography>
                      
                      {renderCourseRequirements(selectedApplication.course)}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Academic Records */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Academic Records
                      </Typography>
                      {renderAcademicRecords(selectedApplication.student)}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Evaluation Results */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ 
                    backgroundColor: evaluationResults[selectedApplication.id]?.eligible ? '#f1f8e9' : '#ffebee' 
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Academic Evaluation
                      </Typography>
                      {evaluationResults[selectedApplication.id] ? (
                        <Box>
                          <Chip 
                            icon={evaluationResults[selectedApplication.id].eligible ? <CheckIcon /> : <CloseIcon />}
                            label={evaluationResults[selectedApplication.id].eligible ? 'ACADEMICALLY ELIGIBLE' : 'NOT ACADEMICALLY ELIGIBLE'}
                            color={getEligibilityColor(evaluationResults[selectedApplication.id].eligible)}
                            sx={{ mb: 2 }}
                          />
                          
                          {evaluationResults[selectedApplication.id].reasons.length > 0 && (
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                Evaluation Notes:
                              </Typography>
                              {evaluationResults[selectedApplication.id].reasons.map((reason, index) => (
                                <Typography key={index} variant="body2" color="textSecondary">
                                  • {reason}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Evaluation in progress...
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                <strong>Applied on:</strong> {new Date(selectedApplication.appliedAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          {selectedApplication?.status === 'pending' && (
            <>
              <Button 
                variant="contained" 
                color="success"
                onClick={() => handleStatusUpdate(selectedApplication.id, 'admitted')}
                disabled={updating}
              >
                Admit Student
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                disabled={updating}
              >
                Reject Application
              </Button>
              <Button 
                variant="outlined" 
                color="warning"
                onClick={() => handleStatusUpdate(selectedApplication.id, 'waiting_list')}
                disabled={updating}
              >
                Wait List
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InstitutionApplications;