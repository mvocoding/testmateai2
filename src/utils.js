export const generateTextResponse = async (inputMessage, setMessages, setIsLoading) => {
  try {
    const headers = {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
      'user-agent':
        'Enlight/1.4 (com.lightricks.Apollo; build:123; iOS 18.5.0) Alamofire/5.8.0',
    };

    const payload = {
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: 'You are an IELTS TestMate AI assistant. Help users with IELTS preparation, answer questions about the test format, provide study tips, and assist with practice questions. You can also help users create personalized study plans. If users ask about study plans, guide them to use the study plan form or provide general study advice. Be friendly, encouraging, and knowledgeable about IELTS.',
            },
          ],
        },
        { role: 'user', content: [{ type: 'text', text: inputMessage }] },
      ],
      model: 'vertex_ai/gemini-2.0-flash-001',
      response_format: { type: 'json_object' },
    };

    const response = await fetch(process.env.REACT_APP_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    const aiResponse = JSON.parse(rawContent).response;

    const aiMessage = {
      id: Date.now() + 1,
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, aiMessage]);
  } catch (error) {
    console.error('Error sending message:', error);
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
    const headers = {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
      'user-agent':
        'Enlight/1.4 (com.lightricks.Apollo; build:123; iOS 18.5.0) Alamofire/5.8.0',
    };

    const prompt = `You are an IELTS study coach AI.
A student wants to improve their IELTS score.
Current/last band: ${currentScore}
Target band: ${targetScore}
Test date: ${testDate}

Create a JSON study plan with:
- summary: (short motivational summary)
- weeks: (number of weeks to study)
- recommendations: [list of actionable recommendations]
- weekly_schedule: [{week: number, focus: string, tasks: [string]}]
- focus_areas: [skills to focus on, with reason]`;

    const payload = {
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: 'You are an IELTS study coach AI. Provide detailed, actionable study plans in JSON format.',
            },
          ],
        },
        { role: 'user', content: [{ type: 'text', text: prompt }] },
      ],
      model: 'vertex_ai/gemini-2.0-flash-001',
      response_format: { type: 'json_object' },
    };

    const response = await fetch(process.env.REACT_APP_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    const studyPlan = JSON.parse(rawContent);
    
    return studyPlan;
  } catch (error) {
    console.error('Error generating study plan:', error);
    return null;
  }
};

