import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import { generateWritingFeedback, saveVocabularyWords, recordPracticeActivity } from '../utils';

const Writing = () => {
  const [selectedTask, setSelectedTask] = useState('task1');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [writingData, setWritingData] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

  const FEEDBACK_TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'sample_answer', label: 'Sample Answer' },
    { key: 'vocabulary', label: 'Vocabulary' },
    { key: 'grammar', label: 'Grammar' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Generate AI feedback
    setIsAnalyzing(true);
    try {
      const wordCount = answer.trim().split(/\s+/).length;
      const feedback = await generateWritingFeedback(
        currentPrompts[currentPrompt],
        answer,
        wordCount
      );
      // Validate feedback structure
      if (feedback && typeof feedback === 'object') {
        setAiFeedback(feedback);
        
        // Save vocabulary words from the feedback
        if (feedback.vocabulary_words && Array.isArray(feedback.vocabulary_words)) {
          saveVocabularyWords(feedback.vocabulary_words);
        }

        // Record practice activity
        const score = feedback.overall_score || 6.0;
        const band = Math.round(score * 2) / 2; // Round to nearest 0.5
        recordPracticeActivity('writing', score, band, {
          task: currentPrompts[currentPrompt],
          wordCount: wordCount,
          feedback: feedback.overall_feedback
        });
      } else {
        console.error('Invalid feedback structure:', feedback);
        setAiFeedback(null);
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      setAiFeedback(null);
    } finally {
      setIsAnalyzing(false);
    }
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
                  setAiFeedback(null);
                  setActiveTab('overview');
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
          <div className="space-y-6">
            {/* Submission Confirmation */}
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-700 mb-4">
                Answer Submitted! 📝
              </div>
              {isAnalyzing && (
                <div className="text-purple-600 text-center font-semibold animate-pulse mb-4">
                  Analyzing your essay...
                </div>
              )}
            </div>

            {/* AI Analysis Section */}
            {aiFeedback && typeof aiFeedback === 'object' ? (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
                <div className="flex mb-4 w-full overflow-x-auto border-b border-orange-200">
                  {FEEDBACK_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      className={`flex-1 min-w-0 px-3 py-2 rounded-t-lg font-semibold border-b-2 transition-colors whitespace-nowrap text-sm ${
                        activeTab === tab.key
                          ? 'border-orange-600 bg-white text-orange-800'
                          : 'border-transparent bg-orange-100 text-orange-600 hover:bg-orange-200'
                      }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-orange-800">
                      Overall Performance: Band {typeof aiFeedback.overall_score === 'number' ? aiFeedback.overall_score : 'N/A'}
                    </div>
                    <div className="text-gray-700">
                      <strong>Feedback:</strong> {typeof aiFeedback.overall_feedback === 'string' ? aiFeedback.overall_feedback : JSON.stringify(aiFeedback.overall_feedback)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-2">Strengths</h4>
                        <ul className="list-disc ml-4 text-sm text-gray-700">
                          {aiFeedback.detailed_analysis?.strengths?.map((strength, idx) => (
                            <li key={idx}>{typeof strength === 'string' ? strength : JSON.stringify(strength)}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-2">Areas for Improvement</h4>
                        <ul className="list-disc ml-4 text-sm text-gray-700">
                          {aiFeedback.detailed_analysis?.weaknesses?.map((weakness, idx) => (
                            <li key={idx}>{typeof weakness === 'string' ? weakness : JSON.stringify(weakness)}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sample Answer Tab */}
                {activeTab === 'sample_answer' && (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-orange-800 mb-3">
                      Sample Answer (Band 8-9)
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-200 text-gray-700 leading-relaxed">
                      {typeof aiFeedback.sample_answer === 'string' ? aiFeedback.sample_answer : JSON.stringify(aiFeedback.sample_answer)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Note:</strong> This is a high-quality sample answer for reference. Compare it with your own work to identify areas for improvement.
                    </div>
                  </div>
                )}

                {/* Vocabulary Tab */}
                {activeTab === 'vocabulary' && (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-orange-800 mb-3">
                      Vocabulary Words from Sample Answer
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">Important Words to Review</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiFeedback.vocabulary_words?.map((word, idx) => (
                          <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {typeof word === 'string' ? word : JSON.stringify(word)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Grammar Tab */}
                {activeTab === 'grammar' && (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-orange-800 mb-3">
                      Grammar Analysis
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-200 text-gray-700 leading-relaxed">
                      {typeof aiFeedback.grammatical_range_accuracy === 'string' ? aiFeedback.grammatical_range_accuracy : JSON.stringify(aiFeedback.grammatical_range_accuracy)}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
                <div className="text-center text-gray-600">
                  <p>AI feedback is not available at the moment.</p>
                  <p className="text-sm mt-2">Your essay has been submitted successfully.</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setAnswer('');
                  setSubmitted(false);
                  setAiFeedback(null);
                  setActiveTab('overview');
                }}
                className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
              >
                Try Again
              </button>
              {currentPrompt < currentPrompts.length - 1 && (
                <button
                  onClick={() => {
                    setCurrentPrompt(currentPrompt + 1);
                    setAnswer('');
                    setSubmitted(false);
                    setAiFeedback(null);
                    setActiveTab('overview');
                  }}
                  className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
                >
                  Next Prompt
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Writing;
