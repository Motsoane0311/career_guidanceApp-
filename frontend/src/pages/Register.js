import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const userData = {
      email: formData.email,
      password: formData.password,
      role: formData.role,
      userData: {
        name: formData.name,
      },
    };

    const result = await register(userData);

    if (result.success) {
      if (result.data.requiresVerification) {
        setPendingEmail(formData.email);
        setVerificationDialogOpen(true);
        setSuccess('Registration successful! Please check your email for verification link.');
      } else {
        setSuccess('Registration successful! You can now login.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage('');
    
    try {
      const response = await authAPI.resendVerification({ email: pendingEmail });
      setResendMessage(response.data.message);
    } catch (error) {
      setResendMessage(error.response?.data?.error || 'Failed to resend verification email');
    }
    
    setResendLoading(false);
  };

  const handleCloseDialog = () => {
    setVerificationDialogOpen(false);
    setPendingEmail('');
    setResendMessage('');
    navigate('/login');
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Register
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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="institution">Institution</MenuItem>
                <MenuItem value="company">Company</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Email Verification Dialog */}
      <Dialog open={verificationDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Verify Your Email</DialogTitle>
        <DialogContent>
          <Typography>
            We've sent a verification link to <strong>{pendingEmail}</strong>. 
            Please check your email and click the verification link to activate your account.
          </Typography>
          {resendMessage && (
            <Alert severity={resendMessage.includes('successfully') ? 'success' : 'error'} sx={{ mt: 2 }}>
              {resendMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Go to Login</Button>
          <Button 
            onClick={handleResendVerification} 
            disabled={resendLoading}
            variant="contained"
          >
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Register;
