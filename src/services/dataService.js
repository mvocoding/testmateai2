import mockData from '../data/mockdata.json';
import { generateStudyPlan as generateStudyPlanFromUtils } from '../utils';

// Initialize localStorage with mock data if it doesn't exist
const initializeData = () => {
  if (!localStorage.getItem('testmate_user')) {
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

initializeData();

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
    practiceType: type, 
    score: score,
    band: band,
    details: details,
    xpEarned: Math.floor(score * 10) 
  };

  const newActivity = addActivity(activity);
  if (newActivity) {
    addXP(newActivity.xpEarned);
  }

  return newActivity;
};

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
    
    const existingWords = vocabulary.map(v => v.word);
    const uniqueNewWords = newWords.filter(word => !existingWords.includes(word));
    
    const newVocabularyItems = uniqueNewWords.map(word => ({
      id: Date.now() + Math.random(),
      word: word,
      addedAt: new Date().toISOString(),
      source: 'practice', 
      reviewed: false,
      mastered: false
    }));

    const updatedVocabulary = [...vocabulary, ...newVocabularyItems].slice(0, 100); 
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

export const fetchMockTest = (testId) => {
  try {
    const data = getMockData();
    const mockTest = data.mockTests?.find(test => test.id === testId);
    return mockTest || null;
  } catch (error) {
    console.error('Error fetching mock test:', error);
    return null;
  }
};

export const fetchMockTestQuestions = (testId, sectionId) => {
  try {
    const data = getMockData();
    const sectionData = data.practiceQuestions?.[sectionId];
    
    if (!sectionData) {
      return [];
    }
    
    const allQuestions = [];
    Object.values(sectionData).forEach(questionType => {
      if (questionType.passages) {
        questionType.passages.forEach(passage => {
          if (passage.questions) {
            passage.questions.forEach(question => {
              allQuestions.push({
                ...question,
                passage: passage,
                questionType: questionType.name
              });
            });
          }
        });
      }
    });
    
    return allQuestions.slice(0, 10); // Limit to 10 questions per section
  } catch (error) {
    console.error('Error fetching mock test questions:', error);
    return [];
  }
};

export const getDashboardData = () => {
  try {
    const user = getUser();
    const activities = getActivities();
    const vocabulary = getVocabulary();
    
    const recentActivities = activities.slice(0, 10);
    const today = new Date().toDateString();
    const todayActivities = activities.filter(activity => 
      new Date(activity.timestamp).toDateString() === today
    );

    const practiceActivities = activities.filter(activity => activity.type === 'practice');
    const practiceStats = {
      total: practiceActivities.length,
      listening: practiceActivities.filter(a => a.practiceType === 'listening').length,
      reading: practiceActivities.filter(a => a.practiceType === 'reading').length,
      writing: practiceActivities.filter(a => a.practiceType === 'writing').length,
      speaking: practiceActivities.filter(a => a.practiceType === 'speaking').length
    };

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

export const generateStudyPlan = async (userData) => {
  try {
    // Extract the required data from userData
    const currentScore = userData.currentScore || userData.lastTestScore || 0;
    const targetScore = userData.targetScore || 7.0;
    const testDate = userData.testDate || '2024-12-31'; // Default date if not provided

    // Call the AI-powered study plan generator from utils
    const studyPlan = await generateStudyPlanFromUtils({
      currentScore,
      targetScore,
      testDate
    });

    if (studyPlan) {
      // Save the generated study plan to user data
      updateUser({ studyPlan });
      return studyPlan;
    } else {
      throw new Error('Failed to generate study plan from AI service');
    }
  } catch (error) {
    console.error('Error generating study plan:', error);
    return null;
  }
};

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
  fetchMockTest,
  fetchMockTestQuestions,
  getDashboardData,
  generateStudyPlan,
  resetAllData
};
