// frontend/src/pages/About.js
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import {
  School,
  Work,
  TrendingUp,
  Group
} from '@mui/icons-material';

const About = () => {
  const features = [
    {
      icon: <School sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Discover Institutions',
      description: 'Explore higher learning institutions in Lesotho and their course offerings.'
    },
    {
      icon: <Work sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Career Placement',
      description: 'Connect with partner companies for employment opportunities after graduation.'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Smart Matching',
      description: 'Get matched with jobs based on your qualifications and experience.'
    },
    {
      icon: <Group sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Seamless Integration',
      description: 'Smooth transition from education to employment in one platform.'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" gutterBottom color="primary">
          About Career Guidance Platform
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Bridging the gap between education and employment in Lesotho
        </Typography>
      </Box>

      {/* Mission Section */}
      <Paper elevation={0} sx={{ p: 4, mb: 6, bgcolor: 'background.default' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph>
              To empower Basotho youth by providing a comprehensive platform that 
              simplifies the journey from high school to higher education and 
              ultimately to meaningful employment.
            </Typography>
            <Typography variant="body1" paragraph>
              We believe every student deserves access to quality education and 
              every graduate deserves opportunities that match their skills and aspirations.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              What We Offer
            </Typography>
            <Typography variant="body1" paragraph>
              • Comprehensive database of higher learning institutions in Lesotho
            </Typography>
            <Typography variant="body1" paragraph>
              • Online course applications with smart eligibility checking
            </Typography>
            <Typography variant="body1" paragraph>
              • Career placement services for graduates
            </Typography>
            <Typography variant="body1" paragraph>
              • Direct connection between companies and qualified candidates
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Features Grid */}
      <Typography variant="h4" textAlign="center" gutterBottom mb={4}>
        Key Features
      </Typography>
      <Grid container spacing={4} mb={6}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box mb={2}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stats Section */}
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <Grid container spacing={4}>
          <Grid item xs={6} md={3}>
            <Typography variant="h4" color="primary" gutterBottom>
              50+
            </Typography>
            <Typography variant="body1">
              Institutions
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h4" color="primary" gutterBottom>
              200+
            </Typography>
            <Typography variant="body1">
              Courses
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h4" color="primary" gutterBottom>
              100+
            </Typography>
            <Typography variant="body1">
              Partner Companies
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h4" color="primary" gutterBottom>
              5000+
            </Typography>
            <Typography variant="body1">
              Students Served
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default About;