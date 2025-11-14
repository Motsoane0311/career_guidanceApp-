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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../services/api';

const AddFaculty = () => {
  const navigate = useNavigate();
  const { institutionId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(institutionId || '');

  const [facultyData, setFacultyData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await adminAPI.getAllInstitutions();
      setInstitutions(response.data);
    } catch (err) {
      setError('Failed to load institutions');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFacultyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedInstitution) {
      setError('Please select an institution');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await adminAPI.addFaculty({
        institutionId: selectedInstitution,
        ...facultyData
      });
      
      setSuccess('Faculty added successfully!');
      setTimeout(() => {
        if (institutionId) {
          navigate(`/admin/institutions/${institutionId}/faculties`);
        } else {
          navigate('/admin/institutions');
        }
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add faculty');
    } finally {
      setLoading(false);
    }
  };

  const getInstitutionName = (id) => {
    const institution = institutions.find(inst => inst.id === id);
    return institution ? institution.name : '';
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add New Faculty
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
            {/* Institution Selection */}
            <Grid item xs={12}>
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
              {institutionId && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Adding faculty to: <strong>{getInstitutionName(institutionId)}</strong>
                </Typography>
              )}
            </Grid>

            {/* Faculty Details */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Faculty Name"
                name="name"
                value={facultyData.name}
                onChange={handleInputChange}
                helperText="Enter the name of the faculty (e.g., Faculty of Science)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={facultyData.description}
                onChange={handleInputChange}
                helperText="Describe the faculty, its departments, and focus areas"
              />
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
              disabled={loading || !selectedInstitution || !facultyData.name || !facultyData.description}
            >
              {loading ? 'Adding...' : 'Add Faculty'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Help Text */}
      <Card sx={{ mt: 3, backgroundColor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            About Faculties
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • Faculties are academic divisions within an institution<br/>
            • Each faculty can contain multiple courses and departments<br/>
            • Students apply to courses within specific faculties<br/>
            • You can add courses to this faculty after creation
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddFaculty;