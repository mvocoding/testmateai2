import React from 'react';
import { Link } from 'react-router-dom';
import ListeningAnalysis from './ListeningAnalysis';
import ReadingAnalysis from './ReadingAnalysis';
import WritingAnalysis from './WritingAnalysis';
import SpeakingAnalysis from './SpeakingAnalysis';

const skills = ['listening', 'reading', 'writing', 'speaking'];
const ResultsView = ({
  testResults,
  aiFeedback,
  activeTab,
  onChangeTab,
  onRetake,
}) => {
  const renderActive = () => {
    if (activeTab === 'listening')
      return <ListeningAnalysis feedbacks={aiFeedback.listening} />;
    if (activeTab === 'reading')
      return <ReadingAnalysis feedbacks={aiFeedback.reading} />;
    if (activeTab === 'writing')
      return <WritingAnalysis feedbacks={aiFeedback.writing} />;
    if (activeTab === 'speaking')
      return <SpeakingAnalysis feedbacks={aiFeedback.speaking} />;
    return null;
  };

  const genText = (label, score) => {
    const band = score?.band || 0;
    if (band >= 7) return 'Excellent!';
    if (band >= 6) return 'Good!';
    if (band >= 5) return 'Satisfactory';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 Test Results
        </h2>
        {aiFeedback.listening.length +
          aiFeedback.reading.length +
          aiFeedback.speaking.length +
          aiFeedback.writing.length >
        0 ? (
          <p className="text-gray-600">
            Powered by AI analysis for each section
          </p>
        ) : (
          <p className="text-gray-600">Your scores will appear below</p>
        )}
      </div>

      <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-6 mb-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Overall Band Score</h3>
        <div className="text-5xl font-bold mb-2">
          {(testResults?.overall?.band || 0).toFixed(1)}
        </div>
        <p className="text-teal-100">
          {genText('overall', testResults?.overall)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {skills.map((k) => (
          <div
            key={k}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-gray-900 flex items-center">
                {k === 'listening' && '🎧 Listening'}
                {k === 'reading' && '📖 Reading'}
                {k === 'writing' && '✍️ Writing'}
                {k === 'speaking' && '🗣️ Speaking'}
              </h4>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">
                  {(testResults?.[k]?.band || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">
                  {(testResults?.[k]?.percentage || 0).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="text-gray-600 text-sm">
              {genText(k, testResults?.[k])}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((tab) => (
            <button
              key={tab}
              onClick={() => onChangeTab(tab)}
              className={`px-4 py-2 rounded-lg border ${
                activeTab === tab
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {renderActive()}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 ">
        <Link
          to="/dashboard"
          className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 font-semibold text-center"
        >
          Back to Dashboard
        </Link>
        <button
          onClick={onRetake}
          className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 font-semibold"
        >
          Take Another Test
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
