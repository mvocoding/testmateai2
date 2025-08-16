import React, { useState } from 'react';
// import { generateStudyPlan } from '../utils';

const StudyPlan = () => {
  const [formData, setFormData] = useState({
    currentScore: '',
    targetScore: '',
    testDate: '',
    hasPreviousTest: false,
    lastTestScore: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const generateStudyPlan = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');
    setStudyPlan(null);
    const currentScore = formData.hasPreviousTest
      ? formData.lastTestScore
      : formData.currentScore;
    try {
      const plan = await generateStudyPlan({
        currentScore,
        targetScore: formData.targetScore,
        testDate: formData.testDate,
      });
      if (!plan) {
        setError('Sorry, could not generate a study plan. Please try again.');
      } else {
        setStudyPlan(plan);
      }
    } catch (err) {
      setError('Sorry, something went wrong. Please try again.');
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full mx-auto">
          {!studyPlan ? (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
              {' '}
              <form onSubmit={generateStudyPlan} className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-4xl md:text-6xl font-black text-teal-700 mb-4 drop-shadow-lg">
                    {' '}
                    AI Study Plan
                  </h1>
                  <p className="text-lg md:text-xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">
                    Get your personalized IELTS study plan powered by AI
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="hasPreviousTest"
                    name="hasPreviousTest"
                    checked={formData.hasPreviousTest}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <label
                    htmlFor="hasPreviousTest"
                    className="text-gray-700 font-medium"
                  >
                    I have taken an IELTS test before
                  </label>
                </div>

                {formData.hasPreviousTest ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Last IELTS Score (Overall Band)
                    </label>
                    <input
                      type="number"
                      name="lastTestScore"
                      value={formData.lastTestScore}
                      onChange={handleInputChange}
                      step="0.5"
                      min="0"
                      max="9"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-lg bg-white/80"
                      placeholder="e.g., 6.5"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Current Estimated Band Score
                    </label>
                    <input
                      type="number"
                      name="currentScore"
                      value={formData.currentScore}
                      onChange={handleInputChange}
                      step="0.5"
                      min="0"
                      max="9"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-lg bg-white/80"
                      placeholder="e.g., 5.5"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Band Score
                  </label>
                  <input
                    type="number"
                    name="targetScore"
                    value={formData.targetScore}
                    onChange={handleInputChange}
                    step="0.5"
                    min="0"
                    max="9"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-lg bg-white/80"
                    placeholder="e.g., 7.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Date
                  </label>
                  <input
                    type="date"
                    name="testDate"
                    value={formData.testDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-lg bg-white/80"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-center font-semibold">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`w-full py-4 px-6 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                    isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating your study plan...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span role="img" aria-label="ai">
                        🤖
                      </span>
                      Generate AI Study Plan
                    </span>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              {studyPlan.summary && (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
                  {' '}
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Your Personalized Study Plan
                  </h2>
                  <div className="text-center mb-4">
                    <p className="text-lg text-gray-700">{studyPlan.summary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-gray-100 rounded-xl">
                      {' '}
                      <div className="text-2xl font-bold text-teal-600">
                        Current:{' '}
                        {studyPlan.currentScore ||
                          formData.currentScore ||
                          formData.lastTestScore}
                      </div>
                      <div className="text-sm text-gray-600">Band Score</div>
                    </div>
                    <div className="text-center p-4 bg-gray-100 rounded-xl">
                      {' '}
                      <div className="text-2xl font-bold text-teal-600">
                        Target: {studyPlan.targetScore || formData.targetScore}
                      </div>
                      <div className="text-sm text-gray-600">Band Score</div>
                    </div>
                    <div className="text-center p-4 bg-gray-100 rounded-xl">
                      {' '}
                      <div className="text-2xl font-bold text-teal-600">
                        {studyPlan.weeks || studyPlan.weeksToStudy} weeks
                      </div>
                      <div className="text-sm text-gray-600">Study Time</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-gray-700">
                      You need to improve by{' '}
                      <span className="font-bold text-teal-600">
                        {(
                          (studyPlan.targetScore || formData.targetScore) -
                          (studyPlan.currentScore ||
                            formData.currentScore ||
                            formData.lastTestScore)
                        ).toFixed(1)}{' '}
                        bands
                      </span>{' '}
                      by {formData.testDate}
                    </p>
                  </div>
                </div>
              )}

              {studyPlan.recommendations && (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
                  {' '}
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    AI Recommendations
                  </h3>
                  <div className="space-y-4">
                    {studyPlan.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                      >
                        {' '}
                        <div className="text-2xl">{rec.icon || '💡'}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 mb-1">
                            {rec.title || rec}
                          </div>
                          <p className="text-gray-600">
                            {rec.description || ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {studyPlan.weekly_schedule && (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
                  {' '}
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    Weekly Study Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {studyPlan.weekly_schedule.map((week, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        {' '}
                        <div className="text-lg font-bold text-gray-800 mb-2">
                          Week {week.week}
                        </div>
                        <div
                          className={`inline-block px-2 py-1 rounded-full text-xs font-bold mb-2 bg-gray-200 text-gray-700`}
                        >
                          {week.focus}
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1 mb-2">
                          {week.tasks &&
                            week.tasks.map((task, taskIndex) => (
                              <li key={taskIndex}>• {task}</li>
                            ))}
                        </ul>
                        {week.hoursPerDay && (
                          <div className="text-xs text-gray-500">
                            {week.hoursPerDay}h/day
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {studyPlan.focus_areas && (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
                  {' '}
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    Focus Areas
                  </h3>
                  <div className="space-y-3">
                    {studyPlan.focus_areas.map((area, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        {' '}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                              area.priority === 'High'
                                ? 'bg-teal-500'
                                : 'bg-teal-300'
                            }`}
                          >
                            {area.priority
                              ? area.priority === 'High'
                                ? 'H'
                                : 'M'
                              : '•'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {area.skill || area}
                            </div>
                            <div className="text-sm text-gray-600">
                              {area.reason || ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setStudyPlan(null)}
                className="w-full py-4 px-6 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Generate New Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlan;
