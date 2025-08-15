import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';

const Writing = () => {
  const [selectedTask, setSelectedTask] = useState('task1');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [writingData, setWritingData] = useState(null);

  // Load writing data
  useEffect(() => {
    const loadWritingData = async () => {
      try {
        const data = await dataService.fetchPracticeQuestions('writing');
        setWritingData(data);
      } catch (error) {
        console.error('Error loading writing data:', error);
      }
    };

    loadWritingData();
  }, []);

  if (!writingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading writing exercises...</p>
        </div>
      </div>
    );
  }

  const WRITING_PARTS = writingData;
  const currentPrompts = WRITING_PARTS[selectedTask].prompts;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 relative overflow-hidden flex flex-col items-center justify-center px-8">
      <div className="w-full mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-teal-700 mb-2">
              Writing Test
            </h1>
          </div>
          <div className="flex gap-3 justify-center">
            {Object.entries(WRITING_PARTS).map(([key, task]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedTask(key);
                  setCurrentPrompt(0);
                  setAnswer('');
                  setSubmitted(false);
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedTask === key
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">{task.name.split(':')[0]}</div>
                  <div className="text-xs opacity-80">
                    {task.name.split(':')[1]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="text-lg font-semibold text-gray-800 mb-2">
              {currentPrompts[currentPrompt]}
            </div>
            <textarea
              className="w-full min-h-[300px] rounded-2xl border border-gray-200 bg-gray-50 p-5 text-lg shadow focus:outline-none focus:ring-4 focus:ring-teal-200 focus:border-teal-400 transition-all resize-y placeholder-gray-400"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer here..."
              required
              style={{ resize: 'vertical' }}
            />
            <div className="flex gap-3 justify-center">
              <button
                type="submit"
                className="bg-gradient-to-r from-teal-600 to-teal-400 hover:from-teal-700 hover:to-teal-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-200"
              >
                Submit
              </button>
              {currentPrompt < currentPrompts.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPrompt(currentPrompt + 1);
                    setAnswer('');
                    setSubmitted(false);
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                >
                  Next Prompt
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-700 mb-4">
              Answer Submitted! 📝
            </div>
            <p className="text-gray-600 mb-6">
              Your answer has been submitted. Review your work and consider the following:
            </p>
            <div className="bg-teal-50 p-6 rounded-xl text-left">
              <h3 className="font-semibold text-teal-800 mb-3">Writing Checklist:</h3>
              <ul className="space-y-2 text-sm text-teal-700">
                <li>• Did you address all parts of the question?</li>
                <li>• Is your answer well-structured with clear paragraphs?</li>
                <li>• Did you use appropriate vocabulary and grammar?</li>
                <li>• Is your answer within the word limit?</li>
                <li>• Did you proofread for spelling and punctuation?</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setAnswer('');
                setSubmitted(false);
              }}
              className="mt-6 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Writing;
