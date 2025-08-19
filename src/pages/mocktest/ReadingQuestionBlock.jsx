import React from 'react';

const ReadingQuestionBlock = ({ question, answersSection, onAnswer }) => {
  if (!question) return null;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">
          Reading Passage {question.index != null ? question.index + 1 : ''}
        </h3>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-2">Passage:</h4>
            <p className="text-gray-700 leading-relaxed">
              {question.passageText ||
                question.passage ||
                'Passage not available'}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">
              {question.passageTitle ||
                question.question ||
                'Passage not available'}
            </h4>

            {question.type === 'passage' && question.questions && (
              <div className="space-y-6">
                {question.questions.map((subQuestion, subIndex) => (
                  <div
                    key={`${question.id}-${subIndex}`}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <h5 className="font-semibold text-gray-800 mb-3">
                      Question {subIndex + 1}:{' '}
                      {subQuestion.text || subQuestion.question}
                    </h5>

                    {subQuestion.options ? (
                      <div className="space-y-2">
                        {subQuestion.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className="flex items-center space-x-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`reading-${question.id}-${subIndex}`}
                              value={optionIndex}
                              checked={
                                answersSection[`${question.id}-${subIndex}`] ===
                                optionIndex
                              }
                              onChange={(e) =>
                                onAnswer(
                                  `${question.id}-${subIndex}`,
                                  +e.target.value
                                )
                              }
                              className="text-teal-600"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : subQuestion.type === 'completion' ||
                      subQuestion.type === 'shortAnswer' ? (
                      <input
                        type="text"
                        value={
                          answersSection[`${question.id}-${subIndex}`] || ''
                        }
                        onChange={(e) =>
                          onAnswer(`${question.id}-${subIndex}`, e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Type your answer here..."
                      />
                    ) : subQuestion.type === 'true_false' ||
                      subQuestion.type === 'true-false' ? (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`reading-${question.id}-${subIndex}`}
                            value="true"
                            checked={
                              answersSection[`${question.id}-${subIndex}`] ===
                              true
                            }
                            onChange={() =>
                              onAnswer(`${question.id}-${subIndex}`, true)
                            }
                            className="text-teal-600"
                          />
                          <span>True</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`reading-${question.id}-${subIndex}`}
                            value="false"
                            checked={
                              answersSection[`${question.id}-${subIndex}`] ===
                              false
                            }
                            onChange={() =>
                              onAnswer(`${question.id}-${subIndex}`, false)
                            }
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
                      <label
                        key={index}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`reading-${question.id}`}
                          value={index}
                          checked={answersSection[question.id] === index}
                          onChange={(e) =>
                            onAnswer(question.id, +e.target.value)
                          }
                          className="text-teal-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'true-false' && (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`reading-${question.id}`}
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
                        name={`reading-${question.id}`}
                        value="false"
                        checked={answersSection[question.id] === false}
                        onChange={() => onAnswer(question.id, false)}
                        className="text-teal-600"
                      />
                      <span>False</span>
                    </label>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingQuestionBlock;
