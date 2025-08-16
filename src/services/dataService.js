import mockData from '../data/mockdata.json';

// Initialize localStorage with mock data if it doesn't exist
const initializeData = () => {
  if (!localStorage.getItem('testmate_user')) {
    // Set default user (level 1, 0 XP)
    const defaultUser = {
      id: 1,
      name: "Test User",
      email: "user@testmate.com",
      currentScore: 0,
      targetScore: 7.0,
      testDate: null,
      hasPreviousTest: false,
      lastTestScore: null,
      level: 1,
      xp: 0,
      studyPlan: null
    };
    localStorage.setItem('testmate_user', JSON.stringify(defaultUser));
  }

  if (!localStorage.getItem('testmate_activities')) {
    localStorage.setItem('testmate_activities', JSON.stringify([]));
  }

  if (!localStorage.getItem('testmate_vocabulary')) {
    localStorage.setItem('testmate_vocabulary', JSON.stringify([]));
  }

  if (!localStorage.getItem('testmate_mockdata')) {
    localStorage.setItem('testmate_mockdata', JSON.stringify(mockData));
  }
};

// Initialize data on import
initializeData();

// User Management
export const getUser = () => {
  try {
    const user = localStorage.getItem('testmate_user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const updateUser = (updates) => {
  try {
    const user = getUser();
    const updatedUser = { ...user, ...updates };
    console.log('Updating user:', { current: user, updates, updated: updatedUser });
    localStorage.setItem('testmate_user', JSON.stringify(updatedUser));
    
    // Dispatch custom event to notify components of user data update
    console.log('Dispatching userDataUpdated event from updateUser');
    window.dispatchEvent(new CustomEvent('userDataUpdated'));
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

export const addXP = (amount) => {
  try {
    const user = getUser();
    if (!user) return null;

    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1; // Level up every 100 XP

    console.log('Adding XP:', { currentXP: user.xp, amount, newXP, newLevel });

    const updatedUser = {
      ...user,
      xp: newXP,
      level: newLevel
    };

    localStorage.setItem('testmate_user', JSON.stringify(updatedUser));
    
    // Dispatch custom event to notify components of user data update
    console.log('Dispatching userDataUpdated event');
    window.dispatchEvent(new CustomEvent('userDataUpdated'));
    
    return updatedUser;
  } catch (error) {
    console.error('Error adding XP:', error);
    return null;
  }
};

// Activities Management
export const getActivities = () => {
  try {
    const activities = localStorage.getItem('testmate_activities');
    return activities ? JSON.parse(activities) : [];
  } catch (error) {
    console.error('Error getting activities:', error);
    return [];
  }
};

export const addActivity = (activity) => {
  try {
    const activities = getActivities();
    const newActivity = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...activity
    };
    
    const updatedActivities = [newActivity, ...activities].slice(0, 50); // Keep last 50 activities
    localStorage.setItem('testmate_activities', JSON.stringify(updatedActivities));
    
    return newActivity;
  } catch (error) {
    console.error('Error adding activity:', error);
    return null;
  }
};

export const addPracticeActivity = (type, score, band, details = {}) => {
  const activity = {
    type: 'practice',
    practiceType: type, // 'listening', 'reading', 'writing', 'speaking'
    score: score,
    band: band,
    details: details,
    xpEarned: Math.floor(score * 10) // XP based on score
  };

  const newActivity = addActivity(activity);
  if (newActivity) {
    addXP(newActivity.xpEarned);
  }

  return newActivity;
};

// Vocabulary Management
export const getVocabulary = () => {
  try {
    const vocabulary = localStorage.getItem('testmate_vocabulary');
    return vocabulary ? JSON.parse(vocabulary) : [];
  } catch (error) {
    console.error('Error getting vocabulary:', error);
    return [];
  }
};

export const addVocabulary = (words) => {
  try {
    const vocabulary = getVocabulary();
    const newWords = Array.isArray(words) ? words : [words];
    
    // Add new words, avoiding duplicates
    const existingWords = vocabulary.map(v => v.word);
    const uniqueNewWords = newWords.filter(word => !existingWords.includes(word));
    
    const newVocabularyItems = uniqueNewWords.map(word => ({
      id: Date.now() + Math.random(),
      word: word,
      addedAt: new Date().toISOString(),
      source: 'practice', // or 'quiz', 'manual'
      reviewed: false,
      mastered: false
    }));

    const updatedVocabulary = [...vocabulary, ...newVocabularyItems].slice(0, 100); // Keep last 100 words
    localStorage.setItem('testmate_vocabulary', JSON.stringify(updatedVocabulary));
    
    return newVocabularyItems;
  } catch (error) {
    console.error('Error adding vocabulary:', error);
    return [];
  }
};

export const updateVocabularyItem = (id, updates) => {
  try {
    const vocabulary = getVocabulary();
    const updatedVocabulary = vocabulary.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    localStorage.setItem('testmate_vocabulary', JSON.stringify(updatedVocabulary));
    return updatedVocabulary.find(item => item.id === id);
  } catch (error) {
    console.error('Error updating vocabulary item:', error);
    return null;
  }
};

// Mock Data Management
export const getMockData = () => {
  try {
    const data = localStorage.getItem('testmate_mockdata');
    return data ? JSON.parse(data) : mockData;
  } catch (error) {
    console.error('Error getting mock data:', error);
    return mockData;
  }
};

export const getPracticeQuestions = (type) => {
  try {
    const data = getMockData();
    return data.practiceQuestions?.[type] || null;
  } catch (error) {
    console.error('Error getting practice questions:', error);
    return null;
  }
};

export const getMockTests = () => {
  try {
    const data = getMockData();
    return data.mockTests || [];
  } catch (error) {
    console.error('Error getting mock tests:', error);
    return [];
  }
};

// Dashboard Data
export const getDashboardData = () => {
  try {
    const user = getUser();
    const activities = getActivities();
    const vocabulary = getVocabulary();
    
    // Calculate recent activity stats
    const recentActivities = activities.slice(0, 10);
    const today = new Date().toDateString();
    const todayActivities = activities.filter(activity => 
      new Date(activity.timestamp).toDateString() === today
    );

    // Calculate practice stats
    const practiceActivities = activities.filter(activity => activity.type === 'practice');
    const practiceStats = {
      total: practiceActivities.length,
      listening: practiceActivities.filter(a => a.practiceType === 'listening').length,
      reading: practiceActivities.filter(a => a.practiceType === 'reading').length,
      writing: practiceActivities.filter(a => a.practiceType === 'writing').length,
      speaking: practiceActivities.filter(a => a.practiceType === 'speaking').length
    };

    // Calculate average scores
    const averageScores = {};
    ['listening', 'reading', 'writing', 'speaking'].forEach(type => {
      const typeActivities = practiceActivities.filter(a => a.practiceType === type);
      if (typeActivities.length > 0) {
        const totalScore = typeActivities.reduce((sum, a) => sum + (a.score || 0), 0);
        averageScores[type] = (totalScore / typeActivities.length).toFixed(1);
      } else {
        averageScores[type] = 0;
      }
    });

    return {
      user,
      recentActivities,
      todayActivities: todayActivities.length,
      practiceStats,
      averageScores,
      vocabularyCount: vocabulary.length,
      vocabularyToReview: vocabulary.filter(v => !v.reviewed).length
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return null;
  }
};

// Study Plan Management
export const generateStudyPlan = async (userData) => {
  try {
    // This would normally call the AI service
    // For now, return a basic study plan
    const studyPlan = {
      summary: "You're on track to achieve your target score! Focus on consistent daily practice and targeted improvement in your weaker areas. Remember, small daily efforts lead to significant long-term results.",
      weeks: 8,
      recommendations: [
        "Practice 2-3 exercises daily across all skills",
        "Focus 60% of time on your weakest skill",
        "Take a full mock test every 2 weeks",
        "Review and learn 10 new vocabulary words daily"
      ],
      focus_areas: [
        {
          skill: "Listening",
          reason: "Improving listening comprehension will boost your overall score"
        },
        {
          skill: "Reading", 
          reason: "Strong reading skills help with time management and accuracy"
        },
        {
          skill: "Writing",
          reason: "Writing requires the most practice to see improvement"
        },
        {
          skill: "Speaking",
          reason: "Regular speaking practice builds confidence and fluency"
        }
      ],
      weekly_schedule: [
        {
          week: 1,
          focus: "Foundation & Assessment",
          tasks: [
            "Complete 2 listening passages daily",
            "Practice 3 reading exercises",
            "Write 1 essay (Task 1 or 2)",
            "Record 2 speaking responses"
          ]
        },
        {
          week: 2,
          focus: "Listening & Reading",
          tasks: [
            "Practice note-taking with 3 listening passages",
            "Complete 4 reading exercises with time limits",
            "Review vocabulary from previous week",
            "Take 1 mini mock test"
          ]
        },
        {
          week: 3,
          focus: "Writing & Speaking",
          tasks: [
            "Write 2 essays (both Task 1 and 2)",
            "Practice speaking with 4 different topics",
            "Review grammar rules and common mistakes",
            "Complete 2 listening exercises"
          ]
        },
        {
          week: 4,
          focus: "Integrated Practice",
          tasks: [
            "Take 1 full mock test",
            "Analyze mistakes and create improvement plan",
            "Focus on weakest areas identified",
            "Practice time management for all sections"
          ]
        }
      ]
    };

    updateUser({ studyPlan });
    return studyPlan;
  } catch (error) {
    console.error('Error generating study plan:', error);
    return null;
  }
};

// Reset all data (for testing)
export const resetAllData = () => {
  localStorage.removeItem('testmate_user');
  localStorage.removeItem('testmate_activities');
  localStorage.removeItem('testmate_vocabulary');
  localStorage.removeItem('testmate_mockdata');
  initializeData();
};

export default {
  getUser,
  updateUser,
  addXP,
  getActivities,
  addActivity,
  addPracticeActivity,
  getVocabulary,
  addVocabulary,
  updateVocabularyItem,
  getMockData,
  getPracticeQuestions,
  getMockTests,
  getDashboardData,
  generateStudyPlan,
  resetAllData
};
