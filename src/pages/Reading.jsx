import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';

const Reading = () => {
  const [selectedLevel, setSelectedLevel] = useState('multipleChoice');
  const [currentPassage, setCurrentPassage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [readingData, setReadingData] = useState(null);

  // Load reading data
  useEffect(() => {
    const loadReadingData = async () => {
      try {
        const data = await dataService.fetchPracticeQuestions('reading');
        setReadingData(data);
      } catch (error) {
        console.error('Error loading reading data:', error);
      }
    };

    loadReadingData();
  }, []);

  if (!readingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reading exercises...</p>
        </div>
      </div>
    );
  }

  const READING_PASSAGES = readingData;

  const currentType = READING_PASSAGES[selectedLevel];
  const currentPassages = currentType.passages;
  const selectedPassage = currentPassages[currentPassage];
  const currentQuestions = selectedPassage.questions;

  const handleAnswer = (questionIndex, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let correctAnswers = 0;
    currentQuestions.forEach((question, index) => {
      if (question.options) {
        if (answers[index] === question.correct) {
          correctAnswers++;
        }
      }
    });
    const percentage = (correctAnswers / currentQuestions.length) * 100;
    setScore(percentage);
    setShowResults(true);
  };

  const handleTryAgain = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const nextPassage = () => {
    if (currentPassage < currentPassages.length - 1) {
      setCurrentPassage(currentPassage + 1);
      setAnswers({});
      setShowResults(false);
      setScore(0);
    }
  };

  const prevPassage = () => {
    if (currentPassage > 0) {
      setCurrentPassage(currentPassage - 1);
      setAnswers({});
      setShowResults(false);
      setScore(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Reading Practice</h1>
          <p className="text-gray-600 mt-1">
            Practice different types of reading questions
          </p>
        </div>
      </div>

      <div className="mx-auto p-6">
        {/* Question Type Selection */}
        <div className="mb-6">
          <div className="flex gap-3 flex-wrap">
            {Object.keys(READING_PASSAGES).map((level) => (
              <button
                key={level}
                onClick={() => {
                  setSelectedLevel(level);
                  setCurrentPassage(0);
                  setAnswers({});
                  setShowResults(false);
                  setScore(0);
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedLevel === level
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {READING_PASSAGES[level].name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Reading Passage and Questions */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              {/* Passage */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedPassage.title}
                </h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-800 leading-relaxed text-lg">
                    {selectedPassage.passage}
                  </p>
                </div>
              </div>

              {/* Questions */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {currentQuestions.map((question, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Question {index + 1}: {question.text}
                    </h3>

                    {question.options ? (
                      <div className="space-y-3">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className="flex items-center space-x-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={optionIndex}
                              checked={answers[index] === optionIndex}
                              onChange={() => handleAnswer(index, optionIndex)}
                              className="accent-teal-600 w-5 h-5"
                              required
                            />
                            <span className="text-gray-800 text-base">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswer(index, e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400"
                        placeholder="Type your answer..."
                        required
                      />
                    )}

                    {/* Show feedback if submitted */}
                    {showResults && question.options && (
                      <div className="mt-4">
                        {answers[index] === question.correct ? (
                          <div className="text-green-700 font-bold text-lg">
                            Correct! 🎉
                          </div>
                        ) : (
                          <div className="text-red-600 font-bold text-lg">
                            Incorrect. The correct answer is:{' '}
                            <span className="underline">
                              {question.options[question.correct]}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {!showResults && (
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    disabled={Object.keys(answers).length < currentQuestions.length}
                  >
                    Submit All
                  </button>
                )}

                {showResults && (
                  <div className="space-y-4">
                    <div className="bg-teal-50 p-6 rounded-xl">
                      <h3 className="text-xl font-bold text-teal-800 mb-2">
                        Your Score: {score.toFixed(1)}%
                      </h3>
                      <p className="text-teal-700">
                        You got {Math.round((score / 100) * currentQuestions.length)} out of {currentQuestions.length} questions correct.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar for passage navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex flex-col gap-2 sticky top-24">
              <div className="font-bold text-gray-700 mb-2 text-center">
                {currentType.name} Passages
              </div>
              {currentPassages.map((passage, idx) => (
                <button
                  key={idx}
                  className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-150 mb-1 ${
                    currentPassage === idx
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
                  }`}
                  onClick={() => {
                    setCurrentPassage(idx);
                    setAnswers({});
                    setShowResults(false);
                    setScore(0);
                  }}
                >
                  {passage.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reading;
