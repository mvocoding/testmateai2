import React from 'react';
import { Link } from 'react-router-dom';

const SectionIntro = ({ intro, onStart }) => {
  if (!intro) return null;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{intro.icon}</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{intro.title}</h1>
              <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full inline-block font-semibold">Duration: {intro.duration}</div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">What to Expect</h2>
                <p className="text-gray-700 leading-relaxed text-lg">{intro.description}</p>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tips for Success</h2>
                <ul className="space-y-3">
                  {intro.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">{index + 1}</div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center pt-6">
                <button onClick={onStart} className="bg-teal-600 text-white px-8 py-4 rounded-xl hover:bg-teal-700 transition-colors text-lg font-semibold shadow-lg">
                  Start {intro.title}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionIntro;


