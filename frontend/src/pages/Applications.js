import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import { applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Applications = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getStudentApplications();
      setApplications(response.data);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted': return 'success';
      case 'rejected': return 'error';
      case 'waiting_list': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'admitted': return 'Admitted';
      case 'rejected': return 'Rejected';
      case 'waiting_list': return 'Waiting List';
      default: return 'Pending';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Applications
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Track your course applications and their status
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {applications.length === 0 ? (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No applications yet
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Browse institutions and apply for courses to see your applications here.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          applications.map((application) => (
            <Grid item xs={12} key={application.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {application.course?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {application.institution?.name} • {application.course?.faculty?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Applied on: {new Date(application.appliedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip 
                      label={getStatusText(application.status)} 
                      color={getStatusColor(application.status)}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {application.course?.duration}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fees:</strong> M{application.course?.fees}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Available Seats:</strong> {application.course?.seats}
                    </Typography>
                  </Box>

                  {application.status === 'admitted' && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Congratulations! You have been admitted to this program.
                    </Alert>
                  )}

                  {application.status === 'rejected' && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      Your application was not successful for this program.
                    </Alert>
                  )}

                  {application.status === 'waiting_list' && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      You have been placed on the waiting list for this program.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default Applications;