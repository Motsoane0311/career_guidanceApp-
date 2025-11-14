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
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

const AddInstitution = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  
  const [institutionData, setInstitutionData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });

  const steps = ['Institution Details', 'Confirmation'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInstitutionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      await adminAPI.addInstitution(institutionData);
      
      setSuccess('Institution added successfully!');
      setTimeout(() => {
        navigate('/admin/institutions');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add institution');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Institution Name"
                name="name"
                value={institutionData.name}
                onChange={handleInputChange}
                helperText="Enter the official name of the institution"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={institutionData.email}
                onChange={handleInputChange}
                helperText="Official contact email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={institutionData.phone}
                onChange={handleInputChange}
                helperText="Contact phone number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={institutionData.address}
                onChange={handleInputChange}
                helperText="Physical address of the institution"
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
                value={institutionData.description}
                onChange={handleInputChange}
                helperText="Brief description about the institution"
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Institution Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Name:</Typography>
                  <Typography variant="body1">{institutionData.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Email:</Typography>
                  <Typography variant="body1">{institutionData.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Phone:</Typography>
                  <Typography variant="body1">{institutionData.phone || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Address:</Typography>
                  <Typography variant="body1">{institutionData.address}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Description:</Typography>
                  <Typography variant="body1">{institutionData.description}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add New Institution
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
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={activeStep === 0 ? () => navigate('/admin/institutions') : handleBack}
            disabled={loading}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Institution'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!institutionData.name || !institutionData.email || !institutionData.address || !institutionData.description}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Help Text */}
      <Card sx={{ mt: 3, backgroundColor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            About Adding Institutions
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • The institution will be created with "active" status<br/>
            • An email will be sent to the institution for account setup<br/>
            • You can add faculties and courses after creating the institution<br/>
            • The institution admin can manage their own courses and applications
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddInstitution;