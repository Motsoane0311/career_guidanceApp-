// frontend/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  Container
} from '@mui/material';
import {
  School,
  Work,
  Description,
  TrendingUp,
  Help,
  ContactSupport,
  Person,
  Assignment
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import the image from src/assets
import backgroundImage from '../assets/img1.jpg';

export default function Dashboard() {
  const { user, apiBase, currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    applications: 0,
    jobs: 0,
    institutions: 0
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${apiBase}/auth/me`);
        setProfile(res.data.user);
        
        // Fetch basic stats based on user role
        if (res.data.user.role === 'student') {
          const appsRes = await axios.get(`${apiBase}/applications/student`);
          setStats(prev => ({ ...prev, applications: appsRes.data.length }));
        } else if (res.data.user.role === 'company') {
          const jobsRes = await axios.get(`${apiBase}/jobs/company`);
          setStats(prev => ({ ...prev, jobs: jobsRes.data.length }));
        }
      } catch (err) {
        console.error('Error fetching profile', err);
      }
    };
    
    fetchProfile();
  }, [user, apiBase]);

  const quickActions = [
    {
      title: 'Career Resources',
      description: 'Tools and guides for your journey',
      icon: <Description sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/resources',
      color: '#e3f2fd'
    },
    {
      title: 'FAQ',
      description: 'Find answers to common questions',
      icon: <Help sx={{ fontSize: 40, color: 'secondary.main' }} />,
      path: '/faq',
      color: '#f3e5f5'
    },
    {
      title: 'Support',
      description: 'Get help when you need it',
      icon: <ContactSupport sx={{ fontSize: 40, color: 'success.main' }} />,
      path: '/contact',
      color: '#e8f5e8'
    },
    {
      title: 'Success Stories',
      description: 'Read testimonials from others',
      icon: <TrendingUp sx={{ fontSize: 40, color: 'warning.main' }} />,
      path: '/testimonials',
      color: '#fff3e0'
    }
  ];

  const roleSpecificCards = {
    student: [
      {
        title: 'Browse Institutions',
        description: 'Discover higher learning institutions in Lesotho',
        icon: <School sx={{ fontSize: 30 }} />,
        path: '/institutions',
        color: 'primary'
      },
      {
        title: 'Find Jobs',
        description: 'Explore employment opportunities',
        icon: <Work sx={{ fontSize: 30 }} />,
        path: '/jobs',
        color: 'secondary'
      },
      {
        title: 'My Applications',
        description: 'Track your course and job applications',
        icon: <Assignment sx={{ fontSize: 30 }} />,
        path: '/applications',
        color: 'success'
      }
    ],
    company: [
      {
        title: 'Post New Job',
        description: 'Create job opportunities for graduates',
        icon: <Work sx={{ fontSize: 30 }} />,
        path: '/company/jobs',
        color: 'primary'
      },
      {
        title: 'View Applicants',
        description: 'See qualified candidates for your jobs',
        icon: <Person sx={{ fontSize: 30 }} />,
        path: '/company/applicants',
        color: 'secondary'
      }
    ],
    institution: [
      {
        title: 'Manage Faculties',
        description: 'Add and manage institution faculties',
        icon: <School sx={{ fontSize: 30 }} />,
        path: '/institution/faculties',
        color: 'primary'
      },
      {
        title: 'Manage Courses',
        description: 'Create and update course offerings',
        icon: <Description sx={{ fontSize: 30 }} />,
        path: '/institution/courses',
        color: 'secondary'
      },
      {
        title: 'View Applications',
        description: 'Review student applications',
        icon: <Assignment sx={{ fontSize: 30 }} />,
        path: '/institution/applications',
        color: 'success'
      }
    ],
    admin: [
      {
        title: 'Manage Institutions',
        description: 'Oversee all registered institutions',
        icon: <School sx={{ fontSize: 30 }} />,
        path: '/admin/institutions',
        color: 'primary'
      },
      {
        title: 'Manage Companies',
        description: 'Approve and manage company accounts',
        icon: <Work sx={{ fontSize: 30 }} />,
        path: '/admin/companies',
        color: 'secondary'
      },
      {
        title: 'System Reports',
        description: 'View platform analytics and reports',
        icon: <TrendingUp sx={{ fontSize: 30 }} />,
        path: '/admin/reports',
        color: 'info'
      }
    ]
  };

  // Background image styles using the imported image
  const backgroundStyle = {
    minHeight: '90.8vh',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  };

  // If user is not authenticated, show only the background image
  if (!user) {
    return (
      <Box sx={backgroundStyle}>
        {/* Empty page with background image only */}
      </Box>
    );
  }

  const userRole = profile?.role || user?.role || 'student';
  const userCards = roleSpecificCards[userRole] || [];

  return (
    <Box sx={backgroundStyle}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Paper elevation={2} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Box sx={{ color: 'white' }}>
            <Typography variant="h3" gutterBottom fontWeight="bold">
              Welcome back{profile?.profile?.personalInfo?.firstName ? `, ${profile.profile.personalInfo.firstName}` : ''}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {userRole === 'student' && 'Continue your journey to success'}
              {userRole === 'company' && 'Find the perfect candidates for your organization'}
              {userRole === 'institution' && 'Manage your institution and student applications'}
              {userRole === 'admin' && 'Manage the platform and oversee operations'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Role: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`} 
                variant="outlined" 
                sx={{ color: 'white', borderColor: 'white' }} 
              />
              <Chip 
                label={`Email: ${user.email}`} 
                variant="outlined" 
                sx={{ color: 'white', borderColor: 'white' }} 
              />
            </Box>
          </Box>
        </Paper>

        {/* Role-specific Quick Actions */}
        {userCards.length > 0 && (
          <Box mb={4}>
            <Typography variant="h4" gutterBottom color="primary" sx={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={3}>
              {userCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => navigate(card.path)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ color: `${card.color}.main`, mb: 2 }}>
                        {card.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {card.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {card.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Support & Resources Section */}
        <Box mb={4}>
          <Typography variant="h4" gutterBottom color="primary" sx={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
            Support & Resources
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    backgroundColor: action.color,
                    transition: 'transform 0.2s',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box mb={2}>
                      {action.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {action.description}
                    </Typography>
                    <Button 
                      variant="text" 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(action.path);
                      }}
                    >
                      Explore →
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Quick Stats Section */}
        <Paper elevation={1} sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <Typography variant="h5" gutterBottom color="primary">
            Quick Stats
          </Typography>
          <Grid container spacing={3}>
            {userRole === 'student' && (
              <>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="primary">
                      {stats.applications}
                    </Typography>
                    <Typography variant="body1">
                      Total Applications
                    </Typography>
                  </Box>
                </Grid>
              </>
            )}
            {userRole === 'company' && (
              <>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="primary">
                      {stats.jobs}
                    </Typography>
                    <Typography variant="body1">
                      Active Job Posts
                    </Typography>
                  </Box>
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="secondary">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Typography>
                <Typography variant="body1">
                  Account Type
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h3" color="success.main">
                  24/7
                </Typography>
                <Typography variant="body1">
                  Support Available
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}