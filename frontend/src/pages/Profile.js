import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  School as SchoolIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Work as WorkIcon,
  ContactMail as ContactMailIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { companiesAPI, studentsAPI, institutionsAPI, adminAPI } from '../services/api';

const Profile = () => {
  const { currentUser, fetchUserProfile } = useAuth();
  const [formData, setFormData] = useState({});
  const [academicRecords, setAcademicRecords] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [references, setReferences] = useState([]);
  const [newSubject, setNewSubject] = useState({ name: '', grade: '', credits: '', type: 'core' });
  const [newWork, setNewWork] = useState({ 
    company: '', 
    position: '', 
    duration: '', 
    description: '', 
    startDate: '', 
    endDate: '', 
    currentlyWorking: false 
  });
  const [newReference, setNewReference] = useState({ 
    name: '', 
    position: '', 
    company: '', 
    email: '', 
    phone: '', 
    relationship: '' 
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gpaDialogOpen, setGpaDialogOpen] = useState(false);
  const [gpaInfo, setGpaInfo] = useState({ gpa: 0, totalCredits: 0 });
  const [adminTab, setAdminTab] = useState(0);
  const [studentTab, setStudentTab] = useState(0);

  // Admin specific states
  const [adminSettings, setAdminSettings] = useState({
    email: '',
    phone: '',
    notifications: {
      emailAlerts: true,
      systemUpdates: true,
      securityAlerts: true,
      reportGeneration: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 60,
      loginAlerts: true
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    }
  });

  useEffect(() => {
    if (currentUser) {
      // Initialize form data based on user role
      if (currentUser.role === 'student') {
        setFormData({
          personalInfo: currentUser.profile?.personalInfo || {},
          education: currentUser.profile?.education || {},
        });
        setAcademicRecords(currentUser.profile?.education?.academicRecords || []);
        setWorkExperience(currentUser.profile?.workExperience || []);
        setReferences(currentUser.profile?.references || []);
        
        // Set GPA info if available
        if (currentUser.profile?.education) {
          setGpaInfo({
            gpa: currentUser.profile.education.gpa || 0,
            totalCredits: currentUser.profile.education.totalCredits || 0
          });
        }
      } else if (currentUser.role === 'institution') {
        setFormData({
          name: currentUser.profile?.name || '',
          phone: currentUser.profile?.phone || '',
          address: currentUser.profile?.address || '',
          description: currentUser.profile?.description || '',
        });
      } else if (currentUser.role === 'company') {
        setFormData({
          name: currentUser.profile?.name || '',
          industry: currentUser.profile?.industry || '',
          description: currentUser.profile?.description || '',
          contact: currentUser.profile?.contact || { phone: '', email: '', address: '' },
          website: currentUser.profile?.website || '',
          size: currentUser.profile?.size || 'small',
        });
      } else if (currentUser.role === 'admin') {
        // Initialize admin profile data
        setAdminSettings({
          email: currentUser.email || '',
          phone: currentUser.profile?.phone || '',
          notifications: currentUser.profile?.notifications || {
            emailAlerts: true,
            systemUpdates: true,
            securityAlerts: true,
            reportGeneration: false
          },
          security: currentUser.profile?.security || {
            twoFactorAuth: false,
            sessionTimeout: 60,
            loginAlerts: true
          },
          preferences: currentUser.profile?.preferences || {
            theme: 'light',
            language: 'en',
            timezone: 'UTC'
          }
        });
      }
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAdminSettingChange = (section, field, value) => {
    setAdminSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAdminToggle = (section, field) => (event) => {
    handleAdminSettingChange(section, field, event.target.checked);
  };

  // Academic Records Functions
  const addAcademicRecord = () => {
    if (newSubject.name && newSubject.grade && newSubject.credits) {
      setAcademicRecords(prev => [...prev, { ...newSubject, id: Date.now() }]);
      setNewSubject({ name: '', grade: '', credits: '', type: 'core' });
    }
  };

  const removeAcademicRecord = (id) => {
    setAcademicRecords(prev => prev.filter(record => record.id !== id));
  };

  // Work Experience Functions
  const addWorkExperience = () => {
    if (newWork.company && newWork.position && newWork.duration) {
      setWorkExperience(prev => [...prev, { ...newWork, id: Date.now() }]);
      setNewWork({ 
        company: '', 
        position: '', 
        duration: '', 
        description: '', 
        startDate: '', 
        endDate: '', 
        currentlyWorking: false 
      });
    }
  };

  const removeWorkExperience = (id) => {
    setWorkExperience(prev => prev.filter(work => work.id !== id));
  };

  // References Functions
  const addReference = () => {
    if (newReference.name && newReference.position && newReference.email) {
      setReferences(prev => [...prev, { ...newReference, id: Date.now() }]);
      setNewReference({ 
        name: '', 
        position: '', 
        company: '', 
        email: '', 
        phone: '', 
        relationship: '' 
      });
    }
  };

  const removeReference = (id) => {
    setReferences(prev => prev.filter(ref => ref.id !== id));
  };

  const calculateGPA = () => {
    if (academicRecords.length === 0) return { gpa: 0, totalCredits: 0 };

    let totalPoints = 0;
    let totalCredits = 0;

    academicRecords.forEach(record => {
      const credits = parseInt(record.credits) || 0;
      const gradePoints = convertGradeToPoints(record.grade);
      
      totalPoints += gradePoints * credits;
      totalCredits += credits;
    });

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    
    return {
      gpa: parseFloat(gpa.toFixed(2)),
      totalCredits: totalCredits
    };
  };

  const convertGradeToPoints = (grade) => {
    const gradeUpper = grade.toString().toUpperCase();
    
    if (gradeUpper.includes('A') || gradeUpper === 'A') return 4.0;
    if (gradeUpper.includes('B') || gradeUpper === 'B') return 3.0;
    if (gradeUpper.includes('C') || gradeUpper === 'C') return 2.0;
    if (gradeUpper.includes('D') || gradeUpper === 'D') return 1.0;
    
    // Handle percentage grades
    const percentage = parseFloat(grade);
    if (!isNaN(percentage)) {
      if (percentage >= 80) return 4.0;
      if (percentage >= 70) return 3.0;
      if (percentage >= 60) return 2.0;
      if (percentage >= 50) return 1.0;
    }
    
    return 0.0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      let response;
      
      if (currentUser.role === 'student') {
        const gpaData = calculateGPA();
        const studentData = {
          ...formData,
          academicRecords: academicRecords,
          workExperience: workExperience,
          references: references,
          skills: formData.skills || []
        };
        response = await studentsAPI.updateProfile(studentData);
        setGpaInfo(gpaData);
        setMessage(`Profile updated successfully! Your GPA: ${gpaData.gpa}, Total Credits: ${gpaData.totalCredits}`);
      } else if (currentUser.role === 'admin') {
        // Handle admin profile update
        response = await adminAPI.updateProfile(adminSettings);
        setMessage('Admin profile updated successfully!');
      } else {
        // Call the appropriate API based on user role
        switch (currentUser.role) {
          case 'institution':
            response = await institutionsAPI.updateProfile(formData);
            break;
          case 'company':
            response = await companiesAPI.updateProfile(formData);
            break;
          default:
            throw new Error('Unknown user role');
        }
        setMessage('Profile updated successfully!');
      }
      
      // Refresh user profile data
      await fetchUserProfile();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStudentForm = () => (
    <Box>
      <Tabs value={studentTab} onChange={(e, newValue) => setStudentTab(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<PersonIcon />} label="Personal Info" />
        <Tab icon={<SchoolIcon />} label="Academic Records" />
        <Tab icon={<WorkIcon />} label="Work Experience" />
        <Tab icon={<ContactMailIcon />} label="References" />
      </Tabs>

      {studentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="personalInfo.firstName"
              value={formData.personalInfo?.firstName || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="personalInfo.lastName"
              value={formData.personalInfo?.lastName || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              name="personalInfo.phone"
              value={formData.personalInfo?.phone || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="personalInfo.address"
              multiline
              rows={2}
              value={formData.personalInfo?.address || ''}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Education Background
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="University"
              name="education.university"
              value={formData.education?.university || ''}
              onChange={handleChange}
              placeholder="e.g., University of Example"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="High School"
              name="education.highSchool"
              value={formData.education?.highSchool || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Graduation Year"
              name="education.graduationYear"
              type="number"
              value={formData.education?.graduationYear || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Degree Level</InputLabel>
              <Select
                name="education.degreeLevel"
                value={formData.education?.degreeLevel || ''}
                label="Degree Level"
                onChange={handleChange}
              >
                <MenuItem value="high_school">High School</MenuItem>
                <MenuItem value="diploma">Diploma</MenuItem>
                <MenuItem value="bachelors">Bachelor's Degree</MenuItem>
                <MenuItem value="masters">Master's Degree</MenuItem>
                <MenuItem value="phd">PhD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}

      {studentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    High School Subjects & Grades
                  </Typography>
                  <Button 
                    startIcon={<SchoolIcon />}
                    onClick={() => setGpaDialogOpen(true)}
                    variant="outlined"
                    size="small"
                  >
                    View GPA
                  </Button>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Add your high school subjects and grades. Institutions and companies will use this to evaluate your applications.
                </Typography>

                {/* Add New Subject Form */}
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Subject Name"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Mathematics"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Grade"
                      value={newSubject.grade}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, grade: e.target.value }))}
                      placeholder="e.g., A, B, 85%"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Credits"
                      type="number"
                      value={newSubject.credits}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, credits: e.target.value }))}
                      placeholder="e.g., 4"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={newSubject.type}
                        label="Type"
                        onChange={(e) => setNewSubject(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <MenuItem value="core">Core Subject</MenuItem>
                        <MenuItem value="elective">Elective</MenuItem>
                        <MenuItem value="honors">Honors/AP</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addAcademicRecord}
                      disabled={!newSubject.name || !newSubject.grade || !newSubject.credits}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>

                {/* Subjects Table */}
                {academicRecords.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Subject</strong></TableCell>
                          <TableCell><strong>Grade</strong></TableCell>
                          <TableCell><strong>Credits</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {academicRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={record.grade} 
                                color={
                                  record.grade.includes('A') || parseInt(record.grade) >= 80 ? 'success' :
                                  record.grade.includes('B') || parseInt(record.grade) >= 70 ? 'warning' : 'error'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{record.credits}</TableCell>
                            <TableCell>
                              <Chip 
                                label={record.type} 
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeAcademicRecord(record.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    No subjects added yet. Add your high school subjects to help institutions and companies evaluate your application.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Academic Summary */}
          {academicRecords.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Academic Summary
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Typography variant="body2">
                      <strong>Total Subjects:</strong> {academicRecords.length}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total Credits:</strong> {calculateGPA().totalCredits}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Calculated GPA:</strong> {calculateGPA().gpa.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Core Subjects:</strong> {academicRecords.filter(r => r.type === 'core').length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {studentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Work Experience
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Add your work experience to strengthen your job applications.
                </Typography>

                {/* Add Work Experience Form */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={newWork.company}
                      onChange={(e) => setNewWork(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="e.g., Google Inc."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={newWork.position}
                      onChange={(e) => setNewWork(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="e.g., Software Engineer Intern"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Duration (months)"
                      type="number"
                      value={newWork.duration}
                      onChange={(e) => setNewWork(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 6"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={newWork.startDate}
                      onChange={(e) => setNewWork(prev => ({ ...prev, startDate: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={newWork.endDate}
                      onChange={(e) => setNewWork(prev => ({ ...prev, endDate: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      disabled={newWork.currentlyWorking}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Job Description"
                      multiline
                      rows={3}
                      value={newWork.description}
                      onChange={(e) => setNewWork(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newWork.currentlyWorking}
                          onChange={(e) => setNewWork(prev => ({ ...prev, currentlyWorking: e.target.checked }))}
                        />
                      }
                      label="I currently work here"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addWorkExperience}
                      disabled={!newWork.company || !newWork.position || !newWork.duration}
                    >
                      Add Work Experience
                    </Button>
                  </Grid>
                </Grid>

                {/* Work Experience List */}
                {workExperience.length > 0 ? (
                  <Box>
                    {workExperience.map((work) => (
                      <Card key={work.id} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="h6">{work.position}</Typography>
                              <Typography variant="subtitle1" color="primary">
                                {work.company}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {work.startDate} - {work.currentlyWorking ? 'Present' : work.endDate} 
                                {work.duration && ` (${work.duration} months)`}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {work.description}
                              </Typography>
                            </Box>
                            <IconButton
                              color="error"
                              onClick={() => removeWorkExperience(work.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    No work experience added yet. Add your work experience to make your profile more attractive to employers.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {studentTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Professional References
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Add professional references that employers can contact.
                </Typography>

                {/* Add Reference Form */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Reference Name"
                      value={newReference.name}
                      onChange={(e) => setNewReference(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., John Smith"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={newReference.position}
                      onChange={(e) => setNewReference(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="e.g., Senior Manager"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={newReference.company}
                      onChange={(e) => setNewReference(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="e.g., Microsoft Corporation"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={newReference.email}
                      onChange={(e) => setNewReference(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g., john.smith@company.com"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={newReference.phone}
                      onChange={(e) => setNewReference(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g., +1 (555) 123-4567"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Relationship"
                      value={newReference.relationship}
                      onChange={(e) => setNewReference(prev => ({ ...prev, relationship: e.target.value }))}
                      placeholder="e.g., Former Manager, Professor, etc."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addReference}
                      disabled={!newReference.name || !newReference.position || !newReference.email}
                    >
                      Add Reference
                    </Button>
                  </Grid>
                </Grid>

                {/* References List */}
                {references.length > 0 ? (
                  <Box>
                    {references.map((ref) => (
                      <Card key={ref.id} variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="h6">{ref.name}</Typography>
                              <Typography variant="subtitle1" color="primary">
                                {ref.position} at {ref.company}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Relationship: {ref.relationship}
                              </Typography>
                              <Typography variant="body2">
                                Email: {ref.email} | Phone: {ref.phone}
                              </Typography>
                            </Box>
                            <IconButton
                              color="error"
                              onClick={() => removeReference(ref.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    No references added yet. Add professional references to strengthen your job applications.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  // ... (rest of the code for adminForm, institutionForm, companyForm remains exactly the same as in your original file)

  const renderAdminForm = () => (
    <Box>
      {/* Admin Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                System Administrator
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {currentUser?.email}
              </Typography>
              <Chip 
                label="Administrator" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.3)', 
                  color: 'white',
                  fontWeight: 'bold',
                  mt: 1
                }} 
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Tabs value={adminTab} onChange={(e, newValue) => setAdminTab(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<PersonIcon />} label="Personal Info" />
        <Tab icon={<NotificationsIcon />} label="Notifications" />
        <Tab icon={<SecurityIcon />} label="Security" />
        <Tab icon={<SettingsIcon />} label="Preferences" />
      </Tabs>

      {adminTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon /> Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={adminSettings.email}
                  disabled
                  helperText="Primary email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={adminSettings.phone}
                  onChange={(e) => setAdminSettings(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {adminTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon /> Notification Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={adminSettings.notifications.emailAlerts}
                    onChange={handleAdminToggle('notifications', 'emailAlerts')}
                  />
                }
                label="Email Alerts for Critical System Events"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={adminSettings.notifications.systemUpdates}
                    onChange={handleAdminToggle('notifications', 'systemUpdates')}
                  />
                }
                label="System Update Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={adminSettings.notifications.securityAlerts}
                    onChange={handleAdminToggle('notifications', 'securityAlerts')}
                  />
                }
                label="Security Alert Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={adminSettings.notifications.reportGeneration}
                    onChange={handleAdminToggle('notifications', 'reportGeneration')}
                  />
                }
                label="Automatic Report Generation Alerts"
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {adminTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon /> Security Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={adminSettings.security.twoFactorAuth}
                      onChange={handleAdminToggle('security', 'twoFactorAuth')}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={adminSettings.security.sessionTimeout}
                  onChange={(e) => handleAdminSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  helperText="Automatic logout after inactivity"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={adminSettings.security.loginAlerts}
                      onChange={handleAdminToggle('security', 'loginAlerts')}
                    />
                  }
                  label="Receive Login Alert Emails"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {adminTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon /> System Preferences
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={adminSettings.preferences.theme}
                    label="Theme"
                    onChange={(e) => handleAdminSettingChange('preferences', 'theme', e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto (System)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={adminSettings.preferences.language}
                    label="Language"
                    onChange={(e) => handleAdminSettingChange('preferences', 'language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={adminSettings.preferences.timezone}
                    label="Timezone"
                    onChange={(e) => handleAdminSettingChange('preferences', 'timezone', e.target.value)}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="EST">Eastern Time (EST)</MenuItem>
                    <MenuItem value="PST">Pacific Time (PST)</MenuItem>
                    <MenuItem value="CET">Central European Time (CET)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Admin System Info */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon /> System Administrator Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                <strong>Role:</strong> System Administrator
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                <strong>Access Level:</strong> Full System Access
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                <strong>Last Login:</strong> {new Date().toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                <strong>Account Created:</strong> {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderInstitutionForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Institution Name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          name="address"
          multiline
          rows={2}
          value={formData.address || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          name="description"
          multiline
          rows={4}
          value={formData.description || ''}
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );

  const renderCompanyForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Company Name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Industry</InputLabel>
          <Select
            name="industry"
            value={formData.industry || ''}
            label="Industry"
            onChange={handleChange}
          >
            <MenuItem value="Technology">Technology</MenuItem>
            <MenuItem value="Healthcare">Healthcare</MenuItem>
            <MenuItem value="Education">Education</MenuItem>
            <MenuItem value="Finance">Finance</MenuItem>
            <MenuItem value="Manufacturing">Manufacturing</MenuItem>
            <MenuItem value="Retail">Retail</MenuItem>
            <MenuItem value="Hospitality">Hospitality</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Company Size</InputLabel>
          <Select
            name="size"
            value={formData.size || 'small'}
            label="Company Size"
            onChange={handleChange}
          >
            <MenuItem value="small">Small (1-50 employees)</MenuItem>
            <MenuItem value="medium">Medium (51-200 employees)</MenuItem>
            <MenuItem value="large">Large (201+ employees)</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Website"
          name="website"
          value={formData.website || ''}
          onChange={handleChange}
          placeholder="https://example.com"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Company Description"
          name="description"
          multiline
          rows={4}
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Describe your company, services, and culture..."
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Contact Phone"
          name="contact.phone"
          value={formData.contact?.phone || ''}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Contact Email"
          name="contact.email"
          type="email"
          value={formData.contact?.email || ''}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Office Address"
          name="contact.address"
          multiline
          rows={2}
          value={formData.contact?.address || ''}
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );

  // GPA Info Dialog
  const GpaInfoDialog = () => (
    <Dialog open={gpaDialogOpen} onClose={() => setGpaDialogOpen(false)}>
      <DialogTitle>GPA Information</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          <strong>Your Current GPA:</strong> {gpaInfo.gpa.toFixed(2)}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Total Credits:</strong> {gpaInfo.totalCredits}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          <strong>GPA Calculation:</strong>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          • A / 80-100% = 4.0 points<br/>
          • B / 70-79% = 3.0 points<br/>
          • C / 60-69% = 2.0 points<br/>
          • D / 50-59% = 1.0 points<br/>
          • F / Below 50% = 0.0 points
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          GPA = Total Grade Points ÷ Total Credits
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setGpaDialogOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const renderForm = () => {
    switch (currentUser?.role) {
      case 'student':
        return renderStudentForm();
      case 'institution':
        return renderInstitutionForm();
      case 'company':
        return renderCompanyForm();
      case 'admin':
        return renderAdminForm();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Update your {currentUser?.role} profile information
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {renderForm()}
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              size="large"
              startIcon={<SaveIcon />}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
            {currentUser?.role === 'admin' && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <GpaInfoDialog />
    </Container>
  );
};

export default Profile;