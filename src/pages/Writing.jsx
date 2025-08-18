import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import {
  generateWritingFeedback,
  saveVocabularyWords,
  recordPracticeActivity,
} from '../utils';

const Writing = () => {
  const [selectedTask, setSelectedTask] = useState('task1');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [writingData, setWritingData] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sample_answer');

  useEffect(() => {
    const loadWritingData = async () => {
      try {
        const data = await dataService.getPracticeQuestions('writing');
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

  const writingParts = writingData;
  const currentPrompts = writingParts[selectedTask].prompts;

  const feedbackTabs = [
    { key: 'sample_answer', label: 'Sample Answer' },
    { key: 'vocabulary', label: 'Vocabulary' },
  ];

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    setIsLoading(true);
    try {
      const wordCount = answer.trim().split(/\s+/).length;
      const feedback = await generateWritingFeedback(
        currentPrompts[currentPrompt],
        answer,
        wordCount
      );
      let feedbackData = Array.isArray(feedback) && feedback.length > 0 ? feedback[0] : feedback;

      if (feedbackData && typeof feedbackData === 'object' && feedbackData.sample_answer) {
        setAiFeedback(feedbackData);

        if (feedbackData.vocabulary_words && Array.isArray(feedbackData.vocabulary_words)) {
          saveVocabularyWords(feedbackData.vocabulary_words);
        }

        const score = feedbackData.overall_score || 6.0;
        const band = Math.round(score * 2) / 2;
        recordPracticeActivity('writing', score, band, {
          task: currentPrompts[currentPrompt],
          wordCount,
          feedback: feedbackData.overall_feedback,
        });
      } else {
        console.error('Invalid feedback structure:', feedback);
        setAiFeedback({
          overall_score: 6.0,
          overall_feedback: 'Demo feedback - Your essay shows good structure.',
          sample_answer:
            'This is a sample answer for the writing task. It demonstrates proper structure, vocabulary, and grammar.',
          vocabulary_words: ['sample', 'vocabulary', 'words'],
          grammatical_range_accuracy: 'Grammar usage is generally correct.',
          detailed_analysis: {
            strengths: ['Good structure'],
            weaknesses: ['Could improve vocabulary'],
            suggestions: ['Practice more'],
          },
        });
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      setAiFeedback(null);
    } finally {
      setIsLoading(false);
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
            {Object.entries(writingParts).map(([key, task]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedTask(key);
                  setCurrentPrompt(0);
                  setAnswer('');
                  setSubmitted(false);
                  setAiFeedback(null);
                  setActiveTab('sample_answer');
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

      <div className="flex gap-6 w-full">
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            {!submitted ? (
              <form onSubmit={onSubmit} className="flex flex-col gap-6">
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
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-700 mb-4">
                    Answer Submitted! 📝
                  </div>
                  {isLoading && (
                    <div className="text-purple-600 text-center font-semibold animate-pulse mb-4">
                      Analyzing your essay...
                    </div>
                  )}
                </div>

                {aiFeedback && typeof aiFeedback === 'object' ? (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex mb-4 w-full overflow-x-auto border-b border-orange-200">
                      {feedbackTabs.map((tab) => (
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

                    {activeTab === 'sample_answer' && (
                      <div className="space-y-4">
                        <div className="text-lg font-semibold text-orange-800 mb-3">
                          Sample Answer (Band 8-9)
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-orange-200 text-gray-700 leading-relaxed">
                          {typeof aiFeedback.sample_answer === 'string'
                            ? aiFeedback.sample_answer
                            : JSON.stringify(aiFeedback.sample_answer)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Note:</strong> This is a high-quality sample
                          answer for reference. Compare it with your own work to
                          identify areas for improvement.
                        </div>
                      </div>
                    )}

                    {activeTab === 'vocabulary' && (
                      <div className="space-y-4">
                        <div className="text-lg font-semibold text-orange-800 mb-3">
                          Vocabulary Words from Sample Answer
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <h4 className="font-semibold text-orange-800 mb-2">
                            Important Words to Review
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {aiFeedback.vocabulary_words?.map((word, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                              >
                                {typeof word === 'string'
                                  ? word
                                  : JSON.stringify(word)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
                    <div className="text-center text-gray-600">
                      <p>AI feedback is not available at the moment.</p>
                      <p className="text-sm mt-2">
                        Your essay has been submitted successfully.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setAnswer('');
                      setSubmitted(false);
                      setAiFeedback(null);
                      setActiveTab('sample_answer');
                    }}
                    className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex flex-col gap-2 sticky top-24">
            <div className="font-bold text-gray-700 mb-2 text-center">
              Questions
            </div>
            {currentPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-150 mb-1 text-sm ${
                  currentPrompt === idx
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
                }`}
                onClick={() => {
                  setCurrentPrompt(idx);
                  setAnswer('');
                  setSubmitted(false);
                  setAiFeedback(null);
                  setActiveTab('sample_answer');
                }}
              >
                <div className="truncate">Question {idx + 1}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Writing;
