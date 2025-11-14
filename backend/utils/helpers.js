// Utility helper functions
const { db } = require('../config/firebase');

class Helpers {
  static async checkStudentEligibility(studentId, courseRequirements) {
    // Get student data
    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) return false;

    const student = studentDoc.data();
    
    // Implement eligibility checking logic
    // This is a simplified version - expand based on your requirements
    
    // Check minimum grades
    if (courseRequirements.minimumGrades) {
      const studentGrades = student.education?.grades || {};
      // Add grade comparison logic
    }

    // Check required subjects
    if (courseRequirements.requiredSubjects) {
      const studentSubjects = student.education?.subjects || [];
      // Add subject checking logic
    }

    return true; // Placeholder - implement actual logic
  }

  static generateApplicationId() {
    return `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
  }

  static calculateMatchPercentage(student, job) {
    // Calculate match percentage between student profile and job requirements
    let matchScore = 0;
    const totalCriteria = 4; // Adjust based on your criteria

    // 1. Education level match
    if (student.education?.degreeLevel === job.requirements?.educationLevel) {
      matchScore += 25;
    }

    // 2. Skills match (simplified)
    const studentSkills = student.personalInfo?.skills || [];
    const requiredSkills = job.requirements?.skills || [];
    const matchedSkills = studentSkills.filter(skill => requiredSkills.includes(skill));
    matchScore += (matchedSkills.length / requiredSkills.length) * 25;

    // 3. Experience match
    if (student.personalInfo?.experience >= job.requirements?.minExperience) {
      matchScore += 25;
    }

    // 4. Certificates match
    const studentCerts = student.certificates || [];
    const requiredCerts = job.requirements?.certificates || [];
    const matchedCerts = studentCerts.filter(cert => requiredCerts.includes(cert.name));
    matchScore += (matchedCerts.length / requiredCerts.length) * 25;

    return Math.round(matchScore);
  }

  static async checkDuplicateApplication(studentId, courseId) {
    const existingApp = await db.collection('applications')
      .where('studentId', '==', studentId)
      .where('courseId', '==', courseId)
      .get();

    return !existingApp.empty;
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = Helpers;