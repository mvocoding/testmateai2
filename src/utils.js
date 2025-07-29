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
              text: 'You are an IELTS TestMate AI assistant. Help users with IELTS preparation, answer questions about the test format, provide study tips, and assist with practice questions. Be friendly, encouraging, and knowledgeable about IELTS.',
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