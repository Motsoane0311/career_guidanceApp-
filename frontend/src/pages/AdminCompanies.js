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
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { adminAPI } from '../services/api';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [actionType, setActionType] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllCompanies();
      setCompanies(response.data);
    } catch (err) {
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (companyId, status) => {
    try {
      await adminAPI.manageCompanyStatus(companyId, status);
      setSuccess(`Company status updated to ${status}`);
      fetchCompanies();
      setActionDialogOpen(false);
      setSelectedCompany(null);
    } catch (err) {
      setError('Failed to update company status');
    }
  };

  const openActionDialog = (company, action) => {
    setSelectedCompany(company);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckIcon />;
      case 'pending': return <PendingIcon />;
      case 'suspended': return <BlockIcon />;
      case 'rejected': return <BlockIcon />;
      default: return <PendingIcon />;
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const companyStats = {
    total: companies.length,
    pending: companies.filter(c => c.status === 'pending').length,
    approved: companies.filter(c => c.status === 'approved').length,
    suspended: companies.filter(c => c.status === 'suspended').length,
    rejected: companies.filter(c => c.status === 'rejected').length,
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Companies...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Company Management
      </Typography>

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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total
              </Typography>
              <Typography variant="h4">{companyStats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: companyStats.pending > 0 ? '2px solid #ed6c02' : 'none' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">{companyStats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Approved
              </Typography>
              <Typography variant="h4" color="success.main">{companyStats.approved}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Suspended
              </Typography>
              <Typography variant="h4" color="error.main">{companyStats.suspended}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Rejected
              </Typography>
              <Typography variant="h4" color="error.main">{companyStats.rejected}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search Companies"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or industry..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Companies Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="companies table">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Company</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Industry</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Jobs Posted</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Registered</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No companies found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow key={company.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon color="primary" />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {company.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {company.description?.substring(0, 50)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={company.industry} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{company.contact?.email}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {company.contact?.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={company.stats?.jobs || 0} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={getStatusIcon(company.status)}
                      label={company.status} 
                      color={getStatusColor(company.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {company.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            color="success"
                            onClick={() => openActionDialog(company, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => openActionDialog(company, 'reject')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {company.status === 'approved' && (
                        <Button
                          size="small"
                          color="warning"
                          onClick={() => openActionDialog(company, 'suspend')}
                        >
                          Suspend
                        </Button>
                      )}
                      {(company.status === 'suspended' || company.status === 'rejected') && (
                        <Button
                          size="small"
                          color="success"
                          onClick={() => openActionDialog(company, 'approve')}
                        >
                          Approve
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <DialogTitle>
          {actionType === 'approve' && 'Approve Company'}
          {actionType === 'reject' && 'Reject Company'}
          {actionType === 'suspend' && 'Suspend Company'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionType} <strong>{selectedCompany?.name}</strong>?
          </Typography>
          {actionType === 'reject' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone. The company will need to register again.
            </Alert>
          )}
          {actionType === 'suspend' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              The company will not be able to post jobs or access their account.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              const statusMap = {
                approve: 'approved',
                reject: 'rejected',
                suspend: 'suspended'
              };
              handleStatusUpdate(selectedCompany?.id, statusMap[actionType]);
            }}
            color={
              actionType === 'approve' ? 'success' :
              actionType === 'reject' ? 'error' : 'warning'
            }
          >
            Confirm {actionType}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Summary */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Showing {filteredCompanies.length} of {companies.length} companies
        </Typography>
        {companyStats.pending > 0 && (
          <Alert severity="warning" sx={{ maxWidth: 400 }}>
            {companyStats.pending} company{companyStats.pending !== 1 ? 's' : ''} pending approval
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default AdminCompanies;