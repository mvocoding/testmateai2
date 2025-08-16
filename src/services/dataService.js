import { generateStudyPlan as generateStudyPlanFromUtils } from '../utils';

// Initialize localStorage with mock data if it doesn't exist
const initializeData = async () => {
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

  // Fetch mock data from public folder
  try {
    const response = await fetch('/mockdata.json');
    if (response.ok) {
      const mockData = await response.json();
      localStorage.setItem('testmate_mockdata', JSON.stringify(mockData));
    } else {
      console.error('Failed to load mockdata.json');
    }
  } catch (error) {
    console.error('Error loading mockdata.json:', error);
  }
};

// Initialize data when the module loads
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
    return data ? JSON.parse(data) : null; // Return null if mockdata is not found
  } catch (error) {
    console.error('Error getting mock data:', error);
    return null;
  }
};

export const resetMockData = () => {
  try {
    localStorage.removeItem('testmate_mockdata');
    // Re-fetch mock data from public folder
    initializeData();
    console.log('Mock data reset successfully');
  } catch (error) {
    console.error('Error resetting mock data:', error);
  }
};

export const getPracticeQuestions = (type) => {
  try {
    const data = getMockData();
    return data?.practiceQuestions?.[type] || null;
  } catch (error) {
    console.error('Error getting practice questions:', error);
    return null;
  }
};

export const getMockTests = () => {
  try {
    const data = getMockData();
    return data?.mockTests || [];
  } catch (error) {
    console.error('Error getting mock tests:', error);
    return [];
  }
};

export const fetchMockTest = (testId) => {
  try {
    const data = getMockData();
    const mockTest = data?.mockTests?.find(test => test.id === testId);
    return mockTest || null;
  } catch (error) {
    console.error('Error fetching mock test:', error);
    return null;
  }
};

const createFallbackQuestions = (sectionId) => {
  const fallbackQuestions = {
    listening: [
      {
        id: 1,
        question: "What is the main topic of the conversation?",
        options: ["Weather", "Travel", "Food", "Sports"],
        correct: 1,
        type: "multiple-choice",
        audio: null
      },
      {
        id: 2,
        question: "Where does the conversation take place?",
        options: ["Restaurant", "Airport", "Hotel", "School"],
        correct: 2,
        type: "multiple-choice",
        audio: null
      }
    ],
    speaking: [
      {
        id: 1,
        question: "Describe your hometown. What is it like?",
        title: "Hometown Description",
        part: 1,
        type: "speaking",
        preparationTime: 60
      },
      {
        id: 2,
        question: "Talk about a book you have read recently. What was it about?",
        title: "Book Discussion",
        part: 2,
        type: "speaking",
        preparationTime: 120
      }
    ],
    reading: [
      {
        id: 1,
        question: "What is the main idea of the passage?",
        options: ["Technology", "Education", "Environment", "Health"],
        correct: 1,
        type: "multiple-choice",
        passage: "This is a sample reading passage about education and its importance in modern society."
      },
      {
        id: 2,
        question: "According to the passage, what is the author's opinion?",
        options: ["Positive", "Negative", "Neutral", "Unclear"],
        correct: 0,
        type: "multiple-choice",
        passage: "The author presents a positive view of the topic discussed in the passage."
      }
    ],
    writing: [
      {
        id: 1,
        question: "Write an essay about the advantages and disadvantages of technology in education.",
        title: "Technology in Education",
        type: "task2",
        timeLimit: 40 * 60,
        wordLimit: "250-300 words"
      },
      {
        id: 2,
        question: "You recently stayed at a hotel and had a problem with your room. Write a letter to the hotel manager explaining what happened and what you would like them to do about it.",
        title: "Letter Writing",
        type: "task1",
        timeLimit: 20 * 60,
        wordLimit: "150-200 words"
      }
    ]
  };
  
  return fallbackQuestions[sectionId] || [];
};

