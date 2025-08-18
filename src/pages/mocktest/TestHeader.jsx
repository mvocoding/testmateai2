import React from 'react';
import { Link } from 'react-router-dom';

const TestHeader = ({ currentSectionName, currentQuestionIndex, totalQuestions, timeText }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-teal-600 hover:text-teal-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">IELTS Mock Test</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {currentSectionName} - Question {currentQuestionIndex} of {totalQuestions}
          </div>
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-lg font-medium">{timeText}</div>
        </div>
      </div>
    </div>
  );
};

export default TestHeader;


