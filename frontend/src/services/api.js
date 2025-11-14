import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Students API
export const studentsAPI = {
  updateProfile: (data) => api.put('/students/profile', data),
  uploadTranscripts: (data) => api.post('/students/transcripts', data),
  getApplications: () => api.get('/students/applications'),
  getJobApplications: () => api.get('/students/job-applications'),
};

// Companies API
export const companiesAPI = {
  updateProfile: (data) => api.put('/companies/profile', data),
  getProfile: () => api.get('/companies/profile'),
  getDashboardStats: () => api.get('/companies/dashboard'),
  getJobApplicants: (jobId) => api.get(`/companies/jobs/${jobId}/applicants`),
  updateApplicationStatus: (applicationId, status) =>
    api.put(`/companies/applications/${applicationId}/status`, { status }),
};

// Jobs API
export const jobsAPI = {
  getJobs: () => api.get('/jobs'),
  createJob: (data) => api.post('/jobs', data),
  applyForJob: (jobId) => api.post(`/jobs/${jobId}/apply`),
  getCompanyJobs: () => api.get('/jobs/company'),
  getJobApplicants: (jobId) => api.get(`/jobs/${jobId}/applicants`),
};

// Applications API - UPDATED TO MATCH BACKEND
export const applicationsAPI = {
  applyForCourse: (data) => api.post('/applications/apply/course', data), // This is now correct
  getCourseApplications: (courseId) => api.get(`/applications/course/${courseId}`),
  getStudentApplications: () => api.get('/applications/student/my-applications'),
  getApplicationById: (applicationId) => api.get(`/applications/${applicationId}`),
  updateApplicationStatus: (applicationId, status) => api.put(`/applications/${applicationId}/status`, { status }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  getAllInstitutions: () => api.get('/admin/institutions'),
  getAllCompanies: () => api.get('/admin/companies'),
  manageCompanyStatus: (companyId, status) => 
    api.put(`/admin/companies/${companyId}/status`, { status }),
  manageInstitutionStatus: (institutionId, status) =>
    api.put(`/admin/institutions/${institutionId}/status`, { status }),
  addInstitution: (data) => api.post('/admin/institutions', data),
  addFaculty: (data) => api.post('/admin/faculties', data),
  addCourse: (data) => api.post('/admin/courses', data),
  deleteInstitution: (institutionId) => api.delete(`/admin/institutions/${institutionId}`),
  deleteFaculty: (facultyId) => api.delete(`/admin/faculties/${facultyId}`),
  deleteCourse: (courseId) => api.delete(`/admin/courses/${courseId}`),
  getSystemReports: (params) => api.get('/admin/reports', { params }),
};

// Institutions API
export const institutionsAPI = {
  updateProfile: (data) => api.put('/institutions/profile', data),
  addFaculty: (data) => api.post('/institutions/faculties', data),
  addCourse: (data) => api.post('/institutions/courses', data),
  getApplications: () => api.get('/institutions/applications'),
  updateApplicationStatus: (applicationId, status) => 
    api.put(`/institutions/applications/${applicationId}/status`, { status }),
  getFaculties: () => api.get('/institutions/faculties'),
  getCourses: () => api.get('/institutions/courses'),
};

// Public API
export const publicAPI = {
  getInstitutions: () => api.get('/institutions/public'),
};

export default api;