import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

const AdminInstitutions = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllInstitutions();
      setInstitutions(response.data);
    } catch (err) {
      setError('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (institutionId, status) => {
    try {
      await adminAPI.manageInstitutionStatus(institutionId, status);
      setSuccess(`Institution status updated to ${status}`);
      fetchInstitutions();
      setStatusDialogOpen(false);
      setSelectedInstitution(null);
    } catch (err) {
      setError('Failed to update institution status');
    }
  };

  const handleDelete = async (institutionId) => {
    try {
      await adminAPI.deleteInstitution(institutionId);
      setSuccess('Institution deleted successfully');
      fetchInstitutions();
      setDeleteDialogOpen(false);
      setSelectedInstitution(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete institution');
    }
  };

  const openStatusDialog = (institution, status) => {
    setSelectedInstitution(institution);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const openDeleteDialog = (institution) => {
    setSelectedInstitution(institution);
    setDeleteDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Institutions...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Manage Institutions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/add-institution')}
        >
          Add Institution
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Institutions
              </Typography>
              <Typography variant="h4">{institutions.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Active
              </Typography>
              <Typography variant="h4" color="success.main">
                {institutions.filter(i => i.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Inactive
              </Typography>
              <Typography variant="h4" color="warning.main">
                {institutions.filter(i => i.status === 'inactive').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Suspended
              </Typography>
              <Typography variant="h4" color="error.main">
                {institutions.filter(i => i.status === 'suspended').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="institutions table">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Institution</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statistics</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Registered</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {institutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No institutions found
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/add-institution')}
                    sx={{ mt: 2 }}
                  >
                    Add First Institution
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              institutions.map((institution) => (
                <TableRow key={institution.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {institution.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {institution.description?.substring(0, 50)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{institution.email}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {institution.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`${institution.stats?.faculties || 0} Faculties`} size="small" />
                      <Chip label={`${institution.stats?.courses || 0} Courses`} size="small" />
                      <Chip label={`${institution.stats?.applications || 0} Apps`} size="small" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={institution.status} 
                      color={getStatusColor(institution.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {institution.createdAt ? new Date(institution.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => navigate(`/admin/institutions/${institution.id}/faculties`)}
                      >
                        Manage
                      </Button>
                      {institution.status === 'active' ? (
                        <Button
                          size="small"
                          color="warning"
                          onClick={() => openStatusDialog(institution, 'inactive')}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          color="success"
                          onClick={() => openStatusDialog(institution, 'active')}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        size="small"
                        color="error"
                        onClick={() => openDeleteDialog(institution)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Institution Status</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the status of <strong>{selectedInstitution?.name}</strong> to <strong>{newStatus}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleStatusUpdate(selectedInstitution?.id, newStatus)}
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Institution</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedInstitution?.name}</strong>? This action cannot be undone and will remove all associated faculties and courses.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This will also delete all faculties and courses under this institution.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleDelete(selectedInstitution?.id)}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminInstitutions;