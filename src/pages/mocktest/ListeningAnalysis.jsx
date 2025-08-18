import React from 'react';

const ListeningAnalysis = ({ feedbacks }) => {
  return (
    <div className="space-y-6">
      {(!Array.isArray(feedbacks) || feedbacks.length === 0) ? (
        <p className="text-gray-600">No AI analysis available for Listening.</p>
      ) : (
        feedbacks.map((fb, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-lg font-semibold">Listening Passage {idx + 1}</h5>
              <span className="text-teal-600 font-bold">Band: {Number(fb?.overall_score || 0).toFixed(1)}</span>
            </div>
            {fb?.overall_feedback && (
              <p className="text-gray-700 mb-4">{fb.overall_feedback}</p>
            )}
            {Array.isArray(fb?.question_analysis) && (
              <div>
                <h6 className="font-medium text-gray-800 mb-2">Question Analysis</h6>
                <ul className="space-y-2">
                  {fb.question_analysis.map((qa, qIdx) => (
                    <li key={qIdx} className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800">
                        Q{qa?.question_number || qIdx + 1}: {qa?.question_text}
                      </div>
                      <div className="text-sm text-gray-700">Your answer: {String(qa?.student_answer || 'No answer provided')}</div>
                      <div className="text-sm text-gray-700">Correct: {String(qa?.correct_answer || '')}</div>
                      <div className={`text-sm ${qa?.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                        {qa?.is_correct ? 'Correct' : 'Incorrect'}
                      </div>
                      {qa?.explanation && (
                        <div className="text-xs text-gray-600 mt-1">{qa.explanation}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ListeningAnalysis;


