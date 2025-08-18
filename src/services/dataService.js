import { generateStudyPlan as generateStudyPlanFromUtils } from "../utils";

const API_BASE_URL = "https://testmateai-be-670626115194.australia-southeast2.run.app/api";

const fireUserDataUpdated = () => {
  try { window.dispatchEvent(new CustomEvent("userDataUpdated")); } catch {}
};

const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("testmate_token");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) { throw error; }
};

export const getUser = async () => {
  try {
    const token = localStorage.getItem("testmate_token");
    if (!token) {
      localStorage.removeItem("testmate_user");
      return null;
    }

    const cachedUser = localStorage.getItem("testmate_user");
    if (cachedUser) return JSON.parse(cachedUser);

    const response = await apiCall("/auth/profile");
    const user = response.data;
    if (user) localStorage.setItem("testmate_user", JSON.stringify(user));
    return user;
  } catch (error) {
    const user = localStorage.getItem("testmate_user");
    return user ? JSON.parse(user) : null;
  }
};

export const updateUser = async (updates) => {
  try {
    const response = await apiCall("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(updates)
    });

    const updatedUser = response.data;
    localStorage.setItem("testmate_user", JSON.stringify(updatedUser));

    fireUserDataUpdated();

    return updatedUser;
  } catch (error) {
    const user = await getUser();
    const baseUser = user || {};
    const updatedUser = { ...baseUser, ...updates };
    localStorage.setItem("testmate_user", JSON.stringify(updatedUser));
    fireUserDataUpdated();
    return updatedUser;
  }
};

export const addXP = async (amount, source = "practice", activityId = null) => {
  try {
    const safeAmount = Math.max(1, Math.floor(Number(amount) || 0));
    const response = await apiCall("/users/xp/add", {
      method: "POST",
      body: JSON.stringify({ amount: safeAmount, source, activityId })
    });

    const result = response.data;
    const user = await getUser();
    if (user) {
      const updatedUser = { ...user, xp: result.newXp, level: result.newLevel };
      localStorage.setItem("testmate_user", JSON.stringify(updatedUser));
    }

    fireUserDataUpdated();

    return result;
  } catch (error) {
    const user = getUser();
    if (!user) return null;

    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;

    const updatedUser = { ...user, xp: newXP, level: newLevel };
    localStorage.setItem("testmate_user", JSON.stringify(updatedUser));

    return updatedUser;
  }
};

export const getActivities = async () => {
  try {
    const response = await apiCall("/users/activities?limit=50");
    return response.data;
  } catch (error) {
    return [];
  }
};

export const addActivity = async (activity) => {
  try {
    return activity;
  } catch (error) {
    return null;
  }
};

export const addPracticeActivity = async (type, score, band, details = {}) => {
  try {
    const response = await apiCall("/users/activities", {
      method: "POST",
      body: JSON.stringify({
        type,
        practiceType: "practice",
        score,
        band,
        details,
        timeSpent: details.timeSpent || 0
      })
    });

    const result = response.data;

    await addActivity({
      type: "practice",
      practiceType: type,
      score: result.score,
      band: result.band,
      details: details,
      xpEarned: result.xpEarned
    });

    if (typeof result.xpEarned === "number" && result.xpEarned > 0) {
      try {
        await addXP(result.xpEarned, "practice", result.activityId);
      } catch (xpError) {}
    }
    // Fallback: if backend didn't compute xpEarned, derive from band/score
    if (!(typeof result.xpEarned === "number" && result.xpEarned > 0)) {
      const derived = Math.max(5, Math.min(20, Math.round((Number(band) || Number(score) || 6) * 2)));
      try {
        await addXP(derived, "practice", result.activityId);
      } catch (xpError) {}
    }

    return result;
  } catch (error) {
    const activity = {
      type: "practice",
      practiceType: type,
      score: score,
      band: band,
      details: details,
      xpEarned: Math.floor(score * 10)
    };

    const newActivity = await addActivity(activity);
    if (newActivity) {
      await addXP(newActivity.xpEarned);
    }

    return newActivity;
  }
};

