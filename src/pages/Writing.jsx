import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import { generateWritingFeedback } from '../utils';

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
    { key: 'task_achievement', label: 'Task Achievement' },
    { key: 'coherence', label: 'Coherence & Cohesion' },
    { key: 'vocabulary', label: 'Vocabulary' },
    { key: 'grammar', label: 'Grammar' },
    { key: 'corrections', label: 'Corrections' },
    { key: 'tips', label: 'Improvement Tips' },
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
      setAiFeedback(feedback);
    } catch (error) {
      console.error('Error generating AI feedback:', error);
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
            {aiFeedback && (
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
                      Overall Performance: Band {aiFeedback.overall_score}
                    </div>
                    <div className="text-gray-700">
                      <strong>Feedback:</strong> {aiFeedback.overall_feedback}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-2">Strengths</h4>
                        <ul className="list-disc ml-4 text-sm text-gray-700">
                          {aiFeedback.detailed_analysis?.strengths?.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-2">Areas for Improvement</h4>
                        <ul className="list-disc ml-4 text-sm text-gray-700">
                          {aiFeedback.detailed_analysis?.weaknesses?.map((weakness, idx) => (
                            <li key={idx}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Task Achievement Tab */}
                {activeTab === 'task_achievement' && (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-orange-800 mb-3">
                      Task Achievement Analysis
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-200 text-gray-700 leading-relaxed">
                      {aiFeedback.task_achievement}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Tip:</strong> Make sure you address all parts of the question thoroughly.
                    </div>
                  </div>
                )}

                {/* Coherence & Cohesion Tab */}
                {activeTab === 'coherence' && (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-orange-800 mb-3">
                      Coherence & Cohesion Analysis
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-200 text-gray-700 leading-relaxed">
                      {aiFeedback.coherence_cohesion}
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">Structure Analysis</h4>
                      <div className="text-sm text-gray-700">
                        {aiFeedback.structure_analysis}
                      </div>
                    </div>
                  </div>
                )}

                {/* Vocabulary Tab */}
                {activeTab === 'vocabulary' && (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-orange-800 mb-3">
                      Vocabulary Analysis
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-200 text-gray-700 leading-relaxed">
                      {aiFeedback.lexical_resource}
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">Vocabulary Improvements</h4>
                      <div className="space-y-2">
                        {aiFeedback.vocabulary_improvements?.map((improvement, idx) => (
                          <div key={idx} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                            <strong>Original:</strong> {improvement.original} → <strong>Suggested:</strong> {improvement.suggested}
                            <br />
                            <span className="text-gray-600">{improvement.reason}</span>
                          </div>
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
                      {aiFeedback.grammatical_range_accuracy}
                    </div>
                  </div>
                )}

                {/* Corrections Tab */}
                {activeTab === 'corrections' && (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-orange-800 mb-3">
                      Grammar Corrections
                    </div>
                    <div className="space-y-3">
                      {aiFeedback.grammar_corrections?.map((correction, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-orange-200">
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>Original:</strong> {correction.original}
                          </div>
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>Corrected:</strong> {correction.corrected}
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Explanation:</strong> {correction.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvement Tips Tab */}
                {activeTab === 'tips' && (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-orange-800 mb-3">
                      Personalized Improvement Tips
                    </div>
                    <div className="space-y-3">
                      {aiFeedback.improvement_tips?.map((tip, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-orange-600 text-lg">💡</span>
                            <span className="font-semibold text-orange-800">Tip {idx + 1}</span>
                          </div>
                          <div className="text-gray-700">{tip}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">Suggestions</h4>
                      <ul className="list-disc ml-4 text-sm text-gray-700">
                        {aiFeedback.detailed_analysis?.suggestions?.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
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
