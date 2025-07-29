import React, { useState } from 'react';
import { generateSpeakingFeedback } from '../utils';

const SPEAKING_PARTS = {
  part1: {
    name: 'Part 1: Introduction & Interview',
    description: 'Personal questions about familiar topics',
    questions: [
      'What do you do in your free time?',
      'Do you enjoy reading books?',
      'What kind of music do you like?',
      'Where do you live?',
      'What do you do for work or study?',
    ],
  },
  part2: {
    name: 'Part 2: Individual Long Turn',
    description: 'Speak for 2 minutes on a given topic',
    questions: [
      'Describe a place you would like to visit',
      'Talk about a book you have read recently',
      'Describe a person who has influenced you',
      'Talk about an important event in your life',
      'Describe your hometown',
    ],
  },
  part3: {
    name: 'Part 3: Two-Way Discussion',
    description: 'Discuss abstract topics and ideas',
    questions: [
      'What are the advantages and disadvantages of living in a big city?',
      'How has technology changed the way people communicate?',
      'Do you think education should be free for everyone?',
      'What are the benefits of learning a foreign language?',
      'How important is it to protect the environment?',
    ],
  },
};

const XP_PER_BAND = 5;
const XP_TO_LEVEL_UP = 100;

const FEEDBACK_TABS = [
  { key: 'general', label: 'General' },
  { key: 'grammar', label: 'Grammar' },
  { key: 'vocabulary', label: 'Vocabulary' },
  { key: 'coherence', label: 'Coherence' },
  { key: 'suggestions', label: 'Suggestions' },
];