export const getVocabulary = async () => {
  try {
    const response = await apiCall("/vocabulary?limit=100");
    return response.data;
  } catch (error) {
    return [];
  }
};

export const addVocabulary = async (words) => {
  try {
    const newWords = Array.isArray(words) ? words : [words];

    const response = await apiCall('/vocabulary', {
      method: 'POST',
      body: JSON.stringify({
        words: newWords,
        source: 'practice',
        context: 'Practice session'
      })
    });

    const result = response.data;
    return result.words;
  } catch (error) {
    return [];
  }
};

export const updateVocabularyItem = async (id, updates) => {
  try {
    const response = await apiCall(`/vocabulary/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });

    const updatedItem = response.data;
    return updatedItem;
  } catch (error) {
    return null;
  }
};

export const getMockData = async () => {
  try {
    const practiceSummary = await apiCall("/practice/summary");

    const mockTests = await apiCall("/mock-tests");
    const studyPlans = await apiCall("/study-plans");

    return {
      practiceQuestions: practiceSummary.data,
      mockTests: mockTests.data,
      studyPlans: studyPlans.data
    };
  } catch (error) {
    return null;
  }
};

export const resetMockData = () => {
  localStorage.removeItem("testmate_mockdata");
};

export const getPracticeQuestions = async (type) => {
  try {
    const endpoint =
      type === "listening"
        ? `/practice/listening?limit=50`
        : type === "reading"
          ? `/practice/reading?limit=50`
          : type === "speaking"
            ? `/practice/speaking?limit=50`
            : type === "writing"
              ? `/practice/writing?limit=50`
              : `/practice/${type}?limit=50`;
    const response = await apiCall(endpoint);
    const data = response.data;

    if (type === "listening" && data && Array.isArray(data.passages)) {
      const mappedPassages = data.passages.map((passage) => {
        const mappedQuestions = (passage.questions || []).map((q) => {
          const isMultipleChoice = Array.isArray(q.options) && q.options.length > 0;
          const correctIndex = isMultipleChoice
            ? q.options.findIndex((opt) => opt === q.correctAnswer)
            : -1;

          return {
            id: q.id,
            question: q.question,
            options: isMultipleChoice ? q.options : null,
            correct: isMultipleChoice ? correctIndex : undefined,
            answer: isMultipleChoice ? undefined : q.correctAnswer,
            type: isMultipleChoice ? "multipleChoice" : "fill_blank",
          };
        });

        const hasMultipleChoice = mappedQuestions.some((q) => q.type === "multipleChoice");
        const passageQuestionType = hasMultipleChoice ? "multipleChoice" : "shortanswer";

        return {
          ...passage,
          questions: mappedQuestions,
          questionType: passageQuestionType,
        };
      });

      const availableTypes = Array.from(
        new Set(mappedPassages.map((p) => p.questionType))
      );
      const questionTypes = [];
      if (availableTypes.includes("multipleChoice")) {
        questionTypes.push({ type: "multipleChoice", name: "Multiple Choice" });
      }
      if (availableTypes.includes("shortanswer")) {
        questionTypes.push({ type: "shortanswer", name: "Short Answer" });
      }

      return {
        questionTypes,
        passages: mappedPassages,
      };
    }

    if (type === "reading" && data && Array.isArray(data.passages)) {
      const typeLabels = {
        multipleChoice: "Multiple Choice",
        shortanswer: "Short Answer",
        sentencecompletion: "Sentence Completion",
        truefalse: "True/False",
        yesno: "Yes/No",
      };

      const groups = Object.keys(typeLabels).reduce((acc, key) => {
        acc[key] = { name: typeLabels[key], passages: [] };
        return acc;
      }, {});

      data.passages.forEach((passage) => {
        const mappedQuestions = (passage.questions || []).map((q) => {
          const isMultipleChoice = Array.isArray(q.options) && q.options.length > 0;
          const correctIndex = isMultipleChoice
            ? q.options.findIndex((opt) => opt === q.correctAnswer)
            : -1;

          const uiType = isMultipleChoice
            ? "multipleChoice"
            : (q.type || "shortanswer");

          return {
            id: q.id,
            text: q.question,
            options: isMultipleChoice ? q.options : null,
            correct: isMultipleChoice ? correctIndex : q.correctAnswer,
            type: uiType,
          };
        });

        Object.keys(typeLabels).forEach((typeKey) => {
          const questionsOfType = mappedQuestions.filter((q) => q.type === typeKey);
          if (questionsOfType.length > 0) {
            groups[typeKey].passages.push({
              id: passage.id,
              title: passage.title,
              passage: passage.passage,
              questions: questionsOfType,
            });
          }
        });
      });

      return groups;
    }

    if (type === "speaking" && data && Array.isArray(data.questions)) {
      const partNameMap = {
        part1: "Part 1: General Questions",
        part2: "Part 2: Cue Card",
        part3: "Part 3: Discussion",
      };

      const groups = {
        part1: { name: partNameMap.part1, questions: [] },
        part2: { name: partNameMap.part2, questions: [] },
        part3: { name: partNameMap.part3, questions: [] },
      };

      data.questions.forEach((q) => {
        const rawPart = (q.part || "").toString().toLowerCase();
        let key = "part1";
        if (rawPart.includes("part 2")) key = "part2";
        else if (rawPart.includes("part 3")) key = "part3";
        groups[key].questions.push(q.question);
      });

      return groups;
    }

    if (type === "writing" && data && Array.isArray(data.prompts)) {
      const groups = {
        task1: { name: "Task 1: Letter Writing", prompts: [] },
        task2: { name: "Task 2: Essay Writing", prompts: [] },
      };

      data.prompts.forEach((p) => {
        const promptText = p.question || p.title || "";
        const lower = promptText.toLowerCase();
        const key = lower.includes("write a letter") || lower.includes("letter to") ? "task1" : "task2";
        groups[key].prompts.push(promptText);
      });

      return groups;
    }

    return data;
  } catch (error) {
    return null;
  }
};

export const getMockTests = async (limit) => {
  try {
    const endpoint = typeof limit === "number" && limit > 0 ? `/mock-tests?limit=${Math.min(100, Math.max(1, limit))}` : "/mock-tests";
    const response = await apiCall(endpoint);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const fetchMockTest = async (testId) => {
  try {
    const response = await apiCall(`/mock-tests/${testId}`);
    return response.data;
  } catch (error) {
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

export const fetchMockTestQuestions = async (testId, sectionId, desiredCount) => {
  try {
    

    // For speaking/writing, backend likely supports limit per item; for reading/listening, limit often applies to passages not sub-questions
    const useItemLimit = sectionId === "speaking" || sectionId === "writing";
    const endpoint = useItemLimit && typeof desiredCount === 'number' && desiredCount > 0
      ? `/practice/${sectionId}?limit=${Math.min(100, Math.max(1, desiredCount))}`
      : `/practice/${sectionId}`;

    const response = await apiCall(endpoint);
    const sectionData = response.data;

    if (!sectionData) { return []; }

    let allQuestions = [];

    if (sectionId === "listening" || sectionId === "reading") {
      const passages = Array.isArray(sectionData.passages) ? sectionData.passages : [];
      const normalizedPassages = passages.map((passage, index) => {
        const rawQuestions = Array.isArray(passage.questions) ? passage.questions : [];

        const mappedQuestions = rawQuestions.map((q) => {
          const isMultipleChoice = Array.isArray(q.options) && q.options.length > 0;

          // Normalize true/false and short answer types for the UI
          const normalizedType = (() => {
            const t = (q.type || "").toString().toLowerCase();
            if (t.includes("true") && t.includes("false")) return "true-false";
            if (t.includes("completion") || t.includes("blank") || t.includes("short")) return "shortAnswer";
            return isMultipleChoice ? "multiple-choice" : "shortAnswer";
          })();

          // Compute correct index for MC if we have a correct answer value
          let correctIndex = -1;
          if (isMultipleChoice) {
            if (typeof q.correct === "number") {
              correctIndex = q.correct;
            } else if (typeof q.correctIndex === "number") {
              correctIndex = q.correctIndex;
            } else if (q.correctAnswer && Array.isArray(q.options)) {
              correctIndex = q.options.findIndex((opt) => opt === q.correctAnswer);
            }
          }

          return {
            id: q.id ?? `${index}-${(q.question || q.text || "").slice(0, 8)}`,
            question: q.question || q.text || "",
            text: q.text || q.question || "",
            options: isMultipleChoice ? q.options : undefined,
            correct: isMultipleChoice && correctIndex >= 0 ? correctIndex : undefined,
            answer: !isMultipleChoice ? (q.correctAnswer || q.answer) : undefined,
            type: normalizedType,
          };
        });

        return {
          id: passage.id ?? index + 1,
          type: "passage",
          passageTitle: passage.title || passage.name || "",
          passage: passage.passage || passage.text || passage.content || "",
          questions: mappedQuestions,
        };
      });
      // Limit by number of passages (not sub-questions) based on mock test's question count
      const numPassages = typeof desiredCount === "number" && desiredCount > 0
        ? desiredCount
        : normalizedPassages.length;
      allQuestions = normalizedPassages.slice(0, numPassages);
    } else if (sectionId === "speaking") {
      allQuestions = (sectionData.questions || []).map((q, index) => ({
        id: q.id ?? index + 1,
        question: q.question || q.text || "",
        title: q.title || undefined,
        part: q.part || undefined,
        type: "speaking",
        preparationTime: q.preparationTime || q.preparation_time || undefined,
      }));
    } else if (sectionId === "writing") {
      allQuestions = (sectionData.prompts || []).map((p, index) => ({
        id: p.id ?? index + 1,
        question: p.question || p.title || "",
        title: p.title || undefined,
        type: (p.type && p.type.toString().toLowerCase().includes('1')) ? "task1" : (p.type && p.type.toString().toLowerCase().includes('2')) ? "task2" : (index === 0 ? "task1" : "task2"),
        timeLimit: p.timeLimit || p.time_limit || undefined,
        wordLimit: p.wordLimit || p.word_limit || undefined,
      }));
    }

    // Final per-section limiting
    let result;
    if (sectionId === "speaking" || sectionId === "writing") {
      const target = typeof desiredCount === "number" && desiredCount > 0 ? desiredCount : (sectionId === "speaking" ? 3 : 2);
      result = allQuestions.slice(0, target);
    } else {
      // Already limited by sub-question count for reading/listening
      result = allQuestions;
    }

    if (result.length === 0) {
      result = createFallbackQuestions(sectionId);
    }

    return result;
  } catch (error) {
    return [];
  }
};

export const getDashboardData = async () => {
  try {
    const response = await apiCall("/dashboard");
    const apiData = response.data || {};

    const recentActivitiesRaw = Array.isArray(apiData.recentActivity)
      ? apiData.recentActivity
      : apiData.recentActivities || [];

    const recentActivities = recentActivitiesRaw.map((a) => {
      let timestamp = a.timestamp || a.createdAt;
      if (!timestamp && (a.date || a.time)) {
        const datePart = a.date || new Date().toISOString().slice(0, 10);
        const timePart = a.time || '00:00';
        const composed = new Date(`${datePart}T${timePart}`);
        if (!isNaN(composed.getTime())) {
          timestamp = composed.toISOString();
        }
      }
      return {
        ...a,
        timestamp,
        practiceType: a.practiceType || a.type,
      };
    });

    const practiceTypes = ["listening", "reading", "writing", "speaking"];
    const practiceStats = {
      total: recentActivities.length || 0,
      listening: recentActivities.filter(a => a.practiceType === "listening").length,
      reading: recentActivities.filter(a => a.practiceType === "reading").length,
      writing: recentActivities.filter(a => a.practiceType === "writing").length,
      speaking: recentActivities.filter(a => a.practiceType === "speaking").length
    };

    const averageScores = practiceTypes.reduce((acc, type) => {
      const items = recentActivities.filter(a => a.practiceType === type && typeof a.score === 'number');
      if (items.length > 0) {
        const total = items.reduce((sum, a) => sum + (a.score || 0), 0);
        acc[type] = (total / items.length).toFixed(1);
      } else {
        acc[type] = 0;
      }
      return acc;
    }, {});

    return {
      userStats: apiData.userStats || {
        totalTestsTaken: 0,
        averageScore: 0,
        bestScore: 0,
        studyStreak: 0,
        totalStudyTime: "0 hours",
        completedLessons: 0,
        currentStreak: 0
      },
      recentActivities,
      practiceStats,
      averageScores
    };
  } catch (error) {
    const user = await getUser();
    const activities = await getActivities();
    const vocabulary = await getVocabulary();

    const recentActivities = activities.slice(0, 10);
    const today = new Date().toDateString();
    const todayActivities = activities.filter(activity =>
      new Date(activity.timestamp).toDateString() === today
    );

    const practiceActivities = activities.filter(activity => activity.type === "practice");
    const practiceStats = {
      total: practiceActivities.length,
      listening: practiceActivities.filter(a => a.practiceType === "listening").length,
      reading: practiceActivities.filter(a => a.practiceType === "reading").length,
      writing: practiceActivities.filter(a => a.practiceType === "writing").length,
      speaking: practiceActivities.filter(a => a.practiceType === "speaking").length
    };

    const averageScores = {};
    ["listening", "reading", "writing", "speaking"].forEach(type => {
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
  }
};

export const generateStudyPlan = async (userData) => {
  try {
    const currentScore = userData?.currentScore || userData?.lastTestScore || 0;
    const targetScore = userData?.targetScore || 7.0;
    const testDate = userData?.testDate || "2024-12-31";

    const studyPlan = await generateStudyPlanFromUtils({
      currentScore,
      targetScore,
      testDate
    });

    if (!studyPlan) return null;

    localStorage.setItem("testmate_study_plan", JSON.stringify(studyPlan));
    fireUserDataUpdated();

    try { await updateUser({ studyPlan }); } catch {}

    return studyPlan;
  } catch (error) {
    return null;
  }
};

export const resetAllData = () => {
  localStorage.removeItem("testmate_user");
  localStorage.removeItem("testmate_activities");
  localStorage.removeItem("testmate_vocabulary");
  localStorage.removeItem("testmate_mockdata");
  localStorage.removeItem("testmate_token");
  localStorage.removeItem("testmate_study_plan");
};

export const register = async (userData) => {
  try {
    const response = await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData)
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (email) => {
  try {
    const response = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await apiCall("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp })
    });
    localStorage.setItem("testmate_token", response.data.token);
    localStorage.setItem("testmate_user", JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await apiCall("/auth/logout", { method: "POST" });
  } catch (error) {
  } finally {
    localStorage.removeItem("testmate_token");
    localStorage.removeItem("testmate_user");
    localStorage.removeItem("testmate_activities");
    localStorage.removeItem("testmate_vocabulary");
    localStorage.removeItem("testmate_mockdata");
    localStorage.removeItem("testmate_study_plan");
    fireUserDataUpdated();
  }
};

export const getAnalytics = async () => {
  try {
    const response = await apiCall("/users/analytics?time_range=all&practice_type=both");
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getProgress = async () => {
  try {
    const response = await apiCall("/users/progress");
    return response.data;
  } catch (error) {
    return null;
  }
};

const dataService = {
  register,
  login,
  verifyOTP,
  logout,

  getUser,
  updateUser,
  addXP,
  getProgress,

  getActivities,
  addActivity,
  addPracticeActivity,
  getAnalytics,

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
