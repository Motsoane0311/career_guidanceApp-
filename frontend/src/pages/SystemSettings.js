import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Backup as BackupIcon,
  Api as ApiIcon,
  Storage as StorageIcon,
  Save as SaveIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    maintenanceMode: false,
    userRegistration: true,
    companyAutoApprove: false,
    
    // Notification Settings
    emailNotifications: true,
    applicationAlerts: true,
    systemUpdates: true,
    
    // Security Settings
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 60,
    
    // System Configuration
    maxFileSize: 10, // MB
    backupFrequency: 'daily',
    logRetention: 30, // days
    
    // API Settings
    apiRateLimit: 1000,
    enableApi: true
  });

  const [saveStatus, setSaveStatus] = useState('');

  const handleToggleChange = (key) => (event) => {
    setSettings(prev => ({
      ...prev,
      [key]: event.target.checked
    }));
  };

  const handleNumberChange = (key) => (event) => {
    setSettings(prev => ({
      ...prev,
      [key]: Number(event.target.value)
    }));
  };

  const handleSelectChange = (key) => (event) => {
    setSettings(prev => ({
      ...prev,
      [key]: event.target.value
    }));
  };

  const handleSaveSettings = () => {
    // Simulate API call to save settings
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 1000);
  };

  const handleResetDefaults = () => {
    setSettings({
      maintenanceMode: false,
      userRegistration: true,
      companyAutoApprove: false,
      emailNotifications: true,
      applicationAlerts: true,
      systemUpdates: true,
      twoFactorAuth: false,
      passwordExpiry: 90,
      sessionTimeout: 60,
      maxFileSize: 10,
      backupFrequency: 'daily',
      logRetention: 30,
      apiRateLimit: 1000,
      enableApi: true
    });
    setSaveStatus('reset');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 'bold' }}>
          <SettingsIcon fontSize="large" />
          System Settings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Configure system-wide settings and preferences
        </Typography>
      </Box>

      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}
      {saveStatus === 'reset' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Settings reset to defaults!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon /> General Settings
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={handleToggleChange('maintenanceMode')}
                      color="warning"
                    />
                  }
                  label="Maintenance Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.userRegistration}
                      onChange={handleToggleChange('userRegistration')}
                    />
                  }
                  label="Allow User Registration"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.companyAutoApprove}
                      onChange={handleToggleChange('companyAutoApprove')}
                    />
                  }
                  label="Auto-approve Companies"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon /> Notification Settings
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={handleToggleChange('emailNotifications')}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.applicationAlerts}
                      onChange={handleToggleChange('applicationAlerts')}
                    />
                  }
                  label="Application Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.systemUpdates}
                      onChange={handleToggleChange('systemUpdates')}
                    />
                  }
                  label="System Update Notifications"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon /> Security Settings
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={handleToggleChange('twoFactorAuth')}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
                
                <TextField
                  label="Password Expiry (days)"
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={handleNumberChange('passwordExpiry')}
                  fullWidth
                  size="small"
                />
                
                <TextField
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={handleNumberChange('sessionTimeout')}
                  fullWidth
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StorageIcon /> System Configuration
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Max File Upload Size (MB)"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={handleNumberChange('maxFileSize')}
                  fullWidth
                  size="small"
                />
                
                <TextField
                  select
                  label="Backup Frequency"
                  value={settings.backupFrequency}
                  onChange={handleSelectChange('backupFrequency')}
                  fullWidth
                  size="small"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </TextField>
                
                <TextField
                  label="Log Retention (days)"
                  type="number"
                  value={settings.logRetention}
                  onChange={handleNumberChange('logRetention')}
                  fullWidth
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* API Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ApiIcon /> API Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableApi}
                        onChange={handleToggleChange('enableApi')}
                      />
                    }
                    label="Enable API Access"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="API Rate Limit (requests/hour)"
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={handleNumberChange('apiRateLimit')}
                    fullWidth
                    size="small"
                    disabled={!settings.enableApi}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BackupIcon /> System Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="System Version" 
                          secondary="v2.1.0" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Last Backup" 
                          secondary="2024-01-15 02:00 AM" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Database Size" 
                          secondary="245 MB" 
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Active Users" 
                          secondary="1,234" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Storage Used" 
                          secondary="1.2 GB / 10 GB" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="System Status" 
                          secondary={
                            <Chip label="Operational" color="success" size="small" />
                          } 
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<RestoreIcon />}
                  onClick={handleResetDefaults}
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SystemSettings;