export const generateSpeakingFeedback = async (question, transcript) => {
  try {
    const headers = {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
      'user-agent':
        'Enlight/1.4 (com.lightricks.Apollo; build:123; iOS 18.5.0) Alamofire/5.8.0',
    };

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
- coherence_feedback: (feedback on organization and logical flow)`;

    const payload = {
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: 'You are an IELTS speaking examiner and pronunciation coach. Provide detailed feedback in JSON format.',
            },
          ],
        },
        { role: 'user', content: [{ type: 'text', text: prompt }] },
      ],
      model: 'vertex_ai/gemini-2.0-flash-001',
      response_format: { type: 'json_object' },
    };

    const response = await fetch(process.env.REACT_APP_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    const feedback = JSON.parse(rawContent);
    
    return feedback;
  } catch (error) {
    console.error('Error generating speaking feedback:', error);
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
    const headers = {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
      'user-agent':
        'Enlight/1.4 (com.lightricks.Apollo; build:123; iOS 18.5.0) Alamofire/5.8.0',
    };

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
- improvement_tips: [personalized tips for better listening performance]`;

    const payload = {
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: 'You are an IELTS listening examiner and coach. Provide detailed analysis and feedback in JSON format.',
            },
          ],
        },
        { role: 'user', content: [{ type: 'text', text: prompt }] },
      ],
      model: 'vertex_ai/gemini-2.0-flash-001',
      response_format: { type: 'json_object' },
    };

    const response = await fetch(process.env.REACT_APP_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    const feedback = JSON.parse(rawContent);
    
    return feedback;
  } catch (error) {
    console.error('Error generating listening feedback:', error);
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
    // Debug logging
    console.log('Reading Feedback Debug:', {
      passage,
      questions: questions.map((q, idx) => ({
        index: idx,
        text: q.text,
        options: q.options,
        correct: q.correct,
        userAnswer: userAnswers[idx]
      })),
      userAnswers
    });

    const headers = {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
      'user-agent':
        'Enlight/1.4 (com.lightricks.Apollo; build:123; iOS 18.5.0) Alamofire/5.8.0',
    };

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
- skimming_scanning_tips: [tips for effective skimming and scanning]`;

    const payload = {
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: 'You are an IELTS reading examiner and coach. Provide detailed analysis and feedback in JSON format.',
            },
          ],
        },
        { role: 'user', content: [{ type: 'text', text: prompt }] },
      ],
      model: 'vertex_ai/gemini-2.0-flash-001',
      response_format: { type: 'json_object' },
    };

    const response = await fetch(process.env.REACT_APP_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    const feedback = JSON.parse(rawContent);
    
    return feedback;
  } catch (error) {
    console.error('Error generating reading feedback:', error);
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
    const headers = {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.REACT_APP_API_KEY}`,
      'user-agent':
        'Enlight/1.4 (com.lightricks.Apollo; build:123; iOS 18.5.0) Alamofire/5.8.0',
    };

    const prompt = `You are an IELTS writing examiner and coach.
Evaluate this essay for the writing task and provide detailed feedback.

Writing Task: "${task}"

Student's Essay: "${userEssay}"
Word Count: ${wordCount}

Return a JSON with:
- overall_score: (0-9, float)
- overall_feedback: (general feedback on writing performance)
- task_achievement: (how well the task was addressed)
- coherence_cohesion: (feedback on organization and flow)
- lexical_resource: (vocabulary usage and range)
- grammatical_range_accuracy: (grammar usage and accuracy)
- detailed_analysis: {
    strengths: [list of strengths in the essay],
    weaknesses: [areas that need improvement],
    suggestions: [specific suggestions for improvement]
  }
- grammar_corrections: [{
    original: string,
    corrected: string,
    explanation: string
  }]
- vocabulary_improvements: [{
    original: string,
    suggested: string,
    reason: string
  }]
- structure_analysis: (analysis of essay structure and organization)
- improvement_tips: [personalized tips for better writing performance]`;

    const payload = {
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: 'You are an IELTS writing examiner and coach. Provide detailed analysis and feedback in JSON format.',
            },
          ],
        },
        { role: 'user', content: [{ type: 'text', text: prompt }] },
      ],
      model: 'vertex_ai/gemini-2.0-flash-001',
      response_format: { type: 'json_object' },
    };

    const response = await fetch(process.env.REACT_APP_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    const feedback = JSON.parse(rawContent);
    
    return feedback;
  } catch (error) {
    console.error('Error generating writing feedback:', error);
    return {
      overall_score: 6.0,
      overall_feedback: 'Could not parse AI feedback. (Demo)',
      task_achievement: 'The task was partially addressed.',
      coherence_cohesion: 'The essay has some logical flow.',
      lexical_resource: 'Vocabulary range is adequate.',
      grammatical_range_accuracy: 'Grammar usage is generally correct.',
      detailed_analysis: {
        strengths: ['Clear main points', 'Good topic sentences'],
        weaknesses: ['Limited vocabulary', 'Some grammar errors'],
        suggestions: ['Expand vocabulary', 'Review grammar rules']
      },
      grammar_corrections: [
        {
          original: 'example error',
          corrected: 'corrected version',
          explanation: 'This is a demo correction.'
        }
      ],
      vocabulary_improvements: [
        {
          original: 'basic word',
          suggested: 'advanced word',
          reason: 'More precise and academic'
        }
      ],
      structure_analysis: 'The essay follows a basic structure.',
      improvement_tips: [
        'Practice writing regularly',
        'Read model essays',
        'Focus on time management'
      ]
    };
  }
}; 