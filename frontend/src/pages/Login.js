import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const { login } = useAuth();
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
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Redirect based on user role
      switch (result.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'institution':
          navigate('/institution');
          break;
        case 'company':
          navigate('/company');
          break;
        case 'student':
        default:
          navigate('/dashboard');
      }
    } else {
      // Check if email verification is required
      if (result.error.includes('verify your email') || result.requiresVerification) {
        setPendingEmail(formData.email);
        setVerificationDialogOpen(true);
      }
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
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Box textAlign="center">
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
            <Box textAlign="center" sx={{ mt: 1 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot your password?
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Email Verification Dialog */}
      <Dialog open={verificationDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Email Verification Required</DialogTitle>
        <DialogContent>
          <Typography>
            Please verify your email address before logging in. We've sent a verification link to <strong>{pendingEmail}</strong>.
          </Typography>
          {resendMessage && (
            <Alert severity={resendMessage.includes('successfully') ? 'success' : 'error'} sx={{ mt: 2 }}>
              {resendMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
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

export default Login;