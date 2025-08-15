import mockData from '../data/mockdata.json';

class DataService {
  constructor() {
    this.data = mockData;
  }

  // User related methods
  getUsers() {
    return this.data.users;
  }

  getUserById(id) {
    return this.data.users.find(user => user.id === id);
  }

  getUserByEmail(email) {
    return this.data.users.find(user => user.email === email);
  }

  // Mock test related methods
  getMockTests() {
    return this.data.mockTests;
  }

  getMockTestById(id) {
    return this.data.mockTests.find(test => test.id === id);
  }

  getMockTestQuestions(testId, section) {
    const test = this.getMockTestById(testId);
    return test ? test.questions[section] : [];
  }

  getMockTestSections(testId) {
    const test = this.getMockTestById(testId);
    return test ? test.sections : [];
  }

  // Practice questions related methods
  getPracticeQuestions(skill) {
    return this.data.practiceQuestions[skill] || {};
  }

  getListeningQuestions() {
    return this.data.practiceQuestions.listening;
  }

  getReadingQuestions() {
    return this.data.practiceQuestions.reading;
  }

  getSpeakingQuestions() {
    return this.data.practiceQuestions.speaking;
  }

  getWritingQuestions() {
    return this.data.practiceQuestions.writing;
  }

  // AI responses related methods
  getAIResponses() {
    return this.data.aiResponses;
  }

  getStudyPlanQuestions() {
    return this.data.aiResponses.studyPlanQuestions;
  }

  getGeneralQuestions() {
    return this.data.aiResponses.generalQuestions;
  }

  // Dashboard related methods
  getDashboardData() {
    return this.data.dashboard;
  }

  getUserStats() {
    return this.data.dashboard.userStats;
  }

  getRecentActivity() {
    return this.data.dashboard.recentActivity;
  }

  getProgressCharts() {
    return this.data.dashboard.progressCharts;
  }

  getUpcomingTasks() {
    return this.data.dashboard.upcomingTasks;
  }

  getAchievements() {
    return this.data.dashboard.achievements;
  }

  getRecommendations() {
    return this.data.dashboard.recommendations;
  }

  // Study plans related methods
  getStudyPlans() {
    return this.data.studyPlans;
  }

  getStudyPlanTemplates() {
    return this.data.studyPlans.templates;
  }

  getStudyPlanTemplateById(id) {
    return this.data.studyPlans.templates.find(template => template.id === id);
  }

  getStudyPlanResources() {
    return this.data.studyPlans.resources;
  }

  getStudyPlanVideos() {
    return this.data.studyPlans.resources.videos;
  }

  getStudyPlanArticles() {
    return this.data.studyPlans.resources.articles;
  }

  getStudyPlanPracticeMaterials() {
    return this.data.studyPlans.resources.practiceMaterials;
  }

  getProgressTracking() {
    return this.data.studyPlans.progressTracking;
  }

  getMilestones() {
    return this.data.studyPlans.progressTracking.milestones;
  }

  getWeeklyGoals() {
    return this.data.studyPlans.progressTracking.weeklyGoals;
  }

  // Generic data access
  getAllData() {
    return this.data;
  }

  // Search and filter methods
  searchQuestions(query, skill = null) {
    const questions = skill ? this.getPracticeQuestions(skill) : this.data.practiceQuestions;
    const results = [];

    Object.keys(questions).forEach(category => {
      const categoryData = questions[category];
      if (categoryData.passages) {
        categoryData.passages.forEach(passage => {
          if (passage.title.toLowerCase().includes(query.toLowerCase()) ||
              passage.passage?.toLowerCase().includes(query.toLowerCase()) ||
              passage.text?.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              skill,
              category,
              passage
            });
          }
        });
      }
    });

    return results;
  }

  // Mock API methods (for future real API integration)
  async fetchUsers() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getUsers());
      }, 100);
    });
  }

  async fetchMockTest(testId) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getMockTestById(testId));
      }, 100);
    });
  }

  async fetchPracticeQuestions(skill) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getPracticeQuestions(skill));
      }, 100);
    });
  }

  async fetchDashboardData() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getDashboardData());
      }, 100);
    });
  }

  async fetchUserStats() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getUserStats());
      }, 100);
    });
  }

  async fetchRecentActivity() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getRecentActivity());
      }, 100);
    });
  }

  async fetchStudyPlanTemplates() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getStudyPlanTemplates());
      }, 100);
    });
  }

  async fetchStudyPlanTemplate(id) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getStudyPlanTemplateById(id));
      }, 100);
    });
  }

  async fetchStudyPlanResources() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getStudyPlanResources());
      }, 100);
    });
  }

  async fetchProgressTracking() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getProgressTracking());
      }, 100);
    });
  }

  // Data validation methods
  validateUser(userData) {
    const required = ['name', 'email'];
    return required.every(field => userData[field]);
  }

  validateQuestion(questionData) {
    const required = ['question'];
    return required.every(field => questionData[field]);
  }
}

// Create and export a singleton instance
const dataService = new DataService();
export default dataService;
