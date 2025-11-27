// frontend/src/pages/Resources.js
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper // ADDED THIS IMPORT
} from '@mui/material';
import {
  ExpandMore,
  School,
  Work,
  Description,
  VideoLibrary,
  TrendingUp
} from '@mui/icons-material';

const Resources = () => {
  const resourceCategories = [
    {
      icon: <School sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Study Guides',
      description: 'Resources to help you prepare for higher education',
      resources: [
        { name: 'Mathematics Preparation', type: 'PDF', level: 'Beginner' },
        { name: 'Science Fundamentals', type: 'PDF', level: 'Intermediate' },
        { name: 'Language Skills', type: 'Video', level: 'Beginner' }
      ]
    },
    {
      icon: <Work sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Career Planning',
      description: 'Tools and guides for career development',
      resources: [
        { name: 'Resume Writing Guide', type: 'PDF', level: 'All' },
        { name: 'Interview Preparation', type: 'Video', level: 'Intermediate' },
        { name: 'Career Assessment Test', type: 'Tool', level: 'Beginner' }
      ]
    },
    {
      icon: <Description sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Application Tips',
      description: 'How to create successful applications',
      resources: [
        { name: 'Personal Statement Guide', type: 'PDF', level: 'Intermediate' },
        { name: 'Application Checklist', type: 'PDF', level: 'Beginner' },
        { name: 'Scholarship Applications', type: 'Video', level: 'Advanced' }
      ]
    }
  ];

  const faqs = [
    {
      question: 'How do I choose the right course?',
      answer: 'Consider your interests, strengths, career goals, and job market demands. Use our career assessment tools and consult with academic advisors.'
    },
    {
      question: 'What documents do I need for applications?',
      answer: 'Typically you need academic transcripts, identification documents, recommendation letters, and a personal statement. Specific requirements vary by institution.'
    },
    {
      question: 'How can I improve my job prospects?',
      answer: 'Focus on developing both technical and soft skills, gain practical experience through internships, and build a professional network.'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" textAlign="center" gutterBottom color="primary">
        Career Resources
      </Typography>
      <Typography variant="h6" textAlign="center" color="textSecondary" paragraph mb={4}>
        Tools and guides to support your educational and career journey
      </Typography>

      {/* Resource Categories */}
      <Grid container spacing={4} mb={6}>
        {resourceCategories.map((category, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box mb={2}>
                  {category.icon}
                </Box>
                <Typography variant="h5" gutterBottom>
                  {category.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {category.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {category.resources.map((resource, idx) => (
                    <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {resource.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={resource.type} size="small" variant="outlined" />
                        <Chip label={resource.level} size="small" color="primary" />
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Button variant="outlined" sx={{ mt: 2 }}>
                  Explore More
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Tips Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Quick Career Tips
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Stay Updated
              </Typography>
              <Typography variant="body2">
                Keep track of emerging industries and required skills in the job market
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <School sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Continuous Learning
              </Typography>
              <Typography variant="body2">
                Always look for opportunities to learn new skills and gain certifications
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Work sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Network Building
              </Typography>
              <Typography variant="body2">
                Connect with professionals and attend career fairs and workshops
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* FAQ Section */}
      <Typography variant="h4" gutterBottom textAlign="center">
        Frequently Asked Questions
      </Typography>
      <Box mb={4}>
        {faqs.map((faq, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
};

export default Resources;