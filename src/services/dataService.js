import { generateStudyPlan as generateStudyPlanFromUtils } from "../utils";
const API_BASE_URL = "https://testmateai-be-670626115194.australia-southeast2.run.app/api";
const fireUserDataUpdated = () => {
  try { window.dispatchEvent(new CustomEvent("userDataUpdated")); } catch {}
};

const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("testmate_token");
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) throw new Error(`API call failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
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

    const res = await apiCall("/auth/profile");
    const user = res.data;
    if (user) localStorage.setItem("testmate_user", JSON.stringify(user));
    return user;
  } catch (error) {
    const user = localStorage.getItem("testmate_user");
    return user ? JSON.parse(user) : null;
  }
};

export const updateUser = async (updates) => {
  try {
    const res = await apiCall("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(updates)
    });

    const updatedUser = res.data;
    localStorage.setItem("testmate_user", JSON.stringify(updatedUser));

    fireUserDataUpdated();

    return updatedUser;
  } catch (error) {
    
  }
};

export const addXP = async (amount, source = "practice", activityId = null) => {
  try {
    const safeAmount = Math.max(1, Math.floor(Number(amount) || 0));
    const res = await apiCall("/users/xp/add", {
      method: "POST",
      body: JSON.stringify({ amount: safeAmount, source, activityId })
    });

    const r = res.data;
    const user = await getUser();
    if (user) {
      const updatedUser = { ...user, xp: r.newXp, level: r.newLevel };
      localStorage.setItem("testmate_user", JSON.stringify(updatedUser));
    }

    fireUserDataUpdated();
    return r;
  } catch (error) {
    
  }
};

export const getActivities = async () => {
  try {
    const res = await apiCall("/users/activities?limit=50");
    return res.data;
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
    const res = await apiCall("/users/activities", {
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

    const r = res.data;

    await addActivity({
      type: "practice",
      practiceType: type,
      score: r.score,
      band: r.band,
      details: details,
      xpEarned: r.xpEarned
    });

    if (typeof r.xpEarned === "number" && r.xpEarned > 0) {
      try {
        await addXP(r.xpEarned, "practice", r.activityId);
      } catch (xpError) {}
    }
    if (!(typeof r.xpEarned === "number" && r.xpEarned > 0)) {
      const d = Math.max(5, Math.min(20, Math.round((Number(band) || Number(score) || 6) * 2)));
      try {
        await addXP(d, "practice", r.activityId);
      } catch (xpError) {}
    }

    return r;
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
    const res = await apiCall("/vocabulary?limit=100");
    return res.data;
  } catch (error) {
    return [];
  }
};

export const addVocabulary = async (words) => {
  try {
    const newWords = Array.isArray(words) ? words : [words];

    const res = await apiCall('/vocabulary', {
      method: 'POST',
      body: JSON.stringify({
        words: newWords,
        source: 'practice',
        context: 'Practice session'
      })
    });

    const r = res.data;
    return r.words;
  } catch (error) {
    return [];
  }
};

export const updateVocabularyItem = async (id, updates) => {
  try {
    const res = await apiCall(`/vocabulary/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });

    const updatedItem = res.data;
    return updatedItem;
  } catch (error) {
    return null;
  }
};

export const getMockData = async () => {
  try {
    const sum = await apiCall("/practice/summary");
    const tests = await apiCall("/mock-tests");
    const plans = await apiCall("/study-plans");

    return {
      practiceQuestions: sum.data,
      mockTests: tests.data,
      studyPlans: plans.data
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
    const types = {
      listening: "/practice/listening?limit=50",
      reading: "/practice/reading?limit=50",
      speaking: "/practice/speaking?limit=50",
      writing: "/practice/writing?limit=50",
    }
    const endpoint = types[type] || `/practice/${type}?limit=50`;
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
    const res = await apiCall(endpoint);
    return res.data;
  } catch (error) {
    return [];
  }
};

export const fetchMockTest = async (testId) => {
  try {
    const res = await apiCall(`/mock-tests/${testId}`);
    return res.data;
  } catch (error) {
    return null;
  }
};


export const fetchMockTestQuestions = async (testId, sectionId, desiredCount) => {
  try {
    const useItemLimit = sectionId === "speaking" || sectionId === "writing";
    const endpoint = useItemLimit && typeof desiredCount === 'number' && desiredCount > 0
      ? `/practice/${sectionId}?limit=${Math.min(100, Math.max(1, desiredCount))}`
      : `/practice/${sectionId}`;

    const res = await apiCall(endpoint);
    const d = res.data;

    if (!d) return [];

    let all = [];

    if (sectionId === "listening" || sectionId === "reading") {
      const passages = Array.isArray(d.passages) ? d.passages : [];
      const normalizedPassages = passages.map((passage, index) => {
        const rawQuestions = Array.isArray(passage.questions) ? passage.questions : [];

        const mappedQuestions = rawQuestions.map((q) => {
          const isMultipleChoice = Array.isArray(q.options) && q.options.length > 0;

          const normalizedType = (() => {
            const t = (q.type || "").toString().toLowerCase();
            if (t.includes("true") && t.includes("false")) return "true-false";
            if (t.includes("completion") || t.includes("blank") || t.includes("short")) return "shortAnswer";
            return isMultipleChoice ? "multiple-choice" : "shortAnswer";
          })();

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
      const numPassages = typeof desiredCount === "number" && desiredCount > 0
        ? desiredCount
        : normalizedPassages.length;
      all = normalizedPassages.slice(0, numPassages);
    } else if (sectionId === "speaking") {
      all = (d.questions || []).map((q, index) => ({
        id: q.id ?? index + 1,
        question: q.question || q.text || "",
        title: q.title || undefined,
        part: q.part || undefined,
        type: "speaking",
        preparationTime: q.preparationTime || q.preparation_time || undefined,
      }));
    } else if (sectionId === "writing") {
      all = (d.prompts || []).map((p, index) => ({
        id: p.id ?? index + 1,
        question: p.question || p.title || "",
        title: p.title || undefined,
        type: (p.type && p.type.toString().toLowerCase().includes('1')) ? "task1" : (p.type && p.type.toString().toLowerCase().includes('2')) ? "task2" : (index === 0 ? "task1" : "task2"),
        timeLimit: p.timeLimit || p.time_limit || undefined,
        wordLimit: p.wordLimit || p.word_limit || undefined,
      }));
    }

    let out;
    if (sectionId === "speaking" || sectionId === "writing") {
      const target = typeof desiredCount === "number" && desiredCount > 0 ? desiredCount : (sectionId === "speaking" ? 3 : 2);
      out = all.slice(0, target);
    } else {
      out = all;
    }

    if (out.length === 0) out = [];
    return out;
  } catch (error) {
    return [];
  }
};

export const getDashboardData = async () => {
  try {
    const res = await apiCall("/dashboard");
    const apiData = res.data || {};

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
    resetAllData()
    fireUserDataUpdated();
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
