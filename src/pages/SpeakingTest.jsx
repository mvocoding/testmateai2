import React, { useState } from 'react';

const questions = [
  "What do you do in your free time?",
  "Do you enjoy reading books?",
  "What kind of music do you like?"
];

const XP_PER_BAND = 5;
const XP_TO_LEVEL_UP = 100;

const USE_OPENAI = true;
const OPENAI_API_KEY = "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";

async function getOpenAIFeedback(question, transcript) {
  const prompt = `You are an IELTS speaking examiner and pronunciation coach.\nEvaluate this answer for the question: "${question}"\n\nStudent's answer: "${transcript}"\n\nReturn a JSON with:\n- band: (0-9, float)\n- comment: (short feedback on fluency, grammar, vocabulary, pronunciation)\n- words: [{word: string, native_like: boolean, score: float, tip: string}]\n- length_feedback: (is the answer too short? what should be added?)\n- suggestions: [specific suggestions for improvement, e.g., use more complex sentences, add examples, elaborate on ideas]\n- pronunciation_tips: [personalized tips for improving pronunciation]\n- grammar_feedback: (detailed feedback on grammar mistakes and how to fix them)\n- vocabulary_feedback: (feedback on vocabulary range and suggestions for better word choices)\n- coherence_feedback: (feedback on organization and logical flow)`;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 16000,
      temperature: 0.4,
    }),
  });
  const data = await response.json();
  try {
    let raw = data.choices[0].message.content.trim();
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
    return JSON.parse(raw);
  } catch (e) {
    return {
      band: 6.0,
      comment: "Could not parse AI feedback. (Demo)",
      words: transcript.split(' ').map(word => ({ word, native_like: true, score: 1.0, tip: "" })),
      length_feedback: "The answer is a bit short. Try to elaborate more and provide examples.",
      suggestions: ["Add more details to your answer.", "Use linking words.", "Give a personal example."],
      pronunciation_tips: ["Practice intonation.", "Work on vowel clarity."],
      grammar_feedback: "Check your verb tenses and subject-verb agreement.",
      vocabulary_feedback: "Try to use a wider range of vocabulary.",
      coherence_feedback: "Organize your answer with clear points and examples."
    };
  }
}

function mockGeminiFeedback(transcript) {
  const words = transcript.split(' ').map(word => {
    const easyWords = ['I', 'a', 'the', 'and', 'to', 'in', 'on', 'of', 'do', 'you', 'my', 'is', 'it', 'like'];
    const native_like = easyWords.includes(word.replace(/[^a-zA-Z]/g, '')) || Math.random() > 0.3;
    return {
      word,
      native_like,
      score: native_like ? (0.9 + Math.random() * 0.1) : (0.5 + Math.random() * 0.3),
      tip: native_like ? "" : "Practice this word's pronunciation."
    };
  });
  return {
    band: (6 + Math.random() * 2.5).toFixed(1),
    comment: "Some words are native-like, others need practice. (Demo)",
    words
  };
}

const FEEDBACK_TABS = [
  { key: 'general', label: 'General' },
  { key: 'length', label: 'Length' },
  { key: 'suggestions', label: 'Suggestions' },
  { key: 'pronunciation', label: 'Pronunciation' },
  { key: 'grammar', label: 'Grammar' },
  { key: 'vocabulary', label: 'Vocabulary' },
  { key: 'coherence', label: 'Coherence' },
];

