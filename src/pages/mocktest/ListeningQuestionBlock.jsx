import React from 'react';

const ListeningQuestionBlock = ({
  question,
  answersSection,
  onAnswer,
  startListening,
  stopListening,
  isPlaying,
  isLoading,
  playCount,
}) => {
  if (!question) return null;

  return (
    <div className="space-y-6">
      <div className="bg-teal-50 rounded-xl p-6 border-2 border-teal-200">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-teal-800 mb-2">🎧 Audio Player</h3>
          <p className="text-sm text-teal-600">Listen to the passage and answer the question below</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={isPlaying ? stopListening : startListening}
              disabled={isLoading}
              className={`px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-2 ${
                isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span role="img" aria-label="audio">{isPlaying ? '⏸️' : '▶️'}</span>
              {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play Audio'}
            </button>
          </div>
          

          {isPlaying && (
            <div className="flex items-center gap-2 text-teal-600">
              <div className="animate-pulse">🔊</div>
              <span className="text-sm font-medium">Playing audio...</span>
            </div>
          )}

          {!isPlaying && playCount > 0 && (
            <div className="text-sm text-gray-600">Audio ready to play again</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium">{question.passageTitle || question.question || 'Passage not available'}</h4>

        {question.type === 'passage' && question.questions && (
          <div className="space-y-6">
            {question.questions.map((subQuestion, subIndex) => (
              <div key={`${question.id}-${subIndex}`} className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-3">Question {subIndex + 1}: {subQuestion.question}</h5>

                {subQuestion.options ? (
                  <div className="space-y-2">
                    {subQuestion.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`listening-${question.id}-${subIndex}`}
                          value={optionIndex}
                          checked={answersSection[`${question.id}-${subIndex}`] === optionIndex}
                          onChange={(e) => onAnswer(`${question.id}-${subIndex}`, parseInt(e.target.value))}
                          className="text-teal-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : subQuestion.type === 'completion' || subQuestion.type === 'shortAnswer' ? (
                  <input
                    type="text"
                    value={answersSection[`${question.id}-${subIndex}`] || ''}
                    onChange={(e) => onAnswer(`${question.id}-${subIndex}`, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Type your answer here..."
                  />
                ) : subQuestion.type === 'true_false' ? (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`listening-${question.id}-${subIndex}`}
                        value="true"
                        checked={answersSection[`${question.id}-${subIndex}`] === true}
                        onChange={() => onAnswer(`${question.id}-${subIndex}`, true)}
                        className="text-teal-600"
                      />
                      <span>True</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`listening-${question.id}-${subIndex}`}
                        value="false"
                        checked={answersSection[`${question.id}-${subIndex}`] === false}
                        onChange={() => onAnswer(`${question.id}-${subIndex}`, false)}
                        className="text-teal-600"
                      />
                      <span>False</span>
                    </label>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {question.type !== 'passage' && (
          <>
            {question.type === 'multiple-choice' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`listening-${question.id}`}
                      value={index}
                      checked={answersSection[question.id] === index}
                      onChange={(e) => onAnswer(question.id, parseInt(e.target.value))}
                      className="text-teal-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'fill-blank' && (
              <input
                type="text"
                value={answersSection[question.id] || ''}
                onChange={(e) => onAnswer(question.id, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Type your answer here..."
              />
            )}

            {question.type === 'true-false' && (
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`listening-${question.id}`}
                    value="true"
                    checked={answersSection[question.id] === true}
                    onChange={() => onAnswer(question.id, true)}
                    className="text-teal-600"
                  />
                  <span>True</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`listening-${question.id}`}
                    value="false"
                    checked={answersSection[question.id] === false}
                    onChange={() => onAnswer(question.id, false)}
                    className="text-teal-600"
                  />
                  <span>False</span>
                </label>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListeningQuestionBlock;

