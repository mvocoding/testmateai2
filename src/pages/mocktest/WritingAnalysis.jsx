import React from 'react';

const WritingAnalysis = ({ feedbacks }) => {
  return (
    <div className="space-y-6">
      {!Array.isArray(feedbacks) || feedbacks.length === 0 ? (
        <p className="text-gray-600">No AI analysis available for Writing.</p>
      ) : (
        feedbacks.map((fb, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-lg font-semibold">Writing Task {idx + 1}</h5>
              <span className="text-teal-600 font-bold">
                Band: {+(fb?.overall_score || fb?.band || 0).toFixed(1)}
              </span>
            </div>
            {fb?.overall_feedback && (
              <p className="text-gray-700">{fb.overall_feedback}</p>
            )}
            {fb?.sample_answer && (
              <details className="bg-gray-50 rounded p-3">
                <summary className="cursor-pointer font-medium text-gray-800">
                  Sample Answer
                </summary>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 mt-2">
                  {fb.sample_answer}
                </pre>
              </details>
            )}
            {fb?.grammatical_range_accuracy && (
              <div>
                <h6 className="font-medium text-gray-800 mb-1">Grammar</h6>
                <p className="text-sm text-gray-700">
                  {fb.grammatical_range_accuracy}
                </p>
              </div>
            )}
            {fb?.detailed_analysis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h6 className="font-medium text-gray-800 mb-1">Strengths</h6>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {(fb.detailed_analysis.strengths || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="font-medium text-gray-800 mb-1">Weaknesses</h6>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {(fb.detailed_analysis.weaknesses || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6 className="font-medium text-gray-800 mb-1">
                    Suggestions
                  </h6>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {(fb.detailed_analysis.suggestions || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {Array.isArray(fb?.vocabulary_improvements) &&
              fb.vocabulary_improvements.length > 0 && (
                <div>
                  <h6 className="font-medium text-gray-800 mb-2">
                    Vocabulary Improvements
                  </h6>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {fb.vocabulary_improvements.map((vi, i) => (
                      <li key={i} className="bg-gray-50 rounded p-2">
                        <span className="font-semibold">{vi.original}</span> →{' '}
                        <span className="text-teal-700 font-medium">
                          {vi.suggested}
                        </span>
                        {vi.reason && (
                          <span className="text-gray-600"> — {vi.reason}</span>
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

export default WritingAnalysis;