const SpeakingTest = () => {
  const [selectedPart, setSelectedPart] = useState('part1');
  const [currentQ, setCurrentQ] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState({});
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const currentQuestions = SPEAKING_PARTS[selectedPart].questions;

  const startSpeech = () => {
    setTranscript('');
    setIsListening(true);
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
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
      const aiFeedback = await generateSpeakingFeedback(
        currentQuestions[currentQ],
        result
      );
      setFeedback((prev) => ({
        ...prev,
        [`${selectedPart}-${currentQ}`]: aiFeedback,
      }));
      setIsLoading(false);
      updateXP(aiFeedback.band);
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
    <div className="bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center px-8">
      <div className="w-full  mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-teal-700 mb-2">
              Speaking Test
            </h1>
          </div>
          <div className="flex gap-3 justify-center">
            {Object.entries(SPEAKING_PARTS).map(([key, part]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedPart(key);
                  setCurrentQ(0);
                  setTranscript('');
                  setActiveTab('general');
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedPart === key
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">{part.name.split(':')[0]}</div>
                  <div className="text-xs opacity-80">
                    {part.name.split(':')[1]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full mx-auto flex flex-row gap-8">
        <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 mb-6 min-h-[500px]">
          <div className="mb-6 text-center">
            <div className="text-2xl md:text-3xl font-semibold text-teal-700 py-4 px-4 shadow inline-block">
              {currentQuestions[currentQ]}
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 mb-6">
            <button
              onClick={startSpeech}
              disabled={isListening || isLoading}
              className={`px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-2 ${
                isListening
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-bold '
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span role="img" aria-label="mic">
                🎙️
              </span>{' '}
              {isListening ? 'Listening...' : 'Start Answering'}
            </button>
            <div className="w-full flex flex-col gap-2">
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 flex items-center gap-2">
                <span className="text-pink-500 text-xl">📝</span>
                <span className="text-gray-700">
                  <strong>Transcript:</strong>{' '}
                  {transcript || (
                    <span className="italic text-gray-400">
                      (Your answer will appear here)
                    </span>
                  )}
                </span>
              </div>
              {isLoading && (
                <div className="text-purple-600 text-center font-semibold animate-pulse">
                  Analyzing your answer...
                </div>
              )}
              {feedback[`${selectedPart}-${currentQ}`] && (
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-3 flex flex-col gap-2 animate-fade-in mt-2">
                  <div className="flex mb-2 w-full overflow-x-auto border-b border-pink-200">
                    {FEEDBACK_TABS.map((tab) => (
                      <button
                        key={tab.key}
                        className={`flex-1 min-w-0 px-2 py-1 rounded-t-lg font-semibold border-b-2 transition-colors whitespace-nowrap text-sm ${
                          activeTab === tab.key
                            ? 'border-pink-600 bg-white text-pink-800'
                            : 'border-transparent bg-pink-100 text-pink-600 hover:bg-pink-200'
                        }`}
                        style={{ flex: 1 }}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  {activeTab === 'general' && (
                    <>
                      <span className="text-gray-700">
                        <strong>AI Feedback:</strong>{' '}
                        {feedback[`${selectedPart}-${currentQ}`].comment}{' '}
                        <span className="font-bold text-pink-700">
                          (Band: {feedback[`${selectedPart}-${currentQ}`].band})
                        </span>
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {feedback[`${selectedPart}-${currentQ}`].words.map(
                          (w, i) => (
                            <span
                              key={i}
                              className={`px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                                w.native_like
                                  ? 'bg-pink-200 text-pink-900'
                                  : 'bg-red-200 text-red-900 underline decoration-dotted'
                              }`}
                              title={w.tip}
                            >
                              {w.word}
                            </span>
                          )
                        )}
                      </div>
                    </>
                  )}
                  {activeTab === 'length' &&
                    feedback[`${selectedPart}-${currentQ}`].length_feedback && (
                      <div className="mt-2 text-sm text-purple-800">
                        <strong>Length:</strong>{' '}
                        {
                          feedback[`${selectedPart}-${currentQ}`]
                            .length_feedback
                        }
                      </div>
                    )}
                  {activeTab === 'suggestions' &&
                    feedback[`${selectedPart}-${currentQ}`].suggestions &&
                    feedback[`${selectedPart}-${currentQ}`].suggestions.length >
                      0 && (
                      <div className="mt-2 text-sm text-purple-800">
                        <strong>Suggestions:</strong>
                        <ul className="list-disc ml-6">
                          {feedback[
                            `${selectedPart}-${currentQ}`
                          ].suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {activeTab === 'pronunciation' &&
                    feedback[`${selectedPart}-${currentQ}`]
                      .pronunciation_tips &&
                    feedback[`${selectedPart}-${currentQ}`].pronunciation_tips
                      .length > 0 && (
                      <div className="mt-2 text-sm text-pink-800">
                        <strong>Pronunciation Tips:</strong>
                        <ul className="list-disc ml-6">
                          {feedback[
                            `${selectedPart}-${currentQ}`
                          ].pronunciation_tips.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {activeTab === 'grammar' &&
                    feedback[`${selectedPart}-${currentQ}`]
                      .grammar_feedback && (
                      <div className="mt-2 text-sm text-orange-800">
                        <strong>Grammar:</strong>{' '}
                        {
                          feedback[`${selectedPart}-${currentQ}`]
                            .grammar_feedback
                        }
                      </div>
                    )}
                  {activeTab === 'vocabulary' &&
                    feedback[`${selectedPart}-${currentQ}`]
                      .vocabulary_feedback && (
                      <div className="mt-2 text-sm text-teal-800">
                        <strong>Vocabulary:</strong>{' '}
                        {
                          feedback[`${selectedPart}-${currentQ}`]
                            .vocabulary_feedback
                        }
                      </div>
                    )}
                  {activeTab === 'coherence' &&
                    feedback[`${selectedPart}-${currentQ}`]
                      .coherence_feedback && (
                      <div className="mt-2 text-sm text-gray-800">
                        <strong>Coherence:</strong>{' '}
                        {
                          feedback[`${selectedPart}-${currentQ}`]
                            .coherence_feedback
                        }
                      </div>
                    )}
                </div>
              )}
            </div>
            {feedback[`${selectedPart}-${currentQ}`] &&
              currentQ < currentQuestions.length - 1 && (
                <button
                  onClick={() => {
                    setCurrentQ(currentQ + 1);
                    setTranscript('');
                    setActiveTab('general');
                  }}
                  className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white font-semibold shadow transition-all duration-200 flex items-center gap-2"
                >
                  <span role="img" aria-label="next">
                    ➡️
                  </span>{' '}
                  Next Question
                </button>
              )}
            {currentQuestions.every(
              (_, idx) => feedback[`${selectedPart}-${idx}`]
            ) && (
              <div className="mt-4 text-center text-xl font-bold text-pink-700">
                🎉 Test completed!
                <br />
                Your Level: {level} | XP: {xp}
              </div>
            )}
          </div>
        </div>
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex flex-col gap-2 sticky top-24">
            <div className="font-bold text-gray-700 mb-2 text-center">
              Questions
            </div>
            {currentQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentQ(idx);
                  setTranscript('');
                  setActiveTab('general');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-150 mb-1 ${
                  currentQ === idx
                    ? 'bg-teal-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
                }`}
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
