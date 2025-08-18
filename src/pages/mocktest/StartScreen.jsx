import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';

const StartScreen = ({ sections, questions, onStart }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-teal-600 hover:text-teal-700">
              <Icon name="arrow-left" className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">IELTS Mock Test</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Icon name="document" className="w-12 h-12 text-teal-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete IELTS Mock Test</h2>
          <p className="text-gray-600 mb-8">This mock test includes all four sections: Listening, Speaking, Reading, and Writing. Total duration: 2 hours 45 minutes</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {sections.length > 0 ? (
              sections.map((section) => (
                <div key={section.id} className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">{section.name}</h3>
                  <p className="text-gray-600 mb-2">{section.time}</p>
                  <p className="text-sm text-gray-500">{section.questions} questions</p>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading test sections...</p>
              </div>
            )}
          </div>

          <button
            onClick={onStart}
            disabled={!questions || Object.keys(questions).length === 0}
            className={`px-8 py-4 rounded-lg transition-colors text-lg font-semibold ${
              !questions || Object.keys(questions).length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {!questions || Object.keys(questions).length === 0 ? 'Loading Questions...' : 'Start Mock Test'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;


