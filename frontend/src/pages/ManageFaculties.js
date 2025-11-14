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
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { institutionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManageFaculties = () => {
  const { currentUser } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await institutionsAPI.getFaculties();
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setError('Failed to load faculties');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (faculty = null) => {
    if (faculty) {
      setEditingFaculty(faculty);
      setFormData({
        name: faculty.name,
        description: faculty.description
      });
    } else {
      setEditingFaculty(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFaculty(null);
    setFormData({
      name: '',
      description: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      
      if (editingFaculty) {
        // For now, we'll only support adding new faculties
        // Updating would require a separate API endpoint
        setError('Editing faculties is not yet implemented');
      } else {
        // Add new faculty
        await institutionsAPI.addFaculty(formData);
        setSuccess('Faculty added successfully!');
        handleCloseDialog();
        fetchFaculties(); // Refresh the list
      }
    } catch (error) {
      console.error('Error saving faculty:', error);
      setError(error.response?.data?.error || 'Failed to save faculty');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty? This will also delete all courses under this faculty.')) {
      try {
        // For now, we'll just show a message since delete API isn't implemented
        setError('Deleting faculties is not yet implemented. This would require a separate API endpoint.');
      } catch (error) {
        setError('Failed to delete faculty');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading faculties...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Manage Faculties
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
        >
          Add New Faculty
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

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="faculties table">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Faculty Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faculties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No faculties added yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Add your first faculty to get started
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              faculties.map((faculty) => (
                <TableRow key={faculty.id}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    {faculty.name}
                  </TableCell>
                  <TableCell>{faculty.description}</TableCell>
                  <TableCell>
                    {faculty.createdAt ? new Date(faculty.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(faculty)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(faculty.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Faculty Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        disableEnforceFocus
      >
        <DialogTitle>
          {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Faculty Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={saving}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mt: 2 }}
              disabled={saving}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : (editingFaculty ? 'Update' : 'Add')} Faculty
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ManageFaculties;