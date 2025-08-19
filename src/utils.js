import { addVocabulary, getVocabulary, addPracticeActivity } from './services/dataService';
export const generateText = async (prompt) => {
  const headers = { 'content-type': 'application/json' };
  const payload = { prompt };
  const response = await fetch('https://testmateai-be-670626115194.australia-southeast2.run.app/api/ai/generate_text', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('API request failed');
  }
  const data = await response.json();
  const fromRaw = data?.data?.raw?.choices?.[0]?.message?.content;
  if (typeof fromRaw === 'string') return fromRaw;
  const legacy = data?.data?.response;
  if (typeof legacy === 'string') return legacy;
  if (typeof data?.data === 'string') return data.data;
  if (data && typeof data.data === 'object' && data.data !== null) {
    try { return JSON.stringify(data.data); } 
    catch {
    }
  }
  const alt = data?.raw?.choices?.[0]?.message?.content;
  if (typeof alt === 'string') return alt;
  return '';
};

const getFirstJsonObjectString = (text) => {
  if (typeof text !== 'string') return null;
  let inString = false;
  let escapeNext = false;
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (ch === '\\') {
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        return text.slice(start, i + 1);
      }
    }
  }
  return null;
};

const parseJson = (content) => {
  if (typeof content !== 'string') return null;
  let s = content.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```[a-zA-Z]*\n?/, '');
    const lastFence = s.lastIndexOf('```');
    if (lastFence !== -1) s = s.slice(0, lastFence);
  }
  const jsonObjectString = getFirstJsonObjectString(s);
  if (jsonObjectString) {
    try {
      return JSON.parse(jsonObjectString);
    } catch {}
  }
  return null;
};

const parsePlan = (content) => {
  if (typeof content !== 'string') return null;
  let s = content.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```[a-zA-Z]*\n?/, '');
    const lastFence = s.lastIndexOf('```');
    if (lastFence !== -1) s = s.slice(0, lastFence);
  }
  const jsonObjectString = getFirstJsonObjectString(s);
  if (jsonObjectString) {
    try {
      return JSON.parse(jsonObjectString);
    } catch {}
  }
  const generic = parseJson(s);
  if (generic) return generic;
  try {
    const summaryMatch = s.match(/"summary"\s*:\s*"([\s\S]*?)"\s*,/);
    const weeksMatch = s.match(/"weeks"\s*:\s*(\d+)/);
    const recommendationsMatch = s.match(/"recommendations"\s*:\s*\[([\s\S]*?)\]/);
    const focusAreasMatch = s.match(/"focus_areas"\s*:\s*\[([\s\S]*?)\]/);
    const plan = {};
    if (summaryMatch) plan.summary = summaryMatch[1];
    if (weeksMatch) plan.weeks = parseInt(weeksMatch[1], 10);
    if (recommendationsMatch) {
      const recJson = `[${recommendationsMatch[1]}]`;
      try { plan.recommendations = JSON.parse(recJson); } catch {}
    }
    if (focusAreasMatch) {
      const faJson = `[${focusAreasMatch[1]}]`;
      try { plan.focus_areas = JSON.parse(faJson); } catch {}
    }
    plan.weekly_schedule = [];
    if (plan.summary && plan.weeks) return plan;
  } catch {}
  return null;
};

