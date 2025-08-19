import React from 'react';

function ResultsPanel({
  score,
  currentPassageIndex,
  totalPassages,
  isAnalyzing,
  aiFeedback,
  activeTab,
  setActiveTab,
  onNextPassage,
}) {
  const FEEDBACK_TABS = [
    { key: 'transcription', label: 'Transcription' },
    { key: 'analysis', label: 'Question Analysis' },
    { key: 'vocabulary', label: 'Vocabulary' },
  ];

  return (
    <div className="space-y-6 mt-8">
      <div className="text-center space-y-4">
        <div className="text-2xl font-bold text-green-700">Your Score: Band {score}</div>
        <div className="text-lg text-gray-600">
          Passage {currentPassageIndex + 1} of {totalPassages}
        </div>
        {isAnalyzing && (
          <div className="text-purple-600 text-center font-semibold animate-pulse">
            Analyzing your answers...
          </div>
        )}
      </div>

      {aiFeedback && typeof aiFeedback === 'object' ? (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex mb-4 w-full overflow-x-auto border-b border-blue-200">
            {FEEDBACK_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`flex-1 min-w-0 px-3 py-2 rounded-t-lg font-semibold border-b-2 transition-colors whitespace-nowrap text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-600 bg-white text-blue-800'
                    : 'border-transparent bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'transcription' && (
            <div className="space-y-4">
              <div className="text-lg font-semibold text-blue-800 mb-3">
                Full Passage Transcription
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200 text-gray-700 leading-relaxed">
                {typeof aiFeedback.transcription === 'string'
                  ? aiFeedback.transcription
                  : JSON.stringify(aiFeedback.transcription)}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Tip:</strong> Read through the transcription to see what you might have missed while listening.
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <div className="text-lg font-semibold text-blue-800 mb-3">
                Detailed Question Analysis
              </div>
              {aiFeedback.question_analysis?.map((analysis, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        analysis.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {analysis.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                    <span className="font-semibold text-blue-800">Question {analysis.question_number}</span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Question:</strong> {analysis.question_text}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Your Answer:</strong> {analysis.student_answer}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Correct Answer:</strong> {analysis.correct_answer}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Explanation:</strong> {analysis.explanation}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Listening Tip:</strong> {analysis.listening_tips}
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Key Vocabulary:</strong> {analysis.key_vocabulary?.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'vocabulary' && (
            <div className="space-y-4">
              <div className="text-lg font-semibold text-blue-800 mb-3">Important Vocabulary</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiFeedback.vocabulary_notes?.map((vocab, idx) => {
                  let word, definition;
                  if (typeof vocab === 'string') {
                    word = vocab;
                    definition = 'Definition not available';
                  } else if (vocab && typeof vocab === 'object') {
                    word = vocab.word || vocab.mistake || 'Unknown word';
                    definition = vocab.definition || vocab.solution || 'Definition not available';
                  } else {
                    word = 'Unknown word';
                    definition = 'Definition not available';
                  }
                  return (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="font-semibold text-blue-800 mb-1">{word}</div>
                      <div className="text-sm text-gray-700">{definition}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center text-gray-600">
            <p>AI feedback is not available at the moment.</p>
            <p className="text-sm mt-2">Your score has been calculated successfully.</p>
          </div>
        </div>
      )}

      <div className="text-center">
        {currentPassageIndex < totalPassages - 1 ? (
          <button
            onClick={onNextPassage}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow transition-colors"
          >
            Next Passage
          </button>
        ) : (
          <div className="text-xl font-bold text-green-700">🎉 All passages completed!</div>
        )}
      </div>
    </div>
  );
}

export default ResultsPanel;


