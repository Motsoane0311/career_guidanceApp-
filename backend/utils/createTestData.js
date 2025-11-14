const { db } = require('../config/firebase');

const createTestData = async () => {
  try {
    console.log('Creating test data...');

    // Create test companies
    const companies = [
      {
        name: 'Tech Solutions Lesotho',
        industry: 'Technology',
        description: 'Leading tech company in Lesotho specializing in software development',
        contact: { 
          phone: '+266 1234 5678', 
          email: 'hr@techsolutions.ls',
          address: 'Maseru, Lesotho'
        },
        website: 'https://techsolutions.ls',
        status: 'approved',
        createdAt: new Date()
      },
      {
        name: 'Lesotho Commercial Bank',
        industry: 'Finance',
        description: 'Premier banking institution serving Lesotho for over 50 years',
        contact: { 
          phone: '+266 2234 5678', 
          email: 'careers@lcb.ls',
          address: 'Maseru Central, Lesotho'
        },
        website: 'https://lesothobank.ls',
        status: 'approved',
        createdAt: new Date()
      }
    ];

    for (const companyData of companies) {
      const companyRef = await db.collection('companies').add(companyData);
      console.log(`Created company: ${companyData.name}`);
      
      // Create test jobs for each company
      const jobs = [
        {
          companyId: companyRef.id,
          title: companyData.industry === 'Technology' ? 'Junior Software Developer' : 'Customer Service Representative',
          description: companyData.industry === 'Technology' 
            ? 'We are looking for a passionate Junior Software Developer to design, develop and maintain software applications. You will be part of a talented software team that works on mission-critical applications.'
            : 'Join our team as a Customer Service Representative where you will be the first point of contact for our customers. Provide excellent service and support to ensure customer satisfaction.',
          requirements: {
            educationLevel: companyData.industry === 'Technology' ? 'bachelors' : 'diploma',
            minExperience: companyData.industry === 'Technology' ? 1 : 0,
            skills: companyData.industry === 'Technology' 
              ? ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'] 
              : ['Customer Service', 'Communication', 'Problem Solving'],
            certificates: []
          },
          qualifications: [
            companyData.industry === 'Technology' 
              ? "Bachelor's degree in Computer Science or related field"
              : "Diploma in Business Administration or related field"
          ],
          location: 'Maseru, Lesotho',
          salary: companyData.industry === 'Technology' ? 'M18,000 - M25,000' : 'M12,000 - M15,000',
          jobType: 'full-time',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: 'active',
          createdAt: new Date()
        },
        {
          companyId: companyRef.id,
          title: companyData.industry === 'Technology' ? 'IT Support Specialist' : 'Bank Teller',
          description: companyData.industry === 'Technology' 
            ? 'Provide technical support and assistance to our clients and internal teams. Troubleshoot hardware and software issues.'
            : 'Handle financial transactions accurately and efficiently while providing excellent customer service.',
          requirements: {
            educationLevel: 'diploma',
            minExperience: 0,
            skills: companyData.industry === 'Technology' 
              ? ['Technical Support', 'Troubleshooting', 'Windows', 'Networking'] 
              : ['Cash Handling', 'Attention to Detail', 'Numerical Skills'],
            certificates: []
          },
          qualifications: [
            companyData.industry === 'Technology' 
              ? "Diploma in IT or Computer Science"
              : "High School Diploma with mathematics"
          ],
          location: 'Maseru, Lesotho',
          salary: companyData.industry === 'Technology' ? 'M15,000 - M18,000' : 'M10,000 - M12,000',
          jobType: 'full-time',
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          status: 'active',
          createdAt: new Date()
        }
      ];

      for (const jobData of jobs) {
        await db.collection('jobs').add(jobData);
        console.log(`Created job: ${jobData.title}`);
      }
    }

    console.log('✅ Test data created successfully!');
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
};

// Run if called directly
if (require.main === module) {
  createTestData().then(() => {
    console.log('Test data creation completed');
    process.exit(0);
  });
}

module.exports = createTestData;