export const fetchMockTestQuestions = (testId, sectionId) => {
  try {
    console.log(`Fetching questions for test ${testId}, section ${sectionId}`);
    const data = getMockData();
    console.log('Mock data structure:', Object.keys(data));
    console.log('Practice questions structure:', Object.keys(data?.practiceQuestions || {}));
    
    const sectionData = data?.practiceQuestions?.[sectionId];
    console.log(`Section data for ${sectionId}:`, sectionData);
    
    if (!sectionData) {
      console.log(`No section data found for ${sectionId}`);
      return [];
    }
    
         const allQuestions = [];
     Object.entries(sectionData).forEach(([questionTypeKey, questionType]) => {
       console.log(`Processing question type: ${questionTypeKey}`, questionType);
       
       // Handle different question structures
       if (questionType.passages) {
         // Structure with passages (listening, reading)
         questionType.passages.forEach(passage => {
           console.log(`Processing passage:`, passage);
           if (passage.questions) {
                           // For listening and reading, we want to group questions by passage
              if (sectionId === 'listening' || sectionId === 'reading') {
                // Create a single question object that contains all questions for this passage
                allQuestions.push({
                  id: passage.id,
                  question: `Passage: ${passage.title}`,
                  passageText: passage.text || passage.passage,
                  passageTitle: passage.title,
                  questions: passage.questions, // Keep all questions for this passage
                  questionType: questionType.name,
                  type: 'passage' // Mark as a passage type
                });
              } else {
                // For other sections, process each question individually
                passage.questions.forEach(question => {
                  allQuestions.push({
                    ...question,
                    // Map text to question for consistency
                    question: question.text || question.question || '',
                    // Map passage text
                    passageText: passage.passage || passage.text || passage.title || '',
                    questionType: questionType.name
                  });
                });
              }
           }
         });
       } else if (questionType.questions) {
         // Structure with direct questions (speaking part1, part2, part3)
         questionType.questions.forEach((questionText, index) => {
           allQuestions.push({
             id: index + 1,
             question: questionText,
             title: questionType.name,
             part: questionTypeKey.replace('part', ''),
             type: 'speaking',
             preparationTime: questionTypeKey === 'part2' ? 120 : 60
           });
         });
       } else if (questionType.prompts) {
         // Structure with prompts (writing task1, task2)
         // For writing, we only want 1 question per task (2 total)
         if (sectionId === 'writing') {
           // Take only the first prompt from each task
           if (questionTypeKey === 'task1' || questionTypeKey === 'task2') {
             const prompt = questionType.prompts[0]; // Only take the first prompt
             allQuestions.push({
               id: questionTypeKey === 'task1' ? 1 : 2,
               question: prompt,
               title: questionType.name,
               type: questionTypeKey,
               timeLimit: questionTypeKey === 'task1' ? 20 * 60 : 40 * 60,
               wordLimit: questionTypeKey === 'task1' ? '150-200 words' : '250-300 words'
             });
           }
         } else {
           // For other sections, keep all prompts
           questionType.prompts.forEach((prompt, index) => {
             allQuestions.push({
               id: index + 1,
               question: prompt,
               title: questionType.name,
               type: questionTypeKey,
               timeLimit: questionTypeKey === 'task1' ? 20 * 60 : 40 * 60,
               wordLimit: questionTypeKey === 'task1' ? '150-200 words' : '250-300 words'
             });
           });
         }
       }
     });
    
    console.log(`Total questions found for ${sectionId}:`, allQuestions.length);
    
    // For speaking, we want all parts (1, 2, 3) so we need more questions
    // For writing, we only want 2 questions (Task 1 and Task 2)
    const maxQuestions = sectionId === 'speaking' ? 15 : 
                        sectionId === 'writing' ? 2 : 10;
    let result = allQuestions.slice(0, maxQuestions);
    
    // If no questions found, create some basic fallback questions
    if (result.length === 0) {
      console.log(`No questions found for ${sectionId}, creating fallback questions`);
      result = createFallbackQuestions(sectionId);
    }
    
    console.log(`Returning ${result.length} questions for ${sectionId}`);
    return result;
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

const dataService = {
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

export default dataService;
