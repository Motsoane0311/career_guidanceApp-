// frontend/src/pages/Contact.js
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send
} from '@mui/icons-material';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Replace with your actual API endpoint
      await axios.post('/api/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Email',
      details: 'info-careerguidance@gmail.com',
      description: 'Send us an email anytime'
    },
    {
      icon: <Phone sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Phone',
      details: '+266 2232 1234',
      description: 'Mon to Fri 9am to 5pm'
    },
    {
      icon: <LocationOn sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Address',
      details: 'Maseru 100, Lesotho',
      description: 'Visit our office'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" textAlign="center" gutterBottom color="primary">
        Contact Us
      </Typography>
      <Typography variant="h6" textAlign="center" color="textSecondary" paragraph mb={4}>
        Get in touch with our team
      </Typography>

      <Grid container spacing={4}>
        {/* Contact Information */}
        <Grid item xs={12} md={4}>
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              Get in Touch
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Have questions about our platform? Need support with your account? 
              We're here to help you succeed in your educational and career journey.
            </Typography>
          </Box>

          {contactInfo.map((info, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  {info.icon}
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    {info.title}
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold">
                  {info.details}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {info.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Contact Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Send us a Message
            </Typography>
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Thank you for your message! We'll get back to you soon.
              </Alert>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="Tell us how we can help you..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={<Send />}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;