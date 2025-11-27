// frontend/src/pages/Testimonials.js
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Paper
} from '@mui/material';
import {
  FormatQuote
} from '@mui/icons-material';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Thato Molapo',
      role: 'Computer Science Graduate',
      institution: 'National University of Lesotho',
      company: 'Software Developer at TechSolutions LS',
      image: '/avatars/student1.jpg',
      rating: 5,
      testimony: 'This platform made my transition from student to professional seamless. I found my current job through the career matching system and couldn\'t be happier!',
      type: 'student'
    },
    {
      name: 'Limpho Mokoena',
      role: 'High School Graduate',
      institution: 'Lesotho High School',
      image: '/avatars/student2.jpg',
      rating: 5,
      testimony: 'Applying to multiple institutions was so easy through this platform. I got accepted into my first-choice course and received guidance every step of the way.',
      type: 'student'
    },
    {
      name: 'Dr. John Mphuthing',
      role: 'Admissions Officer',
      institution: 'Limkokwing University',
      image: '/avatars/institution1.jpg',
      rating: 4,
      testimony: 'The platform has streamlined our admissions process significantly. We can now manage applications efficiently and connect with qualified students easily.',
      type: 'institution'
    },
    {
      name: 'Maria Ramos',
      role: 'HR Manager',
      company: 'Basotho Enterprises Ltd',
      image: '/avatars/company1.jpg',
      rating: 5,
      testimony: 'The quality of candidates we receive through this platform is outstanding. The matching algorithm ensures we only see applicants who truly fit our requirements.',
      type: 'company'
    },
    {
      name: 'Tebello Ntai',
      role: 'Accounting Graduate',
      institution: 'Botho University',
      company: 'Accountant at Financial Partners',
      image: '/avatars/student3.jpg',
      rating: 5,
      testimony: 'I uploaded my transcripts and within weeks, I was receiving job notifications that matched my profile. Landed my dream job thanks to this platform!',
      type: 'student'
    },
    {
      name: 'Mr. Samuel Khotle',
      role: 'Director',
      institution: 'Ministry of Education',
      image: '/avatars/admin1.jpg',
      rating: 4,
      testimony: 'This platform is revolutionizing education and employment in Lesotho. The integration between institutions and companies is exactly what our youth needs.',
      type: 'admin'
    }
  ];

  const stats = [
    { number: '95%', label: 'Student Satisfaction' },
    { number: '85%', label: 'Employment Rate' },
    { number: '50+', label: 'Partner Institutions' },
    { number: '100+', label: 'Partner Companies' }
  ];

  const getTypeColor = (type) => {
    const colors = {
      student: 'success.main',
      institution: 'primary.main',
      company: 'secondary.main',
      admin: 'warning.main'
    };
    return colors[type] || 'text.primary';
  };

  const getTypeLabel = (type) => {
    const labels = {
      student: 'Student Success Story',
      institution: 'Institution Experience',
      company: 'Company Partnership',
      admin: 'Administrative Insight'
    };
    return labels[type] || 'Testimonial';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" textAlign="center" gutterBottom color="primary">
        Success Stories
      </Typography>
      <Typography variant="h6" textAlign="center" color="textSecondary" paragraph mb={4}>
        Discover how our platform is transforming education and employment in Lesotho
      </Typography>

      {/* Statistics */}
      <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
        <Grid container spacing={4} textAlign="center">
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
                {stat.number}
              </Typography>
              <Typography variant="h6">
                {stat.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Testimonials Grid */}
      <Grid container spacing={4}>
        {testimonials.map((testimonial, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent sx={{ p: 3 }}>
                {/* Quote Icon */}
                <FormatQuote 
                  sx={{ 
                    fontSize: 40, 
                    color: 'primary.light', 
                    position: 'absolute', 
                    top: 16, 
                    right: 16,
                    opacity: 0.3
                  }} 
                />
                
                {/* Rating */}
                <Box mb={2}>
                  <Rating value={testimonial.rating} readOnly />
                </Box>

                {/* Testimony Text */}
                <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{testimonial.testimony}"
                </Typography>

                {/* User Info */}
                <Box display="flex" alignItems="center" mt={2}>
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      mr: 2,
                      bgcolor: getTypeColor(testimonial.type)
                    }}
                  >
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {testimonial.role}
                    </Typography>
                    {testimonial.institution && (
                      <Typography variant="body2" color="textSecondary">
                        {testimonial.institution}
                      </Typography>
                    )}
                    {testimonial.company && (
                      <Typography variant="body2" color="textSecondary">
                        {testimonial.company}
                      </Typography>
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: getTypeColor(testimonial.type),
                        fontWeight: 'bold'
                      }}
                    >
                      {getTypeLabel(testimonial.type)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Call to Action */}
      <Paper elevation={3} sx={{ p: 4, mt: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="primary">
          Ready to Start Your Journey?
        </Typography>
        <Typography variant="body1" paragraph>
          Join thousands of students and professionals who have transformed their careers through our platform.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body1" fontWeight="bold">
            Students: 
            <Typography component="span" color="primary">
              {' '}Discover your path to higher education
            </Typography>
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            Graduates: 
            <Typography component="span" color="primary">
              {' '}Launch your career with top companies
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Testimonials;