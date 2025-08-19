import React from 'react';

const SpeakingAnalysis = ({ feedbacks }) => {
  return (
    <div className="space-y-6">
      {!Array.isArray(feedbacks) || feedbacks.length === 0 ? (
        <p className="text-gray-600">No AI analysis available for Speaking.</p>
      ) : (
        feedbacks.map((fb, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-lg font-semibold">
                Speaking Question {idx + 1}
              </h5>
              <span className="text-teal-600 font-bold">
                Band: {+(fb?.band || 0).toFixed(1)}
              </span>
            </div>
            {fb?.comment && <p className="text-gray-700">{fb.comment}</p>}
            {Array.isArray(fb?.suggestions) && fb.suggestions.length > 0 && (
              <div>
                <h6 className="font-medium text-gray-800 mb-1">Suggestions</h6>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {fb.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(fb?.pronunciation_tips) &&
              fb.pronunciation_tips.length > 0 && (
                <div>
                  <h6 className="font-medium text-gray-800 mb-1">
                    Pronunciation Tips
                  </h6>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {fb.pronunciation_tips.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            {fb?.grammar_feedback && (
              <div>
                <h6 className="font-medium text-gray-800 mb-1">
                  Grammar Feedback
                </h6>
                <p className="text-sm text-gray-700">{fb.grammar_feedback}</p>
              </div>
            )}
            {fb?.vocabulary_feedback && (
              <div>
                <h6 className="font-medium text-gray-800 mb-1">
                  Vocabulary Feedback
                </h6>
                <p className="text-sm text-gray-700">
                  {fb.vocabulary_feedback}
                </p>
              </div>
            )}
            {fb?.coherence_feedback && (
              <div>
                <h6 className="font-medium text-gray-800 mb-1">
                  Coherence & Cohesion
                </h6>
                <p className="text-sm text-gray-700">{fb.coherence_feedback}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default SpeakingAnalysis;
