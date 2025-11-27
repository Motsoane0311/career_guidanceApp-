// frontend/src/pages/FAQ.js
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Grid,
  Paper
} from '@mui/material';
import {
  ExpandMore,
  Search
} from '@mui/icons-material';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      category: 'Student Applications',
      questions: [
        {
          question: 'How many courses can I apply for per institution?',
          answer: 'You can apply for a maximum of two courses per institution. This allows you to have backup options while ensuring fair distribution of opportunities.'
        },
        {
          question: 'What happens if I get admitted to multiple institutions?',
          answer: 'The system will allow you to select one institution. Once you make your choice, you will be automatically removed from other institutions, and the next student on the waiting list will be promoted.'
        },
        {
          question: 'Can I apply for courses I dont qualify for?',
          answer: 'No, the system includes eligibility checking. You will only see and be able to apply for courses that match your qualifications and academic background.'
        },
        {
          question: 'How do I track my application status?',
          answer: 'You can track your application status in real-time through your student dashboard. You will receive notifications for any status changes.'
        }
      ]
    },
    {
      category: 'Institution Management',
      questions: [
        {
          question: 'How do institutions register on the platform?',
          answer: 'Institutions can register by providing their official details and undergoing a verification process. Email verification is required for account activation.'
        },
        {
          question: 'Can institutions manage multiple faculties and courses?',
          answer: 'Yes, institutions can add and manage multiple faculties, and under each faculty, they can create and manage various courses offered.'
        },
        {
          question: 'How do institutions view student applications?',
          answer: 'Institutions have a dedicated dashboard where they can view all applications, filter by course or faculty, and update application status (admitted, rejected, pending).'
        }
      ]
    },
    {
      category: 'Company Services',
      questions: [
        {
          question: 'How do companies post job opportunities?',
          answer: 'Registered companies can post jobs through their dashboard by providing job details, qualifications required, and application deadlines.'
        },
        {
          question: 'How are qualified applicants matched with job posts?',
          answer: 'The system automatically matches applicants based on academic performance, extra certificates, work experience, and relevance to the job requirements.'
        },
        {
          question: 'What kind of applicants do companies see?',
          answer: 'Companies only receive applications from candidates who are qualified and ready for interview consideration, filtered by the system matching algorithm.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          question: 'What should I do if I forget my password?',
          answer: 'Use the "Forgot Password" feature on the login page. You will receive an email with instructions to reset your password.'
        },
        {
          question: 'How do I update my profile information?',
          answer: 'You can update your profile information anytime through the Profile section in your dashboard. Changes are saved automatically.'
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we use industry-standard security measures to protect your personal information and ensure data privacy.'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" textAlign="center" gutterBottom color="primary">
        Frequently Asked Questions
      </Typography>
      <Typography variant="h6" textAlign="center" color="textSecondary" paragraph mb={4}>
        Find answers to common questions about our platform
      </Typography>

      {/* Search Bar */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
          }}
        />
      </Paper>

      {/* FAQ Categories */}
      {filteredCategories.map((category, categoryIndex) => (
        <Box key={categoryIndex} mb={4}>
          <Typography variant="h4" gutterBottom color="primary">
            {category.category}
          </Typography>
          {category.questions.map((faq, faqIndex) => (
            <Accordion key={faqIndex}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ width: '90%', flexShrink: 0 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}

      {/* Contact Support */}
      {filteredCategories.length === 0 && (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No results found for "{searchTerm}"
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Try different keywords or contact our support team for assistance.
          </Typography>
        </Paper>
      )}

      <Paper elevation={2} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Still have questions?
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Can't find the answer you're looking for? Please contact our support team.
        </Typography>
      </Paper>
    </Container>
  );
};

export default FAQ;