const SpeakingTest = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(Array(questions.length).fill(null));
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const startSpeech = () => {
    setTranscript('');
    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = async function (event) {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setIsListening(false);
      setIsLoading(true);
      if (USE_OPENAI) {
        const aiFeedback = await getOpenAIFeedback(questions[currentQ], result);
        setFeedback(prev => {
          const updated = [...prev];
          updated[currentQ] = aiFeedback;
          return updated;
        });
        setIsLoading(false);
        updateXP(aiFeedback.band);
      } else {
        setTimeout(() => {
          const aiFeedback = mockGeminiFeedback(result);
          setFeedback(prev => {
            const updated = [...prev];
            updated[currentQ] = aiFeedback;
            return updated;
          });
          setIsLoading(false);
          updateXP(aiFeedback.band);
        }, 1000);
      }
    };
    recognition.onerror = function () {
      setIsListening(false);
      alert('Speech recognition error.');
    };
    recognition.start();
  };

  function updateXP(band) {
    let newXp = xp + Math.round(band * XP_PER_BAND);
    let newLevel = level;
    let leveledUp = false;
    if (newXp >= XP_TO_LEVEL_UP) {
      newXp = newXp - XP_TO_LEVEL_UP;
      newLevel += 1;
      leveledUp = true;
    }
    setXp(newXp);
    setLevel(newLevel);
    if (leveledUp) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2000);
    }
  }

  const xpPercent = Math.min(100, (xp / XP_TO_LEVEL_UP) * 100);

  return (
    <div className=" bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-black text-teal-700 mb-4 drop-shadow-lg">Speaking Challenge</h1>
        <p className="text-lg md:text-xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">
          Answer the questions and earn XP to level up your speaking skills!
        </p>
      </div>
      <div className="relative w-full max-w-5xl mx-auto flex flex-row gap-8">
        <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 mb-6 min-h-[500px]">
          <div className="mb-6 text-center">
            <div className="text-2xl md:text-3xl font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl py-4 px-4 shadow inline-block">
              <span role="img" aria-label="question">❓</span> {questions[currentQ]}
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 mb-6">
            <button
              onClick={startSpeech}
              disabled={isListening || isLoading}
              className={`px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-2 ${isListening ? 'bg-gray-400' : 'bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span role="img" aria-label="mic">🎙️</span> {isListening ? 'Listening...' : 'Start Answering'}
            </button>
            <div className="w-full flex flex-col gap-2">
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 flex items-center gap-2">
                <span className="text-pink-500 text-xl">📝</span>
                <span className="text-gray-700"><strong>Transcript:</strong> {transcript || <span className="italic text-gray-400">(Your answer will appear here)</span>}</span>
              </div>
              {isLoading && <div className="text-purple-600 text-center font-semibold animate-pulse">Analyzing your answer...</div>}
              {feedback[currentQ] && (
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-3 flex flex-col gap-2 animate-fade-in mt-2">
                  {/* Feedback Tabs */}
                  <div className="flex mb-2 w-full overflow-x-auto border-b border-pink-200">
                    {FEEDBACK_TABS.map(tab => (
                      <button
                        key={tab.key}
                        className={`flex-1 min-w-0 px-2 py-1 rounded-t-lg font-semibold border-b-2 transition-colors whitespace-nowrap text-sm ${activeTab === tab.key ? 'border-pink-600 bg-white text-pink-800' : 'border-transparent bg-pink-100 text-pink-600 hover:bg-pink-200'}`}
                        style={{ flex: 1 }}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  {/* Tab Content */}
                  {activeTab === 'general' && (
                    <>
                      <span className="text-gray-700">
                        <strong>AI Feedback:</strong> {feedback[currentQ].comment} <span className="font-bold text-pink-700">(Band: {feedback[currentQ].band})</span>
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {feedback[currentQ].words.map((w, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded-lg cursor-pointer transition-colors ${w.native_like
                              ? 'bg-pink-200 text-pink-900'
                              : 'bg-red-200 text-red-900 underline decoration-dotted'
                              }`}
                            title={w.tip}
                          >
                            {w.word}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  {activeTab === 'length' && feedback[currentQ].length_feedback && (
                    <div className="mt-2 text-sm text-purple-800"><strong>Length:</strong> {feedback[currentQ].length_feedback}</div>
                  )}
                  {activeTab === 'suggestions' && feedback[currentQ].suggestions && feedback[currentQ].suggestions.length > 0 && (
                    <div className="mt-2 text-sm text-purple-800"><strong>Suggestions:</strong>
                      <ul className="list-disc ml-6">
                        {feedback[currentQ].suggestions.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {activeTab === 'pronunciation' && feedback[currentQ].pronunciation_tips && feedback[currentQ].pronunciation_tips.length > 0 && (
                    <div className="mt-2 text-sm text-pink-800"><strong>Pronunciation Tips:</strong>
                      <ul className="list-disc ml-6">
                        {feedback[currentQ].pronunciation_tips.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {activeTab === 'grammar' && feedback[currentQ].grammar_feedback && (
                    <div className="mt-2 text-sm text-orange-800"><strong>Grammar:</strong> {feedback[currentQ].grammar_feedback}</div>
                  )}
                  {activeTab === 'vocabulary' && feedback[currentQ].vocabulary_feedback && (
                    <div className="mt-2 text-sm text-teal-800"><strong>Vocabulary:</strong> {feedback[currentQ].vocabulary_feedback}</div>
                  )}
                  {activeTab === 'coherence' && feedback[currentQ].coherence_feedback && (
                    <div className="mt-2 text-sm text-gray-800"><strong>Coherence:</strong> {feedback[currentQ].coherence_feedback}</div>
                  )}
                </div>
              )}
            </div>
            {feedback[currentQ] && currentQ < questions.length - 1 && (
              <button
                onClick={() => { setCurrentQ(currentQ + 1); setTranscript(''); setActiveTab('general'); }}
                className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white font-semibold shadow transition-all duration-200 flex items-center gap-2"
              >
                <span role="img" aria-label="next">➡️</span> Next Question
              </button>
            )}
            {feedback.every(f => f) && (
              <div className="mt-4 text-center text-xl font-bold text-pink-700">🎉 Test completed!<br />Your Level: {level} | XP: {xp}</div>
            )}
          </div>
        </div>
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex flex-col gap-2 sticky top-24">
            <div className="font-bold text-gray-700 mb-2 text-center">Questions</div>
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentQ(idx); setTranscript(''); setActiveTab('general'); }}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-150 mb-1 ${currentQ === idx ? 'bg-teal-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-teal-100'}`}
              >
                Question {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingTest; 