import React, { useState, useEffect } from 'react';
import {
  generateSpeakingFeedback,
  recordPracticeActivity,
  saveVocabularyWords,
} from '../utils';
import dataService from '../services/dataService';

const XP_PER_BAND = 5;
const XP_TO_LEVEL_UP = 100;

const FEEDBACK_TABS = [
  { key: 'general', label: 'General' },
  { key: 'grammar', label: 'Grammar' },
  { key: 'vocabulary', label: 'Vocabulary' },
  { key: 'suggestions', label: 'Suggestions' },
];

const SpeakingTest = () => {
  const [part, setPart] = useState('part1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [feedbacks, setFeedbacks] = useState({});
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [speakingData, setSpeakingData] = useState(null);

  const speakingParts = speakingData || {};

  useEffect(() => {
    const loadSpeakingData = async () => {
      try {
        const data = await dataService.getPracticeQuestions('speaking');
        setSpeakingData(data);
      } catch (error) {}
    };

    loadSpeakingData();
  }, []);

  if (!speakingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading speaking exercises...</p>
        </div>
      </div>
    );
  }

  const currentQuestions = speakingParts[part].questions;

  const startAnswer = () => {
    setTranscript('');
    setListening(true);
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = async function (event) {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setListening(false);
      setLoading(true);
      const aiFeedback = await generateSpeakingFeedback(
        currentQuestions[currentIndex],
        result
      );
      setFeedbacks((prev) => ({
        ...prev,
        [`${part}-${currentIndex}`]: aiFeedback,
      }));
      setLoading(false);
      updateXp(aiFeedback.band);

      const score = aiFeedback.band || 6.0;
      const band = Math.round(score * 2) / 2;
      await recordPracticeActivity('speaking', score, band, {
        question: currentQuestions[currentIndex],
        transcript: result,
        feedback: aiFeedback.comment,
      });
      try {
        if (Array.isArray(aiFeedback?.words)) {
          const wordsToSave = aiFeedback.words
            .map((w) => (typeof w === 'string' ? w : w?.word))
            .filter(Boolean)
            .slice(0, 20);
          if (wordsToSave.length) {
            await saveVocabularyWords(wordsToSave);
            window.dispatchEvent(new CustomEvent('userDataUpdated'));
          }
        }
      } catch (e) {}
    };
    recognition.onerror = function () {
      setListening(false);
      alert('Speech recognition error.');
    };
    recognition.start();
  };

  function updateXp(band) {
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

  return (
    <div className="bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center px-8">
      <div className="w-full  mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-teal-700 mb-2 items-center justify-center">
              Speaking Test
            </h1>
          </div>
          <div className="flex gap-3 justify-center">
            {Object.entries(speakingParts).map(([key, sp]) => (
              <button
                key={key}
                onClick={() => {
                  setPart(key);
                  setCurrentIndex(0);
                  setTranscript('');
                  setActiveTab('general');
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  part === key
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">{sp.name.split(':')[0]}</div>
                  <div className="text-xs opacity-80">
                    {sp.name.split(':')[1]}
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
              {currentQuestions[currentIndex]}
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 mb-6">
            <button
              onClick={startAnswer}
              disabled={listening || loading}
              className={`px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-2 ${
                listening
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-bold '
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span role="img">🎙️</span>{' '}
              {listening ? 'Listening...' : 'Start Answering'}
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
              {loading && (
                <div className="text-purple-600 text-center font-semibold animate-pulse">
                  Analyzing your answer...
                </div>
              )}
              {feedbacks[`${part}-${currentIndex}`] && (
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
                        {feedbacks[`${part}-${currentIndex}`].comment}{' '}
                        <span className="font-bold text-pink-700">
                          (Band: {feedbacks[`${part}-${currentIndex}`].band})
                        </span>
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {feedbacks[`${part}-${currentIndex}`].words.map(
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
                    feedbacks[`${part}-${currentIndex}`].length_feedback && (
                      <div className="mt-2 text-sm text-purple-800">
                        <strong>Length:</strong>{' '}
                        {feedbacks[`${part}-${currentIndex}`].length_feedback}
                      </div>
                    )}
                  {activeTab === 'suggestions' &&
                    feedbacks[`${part}-${currentIndex}`].suggestions &&
                    feedbacks[`${part}-${currentIndex}`].suggestions.length >
                      0 && (
                      <div className="mt-2 text-sm text-purple-800">
                        <strong>Suggestions:</strong>
                        <ul className="list-disc ml-6">
                          {feedbacks[`${part}-${currentIndex}`].suggestions.map(
                            (s, i) => (
                              <li key={i}>{s}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {activeTab === 'grammar' &&
                    feedbacks[`${part}-${currentIndex}`].grammar_feedback && (
                      <div className="mt-2 text-sm text-orange-800">
                        <strong>Grammar:</strong>{' '}
                        {feedbacks[`${part}-${currentIndex}`].grammar_feedback}
                      </div>
                    )}
                  {activeTab === 'vocabulary' &&
                    feedbacks[`${part}-${currentIndex}`]
                      .vocabulary_feedback && (
                      <div className="mt-2 text-sm text-teal-800">
                        <strong>Vocabulary:</strong>{' '}
                        {
                          feedbacks[`${part}-${currentIndex}`]
                            .vocabulary_feedback
                        }
                      </div>
                    )}
                </div>
              )}
            </div>
            {feedbacks[`${part}-${currentIndex}`] &&
              currentIndex < currentQuestions.length - 1 && (
                <button
                  onClick={() => {
                    setCurrentIndex(currentIndex + 1);
                    setTranscript('');
                    setActiveTab('general');
                  }}
                  className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white font-semibold shadow transition-all duration-200 flex items-center gap-2"
                >
                  <span role="img">➡️</span> Next Question
                </button>
              )}
            {currentQuestions.every(
              (_, idx) => feedbacks[`${part}-${idx}`]
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
                  setCurrentIndex(idx);
                  setTranscript('');
                  setActiveTab('general');
                }}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-150 mb-1 ${
                  currentIndex === idx
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
