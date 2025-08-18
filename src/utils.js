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
    return {
      band: 6.0,
      comment: 'Could not parse AI feedback. (Demo)',
      words: transcript
        .split(' ')
        .map((word) => ({ word, native_like: true, score: 1.0, tip: '' })),
      length_feedback:
        'The answer is a bit short. Try to elaborate more and provide examples.',
      suggestions: [
        'Add more details to your answer.',
        'Use linking words.',
        'Give a personal example.',
      ],
      pronunciation_tips: ['Practice intonation.', 'Work on vowel clarity.'],
      grammar_feedback: 'Check your verb tenses and subject-verb agreement.',
      vocabulary_feedback: 'Try to use a wider range of vocabulary.',
      coherence_feedback:
        'Organize your answer with clear points and examples.',
    };
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
    return {
      overall_score: 6.0,
      overall_feedback: 'Could not parse AI feedback. (Demo)',
      transcription: passage.text,
      question_analysis: questions.map((q, idx) => ({
        question_number: idx + 1,
        question_text: q.question,
        correct_answer: q.correct || q.answer,
        student_answer: userAnswers[q.id] || 'No answer provided',
        is_correct: userAnswers[q.id] === (q.correct || q.answer),
        explanation: 'This is a demo explanation.',
        listening_tips: 'Listen carefully for key words.',
        key_vocabulary: ['key', 'words'],
        context_clues: 'Look for context clues in the passage.'
      })),
      listening_strategies: [
        'Predict what you might hear',
        'Listen for key words',
        'Pay attention to numbers and dates'
      ],
      vocabulary_notes: [
        { word: 'example', definition: 'a thing characteristic of its kind' }
      ],
      common_mistakes: [
        'Not listening for specific details',
        'Missing context clues'
      ],
      improvement_tips: [
        'Practice with different accents',
        'Focus on understanding main ideas first'
      ]
    };
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
    return {
      overall_score: 6.0,
      overall_feedback: 'Could not parse AI feedback. (Demo)',
      passage_summary: 'This is a demo passage summary.',
             question_analysis: questions.map((q, idx) => ({
         question_number: idx + 1,
         question_text: q.text,
         correct_answer: q.options ? q.options[q.correct] : q.correct,
         student_answer: userAnswers[idx] || 'No answer provided',
         is_correct: userAnswers[idx] === q.correct,
         explanation: 'This is a demo explanation.',
         reading_strategy: 'Read the question carefully and scan for key words.',
         key_vocabulary: ['key', 'words'],
         paragraph_reference: 'Look in the relevant paragraph.'
       })),
      reading_strategies: [
        'Skim the passage first for main ideas',
        'Scan for specific information',
        'Read questions before reading the passage'
      ],
      vocabulary_notes: [
        { word: 'example', definition: 'a thing characteristic of its kind' }
      ],
      common_mistakes: [
        'Not reading the question carefully',
        'Missing key words in the passage'
      ],
      improvement_tips: [
        'Practice skimming and scanning',
        'Focus on understanding main ideas first'
      ],
      skimming_scanning_tips: [
        'Read the first and last sentences of paragraphs',
        'Look for topic sentences',
        'Scan for numbers, names, and dates'
      ]
    };
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
    
    // Return comprehensive fallback data based on the task type
    const isTask1 = task.toLowerCase().includes('letter') || task.toLowerCase().includes('write a letter');
    
    const fallbackData = {
      overall_score: 6.0,
      overall_feedback: 'This is a demo feedback. Your essay shows good structure and clear ideas. To improve, focus on expanding your vocabulary and refining your grammar.',
      sample_answer: isTask1 
        ? `Dear [Recipient Name],

I am writing to [purpose of the letter based on the task]. I hope this letter finds you well.

[First paragraph with clear introduction and context]

[Second paragraph with detailed explanation or request]

[Third paragraph with additional information or clarification]

I would appreciate your prompt attention to this matter and look forward to hearing from you soon.

Yours sincerely,
[Your Name]`
        : `This essay will address the key aspects of [topic] and provide a comprehensive analysis of the issues involved.

Introduction:
The topic of [topic] has become increasingly significant in contemporary society. This essay will examine the various perspectives on this issue and present a balanced argument.

Body Paragraph 1:
One of the primary arguments in favor of [topic] is [first point]. Research has shown that [supporting evidence]. Furthermore, [additional reasoning].

Body Paragraph 2:
However, it is important to consider the opposing viewpoint. Critics argue that [counter-argument]. While this perspective has merit, it fails to account for [rebuttal].

Conclusion:
In conclusion, while there are valid arguments on both sides, the evidence suggests that [final position]. It is essential that [recommendation or call to action].`,
      vocabulary_words: isTask1 
        ? ['correspondence', 'inquiry', 'appreciation', 'regarding', 'consequently', 'furthermore', 'nevertheless', 'subsequently']
        : ['comprehensive', 'methodology', 'implementation', 'analysis', 'perspective', 'contemporary', 'significant', 'evidence', 'consequently', 'nevertheless'],
      grammatical_range_accuracy: 'Your grammar usage demonstrates a good command of basic structures. To achieve higher bands, incorporate more complex sentence structures, conditional clauses, and passive voice constructions.',
      detailed_analysis: {
        strengths: ['Clear main points', 'Good topic sentences', 'Logical organization'],
        weaknesses: ['Limited vocabulary range', 'Some repetitive sentence structures', 'Could use more complex grammar'],
        suggestions: ['Expand vocabulary with academic words', 'Practice using different sentence structures', 'Review conditional and passive voice usage']
      },
      vocabulary_improvements: [
        {
          original: 'good',
          suggested: 'excellent',
          reason: 'More precise and impactful'
        },
        {
          original: 'important',
          suggested: 'significant',
          reason: 'More academic and formal'
        },
        {
          original: 'big',
          suggested: 'substantial',
          reason: 'More sophisticated vocabulary'
        }
      ]
    };
    
    return fallbackData;
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
    const demoDefinitions = {
      'sophisticated': {
        correct: 'Complex and refined in character',
        options: ['Complex and refined in character', 'Simple and basic', 'Old and outdated', 'New and modern']
      },
      'comprehensive': {
        correct: 'Complete and thorough',
        options: ['Complete and thorough', 'Brief and short', 'Difficult and complex', 'Easy and simple']
      },
      'methodology': {
        correct: 'A system of methods used in research',
        options: ['A system of methods used in research', 'A type of technology', 'A form of communication', 'A style of writing']
      },
      'implementation': {
        correct: 'The process of putting a plan into action',
        options: ['The process of putting a plan into action', 'The creation of a plan', 'The evaluation of results', 'The discussion of ideas']
      },
      'analysis': {
        correct: 'Detailed examination of something',
        options: ['Detailed examination of something', 'Quick overview of something', 'Simple description', 'Basic summary']
      },
      'perspective': {
        correct: 'A particular way of viewing something',
        options: ['A particular way of viewing something', 'A physical location', 'A time period', 'A type of object']
      },
      'significant': {
        correct: 'Important or meaningful',
        options: ['Important or meaningful', 'Small or minor', 'Temporary or brief', 'Common or ordinary']
      },
      'consequently': {
        correct: 'As a result or therefore',
        options: ['As a result or therefore', 'At the same time', 'In the beginning', 'For example']
      },
      'furthermore': {
        correct: 'In addition or moreover',
        options: ['In addition or moreover', 'However or but', 'Therefore or so', 'Meanwhile or while']
      },
      'nevertheless': {
        correct: 'Despite that or however',
        options: ['Despite that or however', 'Because of that', 'In addition to', 'As a result of']
      }
    };

    const questions = vocabularyWords.slice(0, Math.min(10, vocabularyWords.length)).map((word, index) => {
        const demo = demoDefinitions[word.toLowerCase()];
        if (demo) {
          return {
            word: word,
            question: `What is the meaning of "${word}"?`,
            options: demo.options,
            correct_answer: demo.correct,
            explanation: `"${word}" means "${demo.correct}". This word is commonly used in academic and professional contexts.`
          };
        } else {
          return {
            word: word,
            question: `What is the meaning of "${word}"?`,
            options: [
              'Advanced or complex',
              'Simple or basic', 
              'Old or traditional',
              'New or modern'
            ],
            correct_answer: 'Advanced or complex',
            explanation: `"${word}" is an advanced vocabulary word that you should review and practice.`
          };
        }
      });
    
    console.log('Generated demo questions:', questions);
    return { questions };
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