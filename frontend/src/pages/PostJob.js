import React, { useState } from 'react';
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
} from '@mui/material';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PostJob = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: {
      educationLevel: '',
      minExperience: '',
      skills: '',
      certificates: '',
    },
    qualifications: [''],
    location: '',
    salary: '',
    jobType: 'full-time',
    deadline: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('requirements.')) {
      const requirementField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          [requirementField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Format the data for API
      const jobData = {
        ...formData,
        requirements: {
          ...formData.requirements,
          skills: formData.requirements.skills.split(',').map(skill => skill.trim()),
          certificates: formData.requirements.certificates.split(',').map(cert => cert.trim()),
        },
        qualifications: formData.qualifications.filter(q => q.trim() !== ''),
      };

      await jobsAPI.createJob(jobData);
      setMessage('Job posted successfully!');
      setTimeout(() => {
        navigate('/company');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, '']
    }));
  };

  const handleQualificationChange = (index, value) => {
    const newQualifications = [...formData.qualifications];
    newQualifications[index] = value;
    setFormData(prev => ({
      ...prev,
      qualifications: newQualifications
    }));
  };

  const removeQualification = (index) => {
    const newQualifications = formData.qualifications.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      qualifications: newQualifications
    }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Post New Job
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Job Information */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  name="jobType"
                  value={formData.jobType}
                  label="Job Type"
                  onChange={handleChange}
                >
                  <MenuItem value="full-time">Full Time</MenuItem>
                  <MenuItem value="part-time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="internship">Internship</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Application Deadline"
                name="deadline"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Requirements */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Education Level</InputLabel>
                <Select
                  name="requirements.educationLevel"
                  value={formData.requirements.educationLevel}
                  label="Education Level"
                  onChange={handleChange}
                >
                  <MenuItem value="high_school">High School</MenuItem>
                  <MenuItem value="diploma">Diploma</MenuItem>
                  <MenuItem value="bachelors">Bachelor's Degree</MenuItem>
                  <MenuItem value="masters">Master's Degree</MenuItem>
                  <MenuItem value="phd">PhD</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Experience (years)"
                name="requirements.minExperience"
                type="number"
                value={formData.requirements.minExperience}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Required Skills (comma separated)"
                name="requirements.skills"
                value={formData.requirements.skills}
                onChange={handleChange}
                placeholder="e.g., JavaScript, React, Node.js"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Required Certificates (comma separated)"
                name="requirements.certificates"
                value={formData.requirements.certificates}
                onChange={handleChange}
                placeholder="e.g., AWS Certified, PMP, Google Analytics"
              />
            </Grid>

            {/* Qualifications */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Qualifications
              </Typography>
              {formData.qualifications.map((qualification, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Qualification ${index + 1}`}
                    value={qualification}
                    onChange={(e) => handleQualificationChange(index, e.target.value)}
                    placeholder="e.g., Bachelor's degree in Computer Science"
                  />
                  {formData.qualifications.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeQualification(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={addQualification}
                sx={{ mt: 1 }}
              >
                Add Qualification
              </Button>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Posting Job...' : 'Post Job'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default PostJob;