export const generateTextResponse = async (inputMessage, setMessages, setIsLoading) => {
  try {
    const content = await generateText(inputMessage);
    let aiResponse = '';
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && typeof parsed.response === 'string') {
        aiResponse = parsed.response;
      } else {
        aiResponse = content;
      }
    } catch {
      aiResponse = content;
    }

    const aiMessage = {
      id: Date.now() + 1,
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, aiMessage]);
  } catch (error) {
    const errorMessage = {
      id: Date.now() + 1,
      text: "Sorry, I'm having trouble connecting right now. Please try again later.",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};

export const generateStudyPlan = async ({ currentScore, targetScore, testDate }) => {
  try {
    const prompt = `You are an IELTS study coach AI.
A student wants to improve their IELTS score.
Current/last band: ${currentScore}
Target band: ${targetScore}
Test date: ${testDate}

Create a detailed, actionable study plan in JSON format with the following structure:

{
  "summary": "A motivational 2-3 sentence summary of the study plan",
  "weeks": number_of_weeks_to_study,
  "recommendations": [
    "Specific, actionable recommendation 1",
    "Specific, actionable recommendation 2",
    "Specific, actionable recommendation 3",
    "Specific, actionable recommendation 4"
  ],
  "focus_areas": [
    {
      "skill": "Listening/Reading/Writing/Speaking",
      "reason": "Why this skill needs focus based on current vs target score"
    }
  ],
  "weekly_schedule": [
    {
      "week": 1,
      "focus": "Main focus area for this week",
      "tasks": [
        "Specific task 1 for this week",
        "Specific task 2 for this week", 
        "Specific task 3 for this week",
        "Specific task 4 for this week"
      ]
    }
  ]
}

Make the plan realistic and achievable. Include specific tasks like "Practice 2 listening passages daily", "Complete 3 reading exercises", "Write 2 essays per week", etc.

STRICT OUTPUT RULES:
- Return ONLY a single raw JSON object matching the structure above
- Do NOT include any wrapper keys like success, status, message, or data
- Do NOT wrap the object in an array
- Do NOT include any markdown, prose, or code fences
- Ensure the JSON is syntactically valid and parseable`;

    const content = await generateText(prompt);
    let studyPlan = parsePlan(content);

    if (studyPlan && typeof studyPlan === 'object' && studyPlan.summary && studyPlan.weeks) {
      return studyPlan;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const generateSpeakingFeedback = async (question, transcript) => {
  try {
    const prompt = `You are an IELTS speaking examiner and pronunciation coach.
Evaluate this answer for the question: "${question}"

Student's answer: "${transcript}"

Return a JSON with:
- band: (0-9, float)
- comment: (short feedback on fluency, grammar, vocabulary, pronunciation)
- words: [{word: string, native_like: boolean, score: float, tip: string}]
- length_feedback: (is the answer too short? what should be added?)
- suggestions: [specific suggestions for improvement, e.g., use more complex sentences, add examples, elaborate on ideas]
- pronunciation_tips: [personalized tips for improving pronunciation]
- grammar_feedback: (detailed feedback on grammar mistakes and how to fix them)
- vocabulary_feedback: (feedback on vocabulary range and suggestions for better word choices)
- coherence_feedback: (feedback on organization and logical flow)
- xp: (integer 5..20 computed from band, where 5 ≈ band 4-5, 10 ≈ band 6, 15 ≈ band 7-8, 20 ≈ band 8.5-9)`;

    const content = await generateText(prompt);
    const feedback = parseJson(content);
    return feedback;
  } catch (error) {
  }
};

export const generateListeningFeedback = async (passage, questions, userAnswers) => {
  try {
    const prompt = `You are an IELTS listening examiner and coach.
Analyze the student's answers for this listening passage and provide detailed feedback.

Passage Text: "${passage.text}"
Passage Title: "${passage.title}"

Questions and Answers:
${questions.map((q, idx) => `
Question ${idx + 1}: ${q.question}
Type: ${q.type}
Correct Answer: ${q.correct || q.answer}
Student's Answer: ${userAnswers[q.id] || 'No answer provided'}
`).join('\n')}

Return a JSON with:
- overall_score: (0-9, float)
- overall_feedback: (general feedback on listening performance)
- transcription: (the full passage text for reference)
- question_analysis: [{
    question_number: number,
    question_text: string,
    correct_answer: string,
    student_answer: string,
    is_correct: boolean,
    explanation: string,
    listening_tips: string,
    key_vocabulary: [string],
    context_clues: string
  }]
- listening_strategies: [specific strategies for improving listening skills]
- vocabulary_notes: [important vocabulary from the passage with definitions]
- common_mistakes: [common listening mistakes and how to avoid them]
- improvement_tips: [personalized tips for better listening performance]
- xp: (integer 5..20 computed from overall_score, where 5 ≈ band 4-5, 10 ≈ band 6, 15 ≈ band 7-8, 20 ≈ band 8.5-9)`;

    const content = await generateText(prompt);
    const feedback = parseJson(content);
    return feedback;
  } catch (error) {
  }
};

export const generateReadingFeedback = async (passage, questions, userAnswers) => {
  try {
    const prompt = `You are an IELTS reading examiner and coach.
     Analyze the student's answers for this reading passage and provide detailed feedback.
     
     Passage Text: "${passage.text}"
     Passage Title: "${passage.title}"
     
     Questions and Answers:
     ${questions.map((q, idx) => `
     Question ${idx + 1}: ${q.text}
     Type: ${q.options ? 'Multiple Choice' : 'Short Answer'}
     Correct Answer: ${q.options ? q.options[q.correct] : q.correct}
     Student's Answer: ${userAnswers[idx] || 'No answer provided'}
     `).join('\n')}
 
 Return a JSON with:
 - overall_score: (0-9, float)
 - overall_feedback: (general feedback on reading performance)
 - passage_summary: (brief summary of the passage content)
 - question_analysis: [{
     question_number: number,
     question_text: string,
     correct_answer: string,
     student_answer: string,
     is_correct: boolean,
     explanation: string,
     reading_strategy: string,
     key_vocabulary: [string],
     paragraph_reference: string
   }]
 - reading_strategies: [specific strategies for improving reading skills]
 - vocabulary_notes: [important vocabulary from the passage with definitions]
 - common_mistakes: [common reading mistakes and how to avoid them]
 - improvement_tips: [personalized tips for better reading performance]
 - skimming_scanning_tips: [tips for effective skimming and scanning]
 - xp: (integer 5..20 computed from overall_score, where 5 ≈ band 4-5, 10 ≈ band 6, 15 ≈ band 7-8, 20 ≈ band 8.5-9)`;
 
    const content = await generateText(prompt);
    const feedback = parseJson(content);
    return feedback;
  } catch (error) {
  }
};

export const generateWritingFeedback = async (task, userEssay, wordCount) => {
  try {
    const prompt = `You are an IELTS writing examiner and coach.
Evaluate this essay for the writing task and provide detailed feedback.

Writing Task: "${task}"

Student's Essay: "${userEssay}"
Word Count: ${wordCount}

First, write a high-quality sample answer (Band 8-9) for this task, then analyze the student's essay.

Return a JSON with:
- overall_score: (0-9, float)
- overall_feedback: (general feedback on writing performance)
- sample_answer: (a high-quality Band 8-9 sample answer for the same task)
- vocabulary_words: [list of important/advanced vocabulary words from the sample answer for review]
- grammatical_range_accuracy: (grammar usage and accuracy)
- detailed_analysis: {
    strengths: [list of strengths in the essay],
    weaknesses: [areas that need improvement],
    suggestions: [specific suggestions for improvement]
  }
- vocabulary_improvements: [{
    original: string,
    suggested: string,
    reason: string
  }] (based on comparing student's vocabulary with sample answer vocabulary)
- xp: (integer 5..20 computed from overall_score, where 5 ≈ band 4-5, 10 ≈ band 6, 15 ≈ band 7-8, 20 ≈ band 8.5-9)`;

    const content = await generateText(prompt);
    const feedback = parseJson(content);
    return feedback;
  } catch (error) {
    
  }
};

export const generateVocabularyQuiz = async (vocabularyWords) => {
  try {
    const prompt = `You are an IELTS vocabulary quiz generator.
Create a multiple-choice quiz based on these vocabulary words: ${vocabularyWords.join(', ')}

Generate 10 questions (or fewer if there are less than 10 words) with 4 options each (A, B, C, D).
Each question should test understanding of the word's meaning, usage, or context.

Return a JSON with:
- questions: [{
    word: string,
    question: string,
    options: [string, string, string, string],
    correct_answer: string,
    explanation: string
  }]`;

    const content = await generateText(prompt);
    const quiz = parseJson(content);
    if (Array.isArray(quiz)) {
      return { questions: quiz };
    }
    return quiz;
  } catch (error) {
    
  }
};

export const saveVocabularyWords = async (words) => {
  try {
    const addedWords = await addVocabulary(words);
    return Array.isArray(addedWords) ? addedWords.map((w) => w.word || w) : [];
  } catch (error) {
    return [];
  }
};

export const getVocabularyWords = async () => {
  try {
    const vocabulary = await getVocabulary();
    return Array.isArray(vocabulary) ? vocabulary.map((v) => v.word) : [];
  } catch (error) {
    return [];
  }
};

export const recordPracticeActivity = (type, score, band, details = {}) => {
  try {
    return addPracticeActivity(type, score, band, details);
  } catch (error) {
    return null;
  }
};