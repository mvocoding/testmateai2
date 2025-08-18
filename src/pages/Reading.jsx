import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import {
  generateReadingFeedback,
  saveVocabularyWords,
  recordPracticeActivity,
} from '../utils';

const Reading = () => {
  const [selectedLevel, setSelectedLevel] = useState('multipleChoice');
  const [currentPassage, setCurrentPassage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [readingData, setReadingData] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const loadReadingData = async () => {
      try {
        const data = await dataService.getPracticeQuestions('reading');
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

  const FEEDBACK_TABS = [
    { key: 'summary', label: 'Passage Summary' },
    { key: 'analysis', label: 'Question Analysis' },
    { key: 'vocabulary', label: 'Vocabulary' },
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    let correctAnswers = 0;
    currentQuestions.forEach((question, index) => {
      if (question.options) {
        if (answers[index] === question.correct) {
          correctAnswers++;
        }
      } else {
        const userAnswer = (answers[index] || '')
          .toString()
          .toLowerCase()
          .trim();
        const correctAnswer = question.correct.toString().toLowerCase().trim();
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      }
    });
    const percentage = (correctAnswers / currentQuestions.length) * 100;
    setScore(percentage);
    setShowResults(true);

    // Debug logging
    console.log('Reading Submit Debug:', {
      selectedPassage,
      currentQuestions,
      answers,
      passageForAI: {
        text: selectedPassage.passage,
        title: selectedPassage.title,
      },
    });

    setIsAnalyzing(true);
    try {
      const feedback = await generateReadingFeedback(
        { text: selectedPassage.passage, title: selectedPassage.title },
        currentQuestions,
        answers
      );
      const correctedFeedback = {
        ...feedback,
        question_analysis:
          feedback.question_analysis?.map((analysis, idx) => {
            const question = currentQuestions[idx];
            const actualCorrectAnswer = question.options
              ? question.options[question.correct]
              : question.correct;
            const actualStudentAnswer =
              question.options && answers[idx] !== undefined
                ? question.options[answers[idx]]
                : answers[idx] || 'No answer provided';

            const isActuallyCorrect = question.options
              ? answers[idx] === question.correct
              : (answers[idx] || '').toString().toLowerCase().trim() ===
                question.correct.toString().toLowerCase().trim();

            return {
              ...analysis,
              correct_answer: actualCorrectAnswer,
              student_answer: actualStudentAnswer,
              is_correct: isActuallyCorrect,
            };
          }) || [],
      };

      setAiFeedback(correctedFeedback);

      if (
        feedback.vocabulary_notes &&
        Array.isArray(feedback.vocabulary_notes)
      ) {
        const words = feedback.vocabulary_notes
          .map((note) => (typeof note === 'string' ? note : note.word || ''))
          .filter((word) => word);
        if (words.length > 0) {
          await saveVocabularyWords(words);
          window.dispatchEvent(new CustomEvent('userDataUpdated'));
        }
      }

      const score = feedback.overall_score || 6.0;
      const band = Math.round(score * 2) / 2; // Round to nearest 0.5
      await recordPracticeActivity('reading', score, band, {
        passage: selectedPassage.title,
        questionsAnswered: Object.keys(answers).length,
        totalQuestions: currentQuestions.length,
        feedback: feedback.overall_feedback,
      });
    } catch (error) {
      console.error('Error generating AI feedback:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTryAgain = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setAiFeedback(null);
    setActiveTab('summary');
  };

  const nextPassage = () => {
    if (currentPassage < currentPassages.length - 1) {
      setCurrentPassage(currentPassage + 1);
      setAnswers({});
      setShowResults(false);
      setScore(0);
      setAiFeedback(null);
      setActiveTab('summary');
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
        <div className="mb-6">
          <div className="flex gap-3 flex-wrap">
            {Object.keys(READING_PASSAGES).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  setSelectedLevel(level);
                  setCurrentPassage(0);
                  setAnswers({});
                  setShowResults(false);
                  setScore(0);
                  setAiFeedback(null);
                  setActiveTab('summary');
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

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
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

                    {showResults && !question.options && (
                      <div className="mt-4">
                        {answers[index]?.toString().toLowerCase().trim() ===
                        question.correct.toString().toLowerCase().trim() ? (
                          <div className="text-green-700 font-bold text-lg">
                            Correct! 🎉
                          </div>
                        ) : (
                          <div className="text-red-600 font-bold text-lg">
                            Incorrect. The correct answer is:{' '}
                            <span className="underline">
                              {question.correct}
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
                    disabled={
                      Object.keys(answers).length < currentQuestions.length
                    }
                  >
                    Submit All
                  </button>
                )}

                {showResults && (
                  <div className="space-y-6">
                    <div className="bg-teal-50 p-6 rounded-xl">
                      <h3 className="text-xl font-bold text-teal-800 mb-2">
                        Your Score: {score.toFixed(1)}%
                      </h3>
                      <p className="text-teal-700">
                        You got{' '}
                        {Math.round((score / 100) * currentQuestions.length)}{' '}
                        out of {currentQuestions.length} questions correct.
                      </p>
                      {isAnalyzing && (
                        <div className="text-purple-600 text-center font-semibold animate-pulse mt-2">
                          Analyzing your answers...
                        </div>
                      )}
                    </div>

                    {aiFeedback && (
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                        <div className="flex mb-4 w-full overflow-x-auto border-b border-green-200">
                          {FEEDBACK_TABS.map((tab) => (
                            <button
                              key={tab.key}
                              type="button"
                              className={`flex-1 min-w-0 px-3 py-2 rounded-t-lg font-semibold border-b-2 transition-colors whitespace-nowrap text-sm ${
                                activeTab === tab.key
                                  ? 'border-green-600 bg-white text-green-800'
                                  : 'border-transparent bg-green-100 text-green-600 hover:bg-green-200'
                              }`}
                              onClick={() => setActiveTab(tab.key)}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        {activeTab === 'summary' && (
                          <div className="space-y-4">
                            <div className="text-lg font-semibold text-green-800 mb-3">
                              Passage Summary
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-green-200 text-gray-700 leading-relaxed">
                              {aiFeedback.passage_summary}
                            </div>
                            <div className="text-sm text-gray-600">
                              <strong>Tip:</strong> Understanding the main idea
                              helps with answering questions.
                            </div>
                          </div>
                        )}

                        {activeTab === 'analysis' && (
                          <div className="space-y-4">
                            <div className="text-lg font-semibold text-green-800 mb-3">
                              Detailed Question Analysis
                            </div>
                            {aiFeedback.question_analysis?.map(
                              (analysis, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white rounded-lg p-4 border border-green-200"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-semibold ${
                                        analysis.is_correct
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {analysis.is_correct
                                        ? '✓ Correct'
                                        : '✗ Incorrect'}
                                    </span>
                                    <span className="font-semibold text-green-800">
                                      Question {analysis.question_number}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-700 mb-2">
                                    <strong>Question:</strong>{' '}
                                    {analysis.question_text}
                                  </div>
                                  <div className="text-sm text-gray-700 mb-2">
                                    <strong>Your Answer:</strong>{' '}
                                    {currentQuestions[
                                      analysis.question_number - 1
                                    ]?.options
                                      ? currentQuestions[
                                          analysis.question_number - 1
                                        ].options[analysis.student_answer] ||
                                        analysis.student_answer
                                      : analysis.student_answer}
                                  </div>
                                  <div className="text-sm text-gray-700 mb-2">
                                    <strong>Correct Answer:</strong>{' '}
                                    {currentQuestions[
                                      analysis.question_number - 1
                                    ]?.options
                                      ? currentQuestions[
                                          analysis.question_number - 1
                                        ].options[analysis.correct_answer] ||
                                        analysis.correct_answer
                                      : analysis.correct_answer}
                                  </div>
                                  <div className="text-sm text-gray-700 mb-2">
                                    <strong>Explanation:</strong>{' '}
                                    {analysis.explanation}
                                  </div>
                                  <div className="text-sm text-gray-700 mb-2">
                                    <strong>Reading Strategy:</strong>{' '}
                                    {analysis.reading_strategy}
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    <strong>Key Vocabulary:</strong>{' '}
                                    {analysis.key_vocabulary?.join(', ')}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {activeTab === 'vocabulary' && (
                          <div className="space-y-4">
                            <div className="text-lg font-semibold text-green-800 mb-3">
                              Important Vocabulary
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {aiFeedback.vocabulary_notes?.map(
                                (vocab, idx) => {
                                  let word, definition;
                                  if (typeof vocab === 'string') {
                                    word = vocab;
                                    definition = 'Definition not available';
                                  } else if (
                                    vocab &&
                                    typeof vocab === 'object'
                                  ) {
                                    word =
                                      vocab.word ||
                                      vocab.mistake ||
                                      'Unknown word';
                                    definition =
                                      vocab.definition ||
                                      vocab.solution ||
                                      'Definition not available';
                                  } else {
                                    word = 'Unknown word';
                                    definition = 'Definition not available';
                                  }

                                  return (
                                    <div
                                      key={idx}
                                      className="bg-white rounded-lg p-4 border border-green-200"
                                    >
                                      <div className="font-semibold text-green-800 mb-1">
                                        {word}
                                      </div>
                                      <div className="text-sm text-gray-700">
                                        {definition}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handleTryAgain}
                        className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
                      >
                        Try Again
                      </button>
                      {currentPassage < currentPassages.length - 1 && (
                        <button
                          type="button"
                          onClick={nextPassage}
                          className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                        >
                          Next Passage
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex flex-col gap-2 sticky top-24">
              <div className="font-bold text-gray-700 mb-2 text-center">
                Questions
              </div>
              {currentPassages.map((passage, idx) => (
                <button
                  key={idx}
                  type="button"
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
                    setAiFeedback(null);
                    setActiveTab('summary');
                  }}
                >
                  Question {idx + 1}
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
