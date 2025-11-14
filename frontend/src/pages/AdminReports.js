import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { adminAPI } from '../services/api';

const AdminReports = () => {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('user_registrations');
  const [dateRange, setDateRange] = useState('all_time');

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange]);

  const generateReport = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (dateRange !== 'all_time') {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (dateRange) {
          case 'last_7_days':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case 'last_30_days':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case 'last_90_days':
            startDate.setDate(endDate.getDate() - 90);
            break;
          case 'this_year':
            startDate.setMonth(0, 1);
            break;
          default:
            break;
        }
        
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
      
      const response = await adminAPI.getSystemReports({ reportType, ...params });
      setReports(response.data);
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const dataStr = JSON.stringify(reports, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderUserRegistrationsReport = () => {
    const data = reports.data;
    if (!data) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Registration Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total Registrations:</Typography>
                  <Typography variant="h6">{data.total}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Students:</Typography>
                  <Chip label={data.byRole.student} color="primary" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Institutions:</Typography>
                  <Chip label={data.byRole.institution} color="secondary" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Companies:</Typography>
                  <Chip label={data.byRole.company} color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Admins:</Typography>
                  <Chip label={data.byRole.admin} color="error" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {Object.entries(data.byDate).slice(0, 5).map(([date, count]) => (
                <Box key={date} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{new Date(date).toLocaleDateString()}</Typography>
                  <Chip label={count} size="small" />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderApplicationAnalyticsReport = () => {
    const data = reports.data;
    if (!data) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total Applications:</Typography>
                  <Typography variant="h6">{data.total}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Pending:</Typography>
                  <Chip label={data.byStatus.pending} color="warning" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Admitted:</Typography>
                  <Chip label={data.byStatus.admitted} color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Rejected:</Typography>
                  <Chip label={data.byStatus.rejected} color="error" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Waiting List:</Typography>
                  <Chip label={data.byStatus.waiting_list} color="info" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Institutions
              </Typography>
              {Object.entries(data.byInstitution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([institution, count]) => (
                  <Box key={institution} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{institution}</Typography>
                    <Chip label={count} size="small" />
                  </Box>
                ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Popular Courses
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Course Name</TableCell>
                      <TableCell align="right">Applications</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(data.byCourse)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 10)
                      .map(([course, count]) => (
                        <TableRow key={course}>
                          <TableCell>{course}</TableCell>
                          <TableCell align="right">
                            <Chip label={count} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCompanyActivityReport = () => {
    const data = reports.data;
    if (!data) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Company Overview
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total Companies:</Typography>
                  <Typography variant="h6">{data.total}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Pending Approval:</Typography>
                  <Chip label={data.byStatus.pending} color="warning" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Approved:</Typography>
                  <Chip label={data.byStatus.approved} color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Suspended:</Typography>
                  <Chip label={data.byStatus.suspended} color="error" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Rejected:</Typography>
                  <Chip label={data.byStatus.rejected} color="error" size="small" variant="outlined" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Posting Activity
              </Typography>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h2" color="primary">
                  {data.jobsPosted}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Jobs Posted
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'user_registrations':
        return renderUserRegistrationsReport();
      case 'application_analytics':
        return renderApplicationAnalyticsReport();
      case 'company_activity':
        return renderCompanyActivityReport();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          System Reports
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportReport}
          disabled={!reports.data}
        >
          Export Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Report Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="user_registrations">User Registrations</MenuItem>
                <MenuItem value="application_analytics">Application Analytics</MenuItem>
                <MenuItem value="company_activity">Company Activity</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="all_time">All Time</MenuItem>
                <MenuItem value="last_7_days">Last 7 Days</MenuItem>
                <MenuItem value="last_30_days">Last 30 Days</MenuItem>
                <MenuItem value="last_90_days">Last 90 Days</MenuItem>
                <MenuItem value="this_year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Report Header */}
      {reports.generatedAt && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Report generated on {new Date(reports.generatedAt).toLocaleString()}
          {dateRange !== 'all_time' && ` for ${dateRange.replace('_', ' ')}`}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Report Content */}
      {!loading && reports.data && renderReportContent()}

      {/* No Data State */}
      {!loading && !reports.data && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BarChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Report Data
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Select a report type and date range to generate reports
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default AdminReports;