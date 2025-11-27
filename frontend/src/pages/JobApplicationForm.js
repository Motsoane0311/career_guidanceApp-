import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  ContactMail as ContactMailIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const JobApplicationForm = ({ open, onClose, job, onSuccess, onError }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    if (open && currentUser) {
      loadStudentProfile();
    }
  }, [open, currentUser]);

  const loadStudentProfile = async () => {
    try {
      setStudentProfile(currentUser.profile);
      evaluateStudentForJob();
    } catch (error) {
      console.error('Error loading student profile:', error);
    }
  };

  const evaluateStudentForJob = () => {
    if (!studentProfile || !job) return;

    let matchScore = 0;
    const matchedQualifications = [];
    const evaluationDetails = {
      academicMatch: {},
      experienceMatch: {},
      skillMatch: {},
      missingRequirements: []
    };

    const requirements = job.requirements || {};

    // Academic Evaluation
    if (requirements.minGPA) {
      const studentGPA = studentProfile.education?.gpa || 0;
      if (studentGPA >= requirements.minGPA) {
        matchScore += 25;
        matchedQualifications.push(`Meets GPA requirement (${studentGPA} >= ${requirements.minGPA})`);
        evaluationDetails.academicMatch.gpa = { required: requirements.minGPA, actual: studentGPA, met: true };
      } else {
        evaluationDetails.academicMatch.gpa = { required: requirements.minGPA, actual: studentGPA, met: false };
        evaluationDetails.missingRequirements.push(`GPA below requirement (${studentGPA} < ${requirements.minGPA})`);
      }
    }

    // Education Level Evaluation
    if (requirements.education?.level) {
      const studentEducationLevel = studentProfile.education?.degreeLevel || '';
      if (studentEducationLevel === requirements.education.level) {
        matchScore += 15;
        matchedQualifications.push(`Education level: ${studentEducationLevel}`);
        evaluationDetails.academicMatch.educationLevel = { required: requirements.education.level, actual: studentEducationLevel, met: true };
      } else {
        evaluationDetails.academicMatch.educationLevel = { required: requirements.education.level, actual: studentEducationLevel, met: false };
      }
    }

    // Course Requirements Evaluation
    if (requirements.requiredCourses && requirements.requiredCourses.length > 0) {
      const studentCourses = studentProfile.education?.academicRecords || [];
      const matchedCourses = requirements.requiredCourses.filter(reqCourse =>
        studentCourses.some(studentCourse => 
          studentCourse.name.toLowerCase().includes(reqCourse.toLowerCase()) ||
          reqCourse.toLowerCase().includes(studentCourse.name.toLowerCase())
        )
      );
      
      if (matchedCourses.length > 0) {
        matchScore += matchedCourses.length * 5;
        matchedQualifications.push(...matchedCourses.map(course => `Completed course: ${course}`));
        evaluationDetails.academicMatch.requiredCourses = { 
          required: requirements.requiredCourses, 
          matched: matchedCourses, 
          met: matchedCourses.length === requirements.requiredCourses.length 
        };
      }
    }

    // Experience Evaluation
    if (requirements.minExperience > 0) {
      const studentExperience = studentProfile.workExperience || [];
      const totalExperience = studentExperience.reduce((total, exp) => {
        return total + (parseInt(exp.duration) || 0);
      }, 0) / 12; // Convert months to years
      
      if (totalExperience >= requirements.minExperience) {
        matchScore += 30;
        matchedQualifications.push(`Experience: ${totalExperience.toFixed(1)} years`);
        evaluationDetails.experienceMatch.years = { required: requirements.minExperience, actual: totalExperience, met: true };
      } else {
        evaluationDetails.experienceMatch.years = { required: requirements.minExperience, actual: totalExperience, met: false };
        evaluationDetails.missingRequirements.push(`Insufficient experience (${totalExperience.toFixed(1)} < ${requirements.minExperience} years)`);
      }
    }

    // References Evaluation
    if (requirements.requireReferences) {
      const minReferences = requirements.minReferences || 2;
      const studentReferences = studentProfile.references || [];
      if (studentReferences.length >= minReferences) {
        matchScore += 10;
        matchedQualifications.push(`References: ${studentReferences.length} provided`);
      } else {
        evaluationDetails.missingRequirements.push(`Insufficient references (${studentReferences.length} < ${minReferences} required)`);
      }
    }

    matchScore = Math.min(matchScore, 100);

    setEvaluation({
      matchScore,
      matchedQualifications,
      evaluationDetails
    });
  };

  const handleSubmit = async () => {
    if (!studentProfile) {
      onError('Please complete your student profile before applying for jobs.');
      return;
    }

    setLoading(true);
    try {
      const applicationData = {
        coverLetter,
        workExperience: studentProfile.workExperience || [],
        references: studentProfile.references || [],
        additionalDocuments: []
      };

      const response = await applicationsAPI.applyForJob(job.id, applicationData);
      onSuccess(response.data.message || 'Application submitted successfully!');
      onClose();
    } catch (error) {
      onError(error.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (!job) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Apply for {job.title}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Job Overview */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Job Overview
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Company:</strong> {job.company?.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Location:</strong> {job.location} • <strong>Type:</strong> {job.jobType}
                </Typography>
                <Typography variant="body2">
                  {job.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Application Evaluation */}
          {evaluation && (
            <Grid item xs={12}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderColor: getMatchColor(evaluation.matchScore) === 'success' ? 'success.main' : 
                             getMatchColor(evaluation.matchScore) === 'warning' ? 'warning.main' : 'error.main'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Application Evaluation
                    </Typography>
                    <Chip 
                      label={`${evaluation.matchScore}% Match`} 
                      color={getMatchColor(evaluation.matchScore)}
                      size="large"
                    />
                  </Box>

                  {evaluation.matchedQualifications.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Matched Qualifications:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {evaluation.matchedQualifications.map((qual, index) => (
                          <Chip key={index} label={qual} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {evaluation.evaluationDetails.missingRequirements.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Areas for Improvement:</strong>
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {evaluation.evaluationDetails.missingRequirements.map((req, index) => (
                          <li key={index}>
                            <Typography variant="body2">{req}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  {/* Detailed Evaluation */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Detailed Evaluation</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {/* Academic Evaluation */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SchoolIcon /> Academic Evaluation
                          </Typography>
                          {evaluation.evaluationDetails.academicMatch.gpa && (
                            <Typography variant="body2">
                              GPA: {evaluation.evaluationDetails.academicMatch.gpa.actual.toFixed(2)} / {evaluation.evaluationDetails.academicMatch.gpa.required} - 
                              <Chip 
                                label={evaluation.evaluationDetails.academicMatch.gpa.met ? 'Met' : 'Not Met'} 
                                color={evaluation.evaluationDetails.academicMatch.gpa.met ? 'success' : 'error'}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Typography>
                          )}
                          {evaluation.evaluationDetails.academicMatch.educationLevel && (
                            <Typography variant="body2">
                              Education: {evaluation.evaluationDetails.academicMatch.educationLevel.actual} - 
                              <Chip 
                                label={evaluation.evaluationDetails.academicMatch.educationLevel.met ? 'Met' : 'Not Met'} 
                                color={evaluation.evaluationDetails.academicMatch.educationLevel.met ? 'success' : 'error'}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Typography>
                          )}
                        </Grid>

                        {/* Experience Evaluation */}
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkIcon /> Experience Evaluation
                          </Typography>
                          {evaluation.evaluationDetails.experienceMatch.years && (
                            <Typography variant="body2">
                              Experience: {evaluation.evaluationDetails.experienceMatch.years.actual.toFixed(1)} years / {evaluation.evaluationDetails.experienceMatch.years.required} - 
                              <Chip 
                                label={evaluation.evaluationDetails.experienceMatch.years.met ? 'Met' : 'Not Met'} 
                                color={evaluation.evaluationDetails.experienceMatch.years.met ? 'success' : 'error'}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Academic Information */}
          {studentProfile?.education && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon /> Academic Information
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>University:</strong> {studentProfile.education.university || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Degree Level:</strong> {studentProfile.education.degreeLevel || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>GPA:</strong> 
                        <Chip 
                          label={studentProfile.education.gpa?.toFixed(2) || 'N/A'} 
                          color={studentProfile.education.gpa >= 3.5 ? 'success' : studentProfile.education.gpa >= 3.0 ? 'warning' : 'default'}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Total Credits:</strong> {studentProfile.education.totalCredits || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {studentProfile.education.academicRecords && studentProfile.education.academicRecords.length > 0 && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Academic Transcript ({studentProfile.education.academicRecords.length} subjects)</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Subject</strong></TableCell>
                                <TableCell><strong>Grade</strong></TableCell>
                                <TableCell><strong>Credits</strong></TableCell>
                                <TableCell><strong>Type</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {studentProfile.education.academicRecords.map((record, index) => (
                                <TableRow key={index}>
                                  <TableCell>{record.name || record.subject}</TableCell>
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
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Work Experience */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon /> Work Experience
                </Typography>
                
                {(!studentProfile?.workExperience || studentProfile.workExperience.length === 0) ? (
                  <Typography variant="body2" color="textSecondary">
                    No work experience provided. Add work experience to your profile to strengthen your application.
                  </Typography>
                ) : (
                  studentProfile.workExperience.map((exp, index) => (
                    <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < studentProfile.workExperience.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {exp.position} at {exp.company}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} - 
                        {exp.currentlyWorking ? ' Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A'}
                        {exp.duration && ` (${exp.duration} months)`}
                      </Typography>
                      <Typography variant="body2">
                        {exp.description}
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* References */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ContactMailIcon /> Professional References
                </Typography>
                
                {(!studentProfile?.references || studentProfile.references.length === 0) ? (
                  <Typography variant="body2" color="textSecondary">
                    No references provided. Add professional references to your profile to strengthen your application.
                  </Typography>
                ) : (
                  studentProfile.references.map((ref, index) => (
                    <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < studentProfile.references.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {ref.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {ref.position} at {ref.company}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Relationship:</strong> {ref.relationship}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {ref.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {ref.phone}
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Cover Letter */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon /> Cover Letter
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write a cover letter explaining why you are a good fit for this position. Highlight your relevant skills, experience, and academic achievements..."
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !studentProfile}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobApplicationForm;