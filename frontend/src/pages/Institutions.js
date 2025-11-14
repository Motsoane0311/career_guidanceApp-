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
import { applicationsAPI, publicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Institutions = () => {
  const { currentUser } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingCourseId, setApplyingCourseId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch real institutions from backend
  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await publicAPI.getInstitutions();
      setInstitutions(response.data);
    } catch (err) {
      console.error('Fetch institutions error:', err);
      setError('Failed to load institutions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyForCourse = async (institutionId, courseId, courseName) => {
    try {
      setApplyingCourseId(courseId);
      setError('');
      setSuccess('');
      
      console.log('Applying for course:', { institutionId, courseId, courseName, studentId: currentUser?.userId });
      
      const response = await applicationsAPI.applyForCourse({
        institutionId,
        courseId,
        courseName,
        documents: []
      });
      
      console.log('Application successful:', response.data);
      
      setSuccess(`Successfully applied for ${courseName}!`);
      setDialogOpen(false);
      
      // Refresh institutions to update seat counts
      fetchInstitutions();
    } catch (err) {
      console.error('Apply error details:', err.response?.data);
      console.error('Full error object:', err);
      
      // Show the exact error message from backend
      if (err.response?.data?.error) {
        setError(`Application failed: ${err.response.data.error}`);
      } else if (err.response?.data?.message) {
        setError(`Application failed: ${err.response.data.message}`);
      } else if (err.response?.status === 400) {
        setError('Bad request: Please check if all required information is provided.');
      } else if (err.response?.status === 404) {
        setError('Service not found. Please try again later.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to apply for course. Please try again.');
      }
    } finally {
      setApplyingCourseId(null);
    }
  };

  const openInstitutionDetails = (institution) => {
    setSelectedInstitution(institution);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedInstitution(null);
    setError('');
  };

  const getTotalCourses = (institution) => {
    if (!institution.courses) return 0;
    return institution.courses.length;
  };

  const getTotalFaculties = (institution) => {
    if (!institution.faculties) return 0;
    return institution.faculties.length;
  };

  const getAvailableSeatsStatus = (seats) => {
    if (seats > 10) return { color: 'success', label: 'Available' };
    if (seats > 0) return { color: 'warning', label: 'Limited' };
    return { color: 'error', label: 'Full' };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading institutions...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Higher Learning Institutions
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Discover and apply to courses at institutions across Lesotho
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
        <Table sx={{ minWidth: 650 }} aria-label="institutions table">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Institution Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Faculties</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Courses</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {institutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No institutions available yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Institutions will appear here once they register and add courses.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              institutions.map((institution) => (
                <TableRow 
                  key={institution.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    {institution.name}
                  </TableCell>
                  <TableCell>{institution.address || 'Location not specified'}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{institution.email}</Typography>
                      <Typography variant="body2">{institution.phone || 'Phone not provided'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${getTotalFaculties(institution)} faculties`} 
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${getTotalCourses(institution)} courses`} 
                      color="info"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={institution.status || 'active'} 
                      color={(institution.status || 'active') === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => openInstitutionDetails(institution)}
                      disabled={getTotalCourses(institution) === 0}
                    >
                      {getTotalCourses(institution) === 0 ? 'No Courses' : 'View Courses'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Institution Details Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedInstitution?.name} - Available Courses
        </DialogTitle>
        <DialogContent>
          {selectedInstitution && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedInstitution.description || 'No description available.'}
              </Typography>
              
              {(!selectedInstitution.courses || selectedInstitution.courses.length === 0) ? (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  This institution hasn't added any courses yet.
                </Typography>
              ) : (
                selectedInstitution.courses.map((course) => {
                  const seatStatus = getAvailableSeatsStatus(course.seats);
                  return (
                    <Paper key={course.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {course.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {course.description || 'No description available'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Typography variant="body2">
                              <strong>Duration:</strong> {course.duration}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Fees:</strong> M{course.fees?.toLocaleString()}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                <strong>Seats:</strong>
                              </Typography>
                              <Chip 
                                label={`${course.seats} (${seatStatus.label})`} 
                                color={seatStatus.color}
                                size="small"
                              />
                            </Box>
                            {course.requirements && (
                              <Typography variant="body2">
                                <strong>Requirements:</strong> {Array.isArray(course.requirements) ? course.requirements.join(', ') : course.requirements}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Button
                          variant="contained"
                          onClick={() => applyForCourse(selectedInstitution.id, course.id, course.name)}
                          disabled={applyingCourseId === course.id || course.seats <= 0}
                          sx={{ ml: 2 }}
                        >
                          {applyingCourseId === course.id ? (
                            <CircularProgress size={20} />
                          ) : course.seats <= 0 ? (
                            'Course Full'
                          ) : (
                            'Apply Now'
                          )}
                        </Button>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Institutions;