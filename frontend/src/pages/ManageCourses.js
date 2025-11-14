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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { institutionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManageCourses = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    description: '',
    duration: '',
    fees: '',
    seats: '',
    requirements: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch both faculties and courses
      const [facultiesResponse, coursesResponse] = await Promise.all([
        institutionsAPI.getFaculties(),
        institutionsAPI.getCourses()
      ]);
      
      setFaculties(facultiesResponse.data);
      setCourses(coursesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        facultyId: course.facultyId,
        name: course.name,
        description: course.description,
        duration: course.duration,
        fees: course.fees.toString(),
        seats: course.seats.toString(),
        requirements: course.requirements || ''
      });
    } else {
      setEditingCourse(null);
      setFormData({
        facultyId: '',
        name: '',
        description: '',
        duration: '',
        fees: '',
        seats: '',
        requirements: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCourse(null);
    setFormData({
      facultyId: '',
      name: '',
      description: '',
      duration: '',
      fees: '',
      seats: '',
      requirements: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      
      if (editingCourse) {
        // Update existing course
        await institutionsAPI.updateCourse(editingCourse.id, formData);
        setSuccess('Course updated successfully!');
        handleCloseDialog();
        fetchData(); // Refresh the list
      } else {
        // Add new course
        await institutionsAPI.addCourse(formData);
        setSuccess('Course added successfully!');
        handleCloseDialog();
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error('Error saving course:', error);
      // Check if it's a 500 error but course might have been created
      if (error.response?.status === 500) {
        setError('Course might have been created but there was a server error. Refreshing data...');
        // Refresh data to check if course was actually created
        setTimeout(() => fetchData(), 1000);
      } else {
        setError(error.response?.data?.error || 'Failed to save course');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await institutionsAPI.deleteCourse(courseId);
        setSuccess('Course deleted successfully!');
        fetchData(); // Refresh the list
      } catch (error) {
        console.error('Error deleting course:', error);
        setError(error.response?.data?.error || 'Failed to delete course');
      }
    }
  };

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : 'Unknown Faculty';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading courses...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Manage Courses
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          disabled={faculties.length === 0}
        >
          Add New Course
        </Button>
      </Box>

      {faculties.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You need to add faculties before you can create courses. Go to "Manage Faculties" to add your first faculty.
        </Alert>
      )}

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
        <Table sx={{ minWidth: 650 }} aria-label="courses table">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Course Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Faculty</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fees (M)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Seats</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No courses added yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {faculties.length === 0 
                      ? 'Add faculties first to create courses' 
                      : 'Add your first course to get started'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id} hover>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    <Box>
                      <Typography variant="subtitle1">{course.name}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        {course.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getFacultyName(course.facultyId)}</TableCell>
                  <TableCell>{course.duration}</TableCell>
                  <TableCell>M {course.fees?.toLocaleString()}</TableCell>
                  <TableCell>{course.seats}</TableCell>
                  <TableCell>
                    <Chip 
                      label={course.status || 'active'} 
                      color={course.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(course)}
                        size="small"
                        title="Edit course"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(course.id)}
                        size="small"
                        title="Delete course"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Course Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Faculty</InputLabel>
              <Select
                value={formData.facultyId}
                label="Faculty"
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                disabled={saving}
              >
                {faculties.map((faculty) => (
                  <MenuItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              label="Course Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={saving}
            />
            
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              disabled={saving}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <TextField
                label="Duration"
                fullWidth
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 4 years"
                required
                disabled={saving}
              />
              <TextField
                label="Fees (M)"
                type="number"
                fullWidth
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                required
                disabled={saving}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label="Seats"
                type="number"
                fullWidth
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                required
                disabled={saving}
                inputProps={{ min: 1 }}
              />
            </Box>
            
            <TextField
              margin="dense"
              label="Requirements"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="e.g., High School Diploma, Mathematics Grade C or above"
              disabled={saving}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={24} /> : (editingCourse ? 'Update' : 'Add')} Course
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ManageCourses;