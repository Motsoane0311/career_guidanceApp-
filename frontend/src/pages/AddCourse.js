import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../services/api';

const AddCourse = () => {
  const navigate = useNavigate();
  const { institutionId, facultyId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(institutionId || '');
  const [selectedFaculty, setSelectedFaculty] = useState(facultyId || '');
  const [newRequirement, setNewRequirement] = useState({ subject: '', minimumGrade: 'C' });

  const [courseData, setCourseData] = useState({
    name: '',
    code: '',
    description: '',
    duration: '',
    fees: '',
    seats: '',
    requirements: {
      minimumGPA: 2.5,
      requiredSubjects: [],
      minimumCredits: 0,
      entranceExam: false,
      additionalRequirements: ''
    }
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    if (selectedInstitution) {
      fetchFaculties(selectedInstitution);
    }
  }, [selectedInstitution]);

  const fetchInstitutions = async () => {
    try {
      const response = await adminAPI.getAllInstitutions();
      setInstitutions(response.data);
    } catch (err) {
      setError('Failed to load institutions');
    }
  };

  const fetchFaculties = async (instId) => {
    try {
      // This would need a proper API endpoint to get faculties by institution
      // For now, we'll simulate it
      const allFaculties = []; // This would come from an API call
      setFaculties(allFaculties);
    } catch (err) {
      setError('Failed to load faculties');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('requirements.')) {
      const requirementField = name.split('.')[1];
      setCourseData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          [requirementField]: value
        }
      }));
    } else {
      setCourseData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addRequirement = () => {
    if (newRequirement.subject.trim()) {
      setCourseData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          requiredSubjects: [...prev.requirements.requiredSubjects, { ...newRequirement }]
        }
      }));
      setNewRequirement({ subject: '', minimumGrade: 'C' });
    }
  };

  const removeRequirement = (index) => {
    setCourseData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        requiredSubjects: prev.requirements.requiredSubjects.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedInstitution || !selectedFaculty) {
      setError('Please select both institution and faculty');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await adminAPI.addCourse({
        institutionId: selectedInstitution,
        facultyId: selectedFaculty,
        ...courseData,
        fees: parseFloat(courseData.fees),
        seats: parseInt(courseData.seats)
      });
      
      setSuccess('Course added successfully!');
      setTimeout(() => {
        if (institutionId && facultyId) {
          navigate(`/admin/institutions/${institutionId}/faculties`);
        } else {
          navigate('/admin/institutions');
        }
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add New Course
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Institution and Faculty Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Institution</InputLabel>
                <Select
                  value={selectedInstitution}
                  label="Institution"
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  disabled={!!institutionId}
                >
                  {institutions.map((institution) => (
                    <MenuItem key={institution.id} value={institution.id}>
                      {institution.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Faculty</InputLabel>
                <Select
                  value={selectedFaculty}
                  label="Faculty"
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  disabled={!!facultyId}
                >
                  {faculties.map((faculty) => (
                    <MenuItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Course Basic Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Course Name"
                name="name"
                value={courseData.name}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Code"
                name="code"
                value={courseData.code}
                onChange={handleInputChange}
                placeholder="e.g., CS101"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={courseData.description}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Duration"
                name="duration"
                value={courseData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 4 years"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Fees (M)"
                name="fees"
                type="number"
                value={courseData.fees}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Available Seats"
                name="seats"
                type="number"
                value={courseData.seats}
                onChange={handleInputChange}
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Requirements Section */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Admission Requirements
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Minimum GPA"
                        name="requirements.minimumGPA"
                        type="number"
                        value={courseData.requirements.minimumGPA}
                        onChange={handleInputChange}
                        inputProps={{ min: 0, max: 4, step: 0.1 }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Minimum Credits"
                        name="requirements.minimumCredits"
                        type="number"
                        value={courseData.requirements.minimumCredits}
                        onChange={handleInputChange}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>

                    {/* Required Subjects */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Required Subjects
                      </Typography>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} sm={5}>
                          <TextField
                            fullWidth
                            label="Subject Name"
                            value={newRequirement.subject}
                            onChange={(e) => setNewRequirement(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="e.g., Mathematics"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel>Minimum Grade</InputLabel>
                            <Select
                              value={newRequirement.minimumGrade}
                              label="Minimum Grade"
                              onChange={(e) => setNewRequirement(prev => ({ ...prev, minimumGrade: e.target.value }))}
                            >
                              <MenuItem value="A">A</MenuItem>
                              <MenuItem value="B">B</MenuItem>
                              <MenuItem value="C">C</MenuItem>
                              <MenuItem value="D">D</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={addRequirement}
                            disabled={!newRequirement.subject.trim()}
                          >
                            Add
                          </Button>
                        </Grid>
                      </Grid>

                      {/* Added Requirements */}
                      {courseData.requirements.requiredSubjects.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {courseData.requirements.requiredSubjects.map((req, index) => (
                            <Chip
                              key={index}
                              label={`${req.subject} (Min: ${req.minimumGrade})`}
                              onDelete={() => removeRequirement(index)}
                            />
                          ))}
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Additional Requirements"
                        name="requirements.additionalRequirements"
                        multiline
                        rows={2}
                        value={courseData.requirements.additionalRequirements}
                        onChange={handleInputChange}
                        placeholder="Any additional requirements or notes..."
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !selectedInstitution || !selectedFaculty || !courseData.name || !courseData.description || !courseData.duration || !courseData.fees || !courseData.seats}
            >
              {loading ? 'Adding...' : 'Add Course'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Help Text */}
      <Card sx={{ mt: 3, backgroundColor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            About Courses
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • Courses represent academic programs students can apply to<br/>
            • Set appropriate requirements to ensure qualified applicants<br/>
            • Available seats determine how many students can be admitted<br/>
            • Courses can be managed by institution administrators after creation
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddCourse;